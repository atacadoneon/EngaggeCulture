import { criarClienteNavegador } from "../client";
import type { Jornada, EtapaJornada } from "@/types/database";

const supabase = () => criarClienteNavegador();

// ========== JORNADAS ==========

export async function listarJornadas(filtros?: { status?: string; tipo?: string }) {
  let query = supabase().from("jornadas").select("*").order("criado_em", { ascending: false });

  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.tipo) query = query.eq("tipo", filtros.tipo);

  const { data, error } = await query;
  if (error) throw error;
  return data as Jornada[];
}

export async function buscarJornada(id: string) {
  const { data, error } = await supabase()
    .from("jornadas")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Jornada;
}

export async function criarJornada(jornada: Partial<Jornada>) {
  const { data, error } = await supabase()
    .from("jornadas")
    .insert(jornada)
    .select()
    .single();

  if (error) throw error;
  return data as Jornada;
}

export async function atualizarJornada(id: string, dados: Partial<Jornada>) {
  const { data, error } = await supabase()
    .from("jornadas")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Jornada;
}

export async function excluirJornada(id: string) {
  const { error } = await supabase().from("jornadas").delete().eq("id", id);
  if (error) throw error;
}

// ========== ETAPAS ==========

export async function listarEtapas(jornadaId: string) {
  const { data, error } = await supabase()
    .from("etapas_jornada")
    .select("*")
    .eq("jornada_id", jornadaId)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as EtapaJornada[];
}

export async function criarEtapa(etapa: Partial<EtapaJornada>) {
  const { data, error } = await supabase()
    .from("etapas_jornada")
    .insert(etapa)
    .select()
    .single();

  if (error) throw error;
  return data as EtapaJornada;
}

export async function atualizarEtapa(id: string, dados: Partial<EtapaJornada>) {
  const { data, error } = await supabase()
    .from("etapas_jornada")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as EtapaJornada;
}

export async function excluirEtapa(id: string) {
  const { error } = await supabase().from("etapas_jornada").delete().eq("id", id);
  if (error) throw error;
}

export async function reordenarEtapas(etapas: { id: string; ordem: number }[]) {
  const promises = etapas.map((e) =>
    supabase().from("etapas_jornada").update({ ordem: e.ordem }).eq("id", e.id)
  );
  await Promise.all(promises);
}

// ========== PROGRESSO ==========

export async function buscarMeuProgresso(jornadaId: string) {
  const { data, error } = await supabase()
    .from("colaborador_jornadas")
    .select("*, progresso:progresso_etapas(*)")
    .eq("jornada_id", jornadaId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function concluirEtapa(jornadaId: string, etapaId: string, resposta?: Record<string, unknown>) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const { data, error } = await supabase()
    .from("progresso_etapas")
    .upsert({
      colaborador_id: colab.id,
      jornada_id: jornadaId,
      etapa_id: etapaId,
      empresa_id: colab.empresa_id,
      status: "concluida",
      concluido_em: new Date().toISOString(),
      resposta: resposta || {},
    }, { onConflict: "colaborador_id,etapa_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== DESAFIOS ==========

export async function listarDesafios(filtros?: { status?: string }) {
  let query = supabase().from("desafios").select("*").order("inicio_em", { ascending: false });
  if (filtros?.status) query = query.eq("status", filtros.status);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function buscarRanking(desafioId: string) {
  const { data, error } = await supabase()
    .from("participantes_desafio")
    .select("*, colaborador:colaboradores(nome, avatar_url, cargo)")
    .eq("desafio_id", desafioId)
    .order("pontos_atuais", { ascending: false });

  if (error) throw error;
  return data;
}

// ========== MISSOES ==========

export async function listarMissoes() {
  const { data, error } = await supabase()
    .from("missoes")
    .select("*")
    .eq("ativa", true)
    .order("criado_em", { ascending: false });

  if (error) throw error;
  return data;
}

export async function concluirMissao(missaoId: string, periodo: string) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const { data, error } = await supabase()
    .from("missoes_concluidas")
    .insert({
      missao_id: missaoId,
      colaborador_id: colab.id,
      empresa_id: colab.empresa_id,
      periodo,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
