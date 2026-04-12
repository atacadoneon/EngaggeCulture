"use client";

import { useState, useEffect } from "react";
import { Search, Package, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listarProdutos } from "@/lib/supabase/queries/loja";
import type { ProdutoRecompensa } from "@/types/database";
import { cn } from "@/lib/utils";

interface SeletorProdutoProps {
  selecionado: ProdutoRecompensa | null;
  quantidade: number;
  onChange: (produto: ProdutoRecompensa | null) => void;
  onQuantidadeChange: (qtd: number) => void;
  totalDestinatarios: number;
}

export function SeletorProduto({ selecionado, quantidade, onChange, onQuantidadeChange, totalDestinatarios }: SeletorProdutoProps) {
  const [produtos, setProdutos] = useState<ProdutoRecompensa[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      setCarregando(true);
      const data = await listarProdutos();
      setProdutos(data);
      setCarregando(false);
    }
    carregar();
  }, []);

  const filtrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  const totalNecessario = totalDestinatarios * quantidade;

  return (
    <div className="space-y-3">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar produto..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Quantidade por destinatario */}
      <div className="flex items-center gap-3 bg-zinc-800 rounded-lg p-3">
        <span className="text-sm text-zinc-400">Qtd por destinatario:</span>
        <input
          type="number"
          min={1}
          max={99}
          value={quantidade}
          onChange={(e) => onQuantidadeChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-center text-white text-sm"
        />
        {totalDestinatarios > 0 && (
          <span className="text-xs text-zinc-500">
            = {totalNecessario} unidades no total
          </span>
        )}
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-80 overflow-y-auto pr-1">
        {carregando ? (
          <p className="text-zinc-500 text-sm text-center py-4 col-span-2">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center py-4 col-span-2">Nenhum produto encontrado.</p>
        ) : (
          filtrados.map((produto) => {
            const eSelecionado = selecionado?.id === produto.id;
            const estoqueInsuficiente = produto.estoque !== null && produto.estoque < totalNecessario;
            const semEstoque = produto.estoque !== null && produto.estoque <= 0;

            return (
              <button
                key={produto.id}
                onClick={() => !semEstoque && onChange(eSelecionado ? null : produto)}
                disabled={semEstoque}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                  eSelecionado
                    ? "bg-violet-600/20 border border-violet-500/30"
                    : semEstoque
                    ? "bg-zinc-800/30 border border-zinc-800 opacity-50 cursor-not-allowed"
                    : "bg-zinc-800/50 border border-transparent hover:bg-zinc-800"
                )}
              >
                {/* Imagem placeholder */}
                <div className="h-12 w-12 bg-zinc-700 rounded-lg flex items-center justify-center shrink-0">
                  {produto.imagem_url ? (
                    <img src={produto.imagem_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  ) : (
                    <Package className="h-6 w-6 text-zinc-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{produto.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge cor={
                      produto.categoria === "fisico" ? "blue" :
                      produto.categoria === "digital" ? "green" :
                      produto.categoria === "kit" ? "violet" : "zinc"
                    }>
                      {produto.categoria}
                    </Badge>
                    {produto.estoque !== null ? (
                      <span className={cn(
                        "text-xs font-medium",
                        semEstoque ? "text-red-400" :
                        estoqueInsuficiente ? "text-amber-400" :
                        "text-zinc-500"
                      )}>
                        {semEstoque && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                        {produto.estoque} em estoque
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400">Ilimitado</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
