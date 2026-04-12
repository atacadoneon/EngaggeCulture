import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_GAMIFICACAO } from "@/lib/prompts/prompt-gamificacao";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Rate limiting simples em memoria
const rateLimits = new Map<string, { count: number; resetAt: number }>();

function verificarRateLimit(ip: string): boolean {
  const agora = Date.now();
  const limite = rateLimits.get(ip);

  if (!limite || agora > limite.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: agora + 60000 });
    return true;
  }

  if (limite.count >= 10) return false;
  limite.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!verificarRateLimit(ip)) {
      return new Response(JSON.stringify({ erro: "Muitas requisicoes. Aguarde 1 minuto." }), { status: 429 });
    }

    const body = await request.json();
    const { mensagens, empresa } = body;

    // Validacao de input
    if (!mensagens || !Array.isArray(mensagens) || mensagens.length === 0) {
      return new Response(JSON.stringify({ erro: "Mensagens invalidas" }), { status: 400 });
    }

    if (mensagens.length > 50) {
      return new Response(JSON.stringify({ erro: "Limite de 50 mensagens por conversa" }), { status: 400 });
    }

    for (const msg of mensagens) {
      if (!msg.papel || !msg.conteudo || typeof msg.conteudo !== "string") {
        return new Response(JSON.stringify({ erro: "Formato de mensagem invalido" }), { status: 400 });
      }
      if (msg.conteudo.length > 5000) {
        return new Response(JSON.stringify({ erro: "Mensagem muito longa (max 5000 caracteres)" }), { status: 400 });
      }
    }

    const contextoEmpresa = empresa
      ? `\n\n## Contexto da empresa atual\n- Nome: ${empresa.nome}\n- Plano: ${empresa.plano}\n- Max colaboradores: ${empresa.max_colaboradores}\n- Moeda atual: ${empresa.moeda_nome} ${empresa.moeda_icone}\n- Valor da moeda: R$ ${empresa.moeda_valor_real}`
      : "";

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT_GAMIFICACAO + contextoEmpresa,
      messages: mensagens.map((m: { papel: string; conteudo: string }) => ({
        role: m.papel === "usuario" ? "user" : "assistant",
        content: m.conteudo,
      })),
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        stream.on("text", (text) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ texto: text })}\n\n`));
        });
        stream.on("end", () => {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        });
        stream.on("error", (error) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ erro: error.message })}\n\n`));
          controller.close();
        });
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Erro no chat gamificacao:", error);
    return new Response(JSON.stringify({ erro: "Erro interno" }), { status: 500 });
  }
}
