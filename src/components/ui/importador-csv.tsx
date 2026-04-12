"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, Download } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { Badge } from "./badge";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface ColunaConfig {
  campo: string;
  rotulo: string;
  obrigatorio?: boolean;
}

interface ImportadorCSVProps {
  titulo: string;
  colunas: ColunaConfig[];
  onImportar: (registros: Record<string, string>[]) => Promise<{ sucesso: number; erros: number }>;
  exemploCSV?: string;
}

function parsearCSV(texto: string, colunas: ColunaConfig[]): { dados: Record<string, string>[]; erros: { linha: number; mensagem: string }[] } {
  const linhas = texto.trim().split("\n");
  if (linhas.length < 2) return { dados: [], erros: [{ linha: 0, mensagem: "Arquivo vazio ou sem dados" }] };

  const cabecalho = linhas[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase().replace(/"/g, "").replace(/\s+/g, "_"));
  const dados: Record<string, string>[] = [];
  const erros: { linha: number; mensagem: string }[] = [];

  for (let i = 1; i < linhas.length; i++) {
    if (!linhas[i].trim()) continue;
    const valores = linhas[i].split(/[,;\t]/).map((v) => v.trim().replace(/"/g, ""));
    const registro: Record<string, string> = {};

    cabecalho.forEach((col, j) => { registro[col] = valores[j] || ""; });

    // Validar campos obrigatorios
    const camposErro: string[] = [];
    for (const coluna of colunas) {
      if (coluna.obrigatorio && !registro[coluna.campo]) {
        camposErro.push(coluna.rotulo);
      }
    }

    if (camposErro.length > 0) {
      erros.push({ linha: i + 1, mensagem: `Campos obrigatorios vazios: ${camposErro.join(", ")}` });
    }

    dados.push(registro);
  }

  return { dados, erros };
}

export function ImportadorCSV({ titulo, colunas, onImportar, exemploCSV }: ImportadorCSVProps) {
  const [aberto, setAberto] = useState(false);
  const [registros, setRegistros] = useState<Record<string, string>[]>([]);
  const [erros, setErros] = useState<{ linha: number; mensagem: string }[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState("");
  const [importando, setImportando] = useState(false);
  const [resultado, setResultado] = useState<{ sucesso: number; erros: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setNomeArquivo(file.name);
    setResultado(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const texto = ev.target?.result as string;
      const { dados, erros: errosValidacao } = parsearCSV(texto, colunas);
      setRegistros(dados);
      setErros(errosValidacao);
    };
    reader.readAsText(file, "utf-8");
  }

  async function handleImportar() {
    const validos = registros.filter((_, i) => !erros.some((e) => e.linha === i + 2));
    if (validos.length === 0) return;

    setImportando(true);
    try {
      const res = await onImportar(validos);
      setResultado(res);
      if (res.erros === 0) {
        setTimeout(() => {
          setAberto(false);
          limpar();
        }, 2000);
      }
    } catch (err: any) {
      setResultado({ sucesso: 0, erros: registros.length });
    }
    setImportando(false);
  }

  function limpar() {
    setRegistros([]);
    setErros([]);
    setNomeArquivo("");
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function gerarExemplo() {
    const header = colunas.map((c) => c.campo).join(";");
    const exemplo = exemploCSV || colunas.map((c) => `Exemplo ${c.rotulo}`).join(";");
    const blob = new Blob([`${header}\n${exemplo}\n`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modelo_${titulo.toLowerCase().replace(/\s/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const validos = registros.filter((_, i) => !erros.some((e) => e.linha === i + 2));

  return (
    <>
      <Button variante="secundario" tamanho="sm" onClick={() => setAberto(true)}>
        <Upload className="h-3.5 w-3.5" /> Importar CSV
      </Button>

      <Modal aberto={aberto} fechar={() => { setAberto(false); limpar(); }} titulo={`Importar ${titulo}`} tamanho="xl">
        <div className="space-y-4">
          {/* Resultado */}
          {resultado && (
            <div className={cn("p-4 rounded-xl border", resultado.erros === 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-amber-500/10 border-amber-500/30")}>
              <div className="flex items-center gap-2">
                {resultado.erros === 0 ? <Check className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-amber-400" />}
                <span className="text-sm font-semibold text-white">{resultado.sucesso} importados com sucesso</span>
                {resultado.erros > 0 && <span className="text-sm text-amber-400">({resultado.erros} com erro)</span>}
              </div>
            </div>
          )}

          {/* Upload */}
          {registros.length === 0 && !resultado && (
            <div>
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-zinc-700 rounded-xl p-10 text-center cursor-pointer hover:border-violet-500/50 transition-colors">
                <Upload className="h-10 w-10 text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-white font-medium">Arraste o arquivo ou clique pra selecionar</p>
                <p className="text-xs text-zinc-500 mt-1">CSV ou TXT (separado por ; ou ,)</p>
                <input ref={fileRef} type="file" accept=".csv,.txt,.tsv" onChange={handleArquivo} className="hidden" />
              </div>

              <div className="flex items-center justify-between mt-3">
                <div>
                  <p className="text-xs text-zinc-500">Colunas esperadas:</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {colunas.map((c) => (
                      <Badge key={c.campo} cor={c.obrigatorio ? "violet" : "zinc"}>
                        {c.rotulo} {c.obrigatorio && "*"}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variante="fantasma" tamanho="sm" onClick={gerarExemplo}>
                  <Download className="h-3.5 w-3.5" /> Baixar modelo
                </Button>
              </div>
            </div>
          )}

          {/* Preview */}
          {registros.length > 0 && !resultado && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300">{nomeArquivo}</span>
                  <Badge cor="violet">{registros.length} registros</Badge>
                  {erros.length > 0 && <Badge cor="red">{erros.length} com erro</Badge>}
                </div>
                <button onClick={limpar} className="text-xs text-zinc-500 hover:text-red-400">Limpar</button>
              </div>

              <div className="max-h-64 overflow-auto rounded-lg border border-zinc-800">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-zinc-900">
                    <tr className="border-b border-zinc-800">
                      <th className="px-3 py-2 text-left text-zinc-500">#</th>
                      {colunas.map((c) => (
                        <th key={c.campo} className="px-3 py-2 text-left text-zinc-500">{c.rotulo}</th>
                      ))}
                      <th className="px-3 py-2 text-zinc-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registros.map((r, i) => {
                      const erro = erros.find((e) => e.linha === i + 2);
                      return (
                        <tr key={i} className={cn("border-b border-zinc-800/50", erro && "bg-red-500/5")}>
                          <td className="px-3 py-2 text-zinc-600">{i + 1}</td>
                          {colunas.map((c) => (
                            <td key={c.campo} className="px-3 py-2 text-zinc-300">{r[c.campo] || "—"}</td>
                          ))}
                          <td className="px-3 py-2">
                            {erro ? (
                              <span className="text-red-400 text-[10px]">{erro.mensagem}</span>
                            ) : (
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between pt-2">
                <Button variante="secundario" onClick={limpar}><X className="h-3.5 w-3.5" /> Cancelar</Button>
                <Button onClick={handleImportar} disabled={validos.length === 0 || importando}>
                  <Upload className="h-3.5 w-3.5" />
                  {importando ? "Importando..." : `Importar ${validos.length} registros`}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
