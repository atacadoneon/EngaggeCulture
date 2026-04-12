"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, Truck, Shield, CreditCard, Check, Store } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { usarCarrinho } from "@/hooks/usar-carrinho";
import { criarPedidoCompra } from "@/lib/supabase/queries/loja-interna";
import { cn } from "@/lib/utils";

export default function PaginaCarrinho() {
  const router = useRouter();
  const carrinho = usarCarrinho();
  const [finalizando, setFinalizando] = useState(false);
  const [pedidoCriado, setPedidoCriado] = useState(false);

  const subtotal = carrinho.totalValor();
  const freteGratis = subtotal >= 500;
  const frete = freteGratis ? 0 : 49.90;
  const total = subtotal + frete;

  async function finalizarPedido() {
    setFinalizando(true);
    try {
      const itens = carrinho.itens.map((item) => ({
        produto_catalogo_id: item.id,
        nome_produto: item.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco,
      }));

      await criarPedidoCompra(itens);
      carrinho.limparCarrinho();
      setPedidoCriado(true);
    } catch (error: any) {
      alert("Erro ao finalizar pedido: " + error.message);
    }
    setFinalizando(false);
  }

  if (pedidoCriado) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center mb-6">
          <Check className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Pedido Realizado!</h1>
        <p className="text-zinc-400 text-center max-w-md mb-6">
          Seu pedido de compra foi criado com sucesso. Voce pode acompanhar o status na pagina de pedidos.
        </p>
        <div className="flex gap-3">
          <Link href="/loja-interna/pedidos"><Button variante="secundario"><Package className="h-4 w-4" />Ver Meus Pedidos</Button></Link>
          <Link href="/loja-interna"><Button><Store className="h-4 w-4" />Continuar Comprando</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Loja Interna", href: "/loja-interna" }, { label: "Carrinho" }]} />

      <div className="flex items-center gap-4">
        <Link href="/loja-interna" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-violet-400" /> Carrinho
          </h1>
          <p className="text-zinc-400 text-sm">{carrinho.totalItens()} {carrinho.totalItens() === 1 ? "item" : "itens"}</p>
        </div>
      </div>

      {carrinho.itens.length === 0 ? (
        <EmptyState
          icone={ShoppingCart}
          titulo="Seu carrinho esta vazio"
          descricao="Adicione produtos da loja interna ao carrinho para fazer seu pedido."
          acaoLabel="Ir para a Loja"
          acaoHref="/loja-interna"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de itens */}
          <div className="lg:col-span-2 space-y-3">
            {carrinho.itens.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex gap-4">
                  {/* Imagem */}
                  <div className="h-24 w-24 bg-zinc-800 rounded-xl overflow-hidden shrink-0">
                    {item.imagem ? (
                      <img src={item.imagem} alt={item.nome} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center"><Package className="h-8 w-8 text-zinc-600" /></div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{item.nome}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge cor="zinc">{item.categoria}</Badge>
                          {item.sku && <span className="text-[10px] text-zinc-500 font-mono">SKU: {item.sku}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => carrinho.removerItem(item.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantidade */}
                      <div className="flex items-center border border-zinc-700 rounded-lg">
                        <button
                          onClick={() => carrinho.atualizarQuantidade(item.id, item.quantidade - 1)}
                          className="px-2.5 py-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 py-1.5 text-white font-bold border-x border-zinc-700 min-w-[40px] text-center text-sm">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => carrinho.atualizarQuantidade(item.id, item.quantidade + 1)}
                          className="px-2.5 py-1.5 text-zinc-400 hover:text-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Preco */}
                      <div className="text-right">
                        <p className="text-base font-bold text-white">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                        {item.quantidade > 1 && (
                          <p className="text-[10px] text-zinc-500">R$ {item.preco.toFixed(2)} / unidade</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {/* Botao limpar */}
            <div className="flex justify-between items-center">
              <Link href="/loja-interna" className="text-sm text-violet-400 hover:underline">
                Continuar comprando
              </Link>
              <button onClick={() => carrinho.limparCarrinho()} className="text-xs text-zinc-500 hover:text-red-400 transition-colors">
                Limpar carrinho
              </button>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-base font-bold text-white">Resumo do Pedido</h3>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Subtotal ({carrinho.totalItens()} itens)</span>
                  <span className="text-sm text-white">R$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Frete</span>
                  {freteGratis ? (
                    <span className="text-sm text-emerald-400 font-semibold">Gratis</span>
                  ) : (
                    <span className="text-sm text-white">R$ {frete.toFixed(2)}</span>
                  )}
                </div>
                {!freteGratis && (
                  <p className="text-[10px] text-zinc-500 bg-zinc-800 rounded-lg px-3 py-2">
                    Falta R$ {(500 - subtotal).toFixed(2)} para frete gratis
                  </p>
                )}
                <div className="border-t border-zinc-800 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-white">Total</span>
                    <span className="text-xl font-bold text-white">R$ {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" tamanho="lg" onClick={finalizarPedido} disabled={finalizando}>
                <CreditCard className="h-4 w-4" />
                {finalizando ? "Finalizando..." : "Finalizar Pedido"}
              </Button>

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-xs text-zinc-400"><Shield className="h-3.5 w-3.5 text-emerald-400" />Personalizacao com logo inclusa</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400"><Truck className="h-3.5 w-3.5 text-emerald-400" />Producao em 15 dias uteis</div>
                <div className="flex items-center gap-2 text-xs text-zinc-400"><Package className="h-3.5 w-3.5 text-emerald-400" />Entra direto no estoque</div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
