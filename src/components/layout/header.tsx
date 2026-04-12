"use client";

import { Bell, Search } from "lucide-react";
import { usarSessao } from "@/hooks/usar-sessao";

export function Header() {
  const { sessao } = usarSessao();

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Busca */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Acoes */}
      <div className="flex items-center gap-4">
        {/* Pontos */}
        {sessao && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800">
            <span className="text-lg">{sessao.empresa.moeda_icone}</span>
            <span className="text-sm font-semibold text-white">
              {sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")}
            </span>
          </div>
        )}

        {/* Notificacoes */}
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-violet-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            3
          </span>
        </button>

        {/* Avatar */}
        {sessao && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {sessao.colaborador.nome.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">
                {sessao.colaborador.nome}
              </p>
              <p className="text-xs text-zinc-500">
                {sessao.perfil.nome_exibicao}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
