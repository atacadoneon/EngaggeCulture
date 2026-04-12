"use client";

import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { listarPedidosCompra } from "@/lib/supabase/queries/loja-interna";

const POR_PAGINA = 15;
const STATUS_COR: Record<string, "amber" | "blue" | "green" | "red" | "violet" | "zinc"> = {
  rascunho: "zinc", pendente: "amber", aprovado: "blue", pago: "green",
  produzindo: "violet", enviado: "blue", entregue: "green", cancelado: "red",
};

export default function PaginaPedidosCompra() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("todos");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const filtro = abaAtiva === "todos" ? undefined : abaAtiva;
    const data = await listarPedidosCompra({ status: filtro });
    setPedidos(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, [abaAtiva]);

  const totalPaginas = Math.ceil(pedidos.length / POR_PAGINA);
  const paginados = pedidos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Loja Interna", href: "/loja-interna" }, { label: "Pedidos" }]} />
      <h1 className="text-2xl font-bold text-white">Pedidos de Compra</h1>

      <Tabs itens={[
        { id: "todos", label: "Todos", contagem: pedidos.length },
        { id: "pendente", label: "Pendentes" },
        { id: "pago", label: "Pagos" },
        { id: "produzindo", label: "Em Producao" },
        { id: "entregue", label: "Entregues" },
      ]} ativo={abaAtiva} onChange={(id) => { setAbaAtiva(id); setPagina(1); }} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Numero</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Total</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Data</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginados.length === 0 ? <tr><td colSpan={4}><EmptyState icone={ShoppingCart} titulo="Nenhum pedido de compra" /></td></tr>
              : paginados.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-mono font-semibold">{p.numero}</td>
                  <td className="px-5 py-3 text-sm text-white text-right font-mono">R$ {Number(p.total).toFixed(2)}</td>
                  <td className="px-5 py-3"><Badge cor={STATUS_COR[p.status] || "zinc"}>{p.status}</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{new Date(p.criado_em).toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>
    </div>
  );
}
