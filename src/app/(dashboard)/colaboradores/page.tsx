"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { Dropdown } from "@/components/ui/dropdown";
import { ImportadorCSV } from "@/components/ui/importador-csv";
import { listarColaboradores, criarColaborador } from "@/lib/supabase/queries/colaboradores";
import { Edit, Trash2, Eye } from "lucide-react";

const POR_PAGINA = 20;
const STATUS_COR: Record<string, "green" | "amber" | "zinc" | "red"> = { ativo: "green", convidado: "amber", inativo: "zinc", desligado: "red" };

export default function PaginaColaboradores() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState("todos");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    setCarregando(true);
    const filtroStatus = abaAtiva === "todos" ? undefined : abaAtiva;
    const data = await listarColaboradores({ status: filtroStatus });
    setColaboradores(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, [abaAtiva]);

  const filtrados = colaboradores.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase())
  );
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const ativos = colaboradores.filter((c) => c.status === "ativo").length;
  const convidados = colaboradores.filter((c) => c.status === "convidado").length;
  const inativos = colaboradores.filter((c) => c.status === "inativo").length;

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Administracao" }, { label: "Colaboradores" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Colaboradores</h1>
        <div className="flex gap-2">
          <ImportadorCSV
            titulo="Colaboradores"
            colunas={[
              { campo: "nome", rotulo: "Nome", obrigatorio: true },
              { campo: "email", rotulo: "Email", obrigatorio: true },
              { campo: "cargo", rotulo: "Cargo" },
              { campo: "departamento", rotulo: "Departamento" },
              { campo: "telefone", rotulo: "Telefone" },
            ]}
            exemploCSV="Joao Silva;joao@empresa.com;Vendedor;Comercial;(11)99999-0000"
            onImportar={async (registros) => {
              let sucesso = 0; let erros = 0;
              for (const r of registros) {
                try { await criarColaborador({ nome: r.nome, email: r.email, cargo: r.cargo }); sucesso++; } catch { erros++; }
              }
              carregar();
              return { sucesso, erros };
            }}
          />
          <Link href="/colaboradores/novo"><Button><Plus className="h-4 w-4" />Novo Colaborador</Button></Link>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Tabs itens={[
          { id: "todos", label: "Todos", contagem: colaboradores.length },
          { id: "ativo", label: "Ativos", contagem: ativos },
          { id: "convidado", label: "Convidados", contagem: convidados },
          { id: "inativo", label: "Inativos", contagem: inativos },
        ]} ativo={abaAtiva} onChange={(id) => { setAbaAtiva(id); setPagina(1); }} />
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar por nome, email ou CPF..." className="w-72" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="w-8 px-5 py-3"><input type="checkbox" className="rounded border-zinc-600" /></th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Nome</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Cargo</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Equipe</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Perfil</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-zinc-400 uppercase">Pontos</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              <th className="px-5 py-3 w-10"></th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={8} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginados.length === 0 ? <tr><td colSpan={8}><EmptyState icone={Users} titulo="Nenhum colaborador" acaoLabel="Cadastrar" acaoHref="/colaboradores/novo" /></td></tr>
              : paginados.map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3"><input type="checkbox" className="rounded border-zinc-600" /></td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">{c.nome.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-white">{c.nome}</p>
                        <p className="text-xs text-zinc-500">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{c.cargo || "—"}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{c.equipe?.nome || "—"}</td>
                  <td className="px-5 py-3"><Badge cor="blue">{c.perfil?.nome_exibicao || "—"}</Badge></td>
                  <td className="px-5 py-3 text-sm font-semibold text-white text-right">{c.saldo_pontos.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3"><Badge cor={STATUS_COR[c.status] || "zinc"}>{c.status}</Badge></td>
                  <td className="px-5 py-3">
                    <Dropdown itens={[
                      { label: "Ver detalhes", icone: Eye, onClick: () => { window.location.href = `/colaboradores/novo?id=${c.id}`; } },
                      { label: "Editar", icone: Edit, onClick: () => { window.location.href = `/colaboradores/novo?id=${c.id}`; } },
                      { label: "Desativar", icone: Trash2, onClick: async () => {
                        if (confirm(`Deseja desativar ${c.nome}?`)) {
                          try {
                            const { atualizarColaborador } = await import("@/lib/supabase/queries/colaboradores");
                            await atualizarColaborador(c.id, { status: "inativo" } as any);
                            carregar();
                          } catch {}
                        }
                      }, perigo: true },
                    ]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>
    </div>
  );
}
