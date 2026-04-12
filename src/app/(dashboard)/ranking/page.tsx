"use client";

import { useState } from "react";
import { Trophy, Crown, Medal, Flame, Zap, Heart, Star, Award, ChevronUp, ChevronDown, Minus, Sparkles, GraduationCap, ShoppingBag } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { usarSessao } from "@/hooks/usar-sessao";

const RANKING_DEMO = [
  { id: "1", nome: "Everton Lauxen", cargo: "CEO / Fundador", pontos: 4850, reconhecimentos: 47, streak: 12, treinamentos: 6, posicao_anterior: 1, equipe: "Diretoria" },
  { id: "2", nome: "Ana Carolina", cargo: "Head Comercial", pontos: 4200, reconhecimentos: 52, streak: 8, treinamentos: 5, posicao_anterior: 3, equipe: "Comercial" },
  { id: "3", nome: "Lucas Mendes", cargo: "Vendedor Senior", pontos: 3890, reconhecimentos: 38, streak: 15, treinamentos: 4, posicao_anterior: 2, equipe: "Comercial" },
  { id: "4", nome: "Mariana Costa", cargo: "Analista de Marketing", pontos: 3450, reconhecimentos: 31, streak: 6, treinamentos: 7, posicao_anterior: 5, equipe: "Marketing" },
  { id: "5", nome: "Pedro Santos", cargo: "Vendedor", pontos: 3100, reconhecimentos: 28, streak: 4, treinamentos: 3, posicao_anterior: 4, equipe: "Comercial" },
  { id: "6", nome: "Julia Almeida", cargo: "Designer", pontos: 2800, reconhecimentos: 35, streak: 10, treinamentos: 5, posicao_anterior: 7, equipe: "Marketing" },
  { id: "7", nome: "Rafael Oliveira", cargo: "Desenvolvedor", pontos: 2650, reconhecimentos: 22, streak: 3, treinamentos: 8, posicao_anterior: 6, equipe: "Tecnologia" },
  { id: "8", nome: "Camila Ferreira", cargo: "Vendedora", pontos: 2400, reconhecimentos: 19, streak: 7, treinamentos: 4, posicao_anterior: 8, equipe: "Comercial" },
  { id: "9", nome: "Thiago Lima", cargo: "Suporte", pontos: 2100, reconhecimentos: 15, streak: 2, treinamentos: 3, posicao_anterior: 10, equipe: "Operacoes" },
  { id: "10", nome: "Fernanda Dias", cargo: "RH", pontos: 1900, reconhecimentos: 42, streak: 9, treinamentos: 6, posicao_anterior: 9, equipe: "RH" },
  { id: "11", nome: "Bruno Souza", cargo: "Vendedor Junior", pontos: 1650, reconhecimentos: 12, streak: 1, treinamentos: 2, posicao_anterior: 12, equipe: "Comercial" },
  { id: "12", nome: "Isabela Rocha", cargo: "Financeiro", pontos: 1400, reconhecimentos: 10, streak: 5, treinamentos: 3, posicao_anterior: 11, equipe: "Financeiro" },
];

const CATEGORIAS_RANKING = [
  { id: "pontos", label: "XP Total", icone: Zap, campo: "pontos" },
  { id: "reconhecimentos", label: "Reconhecimentos", icone: Heart, campo: "reconhecimentos" },
  { id: "streak", label: "Sequencia", icone: Flame, campo: "streak" },
  { id: "treinamentos", label: "Treinamentos", icone: GraduationCap, campo: "treinamentos" },
];

function getIniciais(nome: string) {
  return nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

function MovimentacaoIndicador({ atual, anterior }: { atual: number; anterior: number }) {
  const diff = anterior - atual;
  if (diff > 0) return <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400"><ChevronUp className="h-3 w-3" />{diff}</span>;
  if (diff < 0) return <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-400"><ChevronDown className="h-3 w-3" />{Math.abs(diff)}</span>;
  return <span className="flex items-center text-[10px] text-zinc-600"><Minus className="h-3 w-3" /></span>;
}

export default function PaginaRanking() {
  const { sessao } = usarSessao();
  const [categoriaAtiva, setCategoriaAtiva] = useState("pontos");
  const [periodo, setPeriodo] = useState("mes");

  const campoOrdenacao = CATEGORIAS_RANKING.find((c) => c.id === categoriaAtiva)?.campo || "pontos";
  const rankingOrdenado = [...RANKING_DEMO].sort((a, b) => (b as any)[campoOrdenacao] - (a as any)[campoOrdenacao]);
  const top3 = rankingOrdenado.slice(0, 3);
  const restante = rankingOrdenado.slice(3);
  const minhaPosicao = rankingOrdenado.findIndex((r) => r.id === "1") + 1;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Ranking" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-400" /> Ranking
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Quem esta no topo este mes?</p>
        </div>
        <div className="flex bg-zinc-800 rounded-lg p-0.5">
          {[{ id: "semana", label: "Semana" }, { id: "mes", label: "Mes" }, { id: "trimestre", label: "Trimestre" }, { id: "geral", label: "Geral" }].map((p) => (
            <button key={p.id} onClick={() => setPeriodo(p.id)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", periodo === p.id ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}>{p.label}</button>
          ))}
        </div>
      </div>

      {/* Minha posicao */}
      {sessao && (
        <Card className="p-4 border-violet-500/30 bg-violet-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-bold text-sm">{getIniciais(sessao.colaborador.nome)}</div>
              <div><p className="text-sm font-semibold text-white">Sua posicao</p><p className="text-xs text-zinc-400">{sessao.colaborador.nome}</p></div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center"><p className="text-2xl font-bold text-violet-400">#{minhaPosicao}</p><p className="text-[10px] text-zinc-500 uppercase">Posicao</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-amber-400">{sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")}</p><p className="text-[10px] text-zinc-500 uppercase">XP</p></div>
            </div>
          </div>
        </Card>
      )}

      {/* Categorias */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIAS_RANKING.map((cat) => {
          const Icone = cat.icone;
          const ativo = categoriaAtiva === cat.id;
          const lider = rankingOrdenado[0];
          return (
            <button key={cat.id} onClick={() => setCategoriaAtiva(cat.id)} className={cn("rounded-xl border p-4 text-left transition-all duration-300", ativo ? "bg-violet-600/10 border-violet-500/50 scale-[1.02] shadow-lg shadow-violet-500/10" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700")}>
              <div className="flex items-center justify-between mb-2">
                <Icone className={cn("h-5 w-5", ativo ? "text-violet-400" : "text-zinc-500")} />
                {ativo && <Sparkles className="h-4 w-4 text-violet-400 animate-pulse" />}
              </div>
              <p className={cn("text-xs font-semibold uppercase", ativo ? "text-violet-400" : "text-zinc-500")}>{cat.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{(lider as any)[cat.campo].toLocaleString("pt-BR")}</p>
              <p className="text-[10px] text-zinc-600 mt-0.5">Lider: {lider.nome.split(" ")[0]}</p>
            </button>
          );
        })}
      </div>

      {/* PODIO TOP 3 */}
      <div className="relative pt-8 pb-4">
        <div className="flex items-end justify-center gap-4">
          {/* 2o lugar */}
          <div className="flex flex-col items-center w-44">
            <div className="relative mb-3">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-500 p-0.5"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-xl font-bold text-zinc-300">{getIniciais(top3[1]?.nome || "")}</span></div></div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-zinc-400 rounded-full flex items-center justify-center border-2 border-zinc-900"><span className="text-xs font-bold text-zinc-900">2</span></div>
            </div>
            <p className="text-sm font-bold text-white text-center">{top3[1]?.nome}</p>
            <p className="text-[10px] text-zinc-500">{top3[1]?.cargo}</p>
            <div className="flex items-center gap-1 mt-1"><Zap className="h-3 w-3 text-amber-400" /><span className="text-sm font-bold text-amber-400">{(top3[1] as any)?.[campoOrdenacao]?.toLocaleString("pt-BR")}</span></div>
            <div className="w-full h-24 bg-gradient-to-t from-zinc-400/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Medal className="h-6 w-6 text-zinc-400" /></div>
          </div>

          {/* 1o lugar */}
          <div className="flex flex-col items-center w-48 -mt-8">
            <div className="relative mb-3">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 p-1 animate-pulse"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-2xl font-bold text-amber-400">{getIniciais(top3[0]?.nome || "")}</span></div></div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2"><Crown className="h-8 w-8 text-amber-400 drop-shadow-lg" /></div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-zinc-900"><span className="text-xs font-bold text-zinc-900">1</span></div>
            </div>
            <p className="text-base font-bold text-white text-center">{top3[0]?.nome}</p>
            <p className="text-[10px] text-zinc-400">{top3[0]?.cargo}</p>
            <div className="flex items-center gap-1 mt-1"><Zap className="h-4 w-4 text-amber-400" /><span className="text-lg font-bold text-amber-400">{(top3[0] as any)?.[campoOrdenacao]?.toLocaleString("pt-BR")}</span></div>
            <div className="w-full h-32 bg-gradient-to-t from-amber-500/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Trophy className="h-8 w-8 text-amber-400" /></div>
          </div>

          {/* 3o lugar */}
          <div className="flex flex-col items-center w-44">
            <div className="relative mb-3">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 p-0.5"><div className="h-full w-full rounded-full bg-zinc-900 flex items-center justify-center"><span className="text-xl font-bold text-amber-600">{getIniciais(top3[2]?.nome || "")}</span></div></div>
              <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-amber-700 rounded-full flex items-center justify-center border-2 border-zinc-900"><span className="text-xs font-bold text-white">3</span></div>
            </div>
            <p className="text-sm font-bold text-white text-center">{top3[2]?.nome}</p>
            <p className="text-[10px] text-zinc-500">{top3[2]?.cargo}</p>
            <div className="flex items-center gap-1 mt-1"><Zap className="h-3 w-3 text-amber-400" /><span className="text-sm font-bold text-amber-400">{(top3[2] as any)?.[campoOrdenacao]?.toLocaleString("pt-BR")}</span></div>
            <div className="w-full h-16 bg-gradient-to-t from-amber-700/20 to-transparent rounded-t-xl mt-2 flex items-end justify-center pb-2"><Medal className="h-6 w-6 text-amber-700" /></div>
          </div>
        </div>
      </div>

      {/* Tabela 4o em diante */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase w-16">#</th>
              <th className="px-5 py-3 w-8"></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Colaborador</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Equipe</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase"><div className="flex items-center justify-center gap-1"><Zap className="h-3 w-3 text-amber-400" />XP</div></th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase"><div className="flex items-center justify-center gap-1"><Heart className="h-3 w-3 text-rose-400" />Recog</div></th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase"><div className="flex items-center justify-center gap-1"><Flame className="h-3 w-3 text-orange-400" />Streak</div></th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase"><div className="flex items-center justify-center gap-1"><GraduationCap className="h-3 w-3 text-blue-400" />Treino</div></th>
            </tr></thead>
            <tbody>
              {restante.map((r, i) => {
                const posicao = i + 4;
                const eEu = r.id === "1";
                return (
                  <tr key={r.id} className={cn("border-b border-zinc-800/50 transition-colors", eEu ? "bg-violet-500/5 hover:bg-violet-500/10" : "hover:bg-zinc-800/30")}>
                    <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1"><span className="text-sm font-bold text-zinc-400">{posicao}</span><MovimentacaoIndicador atual={posicao} anterior={r.posicao_anterior} /></div></td>
                    <td className="px-5 py-3">
                      <div className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[10px]", r.pontos > 3000 ? "bg-violet-600" : r.pontos > 2000 ? "bg-blue-600" : r.pontos > 1000 ? "bg-emerald-600" : "bg-zinc-700")}>
                        {r.pontos > 3000 ? "💎" : r.pontos > 2000 ? "⭐" : r.pontos > 1000 ? "🔥" : "🌱"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0", eEu ? "bg-violet-600 text-white ring-2 ring-violet-400" : "bg-zinc-700 text-white")}>{getIniciais(r.nome)}</div>
                        <div>
                          <p className={cn("text-sm font-medium", eEu ? "text-violet-400" : "text-white")}>{r.nome} {eEu && <span className="text-[10px] bg-violet-600/30 text-violet-400 px-1.5 py-0.5 rounded ml-1">Voce</span>}</p>
                          <p className="text-xs text-zinc-500">{r.cargo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><Badge cor="zinc">{r.equipe}</Badge></td>
                    <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-amber-400">{r.pontos.toLocaleString("pt-BR")}</span></td>
                    <td className="px-5 py-3 text-center"><span className="text-sm text-rose-400">{r.reconhecimentos}</span></td>
                    <td className="px-5 py-3 text-center"><div className="flex items-center justify-center gap-1"><Flame className={cn("h-3.5 w-3.5", r.streak >= 7 ? "text-orange-400" : "text-zinc-600")} /><span className={cn("text-sm font-bold", r.streak >= 7 ? "text-orange-400" : "text-zinc-400")}>{r.streak}d</span></div></td>
                    <td className="px-5 py-3 text-center"><span className="text-sm text-blue-400">{r.treinamentos}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Destaques do Mes */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Award className="h-5 w-5 text-violet-400" />Destaques do Mes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { titulo: "Mais Reconhecimentos", nome: "Fernanda Dias", valor: "42 recebidos", icone: Heart, cor: "text-rose-400", bgCor: "bg-rose-500/20", borda: "from-rose-600 to-pink-600" },
            { titulo: "Maior Sequencia", nome: "Lucas Mendes", valor: "15 dias seguidos", icone: Flame, cor: "text-orange-400", bgCor: "bg-orange-500/20", borda: "from-orange-600 to-red-600" },
            { titulo: "Mais Treinamentos", nome: "Rafael Oliveira", valor: "8 concluidos", icone: GraduationCap, cor: "text-blue-400", bgCor: "bg-blue-500/20", borda: "from-blue-600 to-cyan-600" },
            { titulo: "Mais Resgates", nome: "Ana Carolina", valor: "5 premios", icone: ShoppingBag, cor: "text-emerald-400", bgCor: "bg-emerald-500/20", borda: "from-emerald-600 to-teal-600" },
          ].map((dest, i) => {
            const Icone = dest.icone;
            return (
              <Card key={i} className="overflow-hidden">
                <div className={cn("h-1.5 bg-gradient-to-r", dest.borda)} />
                <div className="p-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center mb-3", dest.bgCor)}><Icone className={cn("h-5 w-5", dest.cor)} /></div>
                  <p className="text-[10px] text-zinc-500 uppercase font-bold">{dest.titulo}</p>
                  <p className="text-sm font-bold text-white mt-0.5">{dest.nome}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{dest.valor}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
