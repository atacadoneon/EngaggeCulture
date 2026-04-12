"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Award, Clock, Users, Zap, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { TrilhaMapa, type ModuloTrilha } from "@/components/treinamentos/trilha-mapa";

// Demo data
const MODULOS_DEMO: ModuloTrilha[] = [
  { id: "1", titulo: "Bem-vindo a Engagge", tipo: "video", pontos: 50, status: "concluido", nota: 100, duracao: "5min" },
  { id: "2", titulo: "Nossos valores e cultura", tipo: "leitura", pontos: 30, status: "concluido", nota: 90, duracao: "8min" },
  { id: "3", titulo: "Conhecendo os produtos", tipo: "video", pontos: 50, status: "concluido", nota: 85, duracao: "12min" },
  { id: "4", titulo: "Quiz: Fundamentos", tipo: "quiz", pontos: 80, status: "concluido", nota: 70, duracao: "10min" },
  { id: "5", titulo: "Processo de vendas", tipo: "video", pontos: 50, status: "concluido", duracao: "15min" },
  { id: "6", titulo: "Simulacao: Primeira venda", tipo: "tarefa", pontos: 100, status: "disponivel", duracao: "20min" },
  { id: "7", titulo: "Tecnicas avancadas", tipo: "video", pontos: 50, status: "bloqueado", duracao: "18min" },
  { id: "8", titulo: "Avaliacao final", tipo: "quiz", pontos: 100, status: "bloqueado", duracao: "15min" },
];

export default function PaginaDetalheTrilha() {
  const params = useParams();
  const [modalModulo, setModalModulo] = useState<ModuloTrilha | null>(null);

  const concluidos = MODULOS_DEMO.filter((m) => m.status === "concluido").length;
  const totalXP = MODULOS_DEMO.filter((m) => m.status === "concluido").reduce((a, m) => a + m.pontos, 0);
  const totalXPPossivel = MODULOS_DEMO.reduce((a, m) => a + m.pontos, 0);

  function handleModuloClick(modulo: ModuloTrilha) {
    setModalModulo(modulo);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Breadcrumbs itens={[
        { label: "Treinamentos", href: "/treinamentos" },
        { label: "Onboarding Comercial" },
      ]} />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/treinamentos" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">Onboarding Comercial</h1>
            <Badge cor="red">Obrigatoria</Badge>
          </div>
          <p className="text-zinc-400 text-sm mt-0.5">
            Tudo que voce precisa saber para comecar a vender
          </p>
        </div>
      </div>

      {/* Stats da trilha */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <BookOpen className="h-5 w-5 text-violet-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{concluidos}/{MODULOS_DEMO.length}</p>
          <p className="text-[10px] text-zinc-500 uppercase">Modulos</p>
        </Card>
        <Card className="p-3 text-center">
          <Zap className="h-5 w-5 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-amber-400">{totalXP}/{totalXPPossivel} pts</p>
          <p className="text-[10px] text-zinc-500 uppercase">Pontos</p>
        </Card>
        <Card className="p-3 text-center">
          <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">2h30</p>
          <p className="text-[10px] text-zinc-500 uppercase">Duracao</p>
        </Card>
        <Card className="p-3 text-center">
          <Users className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">24</p>
          <p className="text-[10px] text-zinc-500 uppercase">Participantes</p>
        </Card>
      </div>

      {/* Mapa gamificado da trilha */}
      <Card className="p-6">
        <TrilhaMapa modulos={MODULOS_DEMO} onModuloClick={handleModuloClick} />
      </Card>

      {/* Modal do modulo */}
      <Modal
        aberto={!!modalModulo}
        fechar={() => setModalModulo(null)}
        titulo={modalModulo?.titulo || ""}
        tamanho="lg"
      >
        {modalModulo && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge cor={
                modalModulo.tipo === "video" ? "blue" :
                modalModulo.tipo === "quiz" ? "violet" :
                modalModulo.tipo === "leitura" ? "zinc" :
                "amber"
              }>
                {modalModulo.tipo}
              </Badge>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-400">{modalModulo.pontos} pts</span>
              </div>
              {modalModulo.duracao && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-zinc-500" />
                  <span className="text-sm text-zinc-400">{modalModulo.duracao}</span>
                </div>
              )}
            </div>

            {/* Conteudo placeholder baseado no tipo */}
            {modalModulo.tipo === "video" && (
              <div className="aspect-video bg-zinc-800 rounded-xl flex items-center justify-center">
                <button className="h-16 w-16 bg-violet-600 rounded-full flex items-center justify-center hover:bg-violet-700 transition-colors">
                  <Play className="h-8 w-8 text-white ml-1" />
                </button>
              </div>
            )}

            {modalModulo.tipo === "leitura" && (
              <div className="bg-zinc-800 rounded-xl p-6 max-h-64 overflow-y-auto">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Conteudo de leitura sera exibido aqui. O admin pode adicionar texto rico,
                  imagens, links e materiais de apoio diretamente pela area de administracao.
                </p>
              </div>
            )}

            {modalModulo.tipo === "quiz" && (
              <div className="bg-zinc-800 rounded-xl p-6 text-center">
                <HelpCircleIcon className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Quiz com {Math.floor(Math.random() * 5 + 5)} perguntas</p>
                <p className="text-sm text-zinc-400 mt-1">Nota minima: 70% para aprovacao</p>
              </div>
            )}

            {modalModulo.tipo === "tarefa" && (
              <div className="bg-zinc-800 rounded-xl p-6">
                <p className="text-sm text-zinc-300">
                  Complete a tarefa pratica descrita pelo administrador. Ao finalizar,
                  envie para aprovacao do gestor.
                </p>
              </div>
            )}

            {/* Botao de acao */}
            <div className="flex justify-end pt-4 border-t border-zinc-800">
              {modalModulo.status === "concluido" ? (
                <Button variante="secundario" onClick={() => setModalModulo(null)}>
                  <Award className="h-4 w-4" /> Refazer Modulo
                </Button>
              ) : (
                <Button onClick={() => setModalModulo(null)}>
                  <Play className="h-4 w-4" /> Iniciar Modulo
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function HelpCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><path d="M12 17h.01" />
    </svg>
  );
}
