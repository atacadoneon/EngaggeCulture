import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// Padroes perigosos pra bloquear (SQL injection, XSS)
const PADROES_PERIGOSOS = /DROP\s+TABLE|DELETE\s+FROM|INSERT\s+INTO|UPDATE\s+.*SET|ALTER\s+TABLE|UNION\s+SELECT|<script|javascript:|eval\(/i;

export async function POST(request: NextRequest) {
  try {
    // 1. Extrair API key do header
    const apiKey = request.headers.get("x-api-key") || request.headers.get("authorization")?.replace("Bearer ", "");
    if (!apiKey) {
      return NextResponse.json({ erro: "API key ausente" }, { status: 401 });
    }

    // 2. Validar API key
    const { data: keyData, error: keyError } = await supabase
      .rpc("validate_api_key", { p_key: apiKey });

    // Fallback: buscar pelo prefixo na tabela de webhooks
    const prefixo = apiKey.substring(0, 11);
    const { data: webhook } = await supabase
      .from("webhooks_kpi")
      .select("*, empresa:empresas(id, nome)")
      .eq("chave_api", apiKey)
      .eq("ativo", true)
      .single();

    if (!webhook) {
      // Logar tentativa invalida
      await supabase.from("logs_webhook").insert({
        prefixo_chave: prefixo,
        ip: request.headers.get("x-forwarded-for") || "unknown",
        status: "chave_invalida",
        payload: {},
      });
      return NextResponse.json({ erro: "API key invalida" }, { status: 401 });
    }

    // 3. Rate limiting (max 60 requests por minuto por webhook)
    const { data: allowed } = await supabase
      .rpc("verificar_taxa", {
        p_id: webhook.id,
        p_acao: "webhook_kpi",
        p_max: 60,
        p_minutos: 1,
      });

    if (allowed === false) {
      await supabase.from("logs_webhook").insert({
        empresa_id: webhook.empresa_id,
        webhook_id: webhook.id,
        ip: request.headers.get("x-forwarded-for") || "unknown",
        status: "rate_limitado",
        payload: {},
      });
      return NextResponse.json({ erro: "Rate limit excedido. Tente novamente em 1 minuto." }, { status: 429 });
    }

    // 4. Parsear e validar payload
    const payload = await request.json();
    const payloadStr = JSON.stringify(payload);

    if (PADROES_PERIGOSOS.test(payloadStr)) {
      await supabase.from("logs_webhook").insert({
        empresa_id: webhook.empresa_id,
        webhook_id: webhook.id,
        ip: request.headers.get("x-forwarded-for") || "unknown",
        status: "payload_invalido",
        payload,
        mensagem_erro: "Payload contem padroes suspeitos",
      });
      await supabase.from("eventos_seguranca").insert({
        empresa_id: webhook.empresa_id,
        tipo: "payload_suspeito",
        severidade: "alta",
        ip: request.headers.get("x-forwarded-for") || "unknown",
        detalhes: { webhook_id: webhook.id },
      });
      return NextResponse.json({ erro: "Payload invalido" }, { status: 400 });
    }

    // Tamanho maximo: 1MB
    if (payloadStr.length > 1048576) {
      return NextResponse.json({ erro: "Payload muito grande (max 1MB)" }, { status: 413 });
    }

    // 5. Campos obrigatorios
    if (!payload.colaborador_email && !payload.colaborador_id) {
      return NextResponse.json({ erro: "Campo 'colaborador_email' ou 'colaborador_id' obrigatorio" }, { status: 400 });
    }
    if (payload.valor === undefined || payload.valor === null) {
      return NextResponse.json({ erro: "Campo 'valor' obrigatorio" }, { status: 400 });
    }

    // 6. Identificar colaborador
    let colaboradorId = payload.colaborador_id;
    if (!colaboradorId && payload.colaborador_email) {
      const { data: colab } = await supabase
        .from("colaboradores")
        .select("id")
        .eq("empresa_id", webhook.empresa_id)
        .eq("email", payload.colaborador_email)
        .single();

      if (!colab) {
        return NextResponse.json({ erro: `Colaborador nao encontrado: ${payload.colaborador_email}` }, { status: 404 });
      }
      colaboradorId = colab.id;
    }

    // 7. Registrar dado KPI
    const periodo = payload.periodo || new Date().toISOString().substring(0, 7); // YYYY-MM
    const { data: kpiData, error: kpiError } = await supabase
      .from("dados_kpi")
      .insert({
        webhook_id: webhook.id,
        empresa_id: webhook.empresa_id,
        colaborador_id: colaboradorId,
        periodo,
        valor: payload.valor,
        payload_original: payload,
      })
      .select()
      .single();

    if (kpiError) throw kpiError;

    // 8. Logar sucesso
    await supabase.from("logs_webhook").insert({
      empresa_id: webhook.empresa_id,
      webhook_id: webhook.id,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      status: "sucesso",
      payload,
      processado: true,
    });

    // 9. Atualizar ultimo recebimento
    await supabase
      .from("webhooks_kpi")
      .update({ ultimo_recebimento: new Date().toISOString() })
      .eq("id", webhook.id);

    return NextResponse.json({
      sucesso: true,
      dados: {
        kpi_id: kpiData.id,
        colaborador_id: colaboradorId,
        valor: payload.valor,
        periodo,
        kpi: webhook.nome_kpi,
      },
    });

  } catch (error) {
    console.error("Erro no webhook KPI:", error);
    return NextResponse.json({ erro: "Erro interno do servidor" }, { status: 500 });
  }
}
