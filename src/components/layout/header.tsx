"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { usarSessao } from "@/hooks/usar-sessao";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

const ROTAS_BUSCA = [
  { nome: "Painel", href: "/painel" },
  { nome: "Gamificacao", href: "/gamificacao" },
  { nome: "Criar Gamificacao com IA", href: "/gamificacao/criar" },
  { nome: "Cultura", href: "/cultura" },
  { nome: "Criar Cultura com IA", href: "/cultura/criar" },
  { nome: "Loja de Recompensas", href: "/loja" },
  { nome: "Treinamentos", href: "/treinamentos" },
  { nome: "Ranking", href: "/ranking" },
  { nome: "Central de Envios", href: "/envios" },
  { nome: "Novo Envio", href: "/envios/novo" },
  { nome: "Importar Planilha", href: "/envios/importar" },
  { nome: "Destinatarios", href: "/envios/destinatarios" },
  { nome: "Estoque", href: "/estoque" },
  { nome: "Movimentacoes de Estoque", href: "/estoque/movimentacoes" },
  { nome: "Loja Interna", href: "/loja-interna" },
  { nome: "Carrinho", href: "/loja-interna/carrinho" },
  { nome: "Pedidos de Compra", href: "/loja-interna/pedidos" },
  { nome: "Faturas", href: "/financeiro/faturas" },
  { nome: "Notas Fiscais", href: "/financeiro/notas" },
  { nome: "Fretes", href: "/financeiro/fretes" },
  { nome: "Colaboradores", href: "/colaboradores" },
  { nome: "Novo Colaborador", href: "/colaboradores/novo" },
  { nome: "Clientes e Parceiros", href: "/clientes" },
  { nome: "Configuracoes", href: "/configuracoes" },
  { nome: "Integracoes ERP", href: "/configuracoes/integracoes" },
];

export function Header() {
  const { sessao } = usarSessao();
  const router = useRouter();
  const [busca, setBusca] = useState("");
  const [buscaAberta, setBuscaAberta] = useState(false);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [notifAberta, setNotifAberta] = useState(false);
  const [totalNaoLidas, setTotalNaoLidas] = useState(0);
  const buscaRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Carregar notificacoes
  useEffect(() => {
    async function carregar() {
      if (!sessao) return;
      try {
        const supabase = criarClienteNavegador();
        const { data, count } = await supabase
          .from("notificacoes")
          .select("*", { count: "exact" })
          .eq("lida", false)
          .order("criado_em", { ascending: false })
          .limit(10);
        setNotificacoes(data || []);
        setTotalNaoLidas(count || 0);
      } catch {}
    }
    carregar();
  }, [sessao]);

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (buscaRef.current && !buscaRef.current.contains(e.target as Node)) setBuscaAberta(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifAberta(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const resultadosBusca = busca.length > 0
    ? ROTAS_BUSCA.filter((r) => r.nome.toLowerCase().includes(busca.toLowerCase()))
    : [];

  async function marcarLida(id: string) {
    try {
      const supabase = criarClienteNavegador();
      await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
      setNotificacoes((prev) => prev.filter((n) => n.id !== id));
      setTotalNaoLidas((prev) => Math.max(0, prev - 1));
    } catch {}
  }

  return (
    <header className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Busca funcional */}
      <div ref={buscaRef} className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            value={busca}
            onChange={(e) => { setBusca(e.target.value); setBuscaAberta(true); }}
            onFocus={() => setBuscaAberta(true)}
            placeholder="Buscar paginas, funcoes..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
          {busca && (
            <button onClick={() => { setBusca(""); setBuscaAberta(false); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Resultados da busca */}
        {buscaAberta && resultadosBusca.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 max-h-72 overflow-y-auto">
            {resultadosBusca.map((r) => (
              <button
                key={r.href}
                onClick={() => { router.push(r.href); setBusca(""); setBuscaAberta(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors text-left"
              >
                <Search className="h-3 w-3 text-zinc-600 shrink-0" />
                {r.nome}
              </button>
            ))}
          </div>
        )}
        {buscaAberta && busca.length > 0 && resultadosBusca.length === 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 p-4 text-center">
            <p className="text-sm text-zinc-500">Nenhum resultado para "{busca}"</p>
          </div>
        )}
      </div>

      {/* Acoes */}
      <div className="flex items-center gap-4">
        {/* Pontos */}
        {sessao && (
          <Link href="/loja" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-lg border border-zinc-800 hover:border-violet-500/30 transition-colors">
            <span className="text-lg">{sessao.empresa.moeda_icone}</span>
            <span className="text-sm font-semibold text-white">{sessao.colaborador.saldo_pontos.toLocaleString("pt-BR")}</span>
          </Link>
        )}

        {/* Notificacoes funcional */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifAberta(!notifAberta)} className="relative p-2 text-zinc-400 hover:text-white transition-colors">
            <Bell className="h-5 w-5" />
            {totalNaoLidas > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-violet-600 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {totalNaoLidas > 9 ? "9+" : totalNaoLidas}
              </span>
            )}
          </button>

          {/* Dropdown de notificacoes */}
          {notifAberta && (
            <div className="absolute right-0 top-full mt-1 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
              <div className="px-4 py-3 border-b border-zinc-800">
                <p className="text-sm font-semibold text-white">Notificacoes</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notificacoes.length === 0 ? (
                  <p className="text-sm text-zinc-500 text-center py-6">Nenhuma notificacao</p>
                ) : (
                  notificacoes.map((n) => (
                    <button key={n.id} onClick={() => marcarLida(n.id)} className="w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors text-left border-b border-zinc-800/50">
                      <div className="h-2 w-2 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{n.titulo}</p>
                        {n.mensagem && <p className="text-xs text-zinc-500 mt-0.5">{n.mensagem}</p>}
                        <p className="text-[10px] text-zinc-600 mt-1">{new Date(n.criado_em).toLocaleString("pt-BR")}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        {sessao && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold">
              {sessao.colaborador.nome.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-white leading-tight">{sessao.colaborador.nome}</p>
              <p className="text-xs text-zinc-500">{sessao.perfil.nome_exibicao}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
