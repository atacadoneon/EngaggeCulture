"use client";

import { BookOpen, Clock, Zap, Users, Trophy, ChevronRight, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CardTrilhaProps {
  id: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  total_modulos: number;
  modulos_concluidos: number;
  pontos_total: number;
  duracao_estimada?: string;
  obrigatoria?: boolean;
  imagem_url?: string;
  participantes?: number;
  onClick: () => void;
}

export function CardTrilha({
  nome, descricao, categoria, total_modulos, modulos_concluidos,
  pontos_total, duracao_estimada, obrigatoria, imagem_url, participantes, onClick,
}: CardTrilhaProps) {
  const progresso = total_modulos > 0 ? Math.round((modulos_concluidos / total_modulos) * 100) : 0;
  const concluida = progresso === 100;
  const emAndamento = progresso > 0 && progresso < 100;
  const naoIniciada = progresso === 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-zinc-900 rounded-2xl border overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-lg group",
        concluida ? "border-emerald-500/30 hover:shadow-emerald-500/10" :
        emAndamento ? "border-amber-500/30 hover:shadow-amber-500/10" :
        "border-zinc-800 hover:border-violet-500/30 hover:shadow-violet-500/10"
      )}
    >
      {/* Header visual */}
      <div className={cn(
        "h-32 relative overflow-hidden",
        imagem_url ? "" : "bg-gradient-to-br",
        !imagem_url && (concluida ? "from-emerald-900/50 to-emerald-600/20" :
        emAndamento ? "from-amber-900/50 to-amber-600/20" :
        "from-violet-900/50 to-violet-600/20")
      )}>
        {imagem_url && <img src={imagem_url} alt="" className="w-full h-full object-cover opacity-40" />}

        <div className="absolute inset-0 p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex gap-1.5">
              {obrigatoria && <Badge cor="red">Obrigatoria</Badge>}
              {categoria && <Badge cor="zinc">{categoria}</Badge>}
            </div>
            {concluida && (
              <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <Trophy className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{nome}</h3>
          </div>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-1.5 bg-zinc-800">
        <div
          className={cn(
            "h-full rounded-r transition-all duration-500",
            concluida ? "bg-emerald-500" : emAndamento ? "bg-amber-500" : "bg-zinc-700"
          )}
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {descricao && (
          <p className="text-xs text-zinc-500 line-clamp-2">{descricao}</p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-400">
                {modulos_concluidos}/{total_modulos}
              </span>
            </div>
            {duracao_estimada && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-zinc-500" />
                <span className="text-xs text-zinc-400">{duracao_estimada}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-bold text-amber-400">{pontos_total} XP</span>
            </div>
          </div>

          {/* Status */}
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            concluida ? "text-emerald-400" : emAndamento ? "text-amber-400" : "text-violet-400"
          )}>
            {concluida ? "Concluida" : emAndamento ? `${progresso}%` : "Iniciar"}
            <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Streak / Participantes */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
          {participantes && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3 text-zinc-600" />
              <span className="text-[10px] text-zinc-600">{participantes} participantes</span>
            </div>
          )}
          {emAndamento && (
            <div className="flex items-center gap-1">
              <Flame className="h-3 w-3 text-orange-400" />
              <span className="text-[10px] text-orange-400 font-bold">Em andamento</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
