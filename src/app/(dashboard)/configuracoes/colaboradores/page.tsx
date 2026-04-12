"use client";


import { usarToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Users, Plus, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { listarColaboradores, criarColaborador, listarEquipes, listarDepartamentos } from "@/lib/supabase/queries/colaboradores";

const STATUS_COR: Record<string, "green" | "amber" | "zinc" | "red"> = {
  ativo: "green",
  convidado: "amber",
  inativo: "zinc",
  desligado: "red",
};

export default function PaginaColaboradores() {
  const toast = usarToast();
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [equipes, setEquipes] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Form
  const [formNome, setFormNome] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCargo, setFormCargo] = useState("");
  const [formEquipe, setFormEquipe] = useState("");
  const [formDepartamento, setFormDepartamento] = useState("");
  const [formPerfil, setFormPerfil] = useState("colaborador");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const [colabs, eqs, deps] = await Promise.all([
        listarColaboradores({ status: filtroStatus || undefined }),
        listarEquipes(),
        listarDepartamentos(),
      ]);
      setColaboradores(colabs);
      setEquipes(eqs);
      setDepartamentos(deps);
    } catch (e) {
      console.error(e);
    }
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, [filtroStatus]);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarColaborador({
        nome: formNome,
        email: formEmail,
        cargo: formCargo || undefined,
        equipe_id: formEquipe || undefined,
        departamento_id: formDepartamento || undefined,
        perfil_nome: formPerfil,
      });
      setModalAberto(false);
      setFormNome(""); setFormEmail(""); setFormCargo(""); setFormEquipe(""); setFormDepartamento("");
      carregar();
    } catch (error: any) {
      toast.erro("Erro", error.message);
    }
    setSalvando(false);
  }

  const filtrados = colaboradores.filter(
    (c) => c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Colaboradores</h1>
          <p className="text-zinc-400 mt-1">{colaboradores.length} cadastrados</p>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou email..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white focus:outline-none"
        >
          <option value="">Todos os status</option>
          <option value="ativo">Ativos</option>
          <option value="convidado">Convidados</option>
          <option value="inativo">Inativos</option>
          <option value="desligado">Desligados</option>
        </select>
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Colaborador</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Cargo</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Equipe</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Perfil</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Pontos</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                    Carregando...
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-500">
                    Nenhum colaborador encontrado.
                  </td>
                </tr>
              ) : (
                filtrados.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {c.nome.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{c.nome}</p>
                          <p className="text-xs text-zinc-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{c.cargo || "—"}</td>
                    <td className="px-5 py-3 text-sm text-zinc-400">{c.equipe?.nome || "—"}</td>
                    <td className="px-5 py-3">
                      <Badge cor="blue">{c.perfil?.nome_exibicao || "—"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">{c.saldo_pontos.toLocaleString("pt-BR")}</td>
                    <td className="px-5 py-3">
                      <Badge cor={STATUS_COR[c.status] || "zinc"}>{c.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Novo Colaborador */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Novo Colaborador" tamanho="lg">
        <form onSubmit={handleCriar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Nome completo" value={formNome} onChange={(e) => setFormNome(e.target.value)} placeholder="Joao Silva" required />
            <Input rotulo="Email" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="joao@empresa.com" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Cargo" value={formCargo} onChange={(e) => setFormCargo(e.target.value)} placeholder="Vendedor, Analista..." />
            <Select
              rotulo="Perfil de acesso"
              value={formPerfil}
              onChange={(e) => setFormPerfil(e.target.value)}
              opcoes={[
                { valor: "colaborador", texto: "Colaborador" },
                { valor: "lider", texto: "Lider de Equipe" },
                { valor: "gestor", texto: "Gestor" },
                { valor: "admin", texto: "Administrador" },
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              rotulo="Departamento"
              value={formDepartamento}
              onChange={(e) => setFormDepartamento(e.target.value)}
              opcoes={departamentos.map((d: any) => ({ valor: d.id, texto: d.nome }))}
              placeholder="Selecione..."
            />
            <Select
              rotulo="Equipe"
              value={formEquipe}
              onChange={(e) => setFormEquipe(e.target.value)}
              opcoes={equipes.map((eq: any) => ({ valor: eq.id, texto: eq.nome }))}
              placeholder="Selecione..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
