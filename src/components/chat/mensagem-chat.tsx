"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MensagemChatProps {
  papel: "usuario" | "assistente";
  conteudo: string;
  carregando?: boolean;
}

export function MensagemChat({ papel, conteudo, carregando }: MensagemChatProps) {
  const eUsuario = papel === "usuario";

  return (
    <div className={cn("flex gap-3", eUsuario && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
          eUsuario ? "bg-violet-600" : "bg-zinc-700"
        )}
      >
        {eUsuario ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-violet-400" />
        )}
      </div>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          eUsuario
            ? "bg-violet-600 text-white rounded-tr-none"
            : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700"
        )}
      >
        {carregando ? (
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{conteudo}</div>
        )}
      </div>
    </div>
  );
}
