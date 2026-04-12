"use client";

import { useEffect, useState } from "react";
import { usarSessao } from "@/hooks/usar-sessao";
import { usarPermissao } from "@/hooks/usar-permissao";
import { usarToast } from "@/components/ui/toast";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonCards } from "@/components/ui/skeleton";
import {
  Target, Heart, ShoppingBag, Trophy, TrendingUp, Users,
  Flame, Gift, BookOpen, Package, BarChart3,
} from "lucide-react";
import { buscarMetricasPessoais, buscarMetricasEmpresa, buscarFeedRecente, buscarHumorMedio } from "@/lib/supabase/queries/dashboard";
import Link from "next/link";

function CardMetrica({ titulo, valor, icone: Icone, cor, subtitulo }: {
  titulo: string; valor: string; icone: React.ElementType; cor: string; subtitulo?: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{titulo}</p>
          <p className="text-2xl font-bold text-white mt-1">{valor}</p>
          {subtitulo && <p className="text-xs text-zinc-500 mt-1">{subtitulo}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${cor}`}><Icone className="h-5 w-5 text-white" /></div>
      </div>
    </Card>
  );
}

export default function PaginaPainel() {
  const { sessao, carregando: carregandoSessao } = usarSessao();
  const { eGestor } = usarPermissao();
  const [metricas, setMetricas] = useState<any>(null);
  const [metricasEmpresa, setMetricasEmpresa] = useState<any>(null);
  const [feed, setFeed] = useState<any[]>([]);
  const [humor, setHumor] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!sessao) return;
      setCarregando(true);
      try {
        const [mp, me, f, h] = await Promise.all([
          buscarMetricasPessoais(sessao.colaborador.id),
          eGestor ? buscarMetricasEmpresa() : null,
          buscarFeedRecente(5),
          buscarHumorMedio(),
        ]);
        setMetricas(mp);
        setMetricasEmpresa(me);
        setFeed(f || []);
        setHumor(h);
      } catch {}
      setCarregando(false);
    }
    if (sessao) carregar();
  }, [sessao]);

  if (carregandoSessao) return <SkeletonCards quantidade={4} />;
  if (!sessao) return null;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Painel" }]} />

      <div>
        <h1 className="text-2xl font-bold text-white">Ola, {sessao.colaborador.nome.split(" ")[0]}!</h1>
        <p className="text-zinc-400 mt-1">Bem-vindo ao painel da {sessao.empresa.nome}</p>
      </div>

      {/* Metricas Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetrica titulo="Meus Pontos" valor={sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")} icone={Trophy} cor="bg-violet-600" subtitulo={`${sessao.empresa.moeda_icone} ${sessao.empresa.moeda_nome}`} />
        <CardMetrica titulo="Meus Creditos" valor={`R$ ${sessao.colaborador.saldo_creditos.toFixed(2)}`} icone={Gift} cor="bg-emerald-600" subtitulo="Carteira de creditos" />
        <CardMetrica titulo="Reconhecimentos" valor={String(metricas?.reconhecimentos_mes || 0)} icone={Heart} cor="bg-rose-600" subtitulo="Este mes" />
        <CardMetrica titulo="Sequencia" valor={`${metricas?.streak_atual || 0} dias`} icone={Flame} cor="bg-orange-600" subtitulo="Missoes consecutivas" />
      </div>

      {/* Metricas da Empresa (gestor+) */}
      {eGestor && metricasEmpresa && (
        <>
          <h2 className="text-lg font-semibold text-white mt-2">Visao da Empresa</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardMetrica titulo="Colaboradores Ativos" valor={String(metricasEmpresa.colaboradores_ativos)} icone={Users} cor="bg-cyan-600" />
            <CardMetrica titulo="Desafios Ativos" valor={String(metricasEmpresa.desafios_ativos)} icone={Target} cor="bg-amber-600" />
            <CardMetrica titulo="Resgates no Mes" valor={String(metricasEmpresa.pedidos_mes)} icone={ShoppingBag} cor="bg-pink-600" />
            <CardMetrica titulo="Reconhecimentos" valor={String(metricasEmpresa.reconhecimentos_mes)} icone={Heart} cor="bg-violet-600" subtitulo="No mes" />
          </div>
        </>
      )}

      {/* Humor medio + Acoes rapidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Feed Recente</h3>
            {feed.length === 0 ? (
              <p className="text-zinc-500 text-sm text-center py-6">Nenhuma atividade ainda. Comece reconhecendo um colega!</p>
            ) : (
              <div className="space-y-3">
                {feed.map((post: any) => (
                  <div key={post.id} className="flex items-start gap-3 p-3 bg-zinc-800/50 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {post.autor?.nome?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm text-white">{post.autor?.nome || "Sistema"}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">{post.conteudo || post.tipo}</p>
                      <p className="text-[10px] text-zinc-600 mt-1">{new Date(post.criado_em).toLocaleString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card className="p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Acoes Rapidas</h3>
          <div className="space-y-2">
            {[
              { nome: "Reconhecer colega", href: "/cultura", icone: Heart, cor: "text-rose-400" },
              { nome: "Ver ranking", href: "/ranking", icone: Trophy, cor: "text-amber-400" },
              { nome: "Resgatar premio", href: "/loja", icone: ShoppingBag, cor: "text-violet-400" },
              { nome: "Treinamentos", href: "/treinamentos", icone: BookOpen, cor: "text-blue-400" },
              { nome: "Meus envios", href: "/envios", icone: Package, cor: "text-emerald-400" },
            ].map((acao) => {
              const Icone = acao.icone;
              return (
                <Link key={acao.href} href={acao.href} className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <Icone className={`h-5 w-5 ${acao.cor}`} />
                  <span className="text-sm text-white">{acao.nome}</span>
                </Link>
              );
            })}
          </div>
          {humor !== null && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500">Humor medio do time</p>
              <p className="text-2xl font-bold text-white">{humor}/5</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
