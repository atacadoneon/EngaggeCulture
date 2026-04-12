"use client";

import { Target, Plus, Trophy, Flame } from "lucide-react";
import { usarPermissao } from "@/hooks/usar-permissao";

export default function PaginaGamificacao() {
  const { eGestor } = usarPermissao();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gamificacao</h1>
          <p className="text-zinc-400 mt-1">Jornadas, desafios e missoes</p>
        </div>
        {eGestor && (
          <button className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            Nova Jornada
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Target className="h-10 w-10 text-violet-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Jornadas</h3>
          <p className="text-zinc-500 text-sm mt-1">Onboarding e trilhas gamificadas</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Trophy className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Desafios</h3>
          <p className="text-zinc-500 text-sm mt-1">Campanhas com metas e ranking</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Flame className="h-10 w-10 text-orange-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Missoes</h3>
          <p className="text-zinc-500 text-sm mt-1">Tarefas diarias e semanais</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500">Nenhuma jornada ativa ainda. Crie a primeira!</p>
      </div>
    </div>
  );
}
