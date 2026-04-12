import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

export interface Envio {
  id: string;
  empresa_id: string;
  tipo: "manual" | "lote" | "planilha" | "automatico";
  destinatario_tipo: "colaborador" | "cliente_externo";
  destinatario_id: string | null;
  destinatario_nome: string;
  destinatario_email: string | null;
  produto_id: string | null;
  produto_nome: string;
  quantidade: number;
  endereco_entrega: Record<string, string> | null;
  status: string;
  codigo_rastreio: string | null;
  transportadora: string | null;
  origem: string;
  lote_id: string | null;
  custo_estimado: number | null;
  observacoes: string | null;
  criado_em: string;
}

// ========== LISTAR ENVIOS ==========

export async function listarEnvios(filtros?: { status?: string; tipo?: string; lote_id?: string }) {
  let query = supabase()
    .from("envios")
    .select("*, produto:produtos_recompensa(nome, imagem_url, categoria)")
    .order("criado_em", { ascending: false });

  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);
  if (filtros?.lote_id) query = query.eq("lote_id", filtros.lote_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ========== STATS ==========

export async function buscarStatsEnvios() {
  const [pendentes, enviados, entregues, estoqueBaixo] = await Promise.all([
    supabase().from("envios").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    supabase().from("envios").select("id", { count: "exact", head: true }).eq("status", "enviado"),
    supabase().from("envios").select("id", { count: "exact", head: true }).eq("status", "entregue"),
    supabase().from("produtos_recompensa").select("id", { count: "exact", head: true }).eq("ativo", true).lt("estoque", 5).not("estoque", "is", null),
  ]);

  return {
    pendentes: pendentes.count || 0,
    enviados: enviados.count || 0,
    entregues: entregues.count || 0,
    estoque_baixo: estoqueBaixo.count || 0,
  };
}

// ========== CRIAR ENVIO INDIVIDUAL ==========

export async function criarEnvio(dados: {
  destinatario_tipo: "colaborador" | "cliente_externo";
  destinatario_id: string;
  destinatario_nome: string;
  destinatario_email?: string;
  produto_id: string;
  produto_nome: string;
  quantidade?: number;
  endereco_entrega?: Record<string, string>;
  observacoes?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  const { data, error } = await supabase()
    .from("envios")
    .insert({
      empresa_id: colab.empresa_id,
      tipo: "manual",
      origem: "manual",
      destinatario_tipo: dados.destinatario_tipo,
      destinatario_id: dados.destinatario_id,
      destinatario_nome: dados.destinatario_nome,
      destinatario_email: dados.destinatario_email,
      produto_id: dados.produto_id,
      produto_nome: dados.produto_nome,
      quantidade: dados.quantidade || 1,
      endereco_entrega: dados.endereco_entrega,
      observacoes: dados.observacoes,
      criado_por: colab.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== CRIAR ENVIO EM LOTE ==========

export async function criarEnvioLote(dados: {
  destinatarios: {
    tipo: "colaborador" | "cliente_externo";
    id: string;
    nome: string;
    email?: string;
    endereco?: Record<string, string>;
  }[];
  produto_id: string;
  produto_nome: string;
  quantidade?: number;
  nome_lote?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  // 1. Criar lote
  const { data: lote, error: loteError } = await supabase()
    .from("lotes_envio")
    .insert({
      empresa_id: colab.empresa_id,
      nome: dados.nome_lote || `Envio em lote - ${new Date().toLocaleDateString("pt-BR")}`,
      tipo: "lote_manual",
      total_envios: dados.destinatarios.length,
      criado_por: colab.id,
    })
    .select()
    .single();

  if (loteError) throw loteError;

  // 2. Criar envios individuais vinculados ao lote
  const envios = dados.destinatarios.map((dest) => ({
    empresa_id: colab.empresa_id,
    tipo: "lote" as const,
    origem: "lote" as const,
    destinatario_tipo: dest.tipo,
    destinatario_id: dest.id,
    destinatario_nome: dest.nome,
    destinatario_email: dest.email,
    produto_id: dados.produto_id,
    produto_nome: dados.produto_nome,
    quantidade: dados.quantidade || 1,
    endereco_entrega: dest.endereco,
    lote_id: lote.id,
    criado_por: colab.id,
  }));

  const { data: enviosCriados, error: enviosError } = await supabase()
    .from("envios")
    .insert(envios)
    .select();

  if (enviosError) throw enviosError;

  return { lote, envios: enviosCriados };
}

// ========== CRIAR ENVIOS POR PLANILHA ==========

export async function criarEnviosPlanilha(dados: {
  registros: {
    nome: string;
    email?: string;
    empresa_nome?: string;
    produto_nome: string;
    quantidade?: number;
    rua?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  }[];
  produto_id?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  // 1. Criar lote
  const { data: lote } = await supabase()
    .from("lotes_envio")
    .insert({
      empresa_id: colab.empresa_id,
      nome: `Import planilha - ${new Date().toLocaleDateString("pt-BR")}`,
      tipo: "planilha",
      total_envios: dados.registros.length,
      criado_por: colab.id,
    })
    .select()
    .single();

  if (!lote) throw new Error("Erro ao criar lote");

  // 2. Criar envios
  const envios = dados.registros.map((r) => ({
    empresa_id: colab.empresa_id,
    tipo: "planilha" as const,
    origem: "planilha" as const,
    destinatario_tipo: "cliente_externo" as const,
    destinatario_nome: r.nome,
    destinatario_email: r.email,
    produto_id: dados.produto_id,
    produto_nome: r.produto_nome,
    quantidade: r.quantidade || 1,
    endereco_entrega: r.rua ? { rua: r.rua, cidade: r.cidade || "", estado: r.estado || "", cep: r.cep || "" } : null,
    lote_id: lote.id,
    criado_por: colab.id,
  }));

  const { data: enviosCriados, error } = await supabase()
    .from("envios")
    .insert(envios)
    .select();

  if (error) throw error;

  // 3. Criar clientes externos que nao existem
  for (const r of dados.registros) {
    if (r.email) {
      const { data: existente } = await supabase()
        .from("clientes_externos")
        .select("id")
        .eq("empresa_id", colab.empresa_id)
        .eq("email", r.email)
        .single();

      if (!existente) {
        await supabase().from("clientes_externos").insert({
          empresa_id: colab.empresa_id,
          nome: r.nome,
          email: r.email,
          empresa_nome: r.empresa_nome,
          endereco: r.rua ? { rua: r.rua, cidade: r.cidade, estado: r.estado, cep: r.cep } : null,
        });
      }
    }
  }

  return { lote, total: enviosCriados?.length || 0 };
}

// ========== ATUALIZAR STATUS ==========

export async function atualizarStatusEnvio(id: string, status: string, dados?: {
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
    .from("envios")
    .update(atualizacao)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== ATUALIZAR STATUS EM LOTE ==========

export async function atualizarStatusLote(loteId: string, status: string) {
  const { error } = await supabase()
    .from("envios")
    .update({ status })
    .eq("lote_id", loteId)
    .eq("status", "pendente");

  if (error) throw error;
}
