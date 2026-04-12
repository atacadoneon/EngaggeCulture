"use client";

import { useState, useEffect } from "react";
import { Link2, Unlink, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle, Settings, Zap, FileText, Receipt, Package, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { FormSection } from "@/components/ui/form-section";
import { buscarIntegracao, salvarIntegracao, listarSyncLogs } from "@/lib/supabase/queries/integracoes";
import { usarSessao } from "@/hooks/usar-sessao";
import { cn } from "@/lib/utils";

const STATUS_COR: Record<string, { cor: string; icone: typeof CheckCircle; texto: string }> = {
  conectado: { cor: "text-emerald-400", icone: CheckCircle, texto: "Conectado" },
  desconectado: { cor: "text-zinc-500", icone: Unlink, texto: "Desconectado" },
  erro: { cor: "text-red-400", icone: XCircle, texto: "Erro" },
  expirando: { cor: "text-amber-400", icone: AlertTriangle, texto: "Token Expirando" },
};

const ERPS = [
  { tipo: "tiny", nome: "Tiny ERP", descricao: "Pedidos, notas fiscais, contas a receber, expedicao", cor: "from-blue-600 to-cyan-600", logo: "🔷" },
  { tipo: "omie", nome: "Omie", descricao: "ERP completo com financeiro e estoque", cor: "from-violet-600 to-purple-600", logo: "🟣" },
  { tipo: "bling", nome: "Bling", descricao: "Gestao de vendas, estoque e financeiro", cor: "from-amber-600 to-orange-600", logo: "🟠" },
];

export default function PaginaIntegracoes() {
  const { sessao } = usarSessao();
  const [integracao, setIntegracao] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [modalAberto, setModalAberto] = useState(false);
  const [erpSelecionado, setErpSelecionado] = useState("tiny");
  const [sincronizando, setSincronizando] = useState(false);

  // Form
  const [fClientId, setFClientId] = useState("");
  const [fClientSecret, setFClientSecret] = useState("");
  const [fSyncPedidos, setFSyncPedidos] = useState(true);
  const [fSyncNFs, setFSyncNFs] = useState(true);
  const [fSyncContas, setFSyncContas] = useState(true);
  const [fSyncEstoque, setFSyncEstoque] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    setCarregando(true);
    try {
      const [integ, syncLogs] = await Promise.all([
        buscarIntegracao("tiny"),
        listarSyncLogs(10),
      ]);
      setIntegracao(integ);
      setLogs(syncLogs);
      if (integ) {
        setFClientId(integ.client_id || "");
        setFClientSecret(integ.client_secret || "");
        const cfg = integ.config || {};
        setFSyncPedidos(cfg.sync_pedidos !== false);
        setFSyncNFs(cfg.sync_notas_fiscais !== false);
        setFSyncContas(cfg.sync_contas_receber !== false);
        setFSyncEstoque(cfg.sync_estoque === true);
      }
    } catch {}
    setCarregando(false);
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      await salvarIntegracao({
        tipo: erpSelecionado,
        client_id: fClientId,
        client_secret: fClientSecret,
        config: { sync_pedidos: fSyncPedidos, sync_notas_fiscais: fSyncNFs, sync_contas_receber: fSyncContas, sync_estoque: fSyncEstoque },
      });
      setModalAberto(false);
      carregar();
    } catch (err: any) { alert(err.message); }
    setSalvando(false);
  }

  async function handleSincronizar() {
    if (!sessao) return;
    setSincronizando(true);
    try {
      await fetch("/api/integracoes/tiny/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ empresa_id: sessao.empresa.id }),
      });
      carregar();
    } catch (err: any) { alert(err.message); }
    setSincronizando(false);
  }

  const statusInfo = integracao ? STATUS_COR[integracao.status] || STATUS_COR.desconectado : STATUS_COR.desconectado;
  const StatusIcone = statusInfo.icone;

  return (
    <div className="space-y-6">
      <Breadcrumbs itens={[{ label: "Configuracoes", href: "/configuracoes" }, { label: "Integracoes" }]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Link2 className="h-6 w-6 text-violet-400" /> Integracoes
          </h1>
          <p className="text-zinc-400 text-sm mt-0.5">Conecte seu ERP para sincronizar pedidos, notas e financeiro</p>
        </div>
      </div>

      {/* Cards de ERPs disponiveis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ERPS.map((erp) => {
          const eConectado = integracao?.tipo === erp.tipo && integracao?.status === "conectado";
          const eConfigurado = integracao?.tipo === erp.tipo;
          return (
            <Card key={erp.tipo} className={cn("overflow-hidden", eConectado && "border-emerald-500/30")}>
              <div className={cn("h-1.5 bg-gradient-to-r", erp.cor)} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{erp.logo}</span>
                    <div>
                      <h3 className="text-base font-bold text-white">{erp.nome}</h3>
                      <p className="text-xs text-zinc-500">{erp.descricao}</p>
                    </div>
                  </div>
                </div>

                {eConfigurado ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <StatusIcone className={cn("h-4 w-4", statusInfo.cor)} />
                      <span className={cn("text-sm font-semibold", statusInfo.cor)}>{statusInfo.texto}</span>
                    </div>
                    {integracao.ultima_sincronizacao && (
                      <p className="text-[10px] text-zinc-500">
                        Ultimo sync: {new Date(integracao.ultima_sincronizacao).toLocaleString("pt-BR")}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button tamanho="sm" variante="secundario" onClick={() => { setErpSelecionado(erp.tipo); setModalAberto(true); }}>
                        <Settings className="h-3 w-3" /> Configurar
                      </Button>
                      <Button tamanho="sm" onClick={handleSincronizar} disabled={sincronizando || integracao.status !== "conectado"}>
                        <RefreshCw className={cn("h-3 w-3", sincronizando && "animate-spin")} />
                        {sincronizando ? "Sincronizando..." : "Sincronizar"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button tamanho="sm" onClick={() => { setErpSelecionado(erp.tipo); setModalAberto(true); }}>
                    <Link2 className="h-3 w-3" /> Conectar
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* O que sincroniza */}
      <Card className="p-5">
        <h3 className="text-sm font-bold text-white mb-4">Fluxo de Integracao</h3>
        <div className="flex items-center justify-between gap-2 overflow-x-auto">
          {[
            { icone: Package, label: "Envio criado", cor: "text-violet-400", bg: "bg-violet-500/10" },
            { icone: ArrowRight, label: "", cor: "text-zinc-600", bg: "" },
            { icone: Zap, label: "Pedido no Tiny", cor: "text-blue-400", bg: "bg-blue-500/10" },
            { icone: ArrowRight, label: "", cor: "text-zinc-600", bg: "" },
            { icone: FileText, label: "NF emitida", cor: "text-emerald-400", bg: "bg-emerald-500/10" },
            { icone: ArrowRight, label: "", cor: "text-zinc-600", bg: "" },
            { icone: Receipt, label: "Fatura gerada", cor: "text-amber-400", bg: "bg-amber-500/10" },
            { icone: ArrowRight, label: "", cor: "text-zinc-600", bg: "" },
            { icone: CheckCircle, label: "Rastreio atualizado", cor: "text-cyan-400", bg: "bg-cyan-500/10" },
          ].map((item, i) => {
            const Icone = item.icone;
            if (!item.label) return <Icone key={i} className="h-4 w-4 text-zinc-700 shrink-0" />;
            return (
              <div key={i} className={cn("flex flex-col items-center gap-1 shrink-0", item.bg, "rounded-xl p-3")}>
                <Icone className={cn("h-5 w-5", item.cor)} />
                <span className="text-[10px] text-zinc-400 whitespace-nowrap">{item.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Log de sincronizacoes */}
      {logs.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-white mb-3">Historico de Sincronizacoes</h3>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-zinc-800">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Tipo</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Direcao</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-zinc-400 uppercase">Registros</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-zinc-400 uppercase">Data</th>
                </tr></thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3"><Badge cor="zinc">{log.tipo_sync}</Badge></td>
                      <td className="px-5 py-3"><Badge cor={log.direcao === "envio" ? "blue" : "violet"}>{log.direcao}</Badge></td>
                      <td className="px-5 py-3"><Badge cor={log.status === "sucesso" ? "green" : log.status === "parcial" ? "amber" : "red"}>{log.status}</Badge></td>
                      <td className="px-5 py-3 text-center text-sm text-white">{log.registros_processados}</td>
                      <td className="px-5 py-3 text-xs text-zinc-500">{new Date(log.criado_em).toLocaleString("pt-BR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de configuracao */}
      <Modal aberto={modalAberto} fechar={() => setModalAberto(false)} titulo={`Configurar ${ERPS.find((e) => e.tipo === erpSelecionado)?.nome}`} tamanho="lg">
        <form onSubmit={handleSalvar} className="space-y-5">
          <FormSection titulo="Credenciais de Acesso" descricao="Gere as chaves no painel do seu ERP em Configuracoes > API/Integracoes">
            <div className="grid grid-cols-1 gap-4">
              <Input rotulo="Client ID" value={fClientId} onChange={(e) => setFClientId(e.target.value)} placeholder="Cole o Client ID aqui" required />
              <Input rotulo="Client Secret" type="password" value={fClientSecret} onChange={(e) => setFClientSecret(e.target.value)} placeholder="Cole o Client Secret aqui" required />
            </div>
          </FormSection>

          <FormSection titulo="O que sincronizar">
            <div className="space-y-3">
              {[
                { label: "Pedidos de envio", desc: "Criar pedidos no ERP automaticamente quando envio for criado", valor: fSyncPedidos, set: setFSyncPedidos },
                { label: "Notas fiscais", desc: "Importar NFs emitidas pelo ERP", valor: fSyncNFs, set: setFSyncNFs },
                { label: "Contas a receber", desc: "Sincronizar faturas e pagamentos", valor: fSyncContas, set: setFSyncContas },
                { label: "Estoque", desc: "Sincronizar movimentacoes de estoque", valor: fSyncEstoque, set: setFSyncEstoque },
              ].map((item, i) => (
                <label key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <input type="checkbox" checked={item.valor} onChange={(e) => item.set(e.target.checked)} className="rounded border-zinc-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{item.label}</p>
                    <p className="text-xs text-zinc-500">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </FormSection>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button variante="secundario" type="button" onClick={() => setModalAberto(false)}>Cancelar</Button>
            <Button type="submit" disabled={salvando}>{salvando ? "Salvando..." : "Salvar e Conectar"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
