import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

export async function buscarIntegracao(tipo: string = "tiny") {
  const { data, error } = await supabase()
    .from("integracoes_erp")
    .select("*")
    .eq("tipo", tipo)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function salvarIntegracao(dados: {
  tipo: string;
  client_id: string;
  client_secret: string;
  config?: Record<string, boolean>;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  const { data, error } = await supabase()
    .from("integracoes_erp")
    .upsert({
      empresa_id: colab.empresa_id,
      tipo: dados.tipo,
      nome: dados.tipo === "tiny" ? "Tiny ERP" : dados.tipo === "omie" ? "Omie" : "Bling",
      client_id: dados.client_id,
      client_secret: dados.client_secret,
      status: "desconectado",
      config: dados.config || {},
    }, { onConflict: "empresa_id,tipo" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function atualizarConfigIntegracao(id: string, config: Record<string, unknown>) {
  const { data, error } = await supabase()
    .from("integracoes_erp")
    .update({ config })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listarSyncLogs(limite = 20) {
  const { data, error } = await supabase()
    .from("sync_log")
    .select("*")
    .order("criado_em", { ascending: false })
    .limit(limite);

  if (error) throw error;
  return data;
}
