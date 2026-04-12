"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Sparkles, BookOpen, Trophy, Flame } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Tabs } from "@/components/ui/tabs";
import { SearchInput } from "@/components/ui/search-input";
import { EmptyState } from "@/components/ui/empty-state";
import { StatsTreinamento } from "@/components/treinamentos/stats-treinamento";
import { CardTrilha } from "@/components/treinamentos/card-trilha";
import { usarPermissao } from "@/hooks/usar-permissao";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Dados demo pra visualizacao (serao substituidos por dados reais)
const TRILHAS_DEMO = [
  {
    id: "1", nome: "Onboarding Comercial", descricao: "Tudo que voce precisa saber para comecar a vender. Conheca os produtos, tecnicas e processos.",
    categoria: "Onboarding", total_modulos: 8, modulos_concluidos: 5, pontos_total: 400,
    duracao_estimada: "2h30", obrigatoria: true, participantes: 24,
  },
  {
    id: "2", nome: "Tecnicas de Fechamento", descricao: "Domine as 7 tecnicas de fechamento que mais convertem. Do SPIN ao fechamento por alternativa.",
    categoria: "Vendas", total_modulos: 6, modulos_concluidos: 6, pontos_total: 300,
    duracao_estimada: "1h45", obrigatoria: false, participantes: 18,
  },
  {
    id: "3", nome: "Cultura Engagge", descricao: "Nossos valores, rituais e como vivemos nossa cultura no dia a dia.",
    categoria: "Cultura", total_modulos: 5, modulos_concluidos: 0, pontos_total: 250,
    duracao_estimada: "1h", obrigatoria: true, participantes: 45,
  },
  {
    id: "4", nome: "Produto em Profundidade", descricao: "Conheca cada detalhe dos nossos produtos. Materiais, processos, diferenciais competitivos.",
    categoria: "Produto", total_modulos: 10, modulos_concluidos: 3, pontos_total: 500,
    duracao_estimada: "3h", obrigatoria: false, participantes: 12,
  },
  {
    id: "5", nome: "Objecoes Matadoras", descricao: "As 15 objecoes mais comuns e como responder cada uma com autoridade.",
    categoria: "Vendas", total_modulos: 4, modulos_concluidos: 0, pontos_total: 200,
    duracao_estimada: "45min", obrigatoria: false, participantes: 8,
  },
  {
    id: "6", nome: "Seguranca da Informacao", descricao: "Boas praticas de seguranca digital, senhas, phishing e protecao de dados.",
    categoria: "Compliance", total_modulos: 3, modulos_concluidos: 3, pontos_total: 150,
    duracao_estimada: "30min", obrigatoria: true, participantes: 45,
  },
];

export default function PaginaTreinamentos() {
  const router = useRouter();
  const { eGestor } = usarPermissao();
  const [abaAtiva, setAbaAtiva] = useState("todas");
  const [busca, setBusca] = useState("");

  const trilhas = TRILHAS_DEMO;
  const filtradas = trilhas
    .filter((t) => {
      if (abaAtiva === "em_andamento") return t.modulos_concluidos > 0 && t.modulos_concluidos < t.total_modulos;
      if (abaAtiva === "concluidas") return t.modulos_concluidos === t.total_modulos;
      if (abaAtiva === "obrigatorias") return t.obrigatoria;
      return true;
    })
    .filter((t) => t.nome.toLowerCase().includes(busca.toLowerCase()));

  const emAndamento = trilhas.filter((t) => t.modulos_concluidos > 0 && t.modulos_concluidos < t.total_modulos).length;
  const concluidas = trilhas.filter((t) => t.modulos_concluidos === t.total_modulos).length;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Treinamentos" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Treinamentos</h1>
          <p className="text-zinc-400 text-sm">Trilhas de aprendizado gamificadas</p>
        </div>
        {eGestor && (
          <Link href="/treinamentos/admin">
            <Button variante="secundario"><Sparkles className="h-4 w-4" />Gerenciar Conteudo</Button>
          </Link>
        )}
      </div>

      {/* Stats gamificados */}
      <StatsTreinamento
        totalXP={1450}
        trilhasConcluidas={concluidas}
        trilhasEmAndamento={emAndamento}
        horasEstudo={6}
        sequenciaDias={5}
        certificados={concluidas}
      />

      {/* Tabs + Busca */}
      <div className="flex items-center justify-between">
        <Tabs itens={[
          { id: "todas", label: "Todas", contagem: trilhas.length },
          { id: "em_andamento", label: "Em Andamento", contagem: emAndamento },
          { id: "concluidas", label: "Concluidas", contagem: concluidas },
          { id: "obrigatorias", label: "Obrigatorias" },
        ]} ativo={abaAtiva} onChange={setAbaAtiva} />
        <SearchInput valor={busca} onChange={setBusca} placeholder="Buscar trilha..." className="w-64" />
      </div>

      {/* Grid de trilhas */}
      {filtradas.length === 0 ? (
        <EmptyState icone={GraduationCap} titulo="Nenhuma trilha encontrada" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map((trilha) => (
            <CardTrilha
              key={trilha.id}
              {...trilha}
              onClick={() => router.push(`/treinamentos/${trilha.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
