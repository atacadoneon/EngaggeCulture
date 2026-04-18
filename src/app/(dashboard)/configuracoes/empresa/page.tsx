"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FormSection } from "@/components/ui/form-section";
import { usarSessao } from "@/hooks/usar-sessao";
import { usarToast } from "@/components/ui/toast";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function PaginaConfigEmpresa() {
  const toast = usarToast();
  const { sessao } = usarSessao();
  const [nome, setNome] = useState(sessao?.empresa.nome || "");
  const [corPrimaria, setCorPrimaria] = useState(sessao?.empresa.cor_primaria || "#6366f1");
  const [logoUrl, setLogoUrl] = useState(sessao?.empresa.logo_url || "");
  const [salvando, setSalvando] = useState(false);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault(); setSalvando(true);
    try {
      const supabase = criarClienteNavegador();
      await supabase.from("empresas").update({ nome, cor_primaria: corPrimaria, logo_url: logoUrl || null }).eq("id", sessao!.empresa.id);
      toast.sucesso("Dados da empresa atualizados!");
    } catch (err: any) { toast.erro("Erro", err.message); }
    setSalvando(false);
  }

  if (!sessao) return null;

  return (
    <div className="space-y-5 max-w-3xl">
      <Breadcrumbs itens={[{ label: "Configuracoes", href: "/configuracoes" }, { label: "Empresa" }]} />
      <h1 className="text-2xl font-bold text-white">Dados da Empresa</h1>

      <form onSubmit={handleSalvar}>
        <Card className="p-6 space-y-8">
          <FormSection titulo="Informacoes Basicas">
            <div className="grid grid-cols-2 gap-4">
              <Input rotulo="Nome da empresa" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Slug</label>
                <p className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-500">{sessao.empresa.slug}</p>
              </div>
            </div>
          </FormSection>

          <FormSection titulo="Branding">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Cor primaria</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={corPrimaria} onChange={(e) => setCorPrimaria(e.target.value)} className="h-10 w-14 rounded border border-zinc-700 bg-zinc-800 cursor-pointer" />
                  <span className="text-sm text-zinc-400 font-mono">{corPrimaria}</span>
                </div>
              </div>
              <Input rotulo="URL do logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
            </div>
          </FormSection>

          <FormSection titulo="Plano">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-zinc-300 mb-1">Plano atual</label><Badge cor="violet">{sessao.empresa.plano}</Badge></div>
              <div><label className="block text-sm font-medium text-zinc-300 mb-1">Limite de colaboradores</label><p className="text-sm text-white">{sessao.empresa.max_colaboradores}</p></div>
            </div>
          </FormSection>

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar Alteracoes"}</Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
