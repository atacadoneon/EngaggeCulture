"use client";

import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { MensagemChat } from "./mensagem-chat";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Mensagem {
  papel: "usuario" | "assistente";
  conteudo: string;
}

interface ChatInterfaceProps {
  titulo: string;
  subtitulo: string;
  cor: string; // "violet" | "amber"
  apiEndpoint: string; // "/api/chat/cultura" ou "/api/chat/gamificacao"
  empresa?: Record<string, unknown>;
  voltarUrl: string;
  onResultado?: (texto: string) => void;
  children?: React.ReactNode; // Componente de preview/resultado injetado
}

export function ChatInterface({
  titulo,
  subtitulo,
  cor,
  apiEndpoint,
  empresa,
  voltarUrl,
  onResultado,
  children,
}: ChatInterfaceProps) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [input, setInput] = useState("");
  const [respondendo, setRespondendo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens, respondendo]);

  // Focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, [respondendo]);

  async function enviarMensagem(e?: React.FormEvent) {
    e?.preventDefault();
    if (!input.trim() || respondendo) return;

    const novaMensagem: Mensagem = { papel: "usuario", conteudo: input.trim() };
    const todasMensagens = [...mensagens, novaMensagem];
    setMensagens(todasMensagens);
    setInput("");
    setRespondendo(true);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: todasMensagens, empresa }),
      });

      if (!response.ok) throw new Error("Erro na resposta");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Sem stream");

      const decoder = new TextDecoder();
      let textoCompleto = "";

      // Adicionar mensagem vazia do assistente
      setMensagens((prev) => [...prev, { papel: "assistente", conteudo: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const linhas = chunk.split("\n\n");

        for (const linha of linhas) {
          if (!linha.startsWith("data: ")) continue;
          const dados = linha.replace("data: ", "");

          if (dados === "[DONE]") continue;

          try {
            const parsed = JSON.parse(dados);
            if (parsed.texto) {
              textoCompleto += parsed.texto;
              setMensagens((prev) => {
                const atualizadas = [...prev];
                atualizadas[atualizadas.length - 1] = {
                  papel: "assistente",
                  conteudo: textoCompleto,
                };
                return atualizadas;
              });
            }
          } catch {
            // Ignorar chunks mal formados
          }
        }
      }

      // Verificar se tem resultado final
      if (onResultado && (textoCompleto.includes("[SALVAR_CULTURA]") || textoCompleto.includes("[SALVAR_GAMIFICACAO]"))) {
        onResultado(textoCompleto);
      }
    } catch (error) {
      console.error("Erro no chat:", error);
      setMensagens((prev) => [
        ...prev.slice(0, -1), // Remover mensagem vazia
        { papel: "assistente", conteudo: "Desculpe, ocorreu um erro. Tente novamente." },
      ]);
    }

    setRespondendo(false);
  }

  const corBorda = cor === "violet" ? "border-violet-500/30" : "border-amber-500/30";
  const corBg = cor === "violet" ? "from-violet-600" : "from-amber-600";

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Link
          href={voltarUrl}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">{titulo}</h1>
          <p className="text-zinc-400 text-sm">{subtitulo}</p>
        </div>
      </div>

      {/* Area de mensagens */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto rounded-xl border bg-zinc-950 p-4 space-y-4",
          corBorda
        )}
      >
        {mensagens.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className={cn("h-16 w-16 rounded-2xl bg-gradient-to-br to-transparent flex items-center justify-center mb-4", corBg)}>
              <span className="text-3xl">
                {cor === "violet" ? "🏛️" : "🎮"}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">
              {cor === "violet" ? "Vamos construir a cultura da sua empresa" : "Vamos gamificar seu negocio"}
            </h2>
            <p className="text-zinc-500 text-sm max-w-md">
              {cor === "violet"
                ? "Me conte sobre sua empresa e vou te ajudar a definir valores, comportamentos e rituais que fazem sentido de verdade."
                : "Me conte sobre seu time e suas metas. Vou montar jornadas, desafios e missoes sob medida."}
            </p>
          </div>
        )}

        {mensagens.map((m, i) => (
          <MensagemChat key={i} papel={m.papel} conteudo={m.conteudo} />
        ))}

        {respondendo && mensagens[mensagens.length - 1]?.papel !== "assistente" && (
          <MensagemChat papel="assistente" conteudo="" carregando />
        )}

        {/* Preview do resultado (injetado via children) */}
        {children}
      </div>

      {/* Input */}
      <form onSubmit={enviarMensagem} className="mt-3 flex gap-2">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            cor === "violet"
              ? "Descreva sua empresa, seu time, seus desafios..."
              : "Conte sobre seu time, suas metas, o que quer gamificar..."
          }
          disabled={respondendo}
          className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || respondendo}
          className={cn(
            "px-4 py-3 rounded-xl text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            cor === "violet" ? "bg-violet-600 hover:bg-violet-700" : "bg-amber-600 hover:bg-amber-700"
          )}
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
