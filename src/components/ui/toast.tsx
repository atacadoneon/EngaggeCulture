"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTipo = "sucesso" | "erro" | "aviso" | "info";

interface Toast {
  id: string;
  tipo: ToastTipo;
  titulo: string;
  mensagem?: string;
}

interface ToastContextType {
  toast: (tipo: ToastTipo, titulo: string, mensagem?: string) => void;
  sucesso: (titulo: string, mensagem?: string) => void;
  erro: (titulo: string, mensagem?: string) => void;
  aviso: (titulo: string, mensagem?: string) => void;
  info: (titulo: string, mensagem?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONES: Record<ToastTipo, typeof CheckCircle> = {
  sucesso: CheckCircle,
  erro: XCircle,
  aviso: AlertTriangle,
  info: Info,
};

const CORES: Record<ToastTipo, string> = {
  sucesso: "border-emerald-500/50 bg-emerald-500/10",
  erro: "border-red-500/50 bg-red-500/10",
  aviso: "border-amber-500/50 bg-amber-500/10",
  info: "border-blue-500/50 bg-blue-500/10",
};

const CORES_ICONE: Record<ToastTipo, string> = {
  sucesso: "text-emerald-400",
  erro: "text-red-400",
  aviso: "text-amber-400",
  info: "text-blue-400",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((tipo: ToastTipo, titulo: string, mensagem?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, tipo, titulo, mensagem }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const removerToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const value: ToastContextType = {
    toast: addToast,
    sucesso: (t, m) => addToast("sucesso", t, m),
    erro: (t, m) => addToast("erro", t, m),
    aviso: (t, m) => addToast("aviso", t, m),
    info: (t, m) => addToast("info", t, m),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container de toasts */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => {
          const Icone = ICONES[t.tipo];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-sm animate-in slide-in-from-right-5",
                CORES[t.tipo]
              )}
            >
              <Icone className={cn("h-5 w-5 shrink-0 mt-0.5", CORES_ICONE[t.tipo])} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{t.titulo}</p>
                {t.mensagem && <p className="text-xs text-zinc-400 mt-0.5">{t.mensagem}</p>}
              </div>
              <button onClick={() => removerToast(t.id)} className="text-zinc-500 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function usarToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("usarToast deve ser usado dentro de ToastProvider");
  return ctx;
}
