import { criarClienteNavegador } from "../client";
import type { Colaborador } from "@/types/database";

const supabase = () => criarClienteNavegador();

export async function listarColaboradores(filtros?: { status?: string; equipe_id?: string }) {
  let query = supabase()
    .from("colaboradores")
    .select(`
      *,
      perfil:perfis_acesso(nome, nome_exibicao),
      equipe:equipes(nome),
      departamento:departamentos(nome)
    `)
    .order("nome", { ascending: true });

  if (filtros?.status) query = query.eq("status", filtros.status);
  if (filtros?.equipe_id) query = query.eq("equipe_id", filtros.equipe_id);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function buscarColaborador(id: string) {
  const { data, error } = await supabase()
    .from("colaboradores")
    .select(`
      *,
      perfil:perfis_acesso(nome, nome_exibicao, permissoes),
      equipe:equipes(nome),
      departamento:departamentos(nome)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function criarColaborador(dados: {
  nome: string;
  email: string;
  cargo?: string;
  departamento_id?: string;
  equipe_id?: string;
  perfil_nome?: string;
}) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: admin } = await supabase()
    .from("colaboradores")
    .select("empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!admin) throw new Error("Empresa nao encontrada");

  // Buscar perfil_acesso_id
  let perfilId = null;
  if (dados.perfil_nome) {
    const { data: perfil } = await supabase()
      .from("perfis_acesso")
      .select("id")
      .eq("empresa_id", admin.empresa_id)
      .eq("nome", dados.perfil_nome)
      .single();
    perfilId = perfil?.id;
  } else {
    const { data: perfil } = await supabase()
      .from("perfis_acesso")
      .select("id")
      .eq("empresa_id", admin.empresa_id)
      .eq("nome", "colaborador")
      .single();
    perfilId = perfil?.id;
  }

  const { data, error } = await supabase()
    .from("colaboradores")
    .insert({
      empresa_id: admin.empresa_id,
      nome: dados.nome,
      email: dados.email,
      cargo: dados.cargo,
      departamento_id: dados.departamento_id,
      equipe_id: dados.equipe_id,
      perfil_acesso_id: perfilId,
      status: "convidado",
    })
    .select()
    .single();

  if (error) throw error;
  return data as Colaborador;
}

export async function atualizarColaborador(id: string, dados: Partial<Colaborador>) {
  const { data, error } = await supabase()
    .from("colaboradores")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listarEquipes() {
  const { data, error } = await supabase()
    .from("equipes")
    .select("*, departamento:departamentos(nome)")
    .order("nome");

  if (error) throw error;
  return data;
}

export async function listarDepartamentos() {
  const { data, error } = await supabase()
    .from("departamentos")
    .select("*")
    .order("nome");

  if (error) throw error;
  return data;
}
