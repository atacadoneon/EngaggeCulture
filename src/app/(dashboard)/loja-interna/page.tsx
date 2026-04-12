"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Store, ShoppingCart, Package } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { listarCatalogo } from "@/lib/supabase/queries/loja-interna";

const CATEGORIAS = [
  { id: "", label: "Todos" },
  { id: "placa", label: "Placas" },
  { id: "trofeu", label: "Trofeus" },
  { id: "medalha", label: "Medalhas" },
  { id: "kit", label: "Kits" },
  { id: "quadro", label: "Quadros" },
  { id: "sinalizacao", label: "Sinalizacao" },
];

export default function PaginaLojaInterna() {
  const [produtos, setProdutos] = useState<any[]>([]);
  const [categoria, setCategoria] = useState("");
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const data = await listarCatalogo({ categoria: categoria || undefined });
    setProdutos(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, [categoria]);

  const filtrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Loja Interna" }]} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loja Interna</h1>
          <p className="text-zinc-400 text-sm">Compre produtos para o estoque da sua operacao</p>
        </div>
        <Link href="/loja-interna/pedidos">
          <Button variante="secundario"><ShoppingCart className="h-4 w-4" />Meus Pedidos</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 flex-wrap">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoria(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${categoria === c.id ? "bg-violet-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto..." className="w-64" />
      </div>

      {/* Grid */}
      {carregando ? <p className="text-zinc-500">Carregando...</p> : filtrados.length === 0 ? (
        <EmptyState icone={Store} titulo="Nenhum produto no catalogo" descricao="O catalogo sera preenchido pela equipe Engagge." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtrados.map((p) => (
            <Card key={p.id} className="overflow-hidden hover:border-zinc-700 transition-colors">
              <div className="h-40 bg-zinc-800 flex items-center justify-center">
                {p.imagem_url ? <img src={p.imagem_url} alt="" className="h-full w-full object-cover" /> : <Package className="h-12 w-12 text-zinc-600" />}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white leading-tight">{p.nome}</h3>
                  <Badge cor="violet">{p.categoria}</Badge>
                </div>
                {p.descricao && <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{p.descricao}</p>}
                <div className="flex items-center justify-between">
                  <div>
                    {p.preco_promocional ? (
                      <>
                        <span className="text-xs text-zinc-500 line-through">R$ {Number(p.preco).toFixed(2)}</span>
                        <span className="text-lg font-bold text-emerald-400 ml-1">R$ {Number(p.preco_promocional).toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-white">R$ {Number(p.preco).toFixed(2)}</span>
                    )}
                  </div>
                  <Button tamanho="sm">Comprar</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
