import { criarClienteNavegador } from "../client";
import type { Reconhecimento, ValorCultural } from "@/types/database";

const supabase = () => criarClienteNavegador();

// ========== VALORES CULTURAIS ==========

export async function listarValores() {
  const { data, error } = await supabase()
    .from("valores_culturais")
    .select("*")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data as ValorCultural[];
}

export async function criarValor(valor: Partial<ValorCultural>) {
  const { data, error } = await supabase()
    .from("valores_culturais")
    .insert(valor)
    .select()
    .single();

  if (error) throw error;
  return data as ValorCultural;
}

// ========== RECONHECIMENTOS ==========

export async function listarReconhecimentos(limite = 20) {
  const { data, error } = await supabase()
    .from("reconhecimentos")
    .select(`
      *,
      de:colaboradores!reconhecimentos_de_colaborador_id_fkey(nome, avatar_url, cargo),
      para:colaboradores!reconhecimentos_para_colaborador_id_fkey(nome, avatar_url, cargo),
      valor:valores_culturais(nome, icone)
    `)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}

export async function criarReconhecimento(dados: {
  para_colaborador_id: string;
  valor_cultural_id?: string;
  mensagem: string;
  moedas_dadas: number;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id, allowance_restante")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");
  if (colab.allowance_restante < dados.moedas_dadas) {
    throw new Error("Allowance insuficiente para este reconhecimento.");
  }

  // Verificar comportamento da semana
  let eBehaviorSemana = false;
  if (dados.valor_cultural_id) {
    const hoje = new Date().toISOString().split("T")[0];
    const { data: bow } = await supabase()
      .from("comportamento_da_semana")
      .select("id")
      .eq("valor_cultural_id", dados.valor_cultural_id)
      .lte("semana_inicio", hoje)
      .gte("semana_fim", hoje)
      .single();

    eBehaviorSemana = !!bow;
  }

  const { data, error } = await supabase()
    .from("reconhecimentos")
    .insert({
      empresa_id: colab.empresa_id,
      de_colaborador_id: colab.id,
      para_colaborador_id: dados.para_colaborador_id,
      valor_cultural_id: dados.valor_cultural_id,
      mensagem: dados.mensagem,
      moedas_dadas: dados.moedas_dadas,
      e_comportamento_semana: eBehaviorSemana,
      origem: "colega",
    })
    .select()
    .single();

  if (error) throw error;

  // Debitar allowance
  await supabase()
    .from("colaboradores")
    .update({ allowance_restante: colab.allowance_restante - dados.moedas_dadas })
    .eq("id", colab.id);

  return data as Reconhecimento;
}

// ========== AMPLIFICACOES (BOOST) ==========

export async function amplificarReconhecimento(reconhecimentoId: string, moedas: number, mensagem?: string) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, allowance_restante")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");
  if (colab.allowance_restante < moedas) throw new Error("Allowance insuficiente.");

  const { data, error } = await supabase()
    .from("amplificacoes")
    .insert({
      reconhecimento_id: reconhecimentoId,
      de_colaborador_id: colab.id,
      moedas,
      mensagem,
    })
    .select()
    .single();

  if (error) throw error;

  // Debitar allowance
  await supabase()
    .from("colaboradores")
    .update({ allowance_restante: colab.allowance_restante - moedas })
    .eq("id", colab.id);

  return data;
}

// ========== COMPORTAMENTO DA SEMANA ==========

export async function buscarComportamentoSemana() {
  const hoje = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase()
    .from("comportamento_da_semana")
    .select("*, valor:valores_culturais(nome, icone)")
    .lte("semana_inicio", hoje)
    .gte("semana_fim", hoje)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ========== CHECK-IN SEMANAL ==========

export async function enviarCheckin(dados: {
  humor: number;
  maior_conquista?: string;
  maior_bloqueio?: string;
  sugestao_reconhecimento?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id, empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const agora = new Date();
  const semana = `${agora.getFullYear()}-W${String(Math.ceil(((agora.getTime() - new Date(agora.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7)).padStart(2, "0")}`;

  const { data, error } = await supabase()
    .from("checkins_semanais")
    .upsert({
      colaborador_id: colab.id,
      empresa_id: colab.empresa_id,
      semana,
      ...dados,
    }, { onConflict: "colaborador_id,semana" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== FEED ==========

export async function listarFeed(limite = 30) {
  const { data, error } = await supabase()
    .from("feed_posts")
    .select(`
      *,
      autor:colaboradores(nome, avatar_url, cargo)
    `)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}

export async function reagirPost(postId: string, reacao = "👍") {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const { error } = await supabase()
    .from("feed_reacoes")
    .upsert({
      post_id: postId,
      colaborador_id: colab.id,
      reacao,
    }, { onConflict: "post_id,colaborador_id" });

  if (error) throw error;
}

export async function comentarPost(postId: string, conteudo: string) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Colaborador nao encontrado");

  const { data, error } = await supabase()
    .from("feed_comentarios")
    .insert({ post_id: postId, colaborador_id: colab.id, conteudo })
    .select()
    .single();

  if (error) throw error;
  return data;
}
