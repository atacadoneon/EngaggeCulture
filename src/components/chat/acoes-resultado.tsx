"use client";

import { Check, RefreshCw, Pencil, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ValorPreview {
  nome: string;
  descricao: string;
  icone: string;
  comportamentos: string[];
}

interface RitualPreview {
  nome: string;
  descricao: string;
  frequencia: string;
}

interface JornadaPreview {
  nome: string;
  descricao: string;
  tipo: string;
  etapas: { titulo: string; tipo: string; pontos: number }[];
}

interface DesafioPreview {
  nome: string;
  descricao: string;
  tipo: string;
}

interface MissaoPreview {
  nome: string;
  frequencia: string;
  pontos: number;
}

// ========== PREVIEW DE CULTURA ==========

export function PreviewCultura({
  dados,
  salvando,
  onSalvar,
  onRefazer,
}: {
  dados: { valores: ValorPreview[]; rituais: RitualPreview[] };
  salvando: boolean;
  onSalvar: () => void;
  onRefazer: () => void;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-xl border border-violet-500/30 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Cultura Gerada</h3>
      </div>

      {/* Valores */}
      <div>
        <p className="text-sm font-semibold text-zinc-400 mb-2">Valores Culturais</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {dados.valores.map((v, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg p-3 border border-zinc-700">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{v.icone}</span>
                <span className="text-sm font-semibold text-white">{v.nome}</span>
              </div>
              <p className="text-xs text-zinc-400">{v.descricao}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {v.comportamentos.map((c, j) => (
                  <Badge key={j} cor="zinc">{c}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rituais */}
      {dados.rituais?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-2">Rituais</p>
          <div className="space-y-2">
            {dados.rituais.map((r, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg p-3 border border-zinc-700 flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">{r.nome}</span>
                  <p className="text-xs text-zinc-400">{r.descricao}</p>
                </div>
                <Badge cor="blue">{r.frequencia}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acoes */}
      <div className="flex gap-3 pt-2 border-t border-zinc-700">
        <Button onClick={onSalvar} disabled={salvando}>
          <Check className="h-4 w-4" />
          {salvando ? "Salvando..." : "Salvar no Sistema"}
        </Button>
        <Button variante="secundario" onClick={onRefazer} disabled={salvando}>
          <RefreshCw className="h-4 w-4" />
          Refazer
        </Button>
      </div>
    </div>
  );
}

// ========== PREVIEW DE GAMIFICACAO ==========

export function PreviewGamificacao({
  dados,
  salvando,
  onSalvar,
  onRefazer,
}: {
  dados: {
    moeda?: { nome: string; icone: string };
    jornadas?: JornadaPreview[];
    desafios?: DesafioPreview[];
    missoes?: MissaoPreview[];
  };
  salvando: boolean;
  onSalvar: () => void;
  onRefazer: () => void;
}) {
  return (
    <div className="bg-zinc-800/50 rounded-xl border border-amber-500/30 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Gamificacao Gerada</h3>
      </div>

      {/* Moeda */}
      {dados.moeda && (
        <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-700">
          <p className="text-sm font-semibold text-zinc-400 mb-1">Moeda Interna</p>
          <span className="text-lg">{dados.moeda.icone}</span>
          <span className="text-white font-semibold ml-2">{dados.moeda.nome}</span>
        </div>
      )}

      {/* Jornadas */}
      {dados.jornadas?.map((j, i) => (
        <div key={i}>
          <p className="text-sm font-semibold text-zinc-400 mb-2">
            Jornada: {j.nome} <Badge cor="violet">{j.tipo}</Badge>
          </p>
          <div className="space-y-1">
            {j.etapas.map((e, k) => (
              <div key={k} className="bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-mono w-6">{k + 1}.</span>
                  <span className="text-sm text-white">{e.titulo}</span>
                  <Badge cor="zinc">{e.tipo}</Badge>
                </div>
                <span className="text-xs text-amber-400 font-semibold">{e.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Desafios */}
      {dados.desafios?.map((d, i) => (
        <div key={i} className="bg-zinc-900 rounded-lg p-3 border border-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{d.nome}</span>
            <Badge cor="amber">{d.tipo}</Badge>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{d.descricao}</p>
        </div>
      ))}

      {/* Missoes */}
      {dados.missoes && dados.missoes.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-zinc-400 mb-2">Missoes</p>
          <div className="space-y-1">
            {dados.missoes.map((m, i) => (
              <div key={i} className="bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-700 flex items-center justify-between">
                <span className="text-sm text-white">{m.nome}</span>
                <div className="flex items-center gap-2">
                  <Badge cor="blue">{m.frequencia}</Badge>
                  <span className="text-xs text-amber-400 font-semibold">{m.pontos} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Acoes */}
      <div className="flex gap-3 pt-2 border-t border-zinc-700">
        <Button onClick={onSalvar} disabled={salvando}>
          <Check className="h-4 w-4" />
          {salvando ? "Salvando..." : "Salvar no Sistema"}
        </Button>
        <Button variante="secundario" onClick={onRefazer} disabled={salvando}>
          <RefreshCw className="h-4 w-4" />
          Refazer
        </Button>
      </div>
    </div>
  );
}
