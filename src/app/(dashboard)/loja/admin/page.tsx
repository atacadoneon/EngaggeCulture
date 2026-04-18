"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, Package, Edit, Trash2 } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Paginacao } from "@/components/ui/paginacao";
import { EmptyState } from "@/components/ui/empty-state";
import { Dropdown } from "@/components/ui/dropdown";
import { usarToast } from "@/components/ui/toast";
import { listarProdutos, criarProduto } from "@/lib/supabase/queries/loja";

const POR_PAGINA = 15;

export default function PaginaLojaAdmin() {
  const toast = usarToast();
  const [produtos, setProdutos] = useState<any[]>([]);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [fNome, setFNome] = useState("");
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState("fisico");
  const [fPontos, setFPontos] = useState("");
  const [fEstoque, setFEstoque] = useState("");
  const [fImagem, setFImagem] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try { const data = await listarProdutos(); setProdutos(data || []); } catch {}
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  const totalPaginas = Math.ceil(produtos.length / POR_PAGINA);
  const paginados = produtos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      await criarProduto({
        nome: fNome, descricao: fDesc || undefined, categoria: fCat as any,
        custo_pontos: parseInt(fPontos) || 0, estoque: fEstoque ? parseInt(fEstoque) : undefined,
        imagem_url: fImagem || undefined, ativo: true,
      } as any);
      toast.sucesso("Produto criado!");
      setModalAberto(false);
      setFNome(""); setFDesc(""); setFPontos(""); setFEstoque(""); setFImagem("");
      carregar();
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Loja", href: "/loja" }, { label: "Gerenciar Produtos" }]} />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/loja" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold text-white">Gerenciar Produtos</h1>
        </div>
        <Button onClick={() => setModalAberto(true)}><Plus className="h-4 w-4" />Novo Produto</Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Produto</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Categoria</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Pontos</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Estoque</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              <th className="px-5 py-3 w-10"></th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginados.length === 0 ? <tr><td colSpan={6}><EmptyState icone={Package} titulo="Nenhum produto" acaoLabel="Criar Produto" acaoOnClick={() => setModalAberto(true)} /></td></tr>
              : paginados.map((p) => (
                <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                        {p.imagem_url ? <img src={p.imagem_url} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <Package className="h-5 w-5 text-zinc-600" />}
                      </div>
                      <div><p className="text-sm font-medium text-white">{p.nome}</p>{p.descricao && <p className="text-xs text-zinc-500 line-clamp-1">{p.descricao}</p>}</div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge cor="zinc">{p.categoria}</Badge></td>
                  <td className="px-5 py-3 text-sm text-amber-400 text-right font-semibold">{p.custo_pontos || 0} pts</td>
                  <td className="px-5 py-3 text-sm text-right text-white">{p.estoque !== null ? p.estoque : "Ilimitado"}</td>
                  <td className="px-5 py-3"><Badge cor={p.ativo ? "green" : "red"}>{p.ativo ? "Ativo" : "Inativo"}</Badge></td>
                  <td className="px-5 py-3"><Dropdown itens={[
                    { label: "Editar", icone: Edit, onClick: () => {
                      setFNome(p.nome); setFDesc(p.descricao || ""); setFCat(p.categoria);
                      setFPontos(String(p.custo_pontos || "")); setFEstoque(p.estoque !== null ? String(p.estoque) : "");
                      setFImagem(p.imagem_url || ""); setModalAberto(true);
                    }},
                    { label: p.ativo ? "Desativar" : "Ativar", icone: Trash2, onClick: async () => {
                      try {
                        const { atualizarProduto } = await import("@/lib/supabase/queries/loja");
                        await atualizarProduto(p.id, { ativo: !p.ativo } as any);
                        toast.sucesso(p.ativo ? "Produto desativado" : "Produto ativado");
                        carregar();
                      } catch (err: any) { toast.erro("Erro", err.message); }
                    }, perigo: p.ativo },
                  ]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>

      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Novo Produto" tamanho="lg">
        <form onSubmit={handleCriar} className="space-y-4">
          <Input rotulo="Nome do produto" value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Ex: Placa Top Performance" required />
          <Input rotulo="Descricao" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Descricao do produto" />
          <div className="grid grid-cols-3 gap-4">
            <Select rotulo="Categoria" value={fCat} onChange={(e) => setFCat(e.target.value)} opcoes={[
              { valor: "fisico", texto: "Fisico" }, { valor: "digital", texto: "Digital" },
              { valor: "experiencia", texto: "Experiencia" }, { valor: "gift_card", texto: "Gift Card" },
              { valor: "kit", texto: "Kit" }, { valor: "doacao", texto: "Doacao" },
            ]} />
            <Input rotulo="Custo em pontos" type="number" value={fPontos} onChange={(e) => setFPontos(e.target.value)} placeholder="500" required />
            <Input rotulo="Estoque" type="number" value={fEstoque} onChange={(e) => setFEstoque(e.target.value)} placeholder="Vazio = ilimitado" />
          </div>
          <Input rotulo="URL da imagem" value={fImagem} onChange={(e) => setFImagem(e.target.value)} placeholder="https://..." />
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Criar Produto"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
