import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

// ========== METRICAS PESSOAIS ==========

export async function buscarMetricasPessoais(colaboradorId: string) {
  const [reconhecimentos, missoes, jornadas] = await Promise.all([
    supabase()
      .from("reconhecimentos")
      .select("id", { count: "exact", head: true })
      .eq("para_colaborador_id", colaboradorId)
      .gte("criado_em", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    supabase()
      .from("missoes_concluidas")
      .select("id, sequencia")
      .eq("colaborador_id", colaboradorId)
      .order("concluido_em", { ascending: false })
      .limit(1),

    supabase()
      .from("colaborador_jornadas")
      .select("id", { count: "exact", head: true })
      .eq("colaborador_id", colaboradorId)
      .eq("status", "em_andamento"),
  ]);

  return {
    reconhecimentos_mes: reconhecimentos.count || 0,
    streak_atual: missoes.data?.[0]?.sequencia || 0,
    jornadas_ativas: jornadas.count || 0,
  };
}

// ========== METRICAS DA EMPRESA ==========

export async function buscarMetricasEmpresa() {
  const [colaboradores, desafios, pedidos, reconhecimentos] = await Promise.all([
    supabase()
      .from("colaboradores")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),

    supabase()
      .from("desafios")
      .select("id", { count: "exact", head: true })
      .eq("status", "ativo"),

    supabase()
      .from("pedidos_resgate")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    supabase()
      .from("reconhecimentos")
      .select("id", { count: "exact", head: true })
      .gte("criado_em", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ]);

  return {
    colaboradores_ativos: colaboradores.count || 0,
    desafios_ativos: desafios.count || 0,
    pedidos_mes: pedidos.count || 0,
    reconhecimentos_mes: reconhecimentos.count || 0,
  };
}

// ========== RANKING GLOBAL ==========

export async function buscarRankingGlobal(limite = 10) {
  const { data, error } = await supabase()
    .from("colaboradores")
    .select("id, nome, avatar_url, cargo, saldo_pontos, equipe:equipes(nome)")
    .eq("status", "ativo")
    .order("saldo_pontos", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}

// ========== FEED RECENTE ==========

export async function buscarFeedRecente(limite = 10) {
  const { data, error } = await supabase()
    .from("feed_posts")
    .select(`
      *,
      autor:colaboradores(nome, avatar_url)
    `)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}

// ========== CHECKIN HUMOR MEDIO ==========

export async function buscarHumorMedio() {
  const { data, error } = await supabase()
    .from("checkins_semanais")
    .select("humor")
    .gte("criado_em", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .not("humor", "is", null);

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const media = data.reduce((acc, c) => acc + c.humor, 0) / data.length;
  return Math.round(media * 10) / 10;
}
