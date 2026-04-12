"use client";

import { useState } from "react";
import { CreditCard, ShoppingBag, Star, Heart, Zap, Check, Eye } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SearchInput } from "@/components/ui/search-input";
import { usarSessao } from "@/hooks/usar-sessao";
import { cn } from "@/lib/utils";

// Produtos demo — sera substituido por dados do banco
const PRODUTOS_DEMO = [
  {
    id: "1", nome: "Placa Top Performance", descricao: "Placa em acrilico 3D com impressao UV personalizada. Ideal para premiar o melhor vendedor do mes.",
    imagem: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=400&fit=crop",
    custo_pontos: 500, categoria: "fisico", estoque: 12, avaliacao: 4.8, vendidos: 34,
  },
  {
    id: "2", nome: "Gift Card iFood R$ 50", descricao: "Credito de R$ 50 para pedir no iFood. Entrega digital instantanea por email.",
    imagem: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop",
    custo_pontos: 200, categoria: "digital", estoque: null, avaliacao: 4.9, vendidos: 89,
  },
  {
    id: "3", nome: "Kit Onboarding Premium", descricao: "Kit completo de boas-vindas: placa welcome + caneca personalizada + camiseta + carta do CEO.",
    imagem: "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?w=400&h=400&fit=crop",
    custo_pontos: 800, categoria: "kit", estoque: 5, avaliacao: 5.0, vendidos: 12,
  },
  {
    id: "4", nome: "Day Off Extra", descricao: "Um dia de folga extra para voce descansar e recarregar as energias. Validade: 90 dias.",
    imagem: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop",
    custo_pontos: 1000, categoria: "experiencia", estoque: null, avaliacao: 5.0, vendidos: 7,
  },
  {
    id: "5", nome: "Trofeu Campeao de Vendas", descricao: "Trofeu em acrilico 3D com base em madeira nobre. Para os verdadeiros campeoes.",
    imagem: "https://images.unsplash.com/photo-1569429593410-b498b3fb3387?w=400&h=400&fit=crop",
    custo_pontos: 1500, categoria: "fisico", estoque: 3, avaliacao: 4.7, vendidos: 5,
  },
  {
    id: "6", nome: "Gift Card Amazon R$ 100", descricao: "Credito de R$ 100 para compras na Amazon Brasil. Entrega digital instantanea.",
    imagem: "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400&h=400&fit=crop",
    custo_pontos: 400, categoria: "digital", estoque: null, avaliacao: 4.9, vendidos: 56,
  },
  {
    id: "7", nome: "Almoco com o CEO", descricao: "Uma hora de conversa e almoco com o fundador da empresa. Experiencia unica e inspiradora.",
    imagem: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=400&fit=crop",
    custo_pontos: 2000, categoria: "experiencia", estoque: null, avaliacao: 5.0, vendidos: 2,
  },
  {
    id: "8", nome: "Caneca Personalizada", descricao: "Caneca de ceramica com seu nome e logo da empresa. Acabamento premium.",
    imagem: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    custo_pontos: 150, categoria: "fisico", estoque: 25, avaliacao: 4.5, vendidos: 67,
  },
];

export default function PaginaLoja() {
  const { sessao } = usarSessao();
  const [busca, setBusca] = useState("");
  const [produtoSelecionado, setProdutoSelecionado] = useState<typeof PRODUTOS_DEMO[0] | null>(null);
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());

  const filtrados = PRODUTOS_DEMO.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function toggleFavorito(id: string) {
    setFavoritos((prev) => {
      const novo = new Set(prev);
      if (novo.has(id)) novo.delete(id); else novo.add(id);
      return novo;
    });
  }

  const saldoPontos = sessao?.colaborador.saldo_pontos || 0;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Loja de Recompensas" }]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Loja de Recompensas</h1>
          <p className="text-zinc-400 text-sm mt-0.5">Resgate seus pontos por premios incriveis</p>
        </div>
        {sessao && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-600/10 border border-violet-500/30 rounded-xl">
              <span className="text-lg">{sessao.empresa.moeda_icone}</span>
              <div>
                <p className="text-sm font-bold text-violet-400">{saldoPontos.toLocaleString("pt-BR")}</p>
                <p className="text-[10px] text-zinc-500">pontos</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600/10 border border-emerald-500/30 rounded-xl">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="text-sm font-bold text-emerald-400">R$ {sessao.colaborador.saldo_creditos.toFixed(2)}</p>
                <p className="text-[10px] text-zinc-500">creditos</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Busca */}
      <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto..." className="max-w-md" />

      {/* Grid de Produtos — estilo e-commerce */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtrados.map((produto) => {
          const podePagar = saldoPontos >= produto.custo_pontos;
          const eFavorito = favoritos.has(produto.id);

          return (
            <div
              key={produto.id}
              className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-violet-500/40 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300"
            >
              {/* Imagem */}
              <div className="relative h-48 bg-zinc-800 overflow-hidden">
                <img
                  src={produto.imagem}
                  alt={produto.nome}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Favorito */}
                <button
                  onClick={() => toggleFavorito(produto.id)}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-zinc-800"
                >
                  <Heart className={cn("h-4 w-4", eFavorito ? "text-rose-500 fill-rose-500" : "text-zinc-400")} />
                </button>

                {/* Badges sobre a imagem */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {produto.estoque !== null && produto.estoque <= 5 && produto.estoque > 0 && (
                    <span className="text-[10px] font-bold bg-amber-600 text-white px-2 py-0.5 rounded">
                      Ultimas {produto.estoque} unidades
                    </span>
                  )}
                  {produto.categoria === "digital" && (
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">
                      Entrega instantanea
                    </span>
                  )}
                </div>

                {/* Ver detalhes overlay */}
                <button
                  onClick={() => setProdutoSelecionado(produto)}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <span className="flex items-center gap-2 bg-white text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold">
                    <Eye className="h-4 w-4" /> Ver detalhes
                  </span>
                </button>
              </div>

              {/* Info do produto */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white leading-tight line-clamp-1">
                  {produto.nome}
                </h3>
                <p className="text-xs text-zinc-500 mt-1 line-clamp-2 h-8">
                  {produto.descricao}
                </p>

                {/* Avaliacao + vendidos */}
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-semibold text-white">{produto.avaliacao}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600">|</span>
                  <span className="text-[10px] text-zinc-500">{produto.vendidos} resgatados</span>
                </div>

                {/* Preco + botao */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-violet-400" />
                    <span className="text-lg font-bold text-white">
                      {produto.custo_pontos.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs text-zinc-500">pts</span>
                  </div>

                  <Button
                    tamanho="sm"
                    variante={podePagar ? "primario" : "secundario"}
                    disabled={!podePagar}
                    onClick={() => setProdutoSelecionado(produto)}
                  >
                    {podePagar ? "Resgatar" : "Pontos insuficientes"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detalhe do Produto */}
      <Modal
        aberto={!!produtoSelecionado}
        fechar={() => setProdutoSelecionado(null)}
        titulo=""
        tamanho="lg"
      >
        {produtoSelecionado && (
          <div className="space-y-5 -mt-2">
            {/* Imagem grande */}
            <div className="h-64 rounded-xl overflow-hidden bg-zinc-800">
              <img
                src={produtoSelecionado.imagem}
                alt={produtoSelecionado.nome}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-bold text-white">{produtoSelecionado.nome}</h2>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="text-sm font-bold text-white">{produtoSelecionado.avaliacao}</span>
                  <span className="text-xs text-zinc-500">({produtoSelecionado.vendidos} resgates)</span>
                </div>
              </div>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">{produtoSelecionado.descricao}</p>
            </div>

            {/* Detalhes */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Categoria</p>
                <p className="text-sm text-white font-medium mt-0.5">{produtoSelecionado.categoria}</p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Disponibilidade</p>
                <p className="text-sm text-white font-medium mt-0.5">
                  {produtoSelecionado.estoque !== null ? `${produtoSelecionado.estoque} em estoque` : "Ilimitado"}
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <p className="text-[10px] text-zinc-500 uppercase font-semibold">Entrega</p>
                <p className="text-sm text-white font-medium mt-0.5">
                  {produtoSelecionado.categoria === "digital" ? "Instantanea" : "15-20 dias"}
                </p>
              </div>
            </div>

            {/* Preco e acao */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-violet-400" />
                  <span className="text-2xl font-bold text-white">{produtoSelecionado.custo_pontos.toLocaleString("pt-BR")}</span>
                  <span className="text-sm text-zinc-400">pontos</span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Seu saldo: <span className={cn("font-semibold", saldoPontos >= produtoSelecionado.custo_pontos ? "text-emerald-400" : "text-red-400")}>
                    {saldoPontos.toLocaleString("pt-BR")} pontos
                  </span>
                  {saldoPontos >= produtoSelecionado.custo_pontos && (
                    <span className="text-emerald-400 ml-1">(suficiente)</span>
                  )}
                </p>
              </div>
              <Button
                disabled={saldoPontos < produtoSelecionado.custo_pontos}
                tamanho="lg"
              >
                <ShoppingBag className="h-4 w-4" />
                {saldoPontos >= produtoSelecionado.custo_pontos ? "Resgatar Agora" : "Pontos Insuficientes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
