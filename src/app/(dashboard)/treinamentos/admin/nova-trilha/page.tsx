"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, GripVertical, Trash2, Video, BookOpen, HelpCircle, FileText, Award, Upload, ChevronDown, ChevronUp } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/ui/form-section";
import { cn } from "@/lib/utils";

interface ModuloForm {
  id: string;
  titulo: string;
  tipo: string;
  pontos: number;
  duracao: string;
  descricao: string;
  obrigatoria: boolean;
  expandido: boolean;
}

const TIPOS_MODULO = [
  { valor: "video", texto: "Video", icone: Video, cor: "text-blue-400" },
  { valor: "leitura", texto: "Leitura/Artigo", icone: BookOpen, cor: "text-cyan-400" },
  { valor: "quiz", texto: "Quiz/Avaliacao", icone: HelpCircle, cor: "text-purple-400" },
  { valor: "tarefa", texto: "Tarefa Pratica", icone: FileText, cor: "text-amber-400" },
  { valor: "certificado", texto: "Certificado", icone: Award, cor: "text-emerald-400" },
];

let contadorId = 0;
function gerarId() { return `modulo-${++contadorId}`; }

export default function PaginaNovaTrilha() {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  // Dados da trilha
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [obrigatoria, setObrigatoria] = useState(false);

  // Modulos
  const [modulos, setModulos] = useState<ModuloForm[]>([
    { id: gerarId(), titulo: "", tipo: "video", pontos: 50, duracao: "", descricao: "", obrigatoria: true, expandido: true },
  ]);

  function adicionarModulo() {
    setModulos([...modulos, {
      id: gerarId(), titulo: "", tipo: "video", pontos: 50, duracao: "", descricao: "", obrigatoria: true, expandido: true,
    }]);
  }

  function removerModulo(id: string) {
    if (modulos.length <= 1) return;
    setModulos(modulos.filter((m) => m.id !== id));
  }

  function atualizarModulo(id: string, campo: string, valor: unknown) {
    setModulos(modulos.map((m) => m.id === id ? { ...m, [campo]: valor } : m));
  }

  function toggleExpandido(id: string) {
    setModulos(modulos.map((m) => m.id === id ? { ...m, expandido: !m.expandido } : m));
  }

  function moverModulo(index: number, direcao: "cima" | "baixo") {
    const novos = [...modulos];
    const novoIndex = direcao === "cima" ? index - 1 : index + 1;
    if (novoIndex < 0 || novoIndex >= novos.length) return;
    [novos[index], novos[novoIndex]] = [novos[novoIndex], novos[index]];
    setModulos(novos);
  }

  const totalPontos = modulos.reduce((a, m) => a + (m.pontos || 0), 0);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    // TODO: salvar no banco via queries
    setTimeout(() => {
      router.push("/treinamentos/admin");
    }, 1000);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumbs itens={[
        { label: "Treinamentos", href: "/treinamentos" },
        { label: "Gerenciar", href: "/treinamentos/admin" },
        { label: "Nova Trilha" },
      ]} />

      <div className="flex items-center gap-4">
        <Link href="/treinamentos/admin" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Nova Trilha de Treinamento</h1>
      </div>

      <form onSubmit={handleSalvar}>
        {/* Info da trilha */}
        <Card className="p-6 space-y-6 mb-6">
          <FormSection titulo="Informacoes da Trilha">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input rotulo="Nome da trilha" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Onboarding Comercial" required />
              <Select rotulo="Categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Selecione..."
                opcoes={[
                  { valor: "onboarding", texto: "Onboarding" },
                  { valor: "vendas", texto: "Vendas" },
                  { valor: "cultura", texto: "Cultura" },
                  { valor: "produto", texto: "Produto" },
                  { valor: "compliance", texto: "Compliance" },
                  { valor: "lideranca", texto: "Lideranca" },
                  { valor: "outro", texto: "Outro" },
                ]} />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-zinc-300 mb-1">Descricao</label>
              <textarea
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o objetivo desta trilha..."
                rows={3}
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" checked={obrigatoria} onChange={(e) => setObrigatoria(e.target.checked)} className="rounded border-zinc-600" />
              <label className="text-sm text-zinc-300">Trilha obrigatoria (todos os colaboradores devem completar)</label>
            </div>
          </FormSection>
        </Card>

        {/* Modulos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Modulos ({modulos.length})</h2>
              <p className="text-sm text-zinc-500">Total: {totalPontos} pts</p>
            </div>
            <Button type="button" tamanho="sm" onClick={adicionarModulo}>
              <Plus className="h-4 w-4" /> Adicionar Modulo
            </Button>
          </div>

          {modulos.map((modulo, index) => {
            const tipoConfig = TIPOS_MODULO.find((t) => t.valor === modulo.tipo);
            const Icone = tipoConfig?.icone || BookOpen;

            return (
              <Card key={modulo.id} className={cn("overflow-hidden", modulo.expandido && "border-violet-500/30")}>
                {/* Header do modulo (sempre visivel) */}
                <button
                  type="button"
                  onClick={() => toggleExpandido(modulo.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <GripVertical className="h-4 w-4 text-zinc-600 cursor-grab" />
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center",
                    modulo.tipo === "video" ? "bg-blue-500/20" :
                    modulo.tipo === "quiz" ? "bg-purple-500/20" :
                    modulo.tipo === "leitura" ? "bg-cyan-500/20" :
                    modulo.tipo === "tarefa" ? "bg-amber-500/20" :
                    "bg-emerald-500/20"
                  )}>
                    <Icone className={cn("h-4 w-4", tipoConfig?.cor)} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white">
                      {modulo.titulo || `Modulo ${index + 1}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge cor="zinc">{modulo.tipo}</Badge>
                      <span className="text-[10px] text-amber-400 font-bold">{modulo.pontos} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {index > 0 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); moverModulo(index, "cima"); }} className="p-1 text-zinc-500 hover:text-white">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                    )}
                    {index < modulos.length - 1 && (
                      <button type="button" onClick={(e) => { e.stopPropagation(); moverModulo(index, "baixo"); }} className="p-1 text-zinc-500 hover:text-white">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    )}
                    <button type="button" onClick={(e) => { e.stopPropagation(); removerModulo(modulo.id); }} className="p-1 text-zinc-500 hover:text-red-400">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {modulo.expandido ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                  </div>
                </button>

                {/* Body (expandivel) */}
                {modulo.expandido && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-800 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <Input rotulo="Titulo do modulo" value={modulo.titulo}
                          onChange={(e) => atualizarModulo(modulo.id, "titulo", e.target.value)}
                          placeholder="Ex: Conhecendo os produtos" required />
                      </div>
                      <Select rotulo="Tipo" value={modulo.tipo}
                        onChange={(e) => atualizarModulo(modulo.id, "tipo", e.target.value)}
                        opcoes={TIPOS_MODULO.map((t) => ({ valor: t.valor, texto: t.texto }))} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input rotulo="Pontos" type="number" value={String(modulo.pontos)}
                        onChange={(e) => atualizarModulo(modulo.id, "pontos", parseInt(e.target.value) || 0)} />
                      <Input rotulo="Duracao estimada" value={modulo.duracao}
                        onChange={(e) => atualizarModulo(modulo.id, "duracao", e.target.value)}
                        placeholder="Ex: 15min" />
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={modulo.obrigatoria}
                            onChange={(e) => atualizarModulo(modulo.id, "obrigatoria", e.target.checked)}
                            className="rounded border-zinc-600" />
                          <span className="text-sm text-zinc-300">Obrigatorio</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1">Descricao / Conteudo</label>
                      <textarea
                        value={modulo.descricao}
                        onChange={(e) => atualizarModulo(modulo.id, "descricao", e.target.value)}
                        placeholder="Descreva o conteudo deste modulo ou cole o link do video..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                      />
                    </div>

                    {/* Upload area (pra video/PDF) */}
                    {(modulo.tipo === "video" || modulo.tipo === "leitura") && (
                      <div className="border-2 border-dashed border-zinc-700 rounded-xl p-6 text-center hover:border-violet-500/50 transition-colors cursor-pointer">
                        <Upload className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                        <p className="text-sm text-zinc-400">Arraste o arquivo ou clique para upload</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {modulo.tipo === "video" ? "MP4, WebM (max 500MB)" : "PDF, DOCX (max 50MB)"}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}

          {/* Botao adicionar no final */}
          <button
            type="button"
            onClick={adicionarModulo}
            className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 hover:text-violet-400 hover:border-violet-500/30 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" /> Adicionar mais um modulo
          </button>
        </div>

        {/* Acoes */}
        <div className="flex justify-between mt-6 pt-4 border-t border-zinc-800">
          <Button variante="secundario" type="button" onClick={() => router.push("/treinamentos/admin")}>Cancelar</Button>
          <div className="flex gap-2">
            <Button variante="secundario" type="button">Salvar como Rascunho</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Publicando..." : "Publicar Trilha"}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
