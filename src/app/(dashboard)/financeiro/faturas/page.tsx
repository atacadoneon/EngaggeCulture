"use client";


import { usarToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Plus, DollarSign, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { SearchInput } from "@/components/ui/search-input";
import { listarFaturas, buscarStatsFaturas, criarFatura } from "@/lib/supabase/queries/financeiro";

const STATUS_COR: Record<string, "amber" | "green" | "red" | "zinc"> = {
  aberta: "amber", paga: "green", vencida: "red", cancelada: "zinc", parcial: "blue" as any,
};

const POR_PAGINA = 15;

export default function PaginaFaturas() {
  const toast = usarToast();
  const [faturas, setFaturas] = useState<any[]>([]);
  const [stats, setStats] = useState({ total_aberto: 0, total_vencido: 0, total_pago_mes: 0, qtd_abertas: 0, qtd_vencidas: 0 });
  const [abaAtiva, setAbaAtiva] = useState("todas");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Form
  const [fDesc, setFDesc] = useState("");
  const [fCat, setFCat] = useState("fulfillment");
  const [fValor, setFValor] = useState("");
  const [fVenc, setFVenc] = useState("");
  const [fNF, setFNF] = useState("");
  const [fObs, setFObs] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const filtroStatus = abaAtiva === "todas" ? undefined : abaAtiva;
    const [fats, st] = await Promise.all([listarFaturas({ status: filtroStatus }), buscarStatsFaturas()]);
    setFaturas(fats);
    setStats(st);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [abaAtiva]);

  const filtradas = faturas.filter((f) => f.descricao.toLowerCase().includes(busca.toLowerCase()));
  const totalPaginas = Math.ceil(filtradas.length / POR_PAGINA);
  const paginadas = filtradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarFatura({ descricao: fDesc, categoria: fCat, valor: parseFloat(fValor), vencimento: fVenc, nota_fiscal: fNF || undefined, observacoes: fObs || undefined });
      setModalAberto(false);
      setFDesc(""); setFValor(""); setFVenc(""); setFNF(""); setFObs("");
      carregar();
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Financeiro" }, { label: "Faturas" }]} />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Contas a Pagar</h1>
        <Button onClick={() => setModalAberto(true)}><Plus className="h-4 w-4" />Nova Fatura</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Em Aberto</p>
              <p className="text-2xl font-bold text-amber-400">R$ {stats.total_aberto.toFixed(2)}</p>
              <p className="text-xs text-zinc-500">{stats.qtd_abertas} faturas</p>
            </div>
            <Clock className="h-8 w-8 text-amber-500/30" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Vencidas</p>
              <p className="text-2xl font-bold text-red-400">R$ {stats.total_vencido.toFixed(2)}</p>
              <p className="text-xs text-zinc-500">{stats.qtd_vencidas} faturas</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500/30" />
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-400">Pago no Mes</p>
              <p className="text-2xl font-bold text-emerald-400">R$ {stats.total_pago_mes.toFixed(2)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500/30" />
          </div>
        </Card>
      </div>

      {/* Tabs + Busca */}
      <div className="flex items-center justify-between">
        <Tabs
          itens={[
            { id: "todas", label: "Todas" },
            { id: "aberta", label: "Abertas", contagem: stats.qtd_abertas },
            { id: "vencida", label: "Vencidas", contagem: stats.qtd_vencidas },
            { id: "paga", label: "Pagas" },
            { id: "cancelada", label: "Canceladas" },
          ]}
          ativo={abaAtiva}
          onChange={(id) => { setAbaAtiva(id); setPagina(1); }}
        />
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar fatura..." className="w-64" />
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Descricao</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Categoria</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Valor</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Vencimento</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">NF</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              ) : paginadas.length === 0 ? (
                <tr><td colSpan={6}><EmptyState icone={DollarSign} titulo="Nenhuma fatura encontrada" acaoLabel="Nova Fatura" acaoOnClick={() => setModalAberto(true)} /></td></tr>
              ) : paginadas.map((f) => (
                <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">{f.descricao}</td>
                  <td className="px-5 py-3"><Badge cor="zinc">{f.categoria}</Badge></td>
                  <td className="px-5 py-3 text-sm text-white text-right font-mono">R$ {Number(f.valor).toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{new Date(f.vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3"><Badge cor={STATUS_COR[f.status] || "zinc"}>{f.status}</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-500">{f.nota_fiscal || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>

      {/* Modal */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Nova Fatura" tamanho="lg">
        <form onSubmit={handleCriar} className="space-y-4">
          <Input rotulo="Descricao" value={fDesc} onChange={(e) => setFDesc(e.target.value)} placeholder="Descricao da fatura" required />
          <div className="grid grid-cols-3 gap-4">
            <Select rotulo="Categoria" value={fCat} onChange={(e) => setFCat(e.target.value)} opcoes={[
              { valor: "assinatura", texto: "Assinatura" }, { valor: "fulfillment", texto: "Fulfillment" },
              { valor: "frete", texto: "Frete" }, { valor: "produto", texto: "Produto" }, { valor: "outro", texto: "Outro" },
            ]} />
            <Input rotulo="Valor (R$)" type="number" step="0.01" value={fValor} onChange={(e) => setFValor(e.target.value)} placeholder="0.00" required />
            <Input rotulo="Vencimento" type="date" value={fVenc} onChange={(e) => setFVenc(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Nota Fiscal" value={fNF} onChange={(e) => setFNF(e.target.value)} placeholder="Numero da NF (opcional)" />
            <Input rotulo="Observacoes" value={fObs} onChange={(e) => setFObs(e.target.value)} placeholder="Obs (opcional)" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Criar Fatura"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
