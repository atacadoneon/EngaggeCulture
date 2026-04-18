"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormSection } from "@/components/ui/form-section";
import { usarSessao } from "@/hooks/usar-sessao";
import { usarToast } from "@/components/ui/toast";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function PaginaConfigMoeda() {
  const toast = usarToast();
  const { sessao } = usarSessao();
  const [moedaNome, setMoedaNome] = useState(sessao?.empresa.moeda_nome || "Moedas");
  const [moedaIcone, setMoedaIcone] = useState(sessao?.empresa.moeda_icone || "🪙");
  const [moedaValor, setMoedaValor] = useState(String(sessao?.empresa.moeda_valor_real || 0.10));
  const [allowance, setAllowance] = useState(String(sessao?.empresa.allowance_reconhecimento_mensal || 200));
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      const supabase = criarClienteNavegador();
      await supabase.from("empresas").update({
        moeda_nome: moedaNome, moeda_icone: moedaIcone,
        moeda_valor_real: parseFloat(moedaValor), allowance_reconhecimento_mensal: parseInt(allowance),
      }).eq("id", sessao!.empresa.id);
      toast.sucesso("Configuracao de moeda salva!");
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  if (!sessao) return null;

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumbs itens={[{ label: "Configuracoes", href: "/configuracoes" }, { label: "Moeda Interna" }]} />
      <h1 className="text-2xl font-bold text-white">Moeda Interna</h1>

      <form onSubmit={handleSalvar}>
        <Card className="p-6 space-y-8">
          <FormSection titulo="Identidade da Moeda">
            <div className="grid grid-cols-3 gap-4">
              <Input rotulo="Nome da moeda" value={moedaNome} onChange={(e) => setMoedaNome(e.target.value)} placeholder="Moedas" required />
              <Input rotulo="Icone (emoji)" value={moedaIcone} onChange={(e) => setMoedaIcone(e.target.value)} placeholder="🪙" required />
              <Input rotulo="Valor em reais (R$)" type="number" step="0.01" value={moedaValor} onChange={(e) => setMoedaValor(e.target.value)} placeholder="0.10" required />
            </div>
          </FormSection>

          {/* Preview */}
          <div className="bg-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-2">Preview</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-600/10 border border-violet-500/30 rounded-xl">
                <span className="text-2xl">{moedaIcone}</span>
                <div>
                  <p className="text-lg font-bold text-violet-400">1.000</p>
                  <p className="text-[10px] text-zinc-500">{moedaNome}</p>
                </div>
              </div>
              <span className="text-zinc-600">=</span>
              <p className="text-lg font-bold text-emerald-400">R$ {(1000 * parseFloat(moedaValor || "0")).toFixed(2)}</p>
            </div>
          </div>

          <FormSection titulo="Reconhecimento">
            <div className="grid grid-cols-2 gap-4">
              <Input rotulo="Allowance mensal por colaborador" type="number" value={allowance} onChange={(e) => setAllowance(e.target.value)} placeholder="200" required />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Regra de expiracao</label>
                <p className="text-sm text-zinc-400">Moedas nao usadas expiram no fim do mes</p>
              </div>
            </div>
          </FormSection>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Configuracao"}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
