import { NextRequest, NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/server";

/**
 * Webhook do Tiny ERP — recebe eventos de mudanca de status
 * Tipos: pedido.atualizado, nota.emitida, expedicao.atualizada
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = await criarClienteAdmin();

    const evento = payload.tipo || payload.event || payload.type;
    const dados = payload.dados || payload.data || payload;

    // Identificar empresa pelo pedido
    let empresaId: string | null = null;
    let envioId: string | null = null;

    if (dados.idPedido || dados.id_pedido) {
      const tinyPedidoId = String(dados.idPedido || dados.id_pedido);
      const { data: envio } = await supabase
        .from("envios")
        .select("id, empresa_id")
        .eq("erp_pedido_id", tinyPedidoId)
        .single();

      if (envio) {
        empresaId = envio.empresa_id;
        envioId = envio.id;
      }
    }

    // Processar por tipo de evento
    if (evento === "pedido.atualizado" || evento === "order.updated") {
      if (envioId) {
        let novoStatus = "";
        const situacao = dados.situacao || dados.status;

        if (situacao === "Aprovada") novoStatus = "aprovado";
        else if (situacao === "Faturada" || situacao === "Preparando") novoStatus = "processando";
        else if (situacao === "Enviada" || situacao === "Pronto Envio") novoStatus = "enviado";
        else if (situacao === "Entregue") novoStatus = "entregue";
        else if (situacao === "Cancelada") novoStatus = "cancelado";

        if (novoStatus) {
          const atualizacao: Record<string, unknown> = { status: novoStatus, erp_status: situacao };
          if (novoStatus === "enviado") atualizacao.enviado_em = new Date().toISOString();
          if (novoStatus === "entregue") atualizacao.entregue_em = new Date().toISOString();

          await supabase.from("envios").update(atualizacao).eq("id", envioId);
        }
      }
    }

    if (evento === "nota.emitida" || evento === "invoice.created") {
      if (empresaId) {
        await supabase.from("notas_fiscais").insert({
          empresa_id: empresaId,
          numero: dados.numero || String(dados.id),
          tipo: "saida",
          fornecedor: dados.nomeCliente || dados.cliente,
          valor: dados.valorTotal || dados.valor || 0,
          data_emissao: dados.dataEmissao || new Date().toISOString().split("T")[0],
          chave_acesso: dados.chaveAcesso,
          erp_nota_id: String(dados.idNota || dados.id),
          erp_sincronizado: true,
        });

        // Atualizar envio com NF
        if (envioId) {
          await supabase.from("envios").update({
            erp_nota_fiscal_id: String(dados.idNota || dados.id),
          }).eq("id", envioId);
        }

        // Gerar conta a receber automaticamente
        if (dados.valorTotal || dados.valor) {
          await supabase.from("contas_pagar").insert({
            empresa_id: empresaId,
            descricao: `NF ${dados.numero} — ${dados.nomeCliente || "Fulfillment"}`,
            categoria: "fulfillment",
            valor: dados.valorTotal || dados.valor,
            vencimento: dados.dataVencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "aberta",
            nota_fiscal: dados.numero,
            erp_sincronizado: true,
          });
        }
      }
    }

    if (evento === "expedicao.atualizada" || evento === "shipment.updated") {
      if (envioId) {
        const atualizacao: Record<string, unknown> = {};
        if (dados.codigoRastreamento || dados.rastreio) {
          atualizacao.codigo_rastreio = dados.codigoRastreamento || dados.rastreio;
        }
        if (dados.transportador || dados.transportadora) {
          atualizacao.transportadora = dados.transportador?.nome || dados.transportadora;
        }
        if (dados.situacao === "Entregue") {
          atualizacao.status = "entregue";
          atualizacao.entregue_em = new Date().toISOString();
        } else {
          atualizacao.status = "enviado";
          atualizacao.enviado_em = new Date().toISOString();
        }

        await supabase.from("envios").update(atualizacao).eq("id", envioId);
      }
    }

    return NextResponse.json({ sucesso: true });
  } catch (error: any) {
    console.error("Erro no webhook Tiny:", error);
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
