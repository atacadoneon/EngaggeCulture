// Tipos principais do banco Engagge Culture (PT-BR)

export type Perfil = "admin" | "gestor" | "lider" | "colaborador";
export type StatusColaborador = "convidado" | "ativo" | "inativo" | "desligado";
export type Plano = "starter" | "growth" | "enterprise";

export interface Empresa {
  id: string;
  nome: string;
  slug: string;
  logo_url: string | null;
  cor_primaria: string;
  plano: Plano;
  max_colaboradores: number;
  moeda_nome: string;
  moeda_icone: string;
  moeda_valor_real: number;
  allowance_reconhecimento_mensal: number;
  ativo: boolean;
  criado_em: string;
}

export interface Colaborador {
  id: string;
  empresa_id: string;
  auth_user_id: string | null;
  perfil_acesso_id: string | null;
  departamento_id: string | null;
  equipe_id: string | null;
  nome: string;
  email: string;
  avatar_url: string | null;
  cargo: string | null;
  data_contratacao: string | null;
  saldo_pontos: number;
  saldo_creditos: number;
  allowance_restante: number;
  status: StatusColaborador;
  buddy_id: string | null;
  criado_em: string;
}

export interface PerfilAcesso {
  id: string;
  empresa_id: string;
  nome: Perfil;
  nome_exibicao: string;
  permissoes: string[];
  sistema: boolean;
}

export interface Jornada {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  tipo: "onboarding" | "desafio" | "campanha" | "treinamento";
  status: "rascunho" | "ativa" | "pausada" | "concluida" | "arquivada";
  inicio_em: string | null;
  fim_em: string | null;
  obrigatoria: boolean;
  total_pontos: number;
  imagem_url: string | null;
  criado_em: string;
}

export interface EtapaJornada {
  id: string;
  jornada_id: string;
  ordem: number;
  titulo: string;
  descricao: string | null;
  tipo: string;
  pontos: number;
  obrigatoria: boolean;
  prazo_dias: number | null;
  conteudo: Record<string, unknown>;
}

export interface Desafio {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  tipo: "individual" | "equipe" | "fantasy";
  status: "rascunho" | "ativo" | "concluido" | "arquivado";
  inicio_em: string;
  fim_em: string;
  criado_em: string;
}

export interface ValorCultural {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  icone: string | null;
  comportamentos: string[];
  ativo: boolean;
}

export interface Reconhecimento {
  id: string;
  empresa_id: string;
  de_colaborador_id: string;
  para_colaborador_id: string;
  valor_cultural_id: string | null;
  mensagem: string;
  moedas_dadas: number;
  e_comportamento_semana: boolean;
  origem: "colega" | "gestor" | "sistema" | "externo";
  contexto: string | null;
  total_amplificacoes: number;
  criado_em: string;
}

export interface ProdutoRecompensa {
  id: string;
  empresa_id: string;
  nome: string;
  descricao: string | null;
  imagem_url: string | null;
  categoria: "fisico" | "digital" | "experiencia" | "gift_card" | "kit" | "doacao";
  fonte: "proprio" | "engagge_placas" | "tremendous" | "tango";
  custo_pontos: number | null;
  custo_creditos: number | null;
  estoque: number | null;
  ativo: boolean;
}

export interface PedidoResgate {
  id: string;
  empresa_id: string;
  colaborador_id: string;
  produto_id: string;
  status: "pendente" | "aprovado" | "processando" | "enviado" | "entregue" | "cancelado" | "reembolsado";
  pontos_gastos: number;
  creditos_gastos: number;
  codigo_rastreio: string | null;
  criado_em: string;
}

export interface Notificacao {
  id: string;
  empresa_id: string;
  colaborador_id: string;
  tipo: string;
  titulo: string;
  mensagem: string | null;
  lida: boolean;
  criado_em: string;
}

export interface FeedPost {
  id: string;
  empresa_id: string;
  autor_id: string | null;
  tipo: string;
  conteudo: string | null;
  midia_url: string | null;
  curtidas: number;
  comentarios: number;
  fixado: boolean;
  criado_em: string;
}

// Tipo de sessao do usuario autenticado
export interface SessaoUsuario {
  colaborador: Colaborador;
  empresa: Empresa;
  perfil: PerfilAcesso;
  e_master: boolean;
}
