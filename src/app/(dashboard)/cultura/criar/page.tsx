"use client";


import { usarToast } from "@/components/ui/toast";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PreviewCultura } from "@/components/chat/acoes-resultado";
import { usarSessao } from "@/hooks/usar-sessao";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function PaginaCriarCultura() {
  const toast = usarToast();
  const { sessao } = usarSessao();
  const router = useRouter();
  const [dadosCultura, setDadosCultura] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  function handleResultado(texto: string) {
    // Extrair JSON entre [SALVAR_CULTURA] e [/SALVAR_CULTURA]
    const match = texto.match(/\[SALVAR_CULTURA\]\s*([\s\S]*?)\s*\[\/SALVAR_CULTURA\]/);
    if (match) {
      try {
        const dados = JSON.parse(match[1]);
        setDadosCultura(dados);
      } catch (e) {
        console.error("Erro ao parsear resultado:", e);
      }
    }
  }

  async function handleSalvar() {
    if (!dadosCultura || !sessao) return;
    setSalvando(true);

    try {
      const supabase = criarClienteNavegador();

      // 1. Salvar valores culturais
      if (dadosCultura.valores?.length > 0) {
        // Limpar valores existentes (opcional — substituir)
        for (const [i, valor] of dadosCultura.valores.entries()) {
          await supabase.from("valores_culturais").insert({
            empresa_id: sessao.empresa.id,
            nome: valor.nome,
            descricao: valor.descricao,
            icone: valor.icone,
            comportamentos: valor.comportamentos,
            ordem: valor.ordem || i + 1,
            ativo: true,
          });
        }
      }

      // 2. Salvar rituais
      if (dadosCultura.rituais?.length > 0) {
        for (const ritual of dadosCultura.rituais) {
          await supabase.from("rituais").insert({
            empresa_id: sessao.empresa.id,
            nome: ritual.nome,
            descricao: ritual.descricao,
            frequencia: ritual.frequencia || "semanal",
            template: ritual.template || "personalizado",
            checklist: (ritual.checklist || []).map((item: string) => ({ item, obrigatorio: true })),
            pontos_participacao: ritual.pontos_participacao || 10,
            ativo: true,
          });
        }
      }

      toast.sucesso("Cultura salva com sucesso! Valores e rituais criados.");
      router.push("/cultura");
    } catch (error: any) {
      toast.erro("Erro", error.message);
    }

    setSalvando(false);
  }

  function handleRefazer() {
    setDadosCultura(null);
  }

  return (
    <ChatInterface
      titulo="Criador de Cultura"
      subtitulo="Construa a cultura da sua empresa com IA"
      cor="violet"
      apiEndpoint="/api/chat/cultura"
      empresa={sessao?.empresa ? {
        nome: sessao.empresa.nome,
        plano: sessao.empresa.plano,
        max_colaboradores: sessao.empresa.max_colaboradores,
      } : undefined}
      voltarUrl="/cultura"
      onResultado={handleResultado}
    >
      {dadosCultura && (
        <PreviewCultura
          dados={dadosCultura}
          salvando={salvando}
          onSalvar={handleSalvar}
          onRefazer={handleRefazer}
        />
      )}
    </ChatInterface>
  );
}
