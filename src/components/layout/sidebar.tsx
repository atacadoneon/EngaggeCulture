"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usarPermissao } from "@/hooks/usar-permissao";
import {
  LayoutDashboard,
  Target,
  Heart,
  ShoppingBag,
  GraduationCap,
  Settings,
  Bell,
  Trophy,
  Users,
  Package,
  BarChart3,
  LogOut,
} from "lucide-react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface ItemMenu {
  nome: string;
  href: string;
  icone: React.ElementType;
  permissao?: string;
  apenasAdmin?: boolean;
  apenasGestor?: boolean;
}

const MENU_ITEMS: ItemMenu[] = [
  { nome: "Painel", href: "/painel", icone: LayoutDashboard },
  { nome: "Gamificacao", href: "/gamificacao", icone: Target },
  { nome: "Cultura", href: "/cultura", icone: Heart },
  { nome: "Loja", href: "/loja", icone: ShoppingBag },
  { nome: "Treinamentos", href: "/treinamentos", icone: GraduationCap },
  { nome: "Ranking", href: "/gamificacao/ranking", icone: Trophy },
];

const MENU_ADMIN: ItemMenu[] = [
  { nome: "Colaboradores", href: "/configuracoes/colaboradores", icone: Users, apenasGestor: true },
  { nome: "Fulfillment", href: "/configuracoes/fulfillment", icone: Package, apenasGestor: true },
  { nome: "Relatorios", href: "/configuracoes/relatorios", icone: BarChart3, apenasGestor: true },
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
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          ativo
            ? "bg-violet-600/20 text-violet-400"
            : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
        )}
      >
        <Icone className="h-5 w-5 shrink-0" />
        {item.nome}
      </Link>
    );
  }

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-zinc-800">
        <Link href="/painel" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Engagge <span className="text-violet-500">Culture</span>
          </span>
        </Link>
      </div>

      {/* Menu principal */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Menu
        </p>
        {MENU_ITEMS.map(renderItem)}

        {eGestor && (
          <>
            <div className="my-4 border-t border-zinc-800" />
            <p className="px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Administracao
            </p>
            {MENU_ADMIN.map(renderItem)}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-zinc-800/50 transition-colors w-full"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>
      </div>
    </aside>
  );
}
