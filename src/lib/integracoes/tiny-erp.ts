/**
 * Tiny ERP API v3 — Cliente de integracao
 * URL base: https://api.tiny.com.br/public-api/v3
 * Auth: OAuth2 Bearer Token
 */

const BASE_URL = "https://api.tiny.com.br/public-api/v3";
const AUTH_URL = "https://accounts.tiny.com.br/realms/tiny/protocol/openid-connect/token";

interface TinyConfig {
  accessToken: string;
  refreshToken?: string;
}

interface TinyPedido {
  cliente: {
    nome: string;
    tipoPessoa: "F" | "J";
    cpfCnpj?: string;
    email?: string;
    telefone?: string;
    celular?: string;
    endereco?: {
      endereco: string;
      numero: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      uf: string;
      cep: string;
    };
  };
  itens: {
    descricao: string;
    quantidade: number;
    valorUnitario: number;
    codigo?: string;
  }[];
  observacoes?: string;
  observacoesInternas?: string;
  valorFrete?: number;
}

async function request(
  metodo: string,
  endpoint: string,
  token: string,
  body?: Record<string, unknown>
) {
  const url = `${BASE_URL}${endpoint}`;
  const options: RequestInit = {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  if (body && metodo !== "GET") {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    const erro = await response.text();
    throw new Error(`Tiny ERP [${response.status}]: ${erro}`);
  }

  return response.json();
}

// ========== AUTENTICACAO ==========

export async function obterTokenTiny(clientId: string, clientSecret: string, code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/integracoes/tiny/callback`,
  });

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) throw new Error("Falha na autenticacao com Tiny ERP");
  return response.json();
}

export async function renovarTokenTiny(clientId: string, clientSecret: string, refreshToken: string) {
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) throw new Error("Falha ao renovar token do Tiny ERP");
  return response.json();
}

// ========== PEDIDOS ==========

export async function criarPedidoTiny(token: string, pedido: TinyPedido) {
  return request("POST", "/pedidos", token, pedido as any);
}

export async function obterPedidoTiny(token: string, idPedido: string) {
  return request("GET", `/pedidos/${idPedido}`, token);
}

export async function listarPedidosTiny(token: string, filtros?: { situacao?: string; dataInicial?: string; dataFinal?: string; pagina?: number }) {
  let endpoint = "/pedidos?";
  if (filtros?.situacao) endpoint += `situacao=${filtros.situacao}&`;
  if (filtros?.dataInicial) endpoint += `dataInicial=${filtros.dataInicial}&`;
  if (filtros?.dataFinal) endpoint += `dataFinal=${filtros.dataFinal}&`;
  if (filtros?.pagina) endpoint += `pagina=${filtros.pagina}&`;
  return request("GET", endpoint, token);
}

export async function atualizarSituacaoPedidoTiny(token: string, idPedido: string, situacao: string) {
  return request("PUT", `/pedidos/${idPedido}/situacao`, token, { situacao });
}

// ========== NOTAS FISCAIS ==========

export async function listarNotasTiny(token: string, filtros?: { tipo?: string; dataInicial?: string; dataFinal?: string; pagina?: number }) {
  let endpoint = "/notas-fiscais?";
  if (filtros?.tipo) endpoint += `tipo=${filtros.tipo}&`;
  if (filtros?.dataInicial) endpoint += `dataInicial=${filtros.dataInicial}&`;
  if (filtros?.dataFinal) endpoint += `dataFinal=${filtros.dataFinal}&`;
  if (filtros?.pagina) endpoint += `pagina=${filtros.pagina}&`;
  return request("GET", endpoint, token);
}

export async function obterNotaTiny(token: string, idNota: string) {
  return request("GET", `/notas-fiscais/${idNota}`, token);
}

export async function emitirNotaTiny(token: string, idPedido: string) {
  return request("POST", `/notas-fiscais/emitir`, token, { idPedido: parseInt(idPedido) });
}

// ========== CONTAS A RECEBER ==========

export async function listarContasReceberTiny(token: string, filtros?: { situacao?: string; pagina?: number }) {
  let endpoint = "/contas-receber?";
  if (filtros?.situacao) endpoint += `situacao=${filtros.situacao}&`;
  if (filtros?.pagina) endpoint += `pagina=${filtros.pagina}&`;
  return request("GET", endpoint, token);
}

export async function obterContaReceberTiny(token: string, idConta: string) {
  return request("GET", `/contas-receber/${idConta}`, token);
}

export async function baixarContaReceberTiny(token: string, idConta: string, dados: { dataPagamento: string; valorPago: number }) {
  return request("PUT", `/contas-receber/${idConta}/baixar`, token, dados);
}

// ========== EXPEDICAO ==========

export async function obterExpedicaoTiny(token: string, idPedido: string) {
  return request("GET", `/pedidos/${idPedido}/expedicao`, token);
}

// ========== CONTATOS ==========

export async function criarContatoTiny(token: string, contato: {
  nome: string; tipoPessoa: "F" | "J"; cpfCnpj?: string; email?: string; telefone?: string;
}) {
  return request("POST", "/contatos", token, contato as any);
}

// ========== HELPER: Converter envio da Engagge pra pedido Tiny ==========

export function converterEnvioParaPedidoTiny(envio: {
  destinatario_nome: string;
  destinatario_email?: string;
  produto_nome: string;
  quantidade: number;
  endereco_entrega?: Record<string, string>;
  custo_estimado?: number;
  observacoes?: string;
}): TinyPedido {
  return {
    cliente: {
      nome: envio.destinatario_nome,
      tipoPessoa: "F",
      email: envio.destinatario_email,
      endereco: envio.endereco_entrega ? {
        endereco: envio.endereco_entrega.rua || "",
        numero: envio.endereco_entrega.numero || "S/N",
        complemento: envio.endereco_entrega.complemento,
        bairro: envio.endereco_entrega.bairro || "",
        cidade: envio.endereco_entrega.cidade || "",
        uf: envio.endereco_entrega.estado || "",
        cep: envio.endereco_entrega.cep || "",
      } : undefined,
    },
    itens: [{
      descricao: envio.produto_nome,
      quantidade: envio.quantidade,
      valorUnitario: envio.custo_estimado ? envio.custo_estimado / envio.quantidade : 0,
    }],
    observacoes: envio.observacoes,
    observacoesInternas: "Pedido gerado automaticamente via Engagge Culture",
  };
}
