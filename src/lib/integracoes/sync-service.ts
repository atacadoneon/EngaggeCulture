/**
 * Servico de sincronizacao — orquestra sync entre Engagge e ERPs
 */

import { criarClienteAdmin } from "@/lib/supabase/server";
import {
  listarPedidosTiny,
  obterPedidoTiny,
  listarNotasTiny,
  listarContasReceberTiny,
  obterExpedicaoTiny,
} from "./tiny-erp";

interface IntegracaoConfig {
  id: string;
  empresa_id: string;
  access_token: string;
  config: {
    sync_pedidos: boolean;
    sync_notas_fiscais: boolean;
    sync_contas_receber: boolean;
    sync_estoque: boolean;
  };
}

async function logSync(
  supabase: any,
  integracaoId: string,
  empresaId: string,
  tipoSync: string,
  direcao: string,
  status: string,
  registros: number,
  erros: number,
  detalhes: Record<string, unknown>,
  duracaoMs: number
) {
  await supabase.from("sync_log").insert({
    empresa_id: empresaId,
    integracao_id: integracaoId,
    tipo_sync: tipoSync,
    direcao,
    status,
    registros_processados: registros,
    registros_com_erro: erros,
    detalhes,
    duracao_ms: duracaoMs,
  });
}

// ========== SINCRONIZAR PEDIDOS ==========

export async function sincronizarPedidos(integracao: IntegracaoConfig) {
  const inicio = Date.now();
  const supabase = await criarClienteAdmin();
  let processados = 0;
  let erros = 0;

  try {
    // Buscar envios com erp_pedido_id que nao estejam em status final
    const { data: enviosPendentes } = await supabase
      .from("envios")
      .select("id, erp_pedido_id, status")
      .eq("empresa_id", integracao.empresa_id)
      .not("erp_pedido_id", "is", null)
      .not("status", "in", "(entregue,cancelado)");

    if (enviosPendentes) {
      for (const envio of enviosPendentes) {
        try {
          const pedidoTiny = await obterPedidoTiny(integracao.access_token, envio.erp_pedido_id);

          // Mapear situacao do Tiny pra status da Engagge
          let novoStatus = envio.status;
          const situacaoTiny = pedidoTiny.situacao;
          if (situacaoTiny === "Aprovada" || situacaoTiny === "Preparando") novoStatus = "aprovado";
          if (situacaoTiny === "Faturada") novoStatus = "processando";
          if (situacaoTiny === "Pronto Envio" || situacaoTiny === "Enviada") novoStatus = "enviado";
          if (situacaoTiny === "Entregue") novoStatus = "entregue";
          if (situacaoTiny === "Cancelada") novoStatus = "cancelado";

          if (novoStatus !== envio.status) {
            const atualizacao: Record<string, unknown> = { status: novoStatus, erp_status: situacaoTiny };
            if (novoStatus === "enviado") atualizacao.enviado_em = new Date().toISOString();
            if (novoStatus === "entregue") atualizacao.entregue_em = new Date().toISOString();

            // Tentar buscar rastreio
            try {
              const expedicao = await obterExpedicaoTiny(integracao.access_token, envio.erp_pedido_id);
              if (expedicao?.codigoRastreamento) {
                atualizacao.codigo_rastreio = expedicao.codigoRastreamento;
              }
              if (expedicao?.transportador?.nome) {
                atualizacao.transportadora = expedicao.transportador.nome;
              }
            } catch {}

            await supabase.from("envios").update(atualizacao).eq("id", envio.id);
          }
          processados++;
        } catch {
          erros++;
        }
      }
    }

    await logSync(supabase, integracao.id, integracao.empresa_id, "pedidos", "recebimento", erros > 0 ? "parcial" : "sucesso", processados, erros, {}, Date.now() - inicio);
  } catch (error: any) {
    await logSync(supabase, integracao.id, integracao.empresa_id, "pedidos", "recebimento", "erro", 0, 1, { erro: error.message }, Date.now() - inicio);
  }
}

// ========== SINCRONIZAR NOTAS FISCAIS ==========

export async function sincronizarNotas(integracao: IntegracaoConfig) {
  const inicio = Date.now();
  const supabase = await criarClienteAdmin();
  let processados = 0;
  let erros = 0;

  try {
    const hoje = new Date().toISOString().split("T")[0];
    const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const notas = await listarNotasTiny(integracao.access_token, {
      dataInicial: trintaDiasAtras,
      dataFinal: hoje,
    });

    if (notas?.itens) {
      for (const nota of notas.itens) {
        try {
          // Verificar se ja existe
          const { data: existente } = await supabase
            .from("notas_fiscais")
            .select("id")
            .eq("empresa_id", integracao.empresa_id)
            .eq("erp_nota_id", String(nota.id))
            .single();

          if (!existente) {
            await supabase.from("notas_fiscais").insert({
              empresa_id: integracao.empresa_id,
              numero: nota.numero || String(nota.id),
              tipo: nota.tipo === "S" ? "saida" : "entrada",
              fornecedor: nota.nomeCliente,
              valor: nota.valorTotal || 0,
              data_emissao: nota.dataEmissao || hoje,
              chave_acesso: nota.chaveAcesso,
              erp_nota_id: String(nota.id),
              erp_sincronizado: true,
            });
            processados++;
          }
        } catch {
          erros++;
        }
      }
    }

    await logSync(supabase, integracao.id, integracao.empresa_id, "notas_fiscais", "recebimento", erros > 0 ? "parcial" : "sucesso", processados, erros, {}, Date.now() - inicio);
  } catch (error: any) {
    await logSync(supabase, integracao.id, integracao.empresa_id, "notas_fiscais", "recebimento", "erro", 0, 1, { erro: error.message }, Date.now() - inicio);
  }
}

// ========== SINCRONIZAR CONTAS A RECEBER ==========

export async function sincronizarContasReceber(integracao: IntegracaoConfig) {
  const inicio = Date.now();
  const supabase = await criarClienteAdmin();
  let processados = 0;
  let erros = 0;

  try {
    const contas = await listarContasReceberTiny(integracao.access_token, { situacao: "aberto" });

    if (contas?.itens) {
      for (const conta of contas.itens) {
        try {
          const { data: existente } = await supabase
            .from("contas_pagar")
            .select("id")
            .eq("empresa_id", integracao.empresa_id)
            .eq("erp_conta_id", String(conta.id))
            .single();

          if (!existente) {
            await supabase.from("contas_pagar").insert({
              empresa_id: integracao.empresa_id,
              descricao: conta.historico || `Conta ${conta.nomeCliente}`,
              categoria: "fulfillment",
              valor: conta.valor || 0,
              vencimento: conta.dataVencimento,
              status: "aberta",
              erp_conta_id: String(conta.id),
              erp_sincronizado: true,
            });
            processados++;
          } else {
            // Atualizar status se mudou
            const statusLocal = conta.situacao === "pago" ? "paga" : conta.situacao === "cancelado" ? "cancelada" : "aberta";
            await supabase.from("contas_pagar").update({
              status: statusLocal,
              erp_sincronizado: true,
            }).eq("id", existente.id);
            processados++;
          }
        } catch {
          erros++;
        }
      }
    }

    await logSync(supabase, integracao.id, integracao.empresa_id, "contas_receber", "recebimento", erros > 0 ? "parcial" : "sucesso", processados, erros, {}, Date.now() - inicio);
  } catch (error: any) {
    await logSync(supabase, integracao.id, integracao.empresa_id, "contas_receber", "recebimento", "erro", 0, 1, { erro: error.message }, Date.now() - inicio);
  }
}

// ========== SYNC COMPLETO ==========

export async function executarSyncCompleto(integracao: IntegracaoConfig) {
  const supabase = await criarClienteAdmin();

  if (integracao.config.sync_pedidos) {
    await sincronizarPedidos(integracao);
  }

  if (integracao.config.sync_notas_fiscais) {
    await sincronizarNotas(integracao);
  }

  if (integracao.config.sync_contas_receber) {
    await sincronizarContasReceber(integracao);
  }

  // Atualizar ultima sincronizacao
  await supabase
    .from("integracoes_erp")
    .update({ ultima_sincronizacao: new Date().toISOString() })
    .eq("id", integracao.id);
}
