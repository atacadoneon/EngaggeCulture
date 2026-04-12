"use client";


import { usarToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Plus, Building, Search, Upload } from "lucide-react";
import { ImportadorCSV } from "@/components/ui/importador-csv";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { Paginacao } from "@/components/ui/paginacao";
import { FormSection } from "@/components/ui/form-section";
import { listarClientesExternos, criarClienteExterno } from "@/lib/supabase/queries/clientes-externos";

const POR_PAGINA = 20;

export default function PaginaClientes() {
  const toast = usarToast();
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [fNome, setFNome] = useState(""); const [fEmail, setFEmail] = useState("");
  const [fEmpresa, setFEmpresa] = useState(""); const [fTelefone, setFTelefone] = useState("");
  const [fRua, setFRua] = useState(""); const [fCidade, setFCidade] = useState("");
  const [fEstado, setFEstado] = useState(""); const [fCep, setFCep] = useState("");
  const [fTags, setFTags] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    const data = await listarClientesExternos();
    setClientes(data);
    setCarregando(false);
  }
  useEffect(() => { carregar(); }, []);

  const filtrados = clientes.filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) || c.email?.toLowerCase().includes(busca.toLowerCase()) || c.empresa_nome?.toLowerCase().includes(busca.toLowerCase())
  );
  const totalPaginas = Math.ceil(filtrados.length / POR_PAGINA);
  const paginados = filtrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      await criarClienteExterno({
        nome: fNome, email: fEmail || undefined, empresa_nome: fEmpresa || undefined,
        telefone: fTelefone || undefined,
        endereco: fRua ? { rua: fRua, cidade: fCidade, estado: fEstado, cep: fCep } : undefined,
        tags: fTags ? fTags.split(",").map((t) => t.trim()) : [],
      });
      setModalAberto(false);
      setFNome(""); setFEmail(""); setFEmpresa(""); setFTelefone(""); setFRua(""); setFCidade(""); setFEstado(""); setFCep(""); setFTags("");
      carregar();
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  return (
    <div className="space-y-5">
      <Breadcrumbs itens={[{ label: "Administracao" }, { label: "Clientes e Parceiros" }]} />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Clientes e Parceiros</h1>
        <div className="flex gap-2">
          <ImportadorCSV
            titulo="Clientes"
            colunas={[
              { campo: "nome", rotulo: "Nome", obrigatorio: true },
              { campo: "email", rotulo: "Email" },
              { campo: "empresa_nome", rotulo: "Empresa" },
              { campo: "telefone", rotulo: "Telefone" },
              { campo: "cidade", rotulo: "Cidade" },
              { campo: "estado", rotulo: "Estado" },
            ]}
            exemploCSV="Maria Santos;maria@parceiro.com;Parceiro X;(11)98888-0000;Sao Paulo;SP"
            onImportar={async (registros) => {
              let sucesso = 0; let erros = 0;
              for (const r of registros) {
                try {
                  await criarClienteExterno({ nome: r.nome, email: r.email, empresa_nome: r.empresa_nome, telefone: r.telefone,
                    endereco: r.cidade ? { cidade: r.cidade, estado: r.estado } : undefined });
                  sucesso++;
                } catch { erros++; }
              }
              carregar();
              return { sucesso, erros };
            }}
          />
          <Button onClick={() => setModalAberto(true)}><Plus className="h-4 w-4" />Novo Cliente</Button>
        </div>
      </div>

      <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar por nome, email ou empresa..." className="max-w-md" />

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Nome</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Email</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Empresa</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Cidade</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tags</th>
            </tr></thead>
            <tbody>
              {carregando ? <tr><td colSpan={5} className="px-5 py-8 text-center text-zinc-500">Carregando...</td></tr>
              : paginados.length === 0 ? <tr><td colSpan={5}><EmptyState icone={Building} titulo="Nenhum cliente cadastrado" acaoLabel="Cadastrar" acaoOnClick={() => setModalAberto(true)} /></td></tr>
              : paginados.map((c) => (
                <tr key={c.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-white">{c.nome}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{c.email || "—"}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{c.empresa_nome || "—"}</td>
                  <td className="px-5 py-3 text-sm text-zinc-400">{c.endereco?.cidade || "—"}</td>
                  <td className="px-5 py-3"><div className="flex gap-1 flex-wrap">{c.tags?.map((t: string, i: number) => <Badge key={i} cor="zinc">{t}</Badge>)}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Paginacao paginaAtual={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
      </Card>

      {/* Modal */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo="Novo Cliente / Parceiro" tamanho="lg">
        <form onSubmit={handleCriar} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Nome" value={fNome} onChange={(e) => setFNome(e.target.value)} placeholder="Nome completo" required />
            <Input rotulo="Email" type="email" value={fEmail} onChange={(e) => setFEmail(e.target.value)} placeholder="email@empresa.com" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input rotulo="Empresa" value={fEmpresa} onChange={(e) => setFEmpresa(e.target.value)} placeholder="Nome da empresa" />
            <Input rotulo="Telefone" value={fTelefone} onChange={(e) => setFTelefone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <FormSection titulo="Endereco">
            <Input rotulo="Rua" value={fRua} onChange={(e) => setFRua(e.target.value)} placeholder="Rua, numero, complemento" />
            <div className="grid grid-cols-3 gap-4 mt-3">
              <Input rotulo="Cidade" value={fCidade} onChange={(e) => setFCidade(e.target.value)} />
              <Input rotulo="Estado" value={fEstado} onChange={(e) => setFEstado(e.target.value)} placeholder="SP" />
              <Input rotulo="CEP" value={fCep} onChange={(e) => setFCep(e.target.value)} placeholder="00000-000" />
            </div>
          </FormSection>
          <Input rotulo="Tags (separadas por virgula)" value={fTags} onChange={(e) => setFTags(e.target.value)} placeholder="parceiro, vip, campanha" />
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Cadastrar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
