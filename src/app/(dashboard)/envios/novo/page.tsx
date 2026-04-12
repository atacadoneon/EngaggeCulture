"use client";


import { usarToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Users, Package, ClipboardList } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeletorDestinatarios, type Destinatario } from "@/components/envios/seletor-destinatarios";
import { SeletorProduto } from "@/components/envios/seletor-produto";
import { criarEnvio, criarEnvioLote } from "@/lib/supabase/queries/envios";
import type { ProdutoRecompensa } from "@/types/database";
import { cn } from "@/lib/utils";

const PASSOS = [
  { numero: 1, titulo: "Destinatarios", icone: Users },
  { numero: 2, titulo: "Produto", icone: Package },
  { numero: 3, titulo: "Confirmar", icone: ClipboardList },
];

export default function PaginaNovoEnvio() {
  const toast = usarToast();
  const router = useRouter();
  const [passo, setPasso] = useState(1);
  const [destinatarios, setDestinatarios] = useState<Destinatario[]>([]);
  const [produto, setProduto] = useState<ProdutoRecompensa | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [enviando, setEnviando] = useState(false);

  const podeContinuar = passo === 1
    ? destinatarios.length > 0
    : passo === 2
    ? produto !== null
    : true;

  async function handleConfirmar() {
    if (!produto || destinatarios.length === 0) return;
    setEnviando(true);

    try {
      if (destinatarios.length === 1) {
        const dest = destinatarios[0];
        await criarEnvio({
          destinatario_tipo: dest.tipo,
          destinatario_id: dest.id,
          destinatario_nome: dest.nome,
          destinatario_email: dest.email,
          produto_id: produto.id,
          produto_nome: produto.nome,
          quantidade,
          endereco_entrega: dest.endereco,
        });
      } else {
        await criarEnvioLote({
          destinatarios: destinatarios.map((d) => ({
            tipo: d.tipo,
            id: d.id,
            nome: d.nome,
            email: d.email,
            endereco: d.endereco,
          })),
          produto_id: produto.id,
          produto_nome: produto.nome,
          quantidade,
        });
      }

      router.push("/envios");
    } catch (error: any) {
      toast.erro("Erro", error.message);
    }

    setEnviando(false);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/envios" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white">Novo Envio</h1>
          <p className="text-zinc-400 text-sm">Selecione destinatarios, produto e confirme</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2">
        {PASSOS.map((p, i) => {
          const Icone = p.icone;
          const ativo = passo === p.numero;
          const concluido = passo > p.numero;
          return (
            <div key={p.numero} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg flex-1",
                ativo ? "bg-violet-600/20 border border-violet-500/30" :
                concluido ? "bg-emerald-600/10 border border-emerald-500/20" :
                "bg-zinc-800/50 border border-zinc-800"
              )}>
                <div className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold",
                  ativo ? "bg-violet-600 text-white" :
                  concluido ? "bg-emerald-600 text-white" :
                  "bg-zinc-700 text-zinc-400"
                )}>
                  {concluido ? <Check className="h-4 w-4" /> : p.numero}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  ativo ? "text-violet-400" :
                  concluido ? "text-emerald-400" :
                  "text-zinc-500"
                )}>
                  {p.titulo}
                </span>
              </div>
              {i < PASSOS.length - 1 && (
                <div className={cn("h-px w-4", concluido ? "bg-emerald-600" : "bg-zinc-800")} />
              )}
            </div>
          );
        })}
      </div>

      {/* Conteudo do passo */}
      <Card className="p-5">
        {passo === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Selecione os destinatarios</h2>
            <SeletorDestinatarios selecionados={destinatarios} onChange={setDestinatarios} />
          </div>
        )}

        {passo === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Escolha o produto</h2>
            <SeletorProduto
              selecionado={produto}
              quantidade={quantidade}
              onChange={setProduto}
              onQuantidadeChange={setQuantidade}
              totalDestinatarios={destinatarios.length}
            />
          </div>
        )}

        {passo === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Revisar e confirmar</h2>

            {/* Resumo */}
            <div className="bg-zinc-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Destinatarios</span>
                <Badge cor="violet">{destinatarios.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Produto</span>
                <span className="text-sm text-white font-medium">{produto?.nome}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">Qtd por destinatario</span>
                <span className="text-sm text-white">{quantidade}</span>
              </div>
              <div className="border-t border-zinc-700 pt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-zinc-300">Total de envios</span>
                <span className="text-lg font-bold text-white">{destinatarios.length * quantidade} unidades</span>
              </div>
            </div>

            {/* Lista de destinatarios */}
            <div>
              <p className="text-sm text-zinc-400 mb-2">Sera enviado para:</p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {destinatarios.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-3 py-2 bg-zinc-800/50 rounded-lg">
                    <div>
                      <span className="text-sm text-white">{d.nome}</span>
                      <span className="text-xs text-zinc-500 ml-2">{d.email}</span>
                    </div>
                    <Badge cor={d.tipo === "colaborador" ? "blue" : "amber"}>
                      {d.tipo === "colaborador" ? "Colab" : "Cliente"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navegacao */}
      <div className="flex justify-between">
        <Button
          variante="secundario"
          onClick={() => setPasso(Math.max(1, passo - 1))}
          disabled={passo === 1}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {passo < 3 ? (
          <Button
            onClick={() => setPasso(passo + 1)}
            disabled={!podeContinuar}
          >
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleConfirmar} disabled={enviando}>
            <Check className="h-4 w-4" />
            {enviando ? "Criando envios..." : `Confirmar ${destinatarios.length} envio${destinatarios.length > 1 ? "s" : ""}`}
          </Button>
        )}
      </div>
    </div>
  );
}
