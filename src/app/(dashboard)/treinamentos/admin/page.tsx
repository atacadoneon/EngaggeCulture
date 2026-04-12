"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, BookOpen, Edit, Eye, Trash2, Copy, ArrowLeft, Upload, Video, FileText, HelpCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Dropdown } from "@/components/ui/dropdown";
import { Paginacao } from "@/components/ui/paginacao";

// Demo data
const TRILHAS_ADMIN = [
  { id: "1", nome: "Onboarding Comercial", categoria: "Onboarding", modulos: 8, status: "publicada", participantes: 24, criada_em: "2026-03-15" },
  { id: "2", nome: "Tecnicas de Fechamento", categoria: "Vendas", modulos: 6, status: "publicada", participantes: 18, criada_em: "2026-03-20" },
  { id: "3", nome: "Cultura Engagge", categoria: "Cultura", modulos: 5, status: "publicada", participantes: 45, criada_em: "2026-04-01" },
  { id: "4", nome: "Produto em Profundidade", categoria: "Produto", modulos: 10, status: "rascunho", participantes: 0, criada_em: "2026-04-10" },
  { id: "5", nome: "Objecoes Matadoras", categoria: "Vendas", modulos: 4, status: "publicada", participantes: 8, criada_em: "2026-04-05" },
  { id: "6", nome: "Seguranca da Informacao", categoria: "Compliance", modulos: 3, status: "publicada", participantes: 45, criada_em: "2026-02-10" },
];

const STATUS_COR: Record<string, "green" | "amber" | "zinc"> = {
  publicada: "green", rascunho: "amber", arquivada: "zinc",
};

export default function PaginaAdminTreinamentos() {
  const [abaAtiva, setAbaAtiva] = useState("todas");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const filtradas = TRILHAS_ADMIN
    .filter((t) => abaAtiva === "todas" || t.status === abaAtiva)
    .filter((t) => t.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[
        { label: "Treinamentos", href: "/treinamentos" },
        { label: "Gerenciar Conteudo" },
      ]} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/treinamentos" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Gerenciar Conteudo</h1>
            <p className="text-zinc-400 text-sm">Crie e gerencie trilhas de treinamento</p>
          </div>
        </div>
        <Link href="/treinamentos/admin/nova-trilha">
          <Button><Plus className="h-4 w-4" />Nova Trilha</Button>
        </Link>
      </div>

      {/* Stats rapidos */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-zinc-400">Total Trilhas</p>
          <p className="text-2xl font-bold text-white">{TRILHAS_ADMIN.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-400">Publicadas</p>
          <p className="text-2xl font-bold text-emerald-400">{TRILHAS_ADMIN.filter((t) => t.status === "publicada").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-400">Rascunhos</p>
          <p className="text-2xl font-bold text-amber-400">{TRILHAS_ADMIN.filter((t) => t.status === "rascunho").length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-zinc-400">Total Modulos</p>
          <p className="text-2xl font-bold text-violet-400">{TRILHAS_ADMIN.reduce((a, t) => a + t.modulos, 0)}</p>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center justify-between">
        <Tabs itens={[
          { id: "todas", label: "Todas", contagem: TRILHAS_ADMIN.length },
          { id: "publicada", label: "Publicadas" },
          { id: "rascunho", label: "Rascunhos" },
        ]} ativo={abaAtiva} onChange={setAbaAtiva} />
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar trilha..." className="w-64" />
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Trilha</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Categoria</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Modulos</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Participantes</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Criada em</th>
              <th className="px-5 py-3 w-10"></th>
            </tr></thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr><td colSpan={7}><EmptyState icone={BookOpen} titulo="Nenhuma trilha encontrada" acaoLabel="Criar Trilha" acaoHref="/treinamentos/admin/nova-trilha" /></td></tr>
              ) : filtradas.map((t) => (
                <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-violet-600/20 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-violet-400" />
                      </div>
                      <p className="text-sm font-medium text-white">{t.nome}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge cor="zinc">{t.categoria}</Badge></td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-sm font-semibold text-white">{t.modulos}</span>
                      <span className="text-xs text-zinc-500">modulos</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-sm text-zinc-400">{t.participantes}</td>
                  <td className="px-5 py-3"><Badge cor={STATUS_COR[t.status] || "zinc"}>{t.status}</Badge></td>
                  <td className="px-5 py-3 text-sm text-zinc-500">{new Date(t.criada_em + "T12:00:00").toLocaleDateString("pt-BR")}</td>
                  <td className="px-5 py-3">
                    <Dropdown itens={[
                      { label: "Editar modulos", icone: Edit, onClick: () => {} },
                      { label: "Ver preview", icone: Eye, onClick: () => {} },
                      { label: "Duplicar", icone: Copy, onClick: () => {} },
                      { label: "Excluir", icone: Trash2, onClick: () => {}, perigo: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
