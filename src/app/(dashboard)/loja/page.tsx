"use client";

import { ShoppingBag, Gift, CreditCard } from "lucide-react";
import { usarSessao } from "@/hooks/usar-sessao";

export default function PaginaLoja() {
  const { sessao } = usarSessao();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loja de Recompensas</h1>
          <p className="text-zinc-400 mt-1">Resgate seus pontos por premios</p>
        </div>
        {sessao && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <span className="text-lg">{sessao.empresa.moeda_icone}</span>
              <span className="text-sm font-semibold text-white">
                {sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")} pontos
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-semibold text-white">
                R$ {sessao.colaborador.saldo_creditos.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Categorias */}
      <div className="flex gap-2 flex-wrap">
        {["Todos", "Fisicos", "Gift Cards", "Experiencias", "Kits"].map((cat) => (
          <button
            key={cat}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-violet-500 transition-colors"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid de Produtos */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <ShoppingBag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-500">Nenhum produto cadastrado ainda.</p>
        <p className="text-zinc-600 text-sm mt-1">
          O administrador precisa adicionar produtos a loja.
        </p>
      </div>
    </div>
  );
}
