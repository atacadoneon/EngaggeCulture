import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT_GAMIFICACAO } from "@/lib/prompts/prompt-gamificacao";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { mensagens, empresa } = await request.json();

    if (!mensagens || !Array.isArray(mensagens)) {
      return new Response(JSON.stringify({ erro: "Mensagens invalidas" }), { status: 400 });
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
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ erro: error.message })}\n\n`)
          );
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
