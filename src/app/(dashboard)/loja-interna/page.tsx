"use client";

import { useState } from "react";
import Link from "next/link";
import { Store, ShoppingCart, Package, Star, Eye, Heart, Truck, Shield, Clock, Check, Plus, Minus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

// Produtos demo do catalogo Engagge
const CATALOGO_DEMO = [
  {
    id: "1", nome: "Placa Top Performance 20x25cm", descricao: "Placa em acrilico 3D com impressao UV personalizada. Acabamento premium com alto relevo. Personalizacao com nome, conquista e logo da empresa.",
    imagem: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop",
    preco: 149.90, preco_promocional: null, categoria: "placa", estoque: 50, avaliacao: 4.9, vendidos: 234, sku: "PLC-001",
  },
  {
    id: "2", nome: "Trofeu Campeao de Vendas 25cm", descricao: "Trofeu em acrilico 3D com base em madeira nobre. Design moderno e elegante. Gravacao a laser personalizada.",
    imagem: "https://images.unsplash.com/photo-1569429593410-b498b3fb3387?w=400&h=400&fit=crop",
    preco: 289.90, preco_promocional: 249.90, categoria: "trofeu", estoque: 20, avaliacao: 4.8, vendidos: 87, sku: "TRF-001",
  },
  {
    id: "3", nome: "Kit Onboarding Essencial", descricao: "Kit de boas-vindas com placa welcome personalizada + carta do CEO. Embalagem premium para impressionar no primeiro dia.",
    imagem: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=400&h=400&fit=crop",
    preco: 89.90, preco_promocional: null, categoria: "kit", estoque: 100, avaliacao: 5.0, vendidos: 456, sku: "KIT-001",
  },
  {
    id: "4", nome: "Kit Onboarding Premium", descricao: "Kit completo: placa welcome + caneca personalizada + camiseta + adesivos + carta do CEO. A experiencia completa de boas-vindas.",
    imagem: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=400&h=400&fit=crop",
    preco: 199.90, preco_promocional: 179.90, categoria: "kit", estoque: 35, avaliacao: 4.9, vendidos: 178, sku: "KIT-002",
  },
  {
    id: "5", nome: "Medalha de Conquista Dourada", descricao: "Medalha em metal com fita personalizada. Ideal para campanhas de vendas, eventos e premiacoes rapidas. Embalagem individual.",
    imagem: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop",
    preco: 39.90, preco_promocional: null, categoria: "medalha", estoque: 200, avaliacao: 4.7, vendidos: 890, sku: "MDL-001",
  },
  {
    id: "6", nome: "Placa Tempo de Casa 25x30cm", descricao: "Placa em acrilico com moldura em madeira. Para premiar marcos de 1, 3, 5, 10 anos. Personalizacao completa.",
    imagem: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    preco: 189.90, preco_promocional: null, categoria: "placa", estoque: 40, avaliacao: 4.8, vendidos: 156, sku: "PLC-002",
  },
  {
    id: "7", nome: "Quadro de Valores da Empresa", descricao: "Painel em acrilico com impressao UV dos valores da empresa. Moldura moderna. Tamanho 50x70cm para ambientacao.",
    imagem: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop",
    preco: 249.90, preco_promocional: null, categoria: "quadro", estoque: 15, avaliacao: 4.6, vendidos: 34, sku: "QDR-001",
  },
  {
    id: "8", nome: "Caneca Personalizada Premium", descricao: "Caneca de ceramica de alta qualidade com personalizacao full color. Nome do colaborador + logo da empresa. Embalagem individual.",
    imagem: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    preco: 34.90, preco_promocional: 29.90, categoria: "outro", estoque: 300, avaliacao: 4.5, vendidos: 1230, sku: "CNC-001",
  },
];

export default function PaginaLojaInterna() {
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<typeof CATALOGO_DEMO[0] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());
  const [quantidade, setQuantidade] = useState(1);

  const filtrados = CATALOGO_DEMO.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function toggleFavorito(id: string) {
    setFavoritos((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function abrirProduto(p: typeof CATALOGO_DEMO[0]) {
    setProdutoSelecionado(p);
    setQuantidade(1);
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Loja Interna" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Store className="h-6 w-6 text-violet-400" /> Loja Interna
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Compre produtos Engagge para o estoque da sua operacao</p>
        </div>
        <Link href="/loja-interna/pedidos">
          <Button variante="secundario"><ShoppingCart className="h-4 w-4" />Meus Pedidos</Button>
        </Link>
      </div>

      {/* Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
          <Truck className="h-5 w-5 text-emerald-400 shrink-0" />
          <div><p className="text-xs font-semibold text-emerald-400">Frete gratis</p><p className="text-[10px] text-zinc-500">Pedidos acima de R$ 500</p></div>
        </div>
        <div className="flex items-center gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-3">
          <Shield className="h-5 w-5 text-violet-400 shrink-0" />
          <div><p className="text-xs font-semibold text-violet-400">Personalizacao inclusa</p><p className="text-[10px] text-zinc-500">Logo e dados da sua empresa</p></div>
        </div>
        <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
          <Clock className="h-5 w-5 text-amber-400 shrink-0" />
          <div><p className="text-xs font-semibold text-amber-400">Producao em 15 dias</p><p className="text-[10px] text-zinc-500">Producao sob demanda</p></div>
        </div>
      </div>

      {/* Busca */}
      <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto..." className="max-w-md" />

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtrados.map((produto) => {
          const eFavorito = favoritos.has(produto.id);
          const temPromocao = produto.preco_promocional !== null;
          const precoFinal = temPromocao ? produto.preco_promocional! : produto.preco;
          const desconto = temPromocao ? Math.round(((produto.preco - produto.preco_promocional!) / produto.preco) * 100) : 0;

          return (
            <div key={produto.id} className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300">
              {/* Imagem */}
              <div className="relative h-48 bg-zinc-800 overflow-hidden">
                <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                <button onClick={() => toggleFavorito(produto.id)} className="absolute top-3 right-3 h-8 w-8 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center hover:bg-zinc-800 transition-colors">
                  <Heart className={cn("h-4 w-4", eFavorito ? "text-rose-500 fill-rose-500" : "text-zinc-400")} />
                </button>

                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {temPromocao && (
                    <span className="text-[10px] font-bold bg-rose-600 text-white px-2 py-0.5 rounded">-{desconto}% OFF</span>
                  )}
                  {produto.estoque <= 20 && (
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded">Ultimas unidades</span>
                  )}
                </div>

                <button onClick={() => abrirProduto(produto)} className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold"><Eye className="h-4 w-4" />Ver detalhes</span>
                </button>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] text-zinc-500 font-mono mb-1">SKU: {produto.sku}</p>
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 h-10">{produto.nome}</h3>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-white">{produto.avaliacao}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600">|</span>
                  <span className="text-[10px] text-zinc-500">{produto.vendidos} vendidos</span>
                  <span className="text-[10px] text-zinc-600">|</span>
                  <span className="text-[10px] text-emerald-400">{produto.estoque} em estoque</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                  <div>
                    {temPromocao ? (
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs text-zinc-500 line-through">R$ {produto.preco.toFixed(2)}</span>
                        <span className="text-lg font-bold text-emerald-400">R$ {precoFinal.toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-white">R$ {precoFinal.toFixed(2)}</span>
                    )}
                  </div>
                  <Button tamanho="sm" onClick={() => abrirProduto(produto)}>Comprar</Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detalhe */}
      <Modal aberto={!!produtoSelecionado} fechar={() => setProdutoSelecionado(null)} titulo="" tamanho="xl">
        {produtoSelecionado && (() => {
          const temPromocao = produtoSelecionado.preco_promocional !== null;
          const precoFinal = temPromocao ? produtoSelecionado.preco_promocional! : produtoSelecionado.preco;
          const totalPedido = precoFinal * quantidade;

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-2">
              {/* Imagem */}
              <div className="h-72 md:h-full rounded-xl overflow-hidden bg-zinc-800">
                <img src={produtoSelecionado.imagem} alt={produtoSelecionado.nome} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-zinc-500 font-mono">SKU: {produtoSelecionado.sku}</p>
                  <h2 className="text-xl font-bold text-white mt-1">{produtoSelecionado.nome}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold text-white">{produtoSelecionado.avaliacao}</span>
                    </div>
                    <span className="text-xs text-zinc-500">({produtoSelecionado.vendidos} vendidos)</span>
                    <Badge cor="violet">{produtoSelecionado.categoria}</Badge>
                  </div>
                </div>

                <p className="text-sm text-zinc-400 leading-relaxed">{produtoSelecionado.descricao}</p>

                {/* Preco */}
                <div className="bg-zinc-800 rounded-xl p-4">
                  {temPromocao ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-zinc-500 line-through">R$ {produtoSelecionado.preco.toFixed(2)}</span>
                      <span className="text-2xl font-bold text-emerald-400">R$ {precoFinal.toFixed(2)}</span>
                      <Badge cor="green">-{Math.round(((produtoSelecionado.preco - precoFinal) / produtoSelecionado.preco) * 100)}%</Badge>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-white">R$ {precoFinal.toFixed(2)}</span>
                  )}
                  <p className="text-xs text-zinc-500 mt-1">por unidade · personalizacao inclusa</p>
                </div>

                {/* Quantidade */}
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-2">Quantidade</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-zinc-700 rounded-lg">
                      <button onClick={() => setQuantidade(Math.max(1, quantidade - 1))} className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"><Minus className="h-4 w-4" /></button>
                      <span className="px-4 py-2 text-white font-bold border-x border-zinc-700 min-w-[48px] text-center">{quantidade}</span>
                      <button onClick={() => setQuantidade(Math.min(produtoSelecionado.estoque, quantidade + 1))} className="px-3 py-2 text-zinc-400 hover:text-white transition-colors"><Plus className="h-4 w-4" /></button>
                    </div>
                    <span className="text-xs text-zinc-500">{produtoSelecionado.estoque} disponiveis</span>
                  </div>
                </div>

                {/* Info de entrega */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Personalizacao com logo e dados da sua empresa
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Producao sob demanda em 15 dias uteis
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    Entra direto no seu estoque de fulfillment
                  </div>
                </div>

                {/* Total + Botao */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <div>
                    <p className="text-xs text-zinc-500">Total do pedido</p>
                    <p className="text-2xl font-bold text-white">R$ {totalPedido.toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-600">{quantidade} {quantidade === 1 ? "unidade" : "unidades"}</p>
                  </div>
                  <Button tamanho="lg">
                    <ShoppingCart className="h-4 w-4" /> Adicionar ao Pedido
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
