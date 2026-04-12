"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usarPermissao } from "@/hooks/usar-permissao";
import {
  LayoutDashboard, Target, Heart, ShoppingBag, GraduationCap,
  Settings, Trophy, Users, Package, BarChart3, LogOut,
  Truck, Warehouse, Store, Receipt, FileText, DollarSign,
  Building, Sparkles,
} from "lucide-react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ItemMenu {
  nome: string;
  href: string;
  icone: React.ElementType;
  apenasAdmin?: boolean;
  apenasGestor?: boolean;
}

const MENU_PRINCIPAL: ItemMenu[] = [
  { nome: "Painel", href: "/painel", icone: LayoutDashboard },
  { nome: "Gamificacao", href: "/gamificacao", icone: Target },
  { nome: "Cultura", href: "/cultura", icone: Heart },
  { nome: "Loja Recompensas", href: "/loja", icone: ShoppingBag },
  { nome: "Treinamentos", href: "/treinamentos", icone: GraduationCap },
  { nome: "Ranking", href: "/ranking", icone: Trophy },
];

const MENU_OPERACAO: ItemMenu[] = [
  { nome: "Envios", href: "/envios", icone: Truck, apenasGestor: true },
  { nome: "Estoque", href: "/estoque", icone: Warehouse, apenasGestor: true },
  { nome: "Loja Interna", href: "/loja-interna", icone: Store, apenasGestor: true },
];

const MENU_FINANCEIRO: ItemMenu[] = [
  { nome: "Faturas", href: "/financeiro/faturas", icone: Receipt, apenasGestor: true },
  { nome: "Notas Fiscais", href: "/financeiro/notas", icone: FileText, apenasGestor: true },
  { nome: "Fretes", href: "/financeiro/fretes", icone: DollarSign, apenasGestor: true },
];

const MENU_ADMIN: ItemMenu[] = [
  { nome: "Colaboradores", href: "/colaboradores", icone: Users, apenasGestor: true },
  { nome: "Clientes", href: "/clientes", icone: Building, apenasGestor: true },
  { nome: "Configuracoes", href: "/configuracoes", icone: Settings, apenasAdmin: true },
];

export function Sidebar() {
  const caminho = usePathname();
  const { eAdmin, eGestor } = usarPermissao();
  const router = useRouter();

  async function handleLogout() {
    const supabase = criarClienteNavegador();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function renderItem(item: ItemMenu) {
    if (item.apenasAdmin && !eAdmin) return null;
    if (item.apenasGestor && !eGestor) return null;
    const ativo = caminho === item.href || caminho.startsWith(item.href + "/");
    const Icone = item.icone;
    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          ativo ? "bg-violet-600/20 text-violet-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Icone className="h-4 w-4 shrink-0" />
        {item.nome}
      </Link>
    );
  }

  function renderSecao(titulo: string, itens: ItemMenu[]) {
    const visiveis = itens.filter((i) => {
      if (i.apenasAdmin && !eAdmin) return false;
      if (i.apenasGestor && !eGestor) return false;
      return true;
    });
    if (visiveis.length === 0) return null;
    return (
      <>
        <p className="px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-5 mb-1.5">
          {titulo}
        </p>
        {itens.map(renderItem)}
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-zinc-800">
        <Link href="/painel" className="flex items-center gap-1.5">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <span className="text-base font-bold text-white">
            Engagge<span className="text-violet-500">Culture</span>
          </span>
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {renderSecao("Menu", MENU_PRINCIPAL)}
        {renderSecao("Operacao", MENU_OPERACAO)}
        {renderSecao("Financeiro", MENU_FINANCEIRO)}
        {renderSecao("Administracao", MENU_ADMIN)}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
