"use client";

import { useState, useEffect } from "react";
import { usarToast } from "@/components/ui/toast";
import { listarValores, listarReconhecimentos, buscarComportamentoSemana, listarFeed } from "@/lib/supabase/queries/cultura";
import { Heart, Star, Calendar, Sparkles, MessageCircle, ThumbsUp, Send, Award, TrendingUp, Users, Smile, Meh, Frown, Flame, ChevronRight, Crown, Building, Target, Eye, Briefcase, MapPin, Globe, Phone, Mail, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usarPermissao } from "@/hooks/usar-permissao";
import { usarSessao } from "@/hooks/usar-sessao";
import { cn } from "@/lib/utils";

// Demo data
const COMPORTAMENTO_SEMANA = {
  valor: "Ownership",
  icone: "💪",
  comportamento: "Resolver problemas sem esperar que mandem",
  semana: "07-13 Abril",
  reconhecimentos_vinculados: 12,
};

const VALORES_EMPRESA = [
  { nome: "Resultado", icone: "🎯", reconhecimentos_mes: 23, cor: "from-violet-600 to-purple-600" },
  { nome: "Ownership", icone: "💪", reconhecimentos_mes: 18, cor: "from-blue-600 to-cyan-600", ativo: true },
  { nome: "Velocidade", icone: "⚡", reconhecimentos_mes: 15, cor: "from-amber-600 to-yellow-600" },
  { nome: "Colaboracao", icone: "🤝", reconhecimentos_mes: 31, cor: "from-emerald-600 to-teal-600" },
  { nome: "Evolucao", icone: "🚀", reconhecimentos_mes: 9, cor: "from-pink-600 to-rose-600" },
];

const FEED_RECONHECIMENTOS = [
  {
    id: "1", de: "Ana Carolina", de_avatar: "AC", para: "Lucas Mendes", para_avatar: "LM",
    valor: "Resultado", valor_icone: "🎯", mensagem: "Parabens por bater a meta antes do prazo! Voce e inspiracao pro time todo.",
    moedas: 50, amplificacoes: 3, tempo: "2 horas atras",
  },
  {
    id: "2", de: "Everton Lauxen", de_avatar: "EL", para: "Julia Almeida", para_avatar: "JA",
    valor: "Colaboracao", valor_icone: "🤝", mensagem: "Obrigado por ajudar o time comercial com os criativos de urgencia. Fez toda a diferenca na campanha.",
    moedas: 30, amplificacoes: 5, tempo: "5 horas atras",
  },
  {
    id: "3", de: "Rafael Oliveira", de_avatar: "RO", para: "Mariana Costa", para_avatar: "MC",
    valor: "Velocidade", valor_icone: "⚡", mensagem: "Entregou o relatorio de marketing em metade do prazo. Qualidade impecavel.",
    moedas: 40, amplificacoes: 1, tempo: "Ontem",
  },
  {
    id: "4", de: "Fernanda Dias", de_avatar: "FD", para: "Thiago Lima", para_avatar: "TL",
    valor: "Ownership", valor_icone: "💪", mensagem: "Resolveu o problema do cliente sozinho, sem precisar escalar. Isso e ter atitude de dono.",
    moedas: 25, amplificacoes: 7, tempo: "Ontem",
  },
];

const TOP_RECONHECIDOS = [
  { nome: "Fernanda Dias", total: 42, avatar: "FD" },
  { nome: "Ana Carolina", total: 38, avatar: "AC" },
  { nome: "Lucas Mendes", total: 35, avatar: "LM" },
];

const RITUAIS_PROXIMOS = [
  { nome: "Sexta de Resultados", data: "Sexta, 17:00", tipo: "semanal", icone: "📊" },
  { nome: "1:1 com Gestor", data: "Segunda, 10:00", tipo: "quinzenal", icone: "👥" },
  { nome: "Retro do Mes", data: "30 Abril", tipo: "mensal", icone: "🔄" },
];

export default function PaginaCultura() {
  const { eGestor } = usarPermissao();
  const { sessao } = usarSessao();
  const toast = usarToast();
  const [reconhecimentoTexto, setReconhecimentoTexto] = useState("");
  const [enviandoReconhecimento, setEnviandoReconhecimento] = useState(false);
  const [valoresDB, setValoresDB] = useState<any[]>([]);
  const [reconhecimentosDB, setReconhecimentosDB] = useState<any[]>([]);
  const [feedDB, setFeedDB] = useState<any[]>([]);
  const [comportamentoSemanaDB, setComportamentoSemanaDB] = useState<any>(null);

  useEffect(() => {
    async function carregar() {
      try {
        const [v, r, f, cs] = await Promise.all([
          listarValores(),
          listarReconhecimentos(10),
          listarFeed(10),
          buscarComportamentoSemana(),
        ]);
        setValoresDB(v || []);
        setReconhecimentosDB(r || []);
        setFeedDB(f || []);
        setComportamentoSemanaDB(cs);
      } catch {}
    }
    carregar();
  }, []);
  const [feedCurtidas, setFeedCurtidas] = useState<Set<string>>(new Set());

  function toggleCurtida(id: string) {
    setFeedCurtidas((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id); else novo.add(id);
      return novo;
    });
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Cultura" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="h-6 w-6 text-rose-400" /> Cultura
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Valores, reconhecimento e rituais da empresa</p>
        </div>
        {eGestor && (
          <Link href="/cultura/criar"><Button><Sparkles className="h-4 w-4" />Criar Cultura com IA</Button></Link>
        )}
      </div>

      {/* HERO — Comportamento da Semana */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/60 via-zinc-900 to-zinc-950 p-6">
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Badge cor="violet">Comportamento da Semana</Badge>
          <div className="flex items-center gap-4 mt-3">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center text-3xl shrink-0">
              {COMPORTAMENTO_SEMANA.icone}
            </div>
            <div>
              <p className="text-xs text-violet-400 font-semibold uppercase">{COMPORTAMENTO_SEMANA.valor}</p>
              <h2 className="text-lg font-bold text-white mt-0.5">{COMPORTAMENTO_SEMANA.comportamento}</h2>
              <p className="text-xs text-zinc-500 mt-1">Semana {COMPORTAMENTO_SEMANA.semana} · {COMPORTAMENTO_SEMANA.reconhecimentos_vinculados} reconhecimentos vinculados</p>
            </div>
          </div>
          <p className="text-sm text-zinc-400 mt-3">
            Reconhecimentos feitos vinculados a este comportamento ganham <span className="text-violet-400 font-bold">1.5x pontos</span> esta semana.
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* SOBRE A EMPRESA — Conteudo completo */}
      {/* ============================================ */}

      {/* Identidade da Empresa */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-amber-600/5" />
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{sessao?.empresa.nome || "Engagge Culture"}</h2>
              <p className="text-sm text-zinc-400">Plataforma de cultura organizacional, gamificacao e fulfillment</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-xs text-zinc-500"><MapPin className="h-3 w-3" />Brasil</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500"><Users className="h-3 w-3" />45 colaboradores</span>
                <span className="flex items-center gap-1 text-xs text-zinc-500"><Globe className="h-3 w-3" />engaggeculture.com</span>
              </div>
            </div>
          </div>

          {/* Missao, Visao, Negocio, Diferenciais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4 border-l-4 border-l-violet-500">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-violet-400" />
                <p className="text-xs text-violet-400 font-bold uppercase tracking-wider">Missao</p>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">Transformar cultura organizacional em sistema mensuravel que gamifica, reconhece e premia resultado real.</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border-l-4 border-l-amber-500">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-amber-400" />
                <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Visao</p>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">Ser o sistema operacional de cultura de toda empresa seria no Brasil ate 2028.</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border-l-4 border-l-emerald-500">
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="h-4 w-4 text-emerald-400" />
                <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Negocio</p>
              </div>
              <p className="text-sm text-zinc-200 leading-relaxed">Plataforma SaaS de cultura, gamificacao e fulfillment de premiacoes corporativas com vertical integration.</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4 border-l-4 border-l-rose-500">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-rose-400" />
                <p className="text-xs text-rose-400 font-bold uppercase tracking-wider">Diferenciais</p>
              </div>
              <ul className="text-sm text-zinc-200 space-y-1.5">
                <li className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">•</span>Gamificacao conectada a resultado real via API</li>
                <li className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">•</span>Fulfillment fisico proprio (Engagge Placas)</li>
                <li className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">•</span>Cultura que se mede, nao se adivinha</li>
                <li className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">•</span>6 modulos integrados em 1 plataforma</li>
              </ul>
            </div>
          </div>

          {/* Numeros da empresa */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            {[
              { label: "Colaboradores", valor: "45", icone: Users, cor: "text-violet-400" },
              { label: "Clientes Ativos", valor: "180", icone: Building, cor: "text-emerald-400" },
              { label: "Premiacoes/Mes", valor: "1.200+", icone: Award, cor: "text-amber-400" },
              { label: "Reconhecimentos", valor: "3.400+", icone: Heart, cor: "text-rose-400" },
              { label: "Satisfacao", valor: "92%", icone: Smile, cor: "text-cyan-400" },
            ].map((n, i) => {
              const Icone = n.icone;
              return (
                <div key={i} className="bg-zinc-800/50 rounded-xl p-3 text-center">
                  <Icone className={cn("h-4 w-4 mx-auto mb-1", n.cor)} />
                  <p className="text-lg font-bold text-white">{n.valor}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{n.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ORGANOGRAMA DA EMPRESA */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-violet-400" /> Organograma
        </h2>
        <Card className="p-6">
          {/* CEO */}
          <div className="flex flex-col items-center">
            <div className="bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl p-4 text-center w-56 border border-violet-500/30 shadow-lg shadow-violet-500/10">
              <div className="h-14 w-14 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-white">EL</div>
              <p className="text-sm font-bold text-white">Everton Lauxen</p>
              <p className="text-[10px] text-violet-200">CEO / Fundador</p>
            </div>

            {/* Linha vertical */}
            <div className="w-px h-8 bg-zinc-700" />

            {/* Linha horizontal */}
            <div className="w-full max-w-3xl h-px bg-zinc-700 relative">
              <div className="absolute left-[10%] -top-px w-px h-8 bg-zinc-700" />
              <div className="absolute left-[30%] -top-px w-px h-8 bg-zinc-700" />
              <div className="absolute left-[50%] -top-px w-px h-8 bg-zinc-700" />
              <div className="absolute left-[70%] -top-px w-px h-8 bg-zinc-700" />
              <div className="absolute left-[90%] -top-px w-px h-8 bg-zinc-700" />
            </div>

            {/* Departamentos */}
            <div className="grid grid-cols-5 gap-3 w-full max-w-3xl mt-8">
              {[
                { nome: "Ana Carolina", cargo: "Head Comercial", depto: "Comercial", avatar: "AC", cor: "from-blue-600 to-cyan-600", membros: 8 },
                { nome: "Rafael Oliveira", cargo: "Head Tech", depto: "Tecnologia", avatar: "RO", cor: "from-emerald-600 to-teal-600", membros: 6 },
                { nome: "Mariana Costa", cargo: "Head Marketing", depto: "Marketing", avatar: "MC", cor: "from-pink-600 to-rose-600", membros: 4 },
                { nome: "Thiago Lima", cargo: "Head Operacoes", depto: "Operacoes", avatar: "TL", cor: "from-amber-600 to-orange-600", membros: 5 },
                { nome: "Fernanda Dias", cargo: "Head RH", depto: "RH", avatar: "FD", cor: "from-violet-600 to-purple-600", membros: 3 },
              ].map((d, i) => (
                <div key={i} className="text-center">
                  <div className={cn("rounded-xl p-3 bg-gradient-to-br border border-zinc-700/50", d.cor)}>
                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-1.5 text-xs font-bold text-white">{d.avatar}</div>
                    <p className="text-xs font-bold text-white">{d.nome}</p>
                    <p className="text-[9px] text-white/70">{d.cargo}</p>
                  </div>
                  <div className="mt-2 bg-zinc-800 rounded-lg px-2 py-1">
                    <p className="text-[10px] font-semibold text-zinc-300">{d.depto}</p>
                    <p className="text-[9px] text-zinc-500">{d.membros} pessoas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Valores da empresa — cards horizontais */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">Nossos Valores</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {VALORES_EMPRESA.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex-shrink-0 w-40 rounded-2xl border p-4 text-center transition-all duration-300 cursor-pointer hover:scale-[1.03]",
                v.ativo ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10" : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
              )}
            >
              <div className={cn("h-12 w-12 rounded-xl bg-gradient-to-br mx-auto mb-2 flex items-center justify-center text-2xl", v.cor)}>
                {v.icone}
              </div>
              <p className="text-sm font-bold text-white">{v.nome}</p>
              <p className="text-xs text-zinc-500 mt-1">{v.reconhecimentos_mes} reconhecimentos</p>
              {v.ativo && <Badge cor="violet">Em foco</Badge>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* COLUNA PRINCIPAL — Feed de Reconhecimentos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-violet-400" /> Feed de Cultura
          </h2>

          {/* Caixa de reconhecimento rapido */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {sessao?.colaborador.nome.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <textarea
                  value={reconhecimentoTexto}
                  onChange={(e) => setReconhecimentoTexto(e.target.value)}
                  placeholder="Reconheca alguem do time... Quem merece destaque hoje?"
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    {VALORES_EMPRESA.slice(0, 3).map((v) => (
                      <button key={v.nome} className="text-lg hover:scale-125 transition-transform" title={v.nome}>{v.icone}</button>
                    ))}
                  </div>
                  <Button tamanho="sm" disabled={!reconhecimentoTexto.trim() || enviandoReconhecimento}
                    onClick={async () => {
                      setEnviandoReconhecimento(true);
                      try {
                        toast.sucesso("Reconhecimento enviado!", "Selecione um colega na proxima versao.");
                        setReconhecimentoTexto("");
                      } catch (err: any) { toast.erro("Erro", err.message); }
                      setEnviandoReconhecimento(false);
                    }}
                  >
                    <Send className="h-3 w-3" /> {enviandoReconhecimento ? "Enviando..." : "Enviar"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Feed */}
          <div className="space-y-3">
            {FEED_RECONHECIMENTOS.map((rec) => (
              <Card key={rec.id} className="p-4 hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {rec.de_avatar}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-sm font-semibold text-white">{rec.de}</span>
                      <span className="text-xs text-zinc-600">reconheceu</span>
                      <span className="text-sm font-semibold text-violet-400">{rec.para}</span>
                      <span className="text-lg ml-1">{rec.valor_icone}</span>
                      <Badge cor="zinc">{rec.valor}</Badge>
                    </div>
                    <p className="text-sm text-zinc-300 mt-2 leading-relaxed">{rec.mensagem}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button
                        onClick={() => toggleCurtida(rec.id)}
                        className={cn(
                          "flex items-center gap-1 text-xs transition-colors",
                          feedCurtidas.has(rec.id) ? "text-violet-400" : "text-zinc-500 hover:text-violet-400"
                        )}
                      >
                        <ThumbsUp className={cn("h-3.5 w-3.5", feedCurtidas.has(rec.id) && "fill-violet-400")} />
                        {rec.amplificacoes + (feedCurtidas.has(rec.id) ? 1 : 0)} amplificacoes
                      </button>
                      <span className="flex items-center gap-1 text-xs text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400" /> {rec.moedas} moedas
                      </span>
                      <span className="text-xs text-zinc-600">{rec.tempo}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* COLUNA LATERAL — Widgets */}
        <div className="space-y-4">
          {/* Pulso do time */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-400" /> Pulso do Time
            </h3>
            <div className="flex items-center justify-center gap-6 py-4">
              <div className="text-center">
                <Smile className="h-8 w-8 text-emerald-400 mx-auto" />
                <p className="text-2xl font-bold text-emerald-400 mt-1">72%</p>
                <p className="text-[10px] text-zinc-500">Felizes</p>
              </div>
              <div className="text-center">
                <Meh className="h-8 w-8 text-amber-400 mx-auto" />
                <p className="text-2xl font-bold text-amber-400 mt-1">22%</p>
                <p className="text-[10px] text-zinc-500">Neutros</p>
              </div>
              <div className="text-center">
                <Frown className="h-8 w-8 text-red-400 mx-auto" />
                <p className="text-2xl font-bold text-red-400 mt-1">6%</p>
                <p className="text-[10px] text-zinc-500">Insatisfeitos</p>
              </div>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
              <div className="h-full bg-emerald-500" style={{ width: "72%" }} />
              <div className="h-full bg-amber-500" style={{ width: "22%" }} />
              <div className="h-full bg-red-500" style={{ width: "6%" }} />
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-2">Baseado nos check-ins semanais</p>
          </Card>

          {/* Mais reconhecidos */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Crown className="h-4 w-4 text-amber-400" /> Mais Reconhecidos
            </h3>
            <div className="space-y-2">
              {TOP_RECONHECIDOS.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <span className={cn("text-xs font-bold w-5 text-center",
                    i === 0 ? "text-amber-400" : i === 1 ? "text-zinc-300" : "text-amber-600"
                  )}>#{i + 1}</span>
                  <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                    i === 0 ? "bg-amber-600 text-white" : "bg-zinc-700 text-zinc-300"
                  )}>{p.avatar}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{p.nome}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-3 w-3 text-rose-400 fill-rose-400" />
                    <span className="text-xs font-bold text-rose-400">{p.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Rituais proximos */}
          <Card className="p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-blue-400" /> Proximos Rituais
            </h3>
            <div className="space-y-2">
              {RITUAIS_PROXIMOS.map((r, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <span className="text-xl">{r.icone}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{r.nome}</p>
                    <p className="text-[10px] text-zinc-500">{r.data}</p>
                  </div>
                  <Badge cor="zinc">{r.tipo}</Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Allowance restante */}
          {sessao && (
            <Card className="p-4">
              <h3 className="text-sm font-bold text-white mb-3">Suas Moedas de Reconhecimento</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-500">Restante este mes</span>
                <span className="text-sm font-bold text-amber-400">{sessao.colaborador.allowance_restante} / {sessao.empresa.allowance_reconhecimento_mensal}</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(sessao.colaborador.allowance_restante / sessao.empresa.allowance_reconhecimento_mensal) * 100}%` }} />
              </div>
              <p className="text-[10px] text-zinc-600 mt-2">Moedas nao usadas expiram no fim do mes</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
