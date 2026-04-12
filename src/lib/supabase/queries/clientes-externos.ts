import { criarClienteNavegador } from "../client";

const supabase = () => criarClienteNavegador();

export interface ClienteExterno {
  id: string;
  empresa_id: string;
  nome: string;
  email: string | null;
  empresa_nome: string | null;
  telefone: string | null;
  endereco: Record<string, string> | null;
  tags: string[];
  observacoes: string | null;
  ativo: boolean;
  criado_em: string;
}

export async function listarClientesExternos(filtros?: { busca?: string; tag?: string }) {
  let query = supabase()
    .from("clientes_externos")
    .select("*")
    .eq("ativo", true)
    .order("nome");

  if (filtros?.busca) {
    query = query.or(`nome.ilike.%${filtros.busca}%,email.ilike.%${filtros.busca}%,empresa_nome.ilike.%${filtros.busca}%`);
  }
  if (filtros?.tag) {
    query = query.contains("tags", [filtros.tag]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as ClienteExterno[];
}

export async function criarClienteExterno(dados: Partial<ClienteExterno> & { nome: string }) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  const { data, error } = await supabase()
    .from("clientes_externos")
    .insert({ ...dados, empresa_id: colab.empresa_id })
    .select()
    .single();

  if (error) throw error;
  return data as ClienteExterno;
}

export async function atualizarClienteExterno(id: string, dados: Partial<ClienteExterno>) {
  const { data, error } = await supabase()
    .from("clientes_externos")
    .update(dados)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function importarClientesCSV(clientes: Partial<ClienteExterno>[]) {
  const { data: { user } } = await supabase().auth.getUser();
  if (!user) throw new Error("Nao autenticado");

  const { data: colab } = await supabase()
    .from("colaboradores")
    .select("empresa_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!colab) throw new Error("Empresa nao encontrada");

  const registros = clientes.map((c) => ({ ...c, empresa_id: colab.empresa_id }));
  const { data, error } = await supabase()
    .from("clientes_externos")
    .insert(registros)
    .select();

  if (error) throw error;
  return data;
}
