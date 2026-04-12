"use client";

import { useState, useEffect } from "react";
import { Trophy, Crown, Medal, Flame, Zap, Heart, Award, ChevronUp, ChevronDown, Minus, Sparkles, GraduationCap, ShoppingBag } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { SkeletonCards } from "@/components/ui/skeleton";
import { buscarRankingGlobal } from "@/lib/supabase/queries/dashboard";
import { usarSessao } from "@/hooks/usar-sessao";
import { cn } from "@/lib/utils";

function getIniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function PaginaRanking() {
  const { sessao } = usarSessao();
  const [ranking, setRanking] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [periodo, setPeriodo] = useState("geral");

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      try {
        const data = await buscarRankingGlobal(50);
        setRanking(data || []);
      } catch {}
      setCarregando(false);
    }
    carregar();
  }, []);

  const top3 = ranking.slice(0, 3);
  const restante = ranking.slice(3);
  const minhaPosicao = sessao ? ranking.findIndex((r) => r.id === sessao.colaborador.id) + 1 : 0;

  if (carregando) return <div className="space-y-6"><Breadcrumbs itens={[{ label: "Ranking" }]} /><SkeletonCards quantidade={4} /></div>;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Ranking" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-400" /> Ranking</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Quem esta no topo?</p>
        </div>
        <div className="flex bg-zinc-800 rounded-lg p-0.5">
          {[{ id: "semana", label: "Semana" }, { id: "mes", label: "Mes" }, { id: "geral", label: "Geral" }].map((p) => (
            <button key={p.id} onClick={() => setPeriodo(p.id)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", periodo === p.id ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}>{p.label}</button>
          ))}
        </div>
      </div>

      {ranking.length === 0 ? (
        <EmptyState icone={Trophy} titulo="Nenhum colaborador no ranking" descricao="O ranking sera preenchido conforme os colaboradores acumulam pontos." />
      ) : (
        <>
          {/* Minha posicao */}
          {sessao && minhaPosicao > 0 && (
            <Card className="p-4 border-violet-500/30 bg-violet-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">{getIniciais(sessao.colaborador.nome)}</div>
                  <div><p className="text-sm font-semibold text-white">Sua posicao</p><p className="text-xs text-zinc-400">{sessao.colaborador.nome}</p></div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center"><p className="text-2xl font-bold text-violet-400">#{minhaPosicao}</p><p className="text-[10px] text-zinc-500 uppercase">Posicao</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-amber-400">{sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")}</p><p className="text-[10px] text-zinc-500 uppercase">Pontos</p></div>
                </div>
              </div>
            </Card>
          )}

          {/* Podio */}
          {top3.length >= 3 && (
            <div className="relative pt-8 pb-4">
              <div className="flex items-end justify-center gap-4">
                {/* 2o */}
                <div className="flex flex-col items-center w-44">
                  <div className="relative mb-3">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 p-0.5"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-xl font-bold text-zinc-300">{getIniciais(top3[1]?.nome)}</span></div></div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-zinc-400 rounded-full flex items-center justify-center border-2 border-zinc-900"><span className="text-xs font-bold text-zinc-900">2</span></div>
                  </div>
                  <p className="text-sm font-bold text-white text-center">{top3[1]?.nome}</p>
                  <p className="text-[10px] text-zinc-500">{top3[1]?.cargo || ""}</p>
                  <p className="text-sm font-bold text-amber-400 mt-1">{top3[1]?.saldo_pontos?.toLocaleString("pt-BR")} pts</p>
                  <div className="w-full h-24 bg-gradient-to-t from-zinc-400/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Medal className="h-6 w-6 text-zinc-400" /></div>
                </div>
                {/* 1o */}
                <div className="flex flex-col items-center w-48 -mt-8">
                  <div className="relative mb-3">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-1 animate-pulse"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-2xl font-bold text-amber-400">{getIniciais(top3[0]?.nome)}</span></div></div>
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Crown className="h-8 w-8 text-amber-400 drop-shadow-lg" /></div>
                  </div>
                  <p className="text-base font-bold text-white text-center">{top3[0]?.nome}</p>
                  <p className="text-[10px] text-zinc-400">{top3[0]?.cargo || ""}</p>
                  <p className="text-lg font-bold text-amber-400 mt-1">{top3[0]?.saldo_pontos?.toLocaleString("pt-BR")} pts</p>
                  <div className="w-full h-32 bg-gradient-to-t from-amber-500/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Trophy className="h-8 w-8 text-amber-400" /></div>
                </div>
                {/* 3o */}
                <div className="flex flex-col items-center w-44">
                  <div className="relative mb-3">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-0.5"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-xl font-bold text-amber-600">{getIniciais(top3[2]?.nome)}</span></div></div>
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-amber-700 rounded-full flex items-center justify-center border-2 border-zinc-900"><span className="text-xs font-bold text-white">3</span></div>
                  </div>
                  <p className="text-sm font-bold text-white text-center">{top3[2]?.nome}</p>
                  <p className="text-[10px] text-zinc-500">{top3[2]?.cargo || ""}</p>
                  <p className="text-sm font-bold text-amber-400 mt-1">{top3[2]?.saldo_pontos?.toLocaleString("pt-BR")} pts</p>
                  <div className="w-full h-16 bg-gradient-to-t from-amber-700/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Medal className="h-6 w-6 text-amber-700" /></div>
                </div>
              </div>
            </div>
          )}

          {/* Tabela 4o+ */}
          {restante.length > 0 && (
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
                    {restante.map((r, i) => {
                      const pos = i + 4;
                      const eEu = sessao && r.id === sessao.colaborador.id;
                      return (
                        <tr key={r.id} className={cn("border-b border-zinc-800/50 transition-colors", eEu ? "bg-violet-500/5" : "hover:bg-zinc-800/30")}>
                          <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-zinc-400">{pos}</span></td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold", eEu ? "bg-violet-600 text-white" : "bg-zinc-700 text-white")}>{getIniciais(r.nome)}</div>
                              <div>
                                <p className={cn("text-sm font-medium", eEu ? "text-violet-400" : "text-white")}>{r.nome} {eEu && <span className="text-[10px] bg-violet-600/30 text-violet-400 px-1.5 py-0.5 rounded ml-1">Voce</span>}</p>
                                <p className="text-xs text-zinc-500">{r.cargo || ""}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-sm text-zinc-400">{r.equipe?.nome || "—"}</td>
                          <td className="px-5 py-3 text-sm font-bold text-white text-right">{r.saldo_pontos?.toLocaleString("pt-BR")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
