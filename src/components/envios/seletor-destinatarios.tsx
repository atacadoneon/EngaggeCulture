"use client";

import { useState, useEffect } from "react";
import { Search, Users, Building, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listarColaboradores } from "@/lib/supabase/queries/colaboradores";
import { listarClientesExternos } from "@/lib/supabase/queries/clientes-externos";
import { cn } from "@/lib/utils";

export interface Destinatario {
  id: string;
  tipo: "colaborador" | "cliente_externo";
  nome: string;
  email?: string;
  empresa_nome?: string;
  endereco?: Record<string, string>;
}

interface SeletorDestinatariosProps {
  selecionados: Destinatario[];
  onChange: (selecionados: Destinatario[]) => void;
}

export function SeletorDestinatarios({ selecionados, onChange }: SeletorDestinatariosProps) {
  const [aba, setAba] = useState<"colaboradores" | "clientes">("colaboradores");
  const [busca, setBusca] = useState("");
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const [colabs, clis] = await Promise.all([
        listarColaboradores({ status: "ativo" }),
        listarClientesExternos(),
      ]);
      setColaboradores(colabs);
      setClientes(clis);
      setCarregando(false);
    }
    carregar();
  }, []);

  const idsSelecionados = new Set(selecionados.map((s) => s.id));

  function toggleDestinatario(dest: Destinatario) {
    if (idsSelecionados.has(dest.id)) {
      onChange(selecionados.filter((s) => s.id !== dest.id));
    } else {
      onChange([...selecionados, dest]);
    }
  }

  function selecionarTodos(lista: Destinatario[]) {
    const novos = lista.filter((d) => !idsSelecionados.has(d.id));
    onChange([...selecionados, ...novos]);
  }

  const listaAtual = aba === "colaboradores"
    ? colaboradores
        .filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email?.toLowerCase().includes(busca.toLowerCase()))
        .map((c): Destinatario => ({ id: c.id, tipo: "colaborador", nome: c.nome, email: c.email }))
    : clientes
        .filter((c: any) => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email?.toLowerCase().includes(busca.toLowerCase()) || c.empresa_nome?.toLowerCase().includes(busca.toLowerCase()))
        .map((c: any): Destinatario => ({ id: c.id, tipo: "cliente_externo", nome: c.nome, email: c.email, empresa_nome: c.empresa_nome, endereco: c.endereco }));

  return (
    <div className="space-y-3">
      {/* Abas */}
      <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
        <button
          onClick={() => setAba("colaboradores")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            aba === "colaboradores" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <Users className="h-4 w-4" />
          Colaboradores ({colaboradores.length})
        </button>
        <button
          onClick={() => setAba("clientes")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
            aba === "clientes" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white"
          )}
        >
          <Building className="h-4 w-4" />
          Clientes ({clientes.length})
        </button>
      </div>

      {/* Busca + selecionar todos */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button
          onClick={() => selecionarTodos(listaAtual)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors whitespace-nowrap"
        >
          Selecionar todos
        </button>
      </div>

      {/* Badge de selecionados */}
      {selecionados.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge cor="violet">{selecionados.length} selecionado{selecionados.length > 1 ? "s" : ""}</Badge>
          <button onClick={() => onChange([])} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
            Limpar selecao
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="max-h-80 overflow-y-auto space-y-1 pr-1">
        {carregando ? (
          <p className="text-zinc-500 text-sm text-center py-4">Carregando...</p>
        ) : listaAtual.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4">Nenhum resultado encontrado.</p>
        ) : (
          listaAtual.map((dest) => {
            const selecionado = idsSelecionados.has(dest.id);
            return (
              <button
                key={dest.id}
                onClick={() => toggleDestinatario(dest)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                  selecionado
                    ? "bg-violet-600/20 border border-violet-500/30"
                    : "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
                )}
              >
                <div className={cn(
                  "h-5 w-5 rounded border flex items-center justify-center shrink-0",
                  selecionado ? "bg-violet-600 border-violet-600" : "border-zinc-600"
                )}>
                  {selecionado && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{dest.nome}</p>
                  <p className="text-xs text-zinc-500 truncate">
                    {dest.email || "Sem email"} {dest.empresa_nome ? `· ${dest.empresa_nome}` : ""}
                  </p>
                </div>
                <Badge cor={dest.tipo === "colaborador" ? "blue" : "amber"}>
                  {dest.tipo === "colaborador" ? "Colab" : "Cliente"}
                </Badge>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
