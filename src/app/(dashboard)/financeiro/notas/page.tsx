"use client";

import { useEffect, useState } from "react";
import { Plus, FileText } from "lucide-react";
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
import { listarNotas, criarNota } from "@/lib/supabase/queries/financeiro";

const POR_PAGINA = 15;

export default function PaginaNotas() {
  const [notas, setNotas] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("todas");
  const [pagina, setPagina] = useState(1);
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [fNum, setFNum] = useState(""); const [fTipo, setFTipo] = useState("entrada");
  const [fForn, setFForn] = useState(""); const [fValor, setFValor] = useState("");
  const [fData, setFData] = useState(""); const [fChave, setFChave] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const filtro = abaAtiva === "todas" ? undefined : abaAtiva;
    const data = await listarNotas({ tipo: filtro });
    setNotas(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, [abaAtiva]);

  const totalPaginas = Math.ceil(notas.length / POR_PAGINA);
  const paginadas = notas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      await criarNota({ numero: fNum, tipo: fTipo, fornecedor: fForn || undefined, valor: parseFloat(fValor), data_emissao: fData, chave_acesso: fChave || undefined });
      setModalAberto(false); setFNum(""); setFValor(""); setFData(""); setFForn(""); setFChave("");
      carregar();
    } catch (err: any) { alert(err.message); }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Financeiro" }, { label: "Notas Fiscais" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Notas Fiscais</h1>
        <Button onClick={() => setModalAberto(true)}><Plus className="h-4 w-4" />Nova Nota</Button>
      </div>

      <Tabs itens={[
        { id: "todas", label: "Todas", contagem: notas.length },
        { id: "entrada", label: "Entrada" },
        { id: "saida", label: "Saida" },
        { id: "servico", label: "Servico" },
      ]} ativo={abaAtiva} onChange={(id) => { setAbaAtiva(id); setPagina(1); }} />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Numero</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tipo</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Fornecedor</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Valor</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Emissao</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginadas.length === 0 ? <tr><td colSpan={5}><EmptyState icone={FileText} titulo="Nenhuma nota fiscal" acaoLabel="Nova Nota" acaoOnClick={() => setModalAberto(true)} /></td></tr>
              : paginadas.map((n) => (
                <tr key={n.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-mono">{n.numero}</td>
                  <td className="px-5 py-3"><Badge cor={n.tipo === "entrada" ? "green" : n.tipo === "saida" ? "amber" : "blue"}>{n.tipo}</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{n.fornecedor || "—"}</td>
                  <td className="px-5 py-3 text-sm text-white text-right font-mono">R$ {Number(n.valor).toFixed(2)}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{new Date(n.data_emissao + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>

      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Nova Nota Fiscal" tamanho="lg">
        <form onSubmit={handleCriar} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input rotulo="Numero" value={fNum} onChange={(e) => setFNum(e.target.value)} placeholder="NF-001" required />
            <Select rotulo="Tipo" value={fTipo} onChange={(e) => setFTipo(e.target.value)} opcoes={[
              { valor: "entrada", texto: "Entrada" }, { valor: "saida", texto: "Saida" }, { valor: "servico", texto: "Servico" },
            ]} />
            <Input rotulo="Data Emissao" type="date" value={fData} onChange={(e) => setFData(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Fornecedor" value={fForn} onChange={(e) => setFForn(e.target.value)} placeholder="Nome do fornecedor" />
            <Input rotulo="Valor (R$)" type="number" step="0.01" value={fValor} onChange={(e) => setFValor(e.target.value)} required />
          </div>
          <Input rotulo="Chave de Acesso" value={fChave} onChange={(e) => setFChave(e.target.value)} placeholder="Chave de acesso da NF-e (opcional)" />
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Nota"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
