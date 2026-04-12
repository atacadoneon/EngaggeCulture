"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Plus, FileSpreadsheet, Clock, Truck, CheckCircle, AlertTriangle, Users, LayoutGrid, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KanbanEnvios } from "@/components/envios/kanban-envios";
import { listarEnvios, buscarStatsEnvios } from "@/lib/supabase/queries/envios";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { cor: "amber" | "blue" | "green" | "red" | "zinc" | "violet"; texto: string }> = {
  pendente: { cor: "amber", texto: "Pendente" },
  aprovado: { cor: "blue", texto: "Aprovado" },
  processando: { cor: "violet", texto: "Processando" },
  enviado: { cor: "blue", texto: "Enviado" },
  entregue: { cor: "green", texto: "Entregue" },
  cancelado: { cor: "red", texto: "Cancelado" },
};

export default function PaginaEnvios() {
  const [envios, setEnvios] = useState<any[]>([]);
  const [stats, setStats] = useState({ pendentes: 0, enviados: 0, entregues: 0, estoque_baixo: 0 });
  const [filtroStatus, setFiltroStatus] = useState("");
  const [visao, setVisao] = useState<"kanban" | "tabela">("kanban");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const [enviosData, statsData] = await Promise.all([
      listarEnvios({ status: filtroStatus || undefined }),
      buscarStatsEnvios(),
    ]);
    setEnvios(enviosData);
    setStats(statsData);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [filtroStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Central de Envios</h1>
          <p className="text-zinc-400 mt-1">Gerencie todos os envios de premios e kits</p>
        </div>
        <div className="flex gap-2">
          <Link href="/envios/destinatarios">
            <Button variante="secundario"><Users className="h-4 w-4" />Destinatarios</Button>
          </Link>
          <Link href="/envios/importar">
            <Button variante="secundario"><FileSpreadsheet className="h-4 w-4" />Importar</Button>
          </Link>
          <Link href="/envios/novo">
            <Button><Plus className="h-4 w-4" />Novo Envio</Button>
          </Link>
        </div>
      </div>

      {/* Cards de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pendentes</p>
              <p className="text-2xl font-bold text-amber-400">{stats.pendentes}</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/30" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Enviados</p>
              <p className="text-2xl font-bold text-blue-400">{stats.enviados}</p>
            </div>
            <Truck className="h-8 w-8 text-blue-500/30" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Entregues</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.entregues}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500/30" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-400">{stats.estoque_baixo}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500/30" />
          </div>
        </Card>
      </div>

      {/* View toggle + Filtros */}
      <div className="flex items-center gap-4">
        <div className="flex bg-zinc-800 rounded-lg p-0.5">
          <button
            onClick={() => setVisao("kanban")}
            className={cn("p-2 rounded-md transition-colors", visao === "kanban" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}
            title="Kanban"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setVisao("tabela")}
            className={cn("p-2 rounded-md transition-colors", visao === "tabela" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}
            title="Tabela"
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {visao === "tabela" && <div className="flex gap-2">
        {["", "pendente", "aprovado", "enviado", "entregue", "cancelado"].map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtroStatus === s
                ? "bg-violet-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {s === "" ? "Todos" : STATUS_CONFIG[s]?.texto || s}
          </button>
        ))}
      </div>}
      </div>

      {/* KANBAN VIEW */}
      {visao === "kanban" && !carregando && (
        <KanbanEnvios envios={envios} onAtualizar={carregar} />
      )}

      {/* TABELA VIEW */}
      {visao === "tabela" && (
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Destinatario</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Produto</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tipo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Qtd</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Rastreio</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Data</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              ) : envios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">Nenhum envio encontrado.</p>
                    <Link href="/envios/novo" className="text-violet-400 text-sm hover:underline mt-1 inline-block">
                      Criar primeiro envio
                    </Link>
                  </td>
                </tr>
              ) : (
                envios.map((e) => (
                  <tr key={e.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-white">{e.destinatario_nome}</p>
                      <p className="text-xs text-zinc-500">{e.destinatario_email || "—"}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-300">{e.produto_nome}</td>
                    <td className="px-5 py-3">
                      <Badge cor={e.destinatario_tipo === "colaborador" ? "blue" : "amber"}>
                        {e.destinatario_tipo === "colaborador" ? "Colab" : "Cliente"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-white">{e.quantidade}</td>
                    <td className="px-5 py-3">
                      <Badge cor={STATUS_CONFIG[e.status]?.cor || "zinc"}>
                        {STATUS_CONFIG[e.status]?.texto || e.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{e.codigo_rastreio || "—"}</td>
                    <td className="px-5 py-3 text-xs text-zinc-500">
                      {new Date(e.criado_em).toLocaleDateString("pt-BR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      )}
    </div>
  );
}
