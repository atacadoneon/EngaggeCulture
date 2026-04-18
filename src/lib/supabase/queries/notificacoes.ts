import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

export async function criarNotificacao(dados: {
  colaborador_id: string;
  empresa_id: string;
  tipo: string;
  titulo: string;
  mensagem?: string;
  referencia_tipo?: string;
  referencia_id?: string;
}) {
  const { error } = await supabase().from("notificacoes").insert(dados);
  if (error) throw error;
}

export async function listarMinhasNotificacoes(limite = 20) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return [];

  const { data: colab } = await supabase().from("colaboradores").select("id").eq("auth_user_id", user.id).single();
  if (!colab) return [];

  const { data, error } = await supabase()
    .from("notificacoes")
    .select("*")
    .eq("colaborador_id", colab.id)
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}

export async function marcarComoLida(id: string) {
  const { error } = await supabase().from("notificacoes").update({ lida: true }).eq("id", id);
  if (error) throw error;
}

export async function marcarTodasComoLidas() {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return;

  const { data: colab } = await supabase().from("colaboradores").select("id").eq("auth_user_id", user.id).single();
  if (!colab) return;

  const { error } = await supabase().from("notificacoes").update({ lida: true }).eq("colaborador_id", colab.id).eq("lida", false);
  if (error) throw error;
}

export async function contarNaoLidas() {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) return 0;

  const { data: colab } = await supabase().from("colaboradores").select("id").eq("auth_user_id", user.id).single();
  if (!colab) return 0;

  const { count, error } = await supabase().from("notificacoes").select("id", { count: "exact", head: true }).eq("colaborador_id", colab.id).eq("lida", false);
  if (error) return 0;
  return count || 0;
}
