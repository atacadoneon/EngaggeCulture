"use client";

import { useEffect, useState } from "react";
import { Trophy, Medal, Crown } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { buscarRankingGlobal } from "@/lib/supabase/queries/dashboard";
import { cn } from "@/lib/utils";

export default function PaginaRanking() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const data = await buscarRankingGlobal(50);
      setRanking(data);
      setCarregando(false);
    }
    carregar();
  }, []);

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Ranking" }]} />
      <h1 className="text-2xl font-bold text-white">Ranking Geral</h1>

      {/* Top 3 */}
      {ranking.length >= 3 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 0, 2].map((idx) => {
            const r = ranking[idx];
            if (!r) return null;
            const pos = idx === 0 ? 2 : idx === 1 ? 1 : 3;
            return (
              <Card key={r.id} className={cn("p-6 text-center", pos === 1 && "border-amber-500/30 bg-amber-500/5 scale-105")}>
                <div className={cn("h-16 w-16 rounded-full mx-auto mb-3 flex items-center justify-center",
                  pos === 1 ? "bg-amber-600" : pos === 2 ? "bg-zinc-400" : "bg-amber-800"
                )}>
                  {pos === 1 ? <Crown className="h-8 w-8 text-white" /> : <Medal className="h-8 w-8 text-white" />}
                </div>
                <p className="text-lg font-bold text-white">{r.nome}</p>
                <p className="text-sm text-zinc-400">{r.cargo || "—"}</p>
                <p className="text-2xl font-bold text-amber-400 mt-2">{r.saldo_pontos.toLocaleString("pt-BR")} pts</p>
                <p className="text-xs text-zinc-500 mt-1">{pos}o lugar</p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Lista completa */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase w-16">#</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Colaborador</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Equipe</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Pontos</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : ranking.map((r, i) => (
                <tr key={r.id} className={cn("border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors", i < 3 && "bg-amber-500/5")}>
                  <td className="px-5 py-3 text-center">
                    <span className={cn("text-sm font-bold", i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-500")}>{i + 1}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold">{r.nome.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{r.nome}</p>
                        <p className="text-xs text-zinc-500">{r.cargo || ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{r.equipe?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm font-bold text-white text-right">{r.saldo_pontos.toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
