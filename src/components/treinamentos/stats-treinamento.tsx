"use client";

import { Flame, Trophy, BookOpen, Clock, Zap, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsTreinamentoProps {
  totalXP: number;
  trilhasConcluidas: number;
  trilhasEmAndamento: number;
  horasEstudo: number;
  sequenciaDias: number;
  certificados: number;
}

export function StatsTreinamento({ totalXP, trilhasConcluidas, trilhasEmAndamento, horasEstudo, sequenciaDias, certificados }: StatsTreinamentoProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatCard icone={Zap} label="XP Total" valor={totalXP.toLocaleString("pt-BR")} cor="text-amber-400" bgCor="bg-amber-500/10" />
      <StatCard icone={Flame} label="Sequencia" valor={`${sequenciaDias} dias`} cor="text-orange-400" bgCor="bg-orange-500/10" />
      <StatCard icone={Trophy} label="Concluidas" valor={String(trilhasConcluidas)} cor="text-emerald-400" bgCor="bg-emerald-500/10" />
      <StatCard icone={BookOpen} label="Em Andamento" valor={String(trilhasEmAndamento)} cor="text-violet-400" bgCor="bg-violet-500/10" />
      <StatCard icone={Clock} label="Horas Estudo" valor={`${horasEstudo}h`} cor="text-blue-400" bgCor="bg-blue-500/10" />
      <StatCard icone={Award} label="Certificados" valor={String(certificados)} cor="text-pink-400" bgCor="bg-pink-500/10" />
    </div>
  );
}

function StatCard({ icone: Icone, label, valor, cor, bgCor }: {
  icone: typeof Zap; label: string; valor: string; cor: string; bgCor: string;
}) {
  return (
    <div className={cn("rounded-xl border border-zinc-800 p-3 text-center", bgCor)}>
      <Icone className={cn("h-5 w-5 mx-auto mb-1", cor)} />
      <p className={cn("text-lg font-bold", cor)}>{valor}</p>
      <p className="text-[10px] text-zinc-500 uppercase font-semibold">{label}</p>
    </div>
  );
}
