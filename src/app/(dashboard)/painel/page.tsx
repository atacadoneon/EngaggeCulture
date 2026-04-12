"use client";

import { usarSessao } from "@/hooks/usar-sessao";
import { usarPermissao } from "@/hooks/usar-permissao";
import {
  Target,
  Heart,
  ShoppingBag,
  Trophy,
  TrendingUp,
  Users,
  Flame,
  Gift,
} from "lucide-react";

function CardMetrica({
  titulo,
  valor,
  icone: Icone,
  cor,
  subtitulo,
}: {
  titulo: string;
  valor: string;
  icone: React.ElementType;
  cor: string;
  subtitulo?: string;
}) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400">{titulo}</p>
          <p className="text-2xl font-bold text-white mt-1">{valor}</p>
          {subtitulo && (
            <p className="text-xs text-zinc-500 mt-1">{subtitulo}</p>
          )}
        </div>
        <div className={`p-2.5 rounded-lg ${cor}`}>
          <Icone className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function PaginaPainel() {
  const { sessao, carregando } = usarSessao();
  const { eGestor } = usarPermissao();

  if (carregando) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!sessao) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Ola, {sessao.colaborador.nome.split(" ")[0]}!
        </h1>
        <p className="text-zinc-400 mt-1">
          Bem-vindo ao painel da {sessao.empresa.nome}
        </p>
      </div>

      {/* Cards de Metricas Pessoais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <CardMetrica
          titulo="Meus Pontos"
          valor={sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")}
          icone={Trophy}
          cor="bg-violet-600"
          subtitulo={`${sessao.empresa.moeda_icone} ${sessao.empresa.moeda_nome}`}
        />
        <CardMetrica
          titulo="Meus Creditos"
          valor={`R$ ${sessao.colaborador.saldo_creditos.toFixed(2)}`}
          icone={Gift}
          cor="bg-emerald-600"
          subtitulo="Employee Wallet"
        />
        <CardMetrica
          titulo="Reconhecimentos"
          valor="--"
          icone={Heart}
          cor="bg-rose-600"
          subtitulo="Este mes"
        />
        <CardMetrica
          titulo="Sequencia"
          valor="-- dias"
          icone={Flame}
          cor="bg-orange-600"
          subtitulo="Streak de missoes"
        />
      </div>

      {/* Cards de Metricas da Empresa (so gestor+) */}
      {eGestor && (
        <>
          <h2 className="text-lg font-semibold text-white mt-8">
            Visao da Empresa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardMetrica
              titulo="Culture Score"
              valor="--"
              icone={TrendingUp}
              cor="bg-blue-600"
              subtitulo="Score de cultura 0-100"
            />
            <CardMetrica
              titulo="Colaboradores Ativos"
              valor="--"
              icone={Users}
              cor="bg-cyan-600"
            />
            <CardMetrica
              titulo="Desafios Ativos"
              valor="--"
              icone={Target}
              cor="bg-amber-600"
            />
            <CardMetrica
              titulo="Resgates no Mes"
              valor="--"
              icone={ShoppingBag}
              cor="bg-pink-600"
            />
          </div>
        </>
      )}

      {/* Secao Feed Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Feed Recente</h3>
          <div className="space-y-4">
            <p className="text-zinc-500 text-sm text-center py-8">
              Nenhuma atividade ainda. Comece reconhecendo um colega!
            </p>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Minhas Missoes</h3>
          <div className="space-y-3">
            <p className="text-zinc-500 text-sm text-center py-8">
              Nenhuma missao ativa no momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
