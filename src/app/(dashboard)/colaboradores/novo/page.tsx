"use client";


import { usarToast } from "@/components/ui/toast";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormSection } from "@/components/ui/form-section";
import { criarColaborador, listarEquipes, listarDepartamentos } from "@/lib/supabase/queries/colaboradores";

export default function PaginaNovoColaborador() {
  const toast = usarToast();
  const router = useRouter();
  const [equipes, setEquipes] = useState<any[]>([]);
  const [departamentos, setDepartamentos] = useState<any[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Dados pessoais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [celular, setCelular] = useState("");

  // Endereco
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");

  // Organizacao
  const [departamento, setDepartamento] = useState("");
  const [equipe, setEquipe] = useState("");
  const [perfil, setPerfil] = useState("colaborador");
  const [dataContratacao, setDataContratacao] = useState("");

  useEffect(() => {
    async function carregar() {
      const [eqs, deps] = await Promise.all([listarEquipes(), listarDepartamentos()]);
      setEquipes(eqs);
      setDepartamentos(deps);
    }
    carregar();
  }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await criarColaborador({
        nome, email, cargo: cargo || undefined,
        equipe_id: equipe || undefined,
        departamento_id: departamento || undefined,
        perfil_nome: perfil,
      });
      router.push("/colaboradores");
    } catch (err: any) {
      toast.erro("Erro", err.message);
    }
    setSalvando(false);
  }

  return (
    <div className="space-y-5 max-w-4xl">
      <Breadcrumbs itens={[{ label: "Administracao" }, { label: "Colaboradores", href: "/colaboradores" }, { label: "Novo" }]} />

      <div className="flex items-center gap-4">
        <Link href="/colaboradores" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Novo Colaborador</h1>
      </div>

      <form onSubmit={handleSalvar}>
        <Card className="p-6 space-y-8">
          {/* Dados Pessoais */}
          <FormSection titulo="Dados Pessoais">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input rotulo="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome completo do colaborador" required />
              </div>
              <Input rotulo="Cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex: Vendedor, Analista" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input rotulo="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" required />
              <Input rotulo="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(00) 0000-0000" />
              <Input rotulo="Celular" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="(00) 00000-0000" />
            </div>
          </FormSection>

          {/* Endereco */}
          <FormSection titulo="Endereco">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input rotulo="CEP" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="00000-000" />
              <Input rotulo="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" />
              <Select rotulo="UF" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Selecione" opcoes={[
                "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
              ].map((uf) => ({ valor: uf, texto: uf }))} />
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <Input rotulo="Endereco" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, Avenida..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <Input rotulo="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" />
              <Input rotulo="Numero" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Numero" />
              <Input rotulo="Complemento" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, Sala..." />
            </div>
          </FormSection>

          {/* Organizacao */}
          <FormSection titulo="Organizacao">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select rotulo="Departamento" value={departamento} onChange={(e) => setDepartamento(e.target.value)} placeholder="Selecione..."
                opcoes={departamentos.map((d: any) => ({ valor: d.id, texto: d.nome }))} />
              <Select rotulo="Equipe" value={equipe} onChange={(e) => setEquipe(e.target.value)} placeholder="Selecione..."
                opcoes={equipes.map((eq: any) => ({ valor: eq.id, texto: eq.nome }))} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Select rotulo="Perfil de Acesso" value={perfil} onChange={(e) => setPerfil(e.target.value)} opcoes={[
                { valor: "colaborador", texto: "Colaborador" },
                { valor: "lider", texto: "Lider de Equipe" },
                { valor: "gestor", texto: "Gestor" },
                { valor: "admin", texto: "Administrador" },
              ]} />
              <Input rotulo="Data de Contratacao" type="date" value={dataContratacao} onChange={(e) => setDataContratacao(e.target.value)} />
            </div>
          </FormSection>

          {/* Acoes */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Link href="/colaboradores"><Button variante="secundario" type="button">Cancelar</Button></Link>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar"}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
