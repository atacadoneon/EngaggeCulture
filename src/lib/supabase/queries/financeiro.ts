import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

// ========== CONTAS A PAGAR ==========

export async function listarFaturas(filtros?: { status?: string; categoria?: string }) {
  let query = supabase().from("contas_pagar").select("*").order("vencimento", { ascending: true });
  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.categoria) query = query.eq("categoria", filtros.categoria);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarFatura(dados: {
  descricao: string; categoria: string; valor: number; vencimento: string;
  referencia_tipo?: string; referencia_id?: string; nota_fiscal?: string; observacoes?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  const { data: colab } = await supabase().from("colaboradores").select("id, empresa_id").eq("auth_user_id", user.id).single();
  if (!colab) throw new Error("Empresa nao encontrada");

  const { data, error } = await supabase().from("contas_pagar").insert({
    empresa_id: colab.empresa_id, criado_por: colab.id, ...dados,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function atualizarFatura(id: string, dados: Record<string, unknown>) {
  const { data, error } = await supabase().from("contas_pagar").update(dados).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function buscarStatsFaturas() {
  const [abertas, vencidas, pagas] = await Promise.all([
    supabase().from("contas_pagar").select("valor").eq("status", "aberta"),
    supabase().from("contas_pagar").select("valor").eq("status", "vencida"),
    supabase().from("contas_pagar").select("valor").eq("status", "paga").gte("data_pagamento", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]),
  ]);
  return {
    total_aberto: (abertas.data || []).reduce((a, f) => a + Number(f.valor), 0),
    total_vencido: (vencidas.data || []).reduce((a, f) => a + Number(f.valor), 0),
    total_pago_mes: (pagas.data || []).reduce((a, f) => a + Number(f.valor), 0),
    qtd_abertas: abertas.data?.length || 0,
    qtd_vencidas: vencidas.data?.length || 0,
  };
}

// ========== NOTAS FISCAIS ==========

export async function listarNotas(filtros?: { tipo?: string }) {
  let query = supabase().from("notas_fiscais").select("*").order("data_emissao", { ascending: false });
  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarNota(dados: {
  numero: string; tipo: string; fornecedor?: string; valor: number;
  data_emissao: string; chave_acesso?: string; pedido_compra_id?: string; observacoes?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  const { data: colab } = await supabase().from("colaboradores").select("empresa_id").eq("auth_user_id", user.id).single();
  if (!colab) throw new Error("Empresa nao encontrada");
  const { data, error } = await supabase().from("notas_fiscais").insert({ empresa_id: colab.empresa_id, ...dados }).select().single();
  if (error) throw error;
  return data;
}

// ========== FRETES ==========

export async function listarFretes(filtros?: { status?: string }) {
  let query = supabase().from("fretes").select("*, envio:envios(destinatario_nome, produto_nome)").order("criado_em", { ascending: false });
  if (filtros?.status) query = query.eq("status", filtros.status);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function criarFrete(dados: {
  envio_id?: string; transportadora: string; valor: number; peso_kg?: number;
  destino_cep?: string; destino_cidade?: string; destino_estado?: string; codigo_rastreio?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");
  const { data: colab } = await supabase().from("colaboradores").select("empresa_id").eq("auth_user_id", user.id).single();
  if (!colab) throw new Error("Empresa nao encontrada");
  const { data, error } = await supabase().from("fretes").insert({ empresa_id: colab.empresa_id, ...dados }).select().single();
  if (error) throw error;
  return data;
}
