import { criarClienteNavegador } from "../client";
import type { ProdutoRecompensa, PedidoResgate } from "@/types/database";

const supabase = () => criarClienteNavegador();

// ========== PRODUTOS ==========

export async function listarProdutos(filtros?: { categoria?: string }) {
  let query = supabase()
    .from("produtos_recompensa")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (filtros?.categoria) query = query.eq("categoria", filtros.categoria);

  const { data, error } = await query;
  if (error) throw error;
  return data as ProdutoRecompensa[];
}

export async function buscarProduto(id: string) {
  const { data, error } = await supabase()
    .from("produtos_recompensa")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as ProdutoRecompensa;
}

export async function criarProduto(produto: Partial<ProdutoRecompensa>) {
  const { data, error } = await supabase()
    .from("produtos_recompensa")
    .insert(produto)
    .select()
    .single();

  if (error) throw error;
  return data as ProdutoRecompensa;
}

export async function atualizarProduto(id: string, dados: Partial<ProdutoRecompensa>) {
  const { data, error } = await supabase()
    .from("produtos_recompensa")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as ProdutoRecompensa;
}

// ========== RESGATE ==========

export async function resgatarProduto(produtoId: string, opcoes?: {
  variante?: Record<string, string>;
  endereco?: Record<string, string>;
  usar_creditos?: boolean;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id, saldo_pontos, saldo_creditos")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const produto = await buscarProduto(produtoId);

  // Verificar saldo
  if (opcoes?.usar_creditos && produto.custo_creditos) {
    if (colab.saldo_creditos < produto.custo_creditos) {
      throw new Error("Saldo de creditos insuficiente.");
    }
  } else if (produto.custo_pontos) {
    if (colab.saldo_pontos < produto.custo_pontos) {
      throw new Error("Saldo de pontos insuficiente.");
    }
  }

  // Verificar estoque
  if (produto.estoque !== null && produto.estoque <= 0) {
    throw new Error("Produto indisponivel.");
  }

  const { data, error } = await supabase()
    .from("pedidos_resgate")
    .insert({
      empresa_id: colab.empresa_id,
      colaborador_id: colab.id,
      produto_id: produtoId,
      pontos_gastos: opcoes?.usar_creditos ? 0 : (produto.custo_pontos || 0),
      creditos_gastos: opcoes?.usar_creditos ? (produto.custo_creditos || 0) : 0,
      variante_selecionada: opcoes?.variante || null,
      endereco_entrega: opcoes?.endereco || null,
      tipo_gatilho: "manual",
    })
    .select()
    .single();

  if (error) throw error;
  return data as PedidoResgate;
}

// ========== PEDIDOS ==========

export async function listarMeusPedidos() {
  const { data, error } = await supabase()
    .from("pedidos_resgate")
    .select(`
      *,
      produto:produtos_recompensa(nome, imagem_url, categoria)
    `)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data;
}

export async function listarTodosPedidos(filtros?: { status?: string }) {
  let query = supabase()
    .from("pedidos_resgate")
    .select(`
      *,
      produto:produtos_recompensa(nome, imagem_url, categoria),
      colaborador:colaboradores(nome, email, avatar_url)
    `)
    .order("criado_em", { ascending: false });

  if (filtros?.status) query = query.eq("status", filtros.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function atualizarStatusPedido(id: string, status: string, dados?: {
  codigo_rastreio?: string;
  transportadora?: string;
  observacoes?: string;
}) {
  const atualizacao: Record<string, unknown> = { status };
  if (dados?.codigo_rastreio) atualizacao.codigo_rastreio = dados.codigo_rastreio;
  if (dados?.transportadora) atualizacao.transportadora = dados.transportadora;
  if (dados?.observacoes) atualizacao.observacoes = dados.observacoes;

  if (status === "aprovado") atualizacao.aprovado_em = new Date().toISOString();
  if (status === "enviado") atualizacao.enviado_em = new Date().toISOString();
  if (status === "entregue") atualizacao.entregue_em = new Date().toISOString();

  const { data, error } = await supabase()
    .from("pedidos_resgate")
    .update(atualizacao)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
