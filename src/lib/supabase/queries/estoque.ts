import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

export async function listarEstoque() {
  const { data, error } = await supabase()
    .from("produtos_recompensa")
    .select("id, nome, imagem_url, categoria, estoque, ativo")
    .eq("ativo", true)
    .order("nome");
  if (error) throw error;
  return data;
}

export async function listarMovimentacoes(filtros?: { produto_id?: string; tipo?: string }) {
  let query = supabase()
    .from("movimentacoes_estoque")
    .select("*, produto:produtos_recompensa(nome), criador:colaboradores(nome)")
    .order("criado_em", { ascending: false });
  if (filtros?.produto_id) query = query.eq("produto_id", filtros.produto_id);
  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarMovimentacao(dados: {
  produto_id: string; tipo: "entrada" | "saida" | "ajuste" | "devolucao";
  quantidade: number; origem?: string; origem_id?: string; observacoes?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  const { data: colab } = await supabase().from("colaboradores").select("id, empresa_id").eq("auth_user_id", user.id).single();
  if (!colab) throw new Error("Empresa nao encontrada");

  // Buscar saldo atual
  const { data: produto } = await supabase().from("produtos_recompensa").select("estoque").eq("id", dados.produto_id).single();
  const saldoAnterior = produto?.estoque || 0;
  const saldoPosterior = dados.tipo === "entrada" || dados.tipo === "devolucao"
    ? saldoAnterior + dados.quantidade
    : saldoAnterior - dados.quantidade;

  if (saldoPosterior < 0) throw new Error("Estoque insuficiente");

  // Criar movimentacao
  const { data: mov, error } = await supabase().from("movimentacoes_estoque").insert({
    empresa_id: colab.empresa_id, produto_id: dados.produto_id, tipo: dados.tipo,
    quantidade: dados.quantidade, saldo_anterior: saldoAnterior, saldo_posterior: saldoPosterior,
    origem: dados.origem || "ajuste_manual", origem_id: dados.origem_id,
    observacoes: dados.observacoes, criado_por: colab.id,
  }).select().single();
  if (error) throw error;

  // Atualizar estoque do produto
  await supabase().from("produtos_recompensa").update({ estoque: saldoPosterior }).eq("id", dados.produto_id);

  return mov;
}

export async function buscarStatsEstoque() {
  const { data: produtos } = await supabase()
    .from("produtos_recompensa")
    .select("estoque")
    .eq("ativo", true)
    .not("estoque", "is", null);

  const totalItens = (produtos || []).reduce((a, p) => a + (p.estoque || 0), 0);
  const estoqueBaixo = (produtos || []).filter((p) => (p.estoque || 0) < 5 && (p.estoque || 0) > 0).length;
  const semEstoque = (produtos || []).filter((p) => (p.estoque || 0) <= 0).length;

  return { total_itens: totalItens, estoque_baixo: estoqueBaixo, sem_estoque: semEstoque, total_produtos: produtos?.length || 0 };
}
