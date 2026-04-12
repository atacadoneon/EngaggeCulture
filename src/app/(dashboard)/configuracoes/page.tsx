"use client";

import { Settings, Building, Palette, Coins, Link, Shield } from "lucide-react";

export default function PaginaConfiguracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuracoes</h1>
        <p className="text-zinc-400 mt-1">Configuracoes da empresa e da plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { nome: "Empresa", desc: "Nome, logo, branding", icone: Building, cor: "text-violet-500" },
          { nome: "Aparencia", desc: "Cores, tema, personalizacao", icone: Palette, cor: "text-pink-500" },
          { nome: "Moeda", desc: "Nome, icone, conversao", icone: Coins, cor: "text-amber-500" },
          { nome: "Integracoes", desc: "APIs, webhooks, ERPs", icone: Link, cor: "text-blue-500" },
          { nome: "Seguranca", desc: "Roles, permissoes, 2FA", icone: Shield, cor: "text-emerald-500" },
          { nome: "Plano", desc: "Assinatura e limites", icone: Settings, cor: "text-zinc-400" },
        ].map((item) => (
          <button
            key={item.nome}
            className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-left hover:border-zinc-700 transition-colors"
          >
            <item.icone className={`h-8 w-8 ${item.cor} mb-3`} />
            <h3 className="text-white font-semibold">{item.nome}</h3>
            <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
