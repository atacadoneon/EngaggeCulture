"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginacaoProps {
  paginaAtual: number;
  totalPaginas: number;
  onChange: (pagina: number) => void;
}

export function Paginacao({ paginaAtual, totalPaginas, onChange }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;

  function gerarPaginas(): (number | "...")[] {
    const paginas: (number | "...")[] = [];
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
    } else {
      paginas.push(1);
      if (paginaAtual > 3) paginas.push("...");
      for (let i = Math.max(2, paginaAtual - 1); i <= Math.min(totalPaginas - 1, paginaAtual + 1); i++) {
        paginas.push(i);
      }
      if (paginaAtual < totalPaginas - 2) paginas.push("...");
      paginas.push(totalPaginas);
    }
    return paginas;
  }

  return (
    <div className="flex items-center justify-center gap-1 py-3">
      <button
        onClick={() => onChange(paginaAtual - 1)}
        disabled={paginaAtual === 1}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {gerarPaginas().map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-zinc-600 text-sm">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "min-w-[32px] h-8 rounded text-sm font-medium transition-colors",
              paginaAtual === p
                ? "bg-violet-600 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            )}
          >
            {String(p).padStart(2, "0")}
          </button>
        )
      )}

      <button
        onClick={() => onChange(paginaAtual + 1)}
        disabled={paginaAtual === totalPaginas}
        className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
