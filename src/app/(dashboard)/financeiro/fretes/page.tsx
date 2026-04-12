"use client";

import { useEffect, useState } from "react";
import { Plus, Truck } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { listarFretes } from "@/lib/supabase/queries/financeiro";

const POR_PAGINA = 15;
const STATUS_COR: Record<string, "amber" | "blue" | "green" | "red"> = {
  pendente: "amber", em_transito: "blue", entregue: "green", devolvido: "red",
};

export default function PaginaFretes() {
  const [fretes, setFretes] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const data = await listarFretes();
    setFretes(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  const totalPaginas = Math.ceil(fretes.length / POR_PAGINA);
  const paginados = fretes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Financeiro" }, { label: "Fretes" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Fretes</h1>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Transportadora</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Rastreio</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Destino</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Valor</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Peso</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginados.length === 0 ? <tr><td colSpan={6}><EmptyState icone={Truck} titulo="Nenhum frete registrado" /></td></tr>
              : paginados.map((f) => (
                <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white">{f.transportadora}</td>
                  <td className="px-5 py-3 text-sm text-cyan-400 font-mono">{f.codigo_rastreio || "—"}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{[f.destino_cidade, f.destino_estado].filter(Boolean).join("/") || "—"}</td>
                  <td className="px-5 py-3 text-sm text-white text-right font-mono">R$ {Number(f.valor).toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{f.peso_kg ? `${f.peso_kg} kg` : "—"}</td>
                  <td className="px-5 py-3"><Badge cor={STATUS_COR[f.status] || "zinc"}>{f.status}</Badge></td>
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
