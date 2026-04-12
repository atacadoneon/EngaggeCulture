"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, FileSpreadsheet, Check, X, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { criarEnviosPlanilha } from "@/lib/supabase/queries/envios";

interface RegistroPlanilha {
  nome: string;
  email?: string;
  empresa_nome?: string;
  produto_nome: string;
  quantidade?: number;
  rua?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  valido: boolean;
  erros: string[];
}

function parsearCSV(texto: string): RegistroPlanilha[] {
  const linhas = texto.trim().split("\n");
  if (linhas.length < 2) return [];

  const cabecalho = linhas[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase().replace(/"/g, ""));
  const registros: RegistroPlanilha[] = [];

  for (let i = 1; i < linhas.length; i++) {
    const valores = linhas[i].split(/[,;\t]/).map((v) => v.trim().replace(/"/g, ""));
    const registro: Record<string, string> = {};
    cabecalho.forEach((col, j) => { registro[col] = valores[j] || ""; });

    const erros: string[] = [];
    if (!registro.nome) erros.push("Nome obrigatorio");
    if (!registro.produto_nome && !registro.produto) erros.push("Produto obrigatorio");

    registros.push({
      nome: registro.nome || "",
      email: registro.email,
      empresa_nome: registro.empresa_nome || registro.empresa,
      produto_nome: registro.produto_nome || registro.produto || "",
      quantidade: parseInt(registro.quantidade || "1") || 1,
      rua: registro.rua || registro.endereco,
      cidade: registro.cidade,
      estado: registro.estado || registro.uf,
      cep: registro.cep,
      valido: erros.length === 0,
      erros,
    });
  }

  return registros;
}

export default function PaginaImportarPlanilha() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [registros, setRegistros] = useState<RegistroPlanilha[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [enviando, setEnviando] = useState(false);

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setNomeArquivo(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const texto = ev.target?.result as string;
      setRegistros(parsearCSV(texto));
    };
    reader.readAsText(file, "utf-8");
  }

  const validos = registros.filter((r) => r.valido);
  const invalidos = registros.filter((r) => !r.valido);

  async function handleEnviar() {
    if (validos.length === 0) return;
    setEnviando(true);

    try {
      const resultado = await criarEnviosPlanilha({ registros: validos });
      alert(`${resultado.total} envios criados com sucesso!`);
      router.push("/envios");
    } catch (error: any) {
      alert("Erro: " + error.message);
    }

    setEnviando(false);
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/envios" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Importar Planilha</h1>
          <p className="text-zinc-400 text-sm">Faca upload de CSV ou Excel com os dados de envio</p>
        </div>
      </div>

      {/* Upload Area */}
      {registros.length === 0 && (
        <Card className="p-8">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 rounded-xl p-12 text-center cursor-pointer hover:border-violet-500/50 transition-colors"
          >
            <Upload className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-white font-medium">Arraste o arquivo aqui ou clique pra selecionar</p>
            <p className="text-zinc-500 text-sm mt-1">CSV ou TXT (separado por virgula, ponto-e-virgula ou tab)</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleArquivo}
              className="hidden"
            />
          </div>

          <div className="mt-6 bg-zinc-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-zinc-300 mb-2">Formato esperado da planilha:</p>
            <code className="text-xs text-zinc-400 block bg-zinc-900 rounded p-3 overflow-x-auto">
              nome;email;empresa_nome;produto_nome;quantidade;rua;cidade;estado;cep{"\n"}
              Joao Silva;joao@empresa.com;Empresa X;Placa Top Performance;1;Rua A 123;Sao Paulo;SP;01001-000{"\n"}
              Maria Santos;maria@parceiro.com;Parceiro Y;Kit Onboarding Premium;1;Rua B 456;Curitiba;PR;80000-000
            </code>
            <p className="text-xs text-zinc-500 mt-2">Colunas obrigatorias: <strong>nome</strong> e <strong>produto_nome</strong>. As demais sao opcionais.</p>
          </div>
        </Card>
      )}

      {/* Preview dos registros */}
      {registros.length > 0 && (
        <>
          {/* Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-zinc-400" />
              <span className="text-sm text-zinc-400">{nomeArquivo}</span>
            </div>
            <Badge cor="violet">{registros.length} registros</Badge>
            <Badge cor="green">{validos.length} validos</Badge>
            {invalidos.length > 0 && <Badge cor="red">{invalidos.length} com erro</Badge>}
            <button onClick={() => { setRegistros([]); setNomeArquivo(""); }} className="text-xs text-zinc-500 hover:text-red-400 ml-auto">
              Limpar
            </button>
          </div>

          {/* Tabela */}
          <Card>
            <div className="overflow-x-auto max-h-96">
              <table className="w-full">
                <thead className="sticky top-0 bg-zinc-900">
                  <tr className="border-b border-zinc-800">
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">#</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Produto</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Qtd</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-zinc-400">Cidade/UF</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr key={i} className={`border-b border-zinc-800/50 ${!r.valido ? "bg-red-500/5" : ""}`}>
                      <td className="px-4 py-2 text-xs text-zinc-500">{i + 1}</td>
                      <td className="px-4 py-2">
                        {r.valido ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                            <span className="text-xs text-red-400">{r.erros.join(", ")}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-white">{r.nome || "—"}</td>
                      <td className="px-4 py-2 text-sm text-zinc-400">{r.email || "—"}</td>
                      <td className="px-4 py-2 text-sm text-zinc-300">{r.produto_nome || "—"}</td>
                      <td className="px-4 py-2 text-sm text-zinc-400">{r.quantidade}</td>
                      <td className="px-4 py-2 text-sm text-zinc-500">{[r.cidade, r.estado].filter(Boolean).join("/") || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Acoes */}
          <div className="flex justify-between">
            <Button variante="secundario" onClick={() => { setRegistros([]); setNomeArquivo(""); }}>
              <X className="h-4 w-4" /> Cancelar
            </Button>
            <Button onClick={handleEnviar} disabled={validos.length === 0 || enviando}>
              <Check className="h-4 w-4" />
              {enviando ? "Processando..." : `Criar ${validos.length} envios`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
