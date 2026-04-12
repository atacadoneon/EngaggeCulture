"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Search, Users, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { listarClientesExternos, criarClienteExterno, type ClienteExterno } from "@/lib/supabase/queries/clientes-externos";
import { listarColaboradores } from "@/lib/supabase/queries/colaboradores";
import { cn } from "@/lib/utils";

export default function PaginaDestinatarios() {
  const [aba, setAba] = useState<"colaboradores" | "clientes">("clientes");
  const [clientes, setClientes] = useState<ClienteExterno[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);

  // Form
  const [fNome, setFNome] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fEmpresa, setFEmpresa] = useState("");
  const [fTelefone, setFTelefone] = useState("");
  const [fRua, setFRua] = useState("");
  const [fCidade, setFCidade] = useState("");
  const [fEstado, setFEstado] = useState("");
  const [fCep, setFCep] = useState("");
  const [fTags, setFTags] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const [clis, colabs] = await Promise.all([
      listarClientesExternos({ busca: busca || undefined }),
      listarColaboradores({ status: "ativo" }),
    ]);
    setClientes(clis);
    setColaboradores(colabs);
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleCriarCliente(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarClienteExterno({
        nome: fNome,
        email: fEmail || undefined,
        empresa_nome: fEmpresa || undefined,
        telefone: fTelefone || undefined,
        endereco: fRua ? { rua: fRua, cidade: fCidade, estado: fEstado, cep: fCep } : undefined,
        tags: fTags ? fTags.split(",").map((t) => t.trim()) : [],
      });
      setModalAberto(false);
      setFNome(""); setFEmail(""); setFEmpresa(""); setFTelefone("");
      setFRua(""); setFCidade(""); setFEstado(""); setFCep(""); setFTags("");
      carregar();
    } catch (error: any) {
      alert(error.message);
    }
    setSalvando(false);
  }

  const clientesFiltrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.email?.toLowerCase().includes(busca.toLowerCase()) ||
    c.empresa_nome?.toLowerCase().includes(busca.toLowerCase())
  );

  const colaboradoresFiltrados = colaboradores.filter((c: any) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/envios" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Destinatarios</h1>
            <p className="text-zinc-400 text-sm">Colaboradores e clientes externos</p>
          </div>
        </div>
        <Button onClick={() => setModalAberto(true)}>
          <Plus className="h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-zinc-800 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setAba("clientes")}
          className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors", aba === "clientes" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}
        >
          <Building className="h-4 w-4" /> Clientes ({clientes.length})
        </button>
        <button
          onClick={() => setAba("colaboradores")}
          className={cn("flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors", aba === "colaboradores" ? "bg-violet-600 text-white" : "text-zinc-400 hover:text-white")}
        >
          <Users className="h-4 w-4" /> Colaboradores ({colaboradores.length})
        </button>
      </div>

      {/* Busca */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, email ou empresa..."
          className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {/* Tabela */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Nome</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Email</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">{aba === "clientes" ? "Empresa" : "Cargo"}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">{aba === "clientes" ? "Tags" : "Equipe"}</th>
              </tr>
            </thead>
            <tbody>
              {carregando ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              ) : aba === "clientes" ? (
                clientesFiltrados.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-500">Nenhum cliente cadastrado.</td></tr>
                ) : (
                  clientesFiltrados.map((c) => (
                    <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-white">{c.nome}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{c.email || "—"}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{c.empresa_nome || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {c.tags?.map((t, i) => <Badge key={i} cor="zinc">{t}</Badge>)}
                        </div>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                colaboradoresFiltrados.length === 0 ? (
                  <tr><td colSpan={4} className="px-5 py-8 text-center text-zinc-500">Nenhum colaborador ativo.</td></tr>
                ) : (
                  colaboradoresFiltrados.map((c: any) => (
                    <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-white">{c.nome}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{c.email}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{c.cargo || "—"}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{c.equipe?.nome || "—"}</td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Novo Cliente */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Novo Cliente / Parceiro" tamanho="lg">
        <form onSubmit={handleCriarCliente} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Nome" value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" required />
            <Input rotulo="Email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Empresa" value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)} placeholder="Nome da empresa" />
            <Input rotulo="Telefone" value={fTelefone} onChange={(e) => setFTelefone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <p className="text-sm font-medium text-zinc-300 mt-2">Endereco de entrega</p>
          <div className="grid grid-cols-1 gap-4">
            <Input rotulo="Rua/Endereco" value={fRua} onChange={(e) => setFRua(e.target.value)} placeholder="Rua, numero, complemento" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input rotulo="Cidade" value={fCidade} onChange={(e) => setFCidade(e.target.value)} placeholder="Sao Paulo" />
            <Input rotulo="Estado" value={fEstado} onChange={(e) => setFEstado(e.target.value)} placeholder="SP" />
            <Input rotulo="CEP" value={fCep} onChange={(e) => setFCep(e.target.value)} placeholder="01001-000" />
          </div>
          <Input rotulo="Tags (separadas por virgula)" value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="parceiro, vip, campanha-abril" />

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Cadastrar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
