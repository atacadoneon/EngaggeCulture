"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChatInterface } from "@/components/chat/chat-interface";
import { PreviewGamificacao } from "@/components/chat/acoes-resultado";
import { usarSessao } from "@/hooks/usar-sessao";
import { criarClienteNavegador } from "@/lib/supabase/client";

export default function PaginaCriarGamificacao() {
  const { sessao } = usarSessao();
  const router = useRouter();
  const [dadosGamificacao, setDadosGamificacao] = useState<any>(null);
  const [salvando, setSalvando] = useState(false);

  function handleResultado(texto: string) {
    const match = texto.match(/\[SALVAR_GAMIFICACAO\]\s*([\s\S]*?)\s*\[\/SALVAR_GAMIFICACAO\]/);
    if (match) {
      try {
        const dados = JSON.parse(match[1]);
        setDadosGamificacao(dados);
      } catch (e) {
        console.error("Erro ao parsear resultado:", e);
      }
    }
  }

  async function handleSalvar() {
    if (!dadosGamificacao || !sessao) return;
    setSalvando(true);

    try {
      const supabase = criarClienteNavegador();
      const empresaId = sessao.empresa.id;

      // 1. Atualizar moeda da empresa (se definida)
      if (dadosGamificacao.moeda) {
        await supabase.from("empresas").update({
          moeda_nome: dadosGamificacao.moeda.nome,
          moeda_icone: dadosGamificacao.moeda.icone,
          moeda_valor_real: dadosGamificacao.moeda.valor_real || 0.10,
        }).eq("id", empresaId);
      }

      // 2. Criar jornadas com etapas
      if (dadosGamificacao.jornadas?.length > 0) {
        for (const jornada of dadosGamificacao.jornadas) {
          const { data: jornadaCriada } = await supabase
            .from("jornadas")
            .insert({
              empresa_id: empresaId,
              nome: jornada.nome,
              descricao: jornada.descricao,
              tipo: jornada.tipo || "onboarding",
              status: "rascunho",
              obrigatoria: jornada.obrigatoria || false,
              auto_atribuir_novo: jornada.auto_atribuir_novo || false,
              total_pontos: (jornada.etapas || []).reduce((acc: number, e: any) => acc + (e.pontos || 0), 0),
            })
            .select()
            .single();

          if (jornadaCriada && jornada.etapas?.length > 0) {
            for (const [i, etapa] of jornada.etapas.entries()) {
              await supabase.from("etapas_jornada").insert({
                jornada_id: jornadaCriada.id,
                ordem: i + 1,
                titulo: etapa.titulo,
                descricao: etapa.descricao || "",
                tipo: etapa.tipo || "tarefa",
                pontos: etapa.pontos || 10,
                obrigatoria: etapa.obrigatoria !== false,
                prazo_dias: etapa.prazo_dias || null,
              });
            }
          }
        }
      }

      // 3. Criar desafios
      if (dadosGamificacao.desafios?.length > 0) {
        for (const desafio of dadosGamificacao.desafios) {
          const inicio = new Date();
          const fim = new Date();
          fim.setDate(fim.getDate() + (desafio.duracao_dias || 30));

          await supabase.from("desafios").insert({
            empresa_id: empresaId,
            nome: desafio.nome,
            descricao: desafio.descricao,
            tipo: desafio.tipo || "individual",
            status: "rascunho",
            inicio_em: inicio.toISOString(),
            fim_em: fim.toISOString(),
            fonte_kpi: desafio.fonte_kpi || "manual",
            tipo_pontuacao: desafio.tipo_pontuacao || "linear",
            regras_pontuacao: desafio.regras_pontuacao || [],
            config_premios: desafio.premios || {},
          });
        }
      }

      // 4. Criar missoes
      if (dadosGamificacao.missoes?.length > 0) {
        for (const missao of dadosGamificacao.missoes) {
          await supabase.from("missoes").insert({
            empresa_id: empresaId,
            nome: missao.nome,
            descricao: missao.descricao || "",
            frequencia: missao.frequencia || "diaria",
            pontos: missao.pontos || 10,
            multiplicador_sequencia: missao.multiplicador_sequencia || 1.5,
            ativa: true,
          });
        }
      }

      alert("Gamificacao salva com sucesso! Jornadas, desafios e missoes criados.");
      router.push("/gamificacao");
    } catch (error: any) {
      alert("Erro ao salvar: " + error.message);
    }

    setSalvando(false);
  }

  function handleRefazer() {
    setDadosGamificacao(null);
  }

  return (
    <ChatInterface
      titulo="Criador de Gamificacao"
      subtitulo="Monte sua estrategia de gamificacao com IA"
      cor="amber"
      apiEndpoint="/api/chat/gamificacao"
      empresa={sessao?.empresa ? {
        nome: sessao.empresa.nome,
        plano: sessao.empresa.plano,
        max_colaboradores: sessao.empresa.max_colaboradores,
        moeda_nome: sessao.empresa.moeda_nome,
        moeda_icone: sessao.empresa.moeda_icone,
        moeda_valor_real: sessao.empresa.moeda_valor_real,
      } : undefined}
      voltarUrl="/gamificacao"
      onResultado={handleResultado}
    >
      {dadosGamificacao && (
        <PreviewGamificacao
          dados={dadosGamificacao}
          salvando={salvando}
          onSalvar={handleSalvar}
          onRefazer={handleRefazer}
        />
      )}
    </ChatInterface>
  );
}
