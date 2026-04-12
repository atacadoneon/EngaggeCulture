"use client";

import { GraduationCap, BookOpen, Award } from "lucide-react";

export default function PaginaTreinamentos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Treinamentos</h1>
        <p className="text-zinc-400 mt-1">Trilhas de aprendizado e certificacoes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <BookOpen className="h-10 w-10 text-blue-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Minhas Trilhas</h3>
          <p className="text-zinc-500 text-sm mt-1">Trilhas em andamento</p>
          <p className="text-2xl font-bold text-white mt-2">0</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <GraduationCap className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Concluidas</h3>
          <p className="text-zinc-500 text-sm mt-1">Trilhas finalizadas</p>
          <p className="text-2xl font-bold text-white mt-2">0</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-center">
          <Award className="h-10 w-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-white font-semibold">Certificados</h3>
          <p className="text-zinc-500 text-sm mt-1">Certificados emitidos</p>
          <p className="text-2xl font-bold text-white mt-2">0</p>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500">Nenhuma trilha de treinamento disponivel ainda.</p>
      </div>
    </div>
  );
}
