"use client";

import Link from "next/link";
import { Settings, Building, Palette, Coins, Link2, Shield, CreditCard } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

const CONFIG_ITEMS = [
  { nome: "Empresa", desc: "Nome, logo, branding", icone: Building, cor: "text-violet-400", href: "/configuracoes/empresa" },
  { nome: "Aparencia", desc: "Cores, tema, personalizacao", icone: Palette, cor: "text-pink-400", href: "/configuracoes/empresa" },
  { nome: "Moeda", desc: "Nome, icone, conversao", icone: Coins, cor: "text-amber-400", href: "/configuracoes/moeda" },
  { nome: "Integracoes", desc: "Tiny ERP, Omie, Bling", icone: Link2, cor: "text-blue-400", href: "/configuracoes/integracoes" },
  { nome: "Seguranca", desc: "Perfis, permissoes, 2FA", icone: Shield, cor: "text-emerald-400", href: "/configuracoes" },
  { nome: "Plano e Cobranca", desc: "Assinatura e limites", icone: CreditCard, cor: "text-zinc-400", href: "/configuracoes" },
];

export default function PaginaConfiguracoes() {
  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Configuracoes" }]} />
      <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="h-6 w-6 text-zinc-400" /> Configuracoes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONFIG_ITEMS.map((item) => (
          <Link key={item.nome} href={item.href}>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 text-left hover:border-zinc-700 hover:shadow-lg transition-all cursor-pointer group">
              <item.icone className={`h-8 w-8 ${item.cor} mb-3 group-hover:scale-110 transition-transform`} />
              <h3 className="text-white font-semibold">{item.nome}</h3>
              <p className="text-zinc-500 text-sm mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
