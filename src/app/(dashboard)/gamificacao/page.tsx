"use client";

import { useState, useEffect } from "react";
import { Target, Plus, Trophy, Flame, Sparkles, Zap, Crown, Clock, ChevronRight, Star, Users, TrendingUp, Swords, Gift, CheckCircle, Lock, Medal, Timer, ArrowRight, Rocket } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usarPermissao } from "@/hooks/usar-permissao";
import { usarSessao } from "@/hooks/usar-sessao";
import { usarToast } from "@/components/ui/toast";
import { SkeletonCards } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { listarJornadas, listarDesafios, listarMissoes, concluirMissao } from "@/lib/supabase/queries/jornadas";
import { cn } from "@/lib/utils";

// Demo data (fallback quando banco vazio)
const DESAFIO_ATIVO = {
  nome: "Operacao Foguete — Abril",
  descricao: "Quem fatura mais no mes leva o trofeu e R$ 500 em premios",
  fim_em: "2026-04-30",
  participantes: 18,
  minha_posicao: 3,
  meu_valor: 127500,
  meta: 200000,
  lider: { nome: "Ana Carolina", valor: 185000 },
  top5: [
    { nome: "Ana Carolina", valor: 185000, avatar: "AC" },
    { nome: "Lucas Mendes", valor: 162000, avatar: "LM" },
    { nome: "Everton Lauxen", valor: 127500, avatar: "EL" },
    { nome: "Pedro Santos", valor: 98000, avatar: "PS" },
    { nome: "Camila Ferreira", valor: 87000, avatar: "CF" },
  ],
};

const MISSOES_HOJE = [
  { id: "1", nome: "Registrar 3 atividades no CRM", pontos: 15, concluida: true, tipo: "diaria" },
  { id: "2", nome: "Fazer 1 follow-up com lead", pontos: 20, concluida: true, tipo: "diaria" },
  { id: "3", nome: "Reconhecer 1 colega", pontos: 10, concluida: false, tipo: "diaria" },
  { id: "4", nome: "Completar 1 modulo de treinamento", pontos: 30, concluida: false, tipo: "semanal" },
  { id: "5", nome: "Participar do ritual Sexta de Resultados", pontos: 25, concluida: false, tipo: "semanal" },
];

const CONQUISTAS_RECENTES = [
  { nome: "Primeira Venda", icone: "🎯", data: "Hoje", cor: "from-violet-600 to-purple-600" },
  { nome: "Sequencia 7 Dias", icone: "🔥", data: "Ontem", cor: "from-orange-600 to-red-600" },
  { nome: "Top 5 Ranking", icone: "🏆", data: "3 dias atras", cor: "from-amber-600 to-yellow-600" },
  { nome: "10 Reconhecimentos", icone: "💜", data: "Semana passada", cor: "from-pink-600 to-rose-600" },
];

const JORNADAS_ATIVAS = [
  { id: "1", nome: "Onboarding Comercial", tipo: "onboarding", progresso: 62, etapas_total: 8, etapas_concluidas: 5, pontos_ganhos: 250, pontos_total: 400 },
  { id: "2", nome: "Certificacao de Produto", tipo: "treinamento", progresso: 30, etapas_total: 10, etapas_concluidas: 3, pontos_ganhos: 150, pontos_total: 500 },
];

export default function PaginaGamificacao() {
  const { eGestor } = usarPermissao();
  const { sessao } = usarSessao();
  const toast = usarToast();
  const [missoes, setMissoes] = useState(MISSOES_HOJE);
  const [jornadasDB, setJornadasDB] = useState<any[]>([]);
  const [desafiosDB, setDesafiosDB] = useState<any[]>([]);
  const [missoesDB, setMissoesDB] = useState<any[]>([]);
  const [carregandoDB, setCarregandoDB] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        const [j, d, m] = await Promise.all([
          listarJornadas({ status: "ativa" }),
          listarDesafios({ status: "ativo" }),
          listarMissoes(),
        ]);
        setJornadasDB(j || []);
        setDesafiosDB(d || []);
        setMissoesDB(m || []);
      } catch {}
      setCarregandoDB(false);
    }
    carregar();
  }, []);

  const missoesConcluidas = missoes.filter((m) => m.concluida).length;
  const missoesTotal = missoes.length;
  const pontosHoje = missoes.filter((m) => m.concluida).reduce((a, m) => a + m.pontos, 0);
  const diasRestantes = Math.ceil((new Date(DESAFIO_ATIVO.fim_em).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const progressoDesafio = Math.round((DESAFIO_ATIVO.meu_valor / DESAFIO_ATIVO.meta) * 100);

  function completarMissao(id: string) {
    setMissoes((prev) => prev.map((m) => m.id === id ? { ...m, concluida: true } : m));
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Gamificacao" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Rocket className="h-6 w-6 text-violet-400" /> Gamificacao
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Suas missoes, desafios e conquistas</p>
        </div>
        {eGestor && (
          <div className="flex gap-2">
            <Link href="/gamificacao/criar"><Button variante="secundario"><Sparkles className="h-4 w-4" />Criar com IA</Button></Link>
            <Link href="/gamificacao/criar"><Button><Plus className="h-4 w-4" />Nova Jornada</Button></Link>
          </div>
        )}
      </div>

      {/* HERO — Desafio Ativo */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-950/50 via-zinc-900 to-zinc-950 p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <Badge cor="amber">Desafio Ativo</Badge>
              <h2 className="text-xl font-bold text-white mt-2">{DESAFIO_ATIVO.nome}</h2>
              <p className="text-sm text-zinc-400 mt-1">{DESAFIO_ATIVO.descricao}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-400">
                <Timer className="h-4 w-4" />
                <span className="text-sm font-bold">{diasRestantes} dias restantes</span>
              </div>
              <div className="flex items-center gap-1 text-zinc-500 mt-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">{DESAFIO_ATIVO.participantes} participantes</span>
              </div>
            </div>
          </div>

          {/* Meu progresso no desafio */}
          <div className="bg-zinc-900/80 backdrop-blur rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Seu progresso</span>
              <span className="text-sm font-bold text-white">
                R$ {DESAFIO_ATIVO.meu_valor.toLocaleString("pt-BR")} / R$ {DESAFIO_ATIVO.meta.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-1000" style={{ width: `${progressoDesafio}%` }} />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-500">{progressoDesafio}% da meta</span>
              <div className="flex items-center gap-1">
                <Medal className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-bold text-amber-400">#{DESAFIO_ATIVO.minha_posicao} no ranking</span>
              </div>
            </div>
          </div>

          {/* Mini ranking do desafio */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {DESAFIO_ATIVO.top5.map((p, i) => (
              <div key={i} className={cn(
                "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border",
                i === 0 ? "bg-amber-500/10 border-amber-500/30" :
                p.avatar === "EL" ? "bg-violet-500/10 border-violet-500/30" :
                "bg-zinc-800/50 border-zinc-700/50"
              )}>
                <span className={cn("text-xs font-bold", i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : i === 2 ? "text-amber-600" : "text-zinc-500")}>
                  #{i + 1}
                </span>
                <div className={cn("h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold",
                  i === 0 ? "bg-amber-600 text-white" : p.avatar === "EL" ? "bg-violet-600 text-white" : "bg-zinc-700 text-zinc-300"
                )}>
                  {p.avatar}
                </div>
                <div>
                  <p className="text-xs font-medium text-white">{p.nome.split(" ")[0]}</p>
                  <p className="text-[10px] text-zinc-500">R$ {(p.valor / 1000).toFixed(0)}k</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA 1 — Missoes de Hoje */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" /> Missoes de Hoje
            </h2>
            <Badge cor={missoesConcluidas === missoesTotal ? "green" : "amber"}>
              {missoesConcluidas}/{missoesTotal}
            </Badge>
          </div>

          {/* Barra de progresso das missoes */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500">Progresso diario</span>
              <span className="text-xs font-bold text-orange-400">+{pontosHoje} pontos hoje</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all" style={{ width: `${(missoesConcluidas / missoesTotal) * 100}%` }} />
            </div>
          </div>

          {/* Lista de missoes */}
          <div className="space-y-2">
            {missoes.map((missao) => (
              <button
                key={missao.id}
                onClick={() => !missao.concluida && completarMissao(missao.id)}
                disabled={missao.concluida}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left",
                  missao.concluida
                    ? "bg-emerald-500/5 border-emerald-500/20"
                    : "bg-zinc-900 border-zinc-800 hover:border-violet-500/30 hover:bg-violet-500/5 cursor-pointer"
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                  missao.concluida ? "bg-emerald-600" : "bg-zinc-800 border border-zinc-700"
                )}>
                  {missao.concluida ? <CheckCircle className="h-4 w-4 text-white" /> : <div className="h-3 w-3 rounded-full border-2 border-zinc-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", missao.concluida ? "text-zinc-500 line-through" : "text-white")}>{missao.nome}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge cor={missao.tipo === "diaria" ? "amber" : "blue"}>{missao.tipo}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Zap className="h-3 w-3 text-amber-400" />
                  <span className={cn("text-xs font-bold", missao.concluida ? "text-zinc-600" : "text-amber-400")}>+{missao.pontos}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* COLUNA 2 — Jornadas Ativas + Conquistas */}
        <div className="lg:col-span-2 space-y-6">

          {/* Jornadas em andamento */}
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-violet-400" /> Jornadas em Andamento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {JORNADAS_ATIVAS.map((jornada) => (
                <Link key={jornada.id} href={`/treinamentos/${jornada.id}`}>
                  <Card className="p-5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <Badge cor={jornada.tipo === "onboarding" ? "violet" : "blue"}>{jornada.tipo}</Badge>
                        <h3 className="text-sm font-bold text-white mt-2">{jornada.nome}</h3>
                      </div>
                      <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Progresso circular visual */}
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0">
                        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#27272a" strokeWidth="4" />
                          <circle cx="28" cy="28" r="24" fill="none" stroke="#8b5cf6" strokeWidth="4" strokeLinecap="round"
                            strokeDasharray={`${jornada.progresso * 1.508} 150.8`} />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-violet-400">{jornada.progresso}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-500">Etapas</span>
                          <span className="text-xs font-semibold text-white">{jornada.etapas_concluidas}/{jornada.etapas_total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-500">Pontos</span>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3 text-amber-400" />
                            <span className="text-xs font-semibold text-amber-400">{jornada.pontos_ganhos}/{jornada.pontos_total}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Conquistas recentes */}
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Trophy className="h-5 w-5 text-amber-400" /> Conquistas Recentes
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CONQUISTAS_RECENTES.map((c, i) => (
                <div
                  key={i}
                  className="group relative bg-zinc-900 rounded-2xl border border-zinc-800 p-4 text-center hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
                >
                  <div className={cn("h-14 w-14 rounded-2xl bg-gradient-to-br mx-auto mb-3 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform", c.cor)}>
                    {c.icone}
                  </div>
                  <p className="text-sm font-bold text-white">{c.nome}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{c.data}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Proximas conquistas (bloqueadas) */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-500 flex items-center gap-2 mb-3">
              <Lock className="h-4 w-4" /> Proximas Conquistas
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[
                { nome: "Vendedor de Elite", icone: "💎", requisito: "R$ 500k em vendas", progresso: 64 },
                { nome: "Mentor Iniciante", icone: "🎓", requisito: "Ser buddy de 3 pessoas", progresso: 33 },
                { nome: "Sequencia 30 Dias", icone: "⚡", requisito: "30 dias de missoes seguidas", progresso: 40 },
                { nome: "Reconhecedor Master", icone: "💜", requisito: "50 reconhecimentos dados", progresso: 74 },
              ].map((c, i) => (
                <div key={i} className="flex-shrink-0 w-48 bg-zinc-900 rounded-xl border border-zinc-800 p-3 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl grayscale">{c.icone}</span>
                    <div>
                      <p className="text-xs font-bold text-zinc-300">{c.nome}</p>
                      <p className="text-[10px] text-zinc-600">{c.requisito}</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-zinc-600 rounded-full" style={{ width: `${c.progresso}%` }} />
                  </div>
                  <p className="text-[10px] text-zinc-600 text-right mt-1">{c.progresso}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
