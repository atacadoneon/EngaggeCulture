"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  aberto: boolean;
  fechar: () => void;
  titulo: string;
  children: React.ReactNode;
  tamanho?: "sm" | "md" | "lg" | "xl";
}

const tamanhos = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({ aberto, fechar, titulo, children, tamanho = "md" }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") fechar();
    }
    if (aberto) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [aberto, fechar]);

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={fechar} />
      <div
        ref={ref}
        className={cn(
          "relative z-10 w-full mx-4 bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl",
          tamanhos[tamanho]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">{titulo}</h2>
          <button
            onClick={fechar}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
