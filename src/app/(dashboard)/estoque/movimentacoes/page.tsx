"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { listarMovimentacoes } from "@/lib/supabase/queries/estoque";

const POR_PAGINA = 20;

export default function PaginaMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const filtro = abaAtiva === "todas" ? undefined : abaAtiva;
    const data = await listarMovimentacoes({ tipo: filtro });
    setMovimentacoes(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, [abaAtiva]);

  const totalPaginas = Math.ceil(movimentacoes.length / POR_PAGINA);
  const paginadas = movimentacoes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Estoque", href: "/estoque" }, { label: "Movimentacoes" }]} />
      <h1 className="text-2xl font-bold text-white">Movimentacoes de Estoque</h1>

      <Tabs itens={[
        { id: "todas", label: "Todas" },
        { id: "entrada", label: "Entradas" },
        { id: "saida", label: "Saidas" },
        { id: "ajuste", label: "Ajustes" },
      ]} ativo={abaAtiva} onChange={(id) => { setAbaAtiva(id); setPagina(1); }} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tipo</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Produto</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Qtd</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Saldo</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Origem</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Usuario</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Data</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={7} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginadas.length === 0 ? <tr><td colSpan={7}><EmptyState icone={ArrowUpDown} titulo="Nenhuma movimentacao" /></td></tr>
              : paginadas.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1.5">
                      {m.tipo === "entrada" || m.tipo === "devolucao" ? <ArrowUp className="h-4 w-4 text-emerald-400" /> : <ArrowDown className="h-4 w-4 text-red-400" />}
                      <Badge cor={m.tipo === "entrada" ? "green" : m.tipo === "saida" ? "red" : "amber"}>{m.tipo}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-white">{m.produto?.nome || "—"}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono font-bold text-white">{m.tipo === "entrada" || m.tipo === "devolucao" ? "+" : "-"}{m.quantidade}</td>
                  <td className="px-5 py-3 text-sm text-right font-mono text-zinc-400">{m.saldo_anterior} → {m.saldo_posterior}</td>
                  <td className="px-5 py-3"><Badge cor="zinc">{m.origem || "—"}</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{m.criador?.nome || "—"}</td>
                  <td className="px-5 py-3 text-xs text-zinc-500">{new Date(m.criado_em).toLocaleDateString("pt-BR")}</td>
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
