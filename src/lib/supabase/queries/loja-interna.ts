import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

// ========== CATALOGO ENGAGGE ==========

export async function listarCatalogo(filtros?: { categoria?: string }) {
  let query = supabase().from("catalogo_engagge").select("*").eq("ativo", true).order("ordem");
  if (filtros?.categoria) query = query.eq("categoria", filtros.categoria);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ========== PEDIDOS DE COMPRA ==========

export async function listarPedidosCompra(filtros?: { status?: string }) {
  let query = supabase()
    .from("pedidos_compra")
    .select("*, itens:itens_pedido_compra(count)")
    .order("criado_em", { ascending: false });
  if (filtros?.status) query = query.eq("status", filtros.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function buscarPedidoCompra(id: string) {
  const { data, error } = await supabase()
    .from("pedidos_compra")
    .select("*, itens:itens_pedido_compra(*, produto:catalogo_engagge(nome, imagem_url))")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function criarPedidoCompra(itens: { produto_catalogo_id: string; nome_produto: string; quantidade: number; preco_unitario: number }[]) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  const { data: colab } = await supabase().from("colaboradores").select("id, empresa_id").eq("auth_user_id", user.id).single();
  if (!colab) throw new Error("Empresa nao encontrada");

  // Gerar numero
  const { count } = await supabase().from("pedidos_compra").select("id", { count: "exact", head: true }).eq("empresa_id", colab.empresa_id);
  const numero = `PC-${String((count || 0) + 1).padStart(4, "0")}`;

  const subtotal = itens.reduce((a, i) => a + i.preco_unitario * i.quantidade, 0);

  const { data: pedido, error } = await supabase().from("pedidos_compra").insert({
    empresa_id: colab.empresa_id, numero, status: "pendente",
    subtotal, total: subtotal, criado_por: colab.id,
  }).select().single();
  if (error) throw error;

  // Inserir itens
  const itensInsert = itens.map((i) => ({
    pedido_id: pedido.id, produto_catalogo_id: i.produto_catalogo_id,
    nome_produto: i.nome_produto, quantidade: i.quantidade,
    preco_unitario: i.preco_unitario, subtotal: i.preco_unitario * i.quantidade,
  }));
  await supabase().from("itens_pedido_compra").insert(itensInsert);

  return pedido;
}

export async function atualizarStatusPedidoCompra(id: string, status: string) {
  const atualizacao: Record<string, unknown> = { status };
  if (status === "aprovado") atualizacao.aprovado_em = new Date().toISOString();
  if (status === "pago") atualizacao.pago_em = new Date().toISOString();
  if (status === "enviado") atualizacao.enviado_em = new Date().toISOString();
  if (status === "entregue") atualizacao.entregue_em = new Date().toISOString();

  const { data, error } = await supabase().from("pedidos_compra").update(atualizacao).eq("id", id).select().single();
  if (error) throw error;
  return data;
}
