"use client";


import { usarToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Warehouse, Package, AlertTriangle, ArrowUpDown, Plus } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { listarEstoque, buscarStatsEstoque, criarMovimentacao } from "@/lib/supabase/queries/estoque";
import { cn } from "@/lib/utils";

export default function PaginaEstoque() {
  const toast = usarToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_itens: 0, estoque_baixo: 0, sem_estoque: 0, total_produtos: 0 });
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [movTipo, setMovTipo] = useState<"entrada" | "saida">("entrada");
  const [movQtd, setMovQtd] = useState("");
  const [movObs, setMovObs] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const [prods, st] = await Promise.all([listarEstoque(), buscarStatsEstoque()]);
    setProdutos(prods);
    setStats(st);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = produtos.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));

  function abrirMovimentacao(produto: any, tipo: "entrada" | "saida") {
    setProdutoSelecionado(produto);
    setMovTipo(tipo);
    setMovQtd("");
    setMovObs("");
    setModalAberto(true);
  }

  async function handleMovimentacao(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      await criarMovimentacao({ produto_id: produtoSelecionado.id, tipo: movTipo, quantidade: parseInt(movQtd), observacoes: movObs || undefined });
      setModalAberto(false);
      carregar();
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Operacao" }, { label: "Estoque" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Estoque</h1>
        <Link href="/estoque/movimentacoes"><Button variante="secundario"><ArrowUpDown className="h-4 w-4" />Movimentacoes</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5"><p className="text-sm text-zinc-400">Total Produtos</p><p className="text-2xl font-bold text-white">{stats.total_produtos}</p></Card>
        <Card className="p-5"><p className="text-sm text-zinc-400">Total em Estoque</p><p className="text-2xl font-bold text-violet-400">{stats.total_itens} un</p></Card>
        <Card className="p-5"><p className="text-sm text-zinc-400">Estoque Baixo</p><p className="text-2xl font-bold text-amber-400">{stats.estoque_baixo}</p></Card>
        <Card className="p-5"><p className="text-sm text-zinc-400">Sem Estoque</p><p className="text-2xl font-bold text-red-400">{stats.sem_estoque}</p></Card>
      </div>

      <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar produto..." className="max-w-sm" />

      {/* Grid de produtos */}
      {carregando ? <p className="text-zinc-500">Carregando...</p> : filtrados.length === 0 ? (
        <EmptyState icone={Warehouse} titulo="Nenhum produto no estoque" descricao="Cadastre produtos na loja de recompensas primeiro." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtrados.map((p) => {
            const semEstoque = p.estoque !== null && p.estoque <= 0;
            const baixo = p.estoque !== null && p.estoque > 0 && p.estoque < 5;
            return (
              <Card key={p.id} className={cn("p-4", semEstoque && "border-red-500/30", baixo && "border-amber-500/30")}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                      {p.imagem_url ? <img src={p.imagem_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <Package className="h-5 w-5 text-zinc-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-tight">{p.nome}</p>
                      <Badge cor="zinc">{p.categoria}</Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-zinc-500">Estoque</span>
                  <span className={cn("text-xl font-bold", semEstoque ? "text-red-400" : baixo ? "text-amber-400" : "text-white")}>
                    {p.estoque !== null ? p.estoque : "∞"}
                  </span>
                </div>

                {semEstoque && <div className="flex items-center gap-1 text-xs text-red-400 mb-2"><AlertTriangle className="h-3 w-3" />Sem estoque</div>}
                {baixo && <div className="flex items-center gap-1 text-xs text-amber-400 mb-2"><AlertTriangle className="h-3 w-3" />Estoque baixo</div>}

                <div className="flex gap-2">
                  <button onClick={() => abrirMovimentacao(p, "entrada")} className="flex-1 text-xs px-2 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600/30 transition-colors">+ Entrada</button>
                  <button onClick={() => abrirMovimentacao(p, "saida")} className="flex-1 text-xs px-2 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-600/30 transition-colors">- Saida</button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal Movimentacao */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo={`${movTipo === "entrada" ? "Entrada" : "Saida"} de Estoque`}>
        <form onSubmit={handleMovimentacao} className="space-y-4">
          <p className="text-sm text-zinc-400">Produto: <span className="text-white font-medium">{produtoSelecionado?.nome}</span></p>
          <p className="text-sm text-zinc-400">Estoque atual: <span className="text-white font-bold">{produtoSelecionado?.estoque ?? "∞"}</span></p>
          <Input rotulo="Quantidade" type="number" min="1" value={movQtd} onChange={(e) => setMovQtd(e.target.value)} placeholder="Quantidade" required />
          <Input rotulo="Observacao" value={movObs} onChange={(e) => setMovObs(e.target.value)} placeholder="Motivo da movimentacao (opcional)" />
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando} variante={movTipo === "entrada" ? "primario" : "perigo"}>
              {salvando ? "Processando..." : movTipo === "entrada" ? "+ Registrar Entrada" : "- Registrar Saida"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
