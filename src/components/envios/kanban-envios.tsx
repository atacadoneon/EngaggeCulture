"use client";

import { useState } from "react";
import { Package, User, Truck, CheckCircle, XCircle, Clock, MoreVertical, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { atualizarStatusEnvio } from "@/lib/supabase/queries/envios";
import { cn } from "@/lib/utils";

interface EnvioKanban {
  id: string;
  destinatario_nome: string;
  destinatario_email?: string;
  destinatario_tipo: string;
  produto_nome: string;
  quantidade: number;
  status: string;
  codigo_rastreio?: string;
  transportadora?: string;
  criado_em: string;
  produto?: { nome: string; imagem_url?: string; categoria?: string };
}

interface ColunaConfig {
  id: string;
  titulo: string;
  cor: string;
  corBorda: string;
  icone: React.ElementType;
  proximoStatus?: string;
  proximoLabel?: string;
}

const COLUNAS: ColunaConfig[] = [
  {
    id: "pendente",
    titulo: "Pendentes",
    cor: "text-amber-400",
    corBorda: "border-amber-500/30",
    icone: Clock,
    proximoStatus: "aprovado",
    proximoLabel: "Aprovar",
  },
  {
    id: "aprovado",
    titulo: "Aprovados",
    cor: "text-blue-400",
    corBorda: "border-blue-500/30",
    icone: CheckCircle,
    proximoStatus: "processando",
    proximoLabel: "Processar",
  },
  {
    id: "processando",
    titulo: "Em Producao",
    cor: "text-violet-400",
    corBorda: "border-violet-500/30",
    icone: Package,
    proximoStatus: "enviado",
    proximoLabel: "Marcar Enviado",
  },
  {
    id: "enviado",
    titulo: "Enviados",
    cor: "text-cyan-400",
    corBorda: "border-cyan-500/30",
    icone: Truck,
    proximoStatus: "entregue",
    proximoLabel: "Confirmar Entrega",
  },
  {
    id: "entregue",
    titulo: "Entregues",
    cor: "text-emerald-400",
    corBorda: "border-emerald-500/30",
    icone: CheckCircle,
  },
];

interface KanbanEnviosProps {
  envios: EnvioKanban[];
  onAtualizar: () => void;
}

function CardEnvio({
  envio,
  coluna,
  onMover,
}: {
  envio: EnvioKanban;
  coluna: ColunaConfig;
  onMover: (id: string, novoStatus: string) => void;
}) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-700/50 hover:border-zinc-600 transition-colors group">
      {/* Header do card */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {envio.destinatario_nome.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{envio.destinatario_nome}</p>
            <p className="text-[10px] text-zinc-500 truncate">{envio.destinatario_email || ""}</p>
          </div>
        </div>
        <Badge cor={envio.destinatario_tipo === "colaborador" ? "blue" : "amber"}>
          {envio.destinatario_tipo === "colaborador" ? "Colab" : "Cli"}
        </Badge>
      </div>

      {/* Produto */}
      <div className="bg-zinc-900 rounded px-2 py-1.5 mb-2">
        <p className="text-xs text-zinc-300 font-medium truncate">{envio.produto_nome}</p>
        <p className="text-[10px] text-zinc-500">Qtd: {envio.quantidade}</p>
      </div>

      {/* Rastreio */}
      {envio.codigo_rastreio && (
        <div className="flex items-center gap-1 text-[10px] text-cyan-400 mb-2">
          <MapPin className="h-3 w-3" />
          {envio.codigo_rastreio}
        </div>
      )}

      {/* Data */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-zinc-600">
          {new Date(envio.criado_em).toLocaleDateString("pt-BR")}
        </span>

        {/* Botao de acao */}
        {coluna.proximoStatus && (
          <button
            onClick={() => onMover(envio.id, coluna.proximoStatus!)}
            className={cn(
              "text-[10px] font-medium px-2 py-1 rounded transition-colors",
              "bg-zinc-700 text-zinc-300 hover:bg-violet-600 hover:text-white",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            {coluna.proximoLabel} →
          </button>
        )}
      </div>
    </div>
  );
}

export function KanbanEnvios({ envios, onAtualizar }: KanbanEnviosProps) {
  async function moverEnvio(id: string, novoStatus: string) {
    try {
      await atualizarStatusEnvio(id, novoStatus);
      onAtualizar();
    } catch (error: any) {
      alert("Erro: " + error.message);
    }
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {COLUNAS.map((coluna) => {
        const enviosColuna = envios.filter((e) => e.status === coluna.id);
        const Icone = coluna.icone;

        return (
          <div
            key={coluna.id}
            className={cn(
              "flex-shrink-0 w-72 bg-zinc-900/50 rounded-xl border p-3",
              coluna.corBorda
            )}
          >
            {/* Header da coluna */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Icone className={cn("h-4 w-4", coluna.cor)} />
                <span className={cn("text-sm font-semibold", coluna.cor)}>
                  {coluna.titulo}
                </span>
              </div>
              <span className="text-xs font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                {enviosColuna.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {enviosColuna.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-600">Nenhum envio</p>
                </div>
              ) : (
                enviosColuna.map((envio) => (
                  <CardEnvio
                    key={envio.id}
                    envio={envio}
                    coluna={coluna}
                    onMover={moverEnvio}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
