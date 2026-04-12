"use client";

import { Lock, Check, Play, Star, Trophy, Flame, Zap, BookOpen, Video, HelpCircle, FileText, Award } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModuloTrilha {
  id: string;
  titulo: string;
  tipo: "video" | "leitura" | "quiz" | "tarefa" | "certificado";
  pontos: number;
  status: "bloqueado" | "disponivel" | "em_andamento" | "concluido";
  nota?: number;
  duracao?: string;
}

interface TrilhaMapaProps {
  modulos: ModuloTrilha[];
  onModuloClick: (modulo: ModuloTrilha) => void;
}

const ICONES_TIPO: Record<string, typeof Video> = {
  video: Video,
  leitura: BookOpen,
  quiz: HelpCircle,
  tarefa: FileText,
  certificado: Award,
};

const CORES_STATUS = {
  bloqueado: { bg: "bg-zinc-800", border: "border-zinc-700", text: "text-zinc-600", icon: "text-zinc-600" },
  disponivel: { bg: "bg-violet-600/20", border: "border-violet-500/50 animate-pulse", text: "text-violet-400", icon: "text-violet-400" },
  em_andamento: { bg: "bg-amber-600/20", border: "border-amber-500/50", text: "text-amber-400", icon: "text-amber-400" },
  concluido: { bg: "bg-emerald-600/20", border: "border-emerald-500/50", text: "text-emerald-400", icon: "text-emerald-400" },
};

export function TrilhaMapa({ modulos, onModuloClick }: TrilhaMapaProps) {
  const concluidos = modulos.filter((m) => m.status === "concluido").length;
  const progresso = modulos.length > 0 ? Math.round((concluidos / modulos.length) * 100) : 0;

  return (
    <div className="space-y-2">
      {/* Barra de progresso geral */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${progresso}%` }}
          />
        </div>
        <span className="text-sm font-bold text-white whitespace-nowrap">{progresso}%</span>
        <div className="flex items-center gap-1">
          <Flame className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-bold text-orange-400">{concluidos}/{modulos.length}</span>
        </div>
      </div>

      {/* Mapa de modulos — caminho sinuoso */}
      <div className="relative">
        {modulos.map((modulo, index) => {
          const cores = CORES_STATUS[modulo.status];
          const Icone = ICONES_TIPO[modulo.tipo] || BookOpen;
          const ePar = index % 2 === 0;
          const eBloqueado = modulo.status === "bloqueado";
          const eConcluido = modulo.status === "concluido";
          const eDisponivel = modulo.status === "disponivel";

          return (
            <div key={modulo.id} className="relative">
              {/* Linha conectora */}
              {index < modulos.length - 1 && (
                <div className={cn(
                  "absolute left-1/2 -translate-x-1/2 w-0.5 h-8",
                  eConcluido ? "bg-emerald-500/50" : "bg-zinc-800"
                )} style={{ top: "100%" }} />
              )}

              {/* Modulo node */}
              <div className={cn("flex items-center gap-4 mb-8", ePar ? "flex-row" : "flex-row-reverse")}>
                {/* Espacador */}
                <div className="flex-1" />

                {/* Card do modulo */}
                <button
                  onClick={() => !eBloqueado && onModuloClick(modulo)}
                  disabled={eBloqueado}
                  className={cn(
                    "relative flex items-center gap-4 w-full max-w-md p-4 rounded-2xl border-2 transition-all duration-300",
                    cores.bg, cores.border,
                    !eBloqueado && "hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10 cursor-pointer",
                    eBloqueado && "opacity-60 cursor-not-allowed",
                    eDisponivel && "ring-2 ring-violet-500/30 ring-offset-2 ring-offset-zinc-950"
                  )}
                >
                  {/* Icone do modulo */}
                  <div className={cn(
                    "h-14 w-14 rounded-xl flex items-center justify-center shrink-0 border",
                    eConcluido ? "bg-emerald-600 border-emerald-500" :
                    eDisponivel ? "bg-violet-600 border-violet-500" :
                    modulo.status === "em_andamento" ? "bg-amber-600 border-amber-500" :
                    "bg-zinc-800 border-zinc-700"
                  )}>
                    {eBloqueado ? (
                      <Lock className="h-6 w-6 text-zinc-500" />
                    ) : eConcluido ? (
                      <Check className="h-6 w-6 text-white" />
                    ) : eDisponivel ? (
                      <Play className="h-6 w-6 text-white" />
                    ) : (
                      <Icone className="h-6 w-6 text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">
                        Modulo {index + 1}
                      </span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded",
                        modulo.tipo === "video" ? "bg-blue-500/20 text-blue-400" :
                        modulo.tipo === "quiz" ? "bg-purple-500/20 text-purple-400" :
                        modulo.tipo === "leitura" ? "bg-cyan-500/20 text-cyan-400" :
                        modulo.tipo === "tarefa" ? "bg-amber-500/20 text-amber-400" :
                        "bg-emerald-500/20 text-emerald-400"
                      )}>
                        {modulo.tipo}
                      </span>
                    </div>
                    <p className={cn("text-sm font-semibold mt-0.5 truncate", cores.text)}>
                      {modulo.titulo}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {modulo.duracao && (
                        <span className="text-[10px] text-zinc-500">{modulo.duracao}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" />
                        <span className="text-[10px] font-bold text-amber-400">{modulo.pontos} pts</span>
                      </div>
                      {eConcluido && modulo.nota !== undefined && (
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3].map((s) => (
                            <Star key={s} className={cn("h-3 w-3", s <= Math.ceil(modulo.nota! / 33) ? "text-amber-400 fill-amber-400" : "text-zinc-700")} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Indicador de acao */}
                  {eDisponivel && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-violet-600 rounded-full flex items-center justify-center animate-bounce">
                      <Play className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {eConcluido && (
                    <div className="absolute -top-2 -right-2 h-6 w-6 bg-emerald-600 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>

                {/* Espacador */}
                <div className="flex-1" />
              </div>
            </div>
          );
        })}

        {/* Final — Certificado */}
        <div className="flex justify-center">
          <div className={cn(
            "h-20 w-20 rounded-2xl border-2 flex items-center justify-center",
            progresso === 100
              ? "bg-gradient-to-br from-amber-600 to-amber-500 border-amber-400 animate-pulse"
              : "bg-zinc-800 border-zinc-700"
          )}>
            <Trophy className={cn("h-10 w-10", progresso === 100 ? "text-white" : "text-zinc-600")} />
          </div>
        </div>
        {progresso === 100 && (
          <p className="text-center text-amber-400 font-bold mt-2 text-sm">Trilha Concluida! Certificado Disponivel</p>
        )}
      </div>
    </div>
  );
}
