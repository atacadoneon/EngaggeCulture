import { NextRequest, NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/server";
import { criarPedidoTiny, converterEnvioParaPedidoTiny } from "@/lib/integracoes/tiny-erp";

export async function POST(request: NextRequest) {
  try {
    const { envio_id } = await request.json();
    if (!envio_id) return NextResponse.json({ erro: "envio_id obrigatorio" }, { status: 400 });

    const supabase = await criarClienteAdmin();

    // Buscar envio
    const { data: envio, error: envioError } = await supabase
      .from("envios")
      .select("*")
      .eq("id", envio_id)
      .single();

    if (envioError || !envio) return NextResponse.json({ erro: "Envio nao encontrado" }, { status: 404 });

    // Buscar integracao ativa
    const { data: integracao } = await supabase
      .from("integracoes_erp")
      .select("*")
      .eq("empresa_id", envio.empresa_id)
      .eq("tipo", "tiny")
      .eq("status", "conectado")
      .single();

    if (!integracao) return NextResponse.json({ erro: "Integracao Tiny nao configurada ou desconectada" }, { status: 400 });

    // Converter envio pra pedido Tiny
    const pedidoTiny = converterEnvioParaPedidoTiny({
      destinatario_nome: envio.destinatario_nome,
      destinatario_email: envio.destinatario_email,
      produto_nome: envio.produto_nome,
      quantidade: envio.quantidade,
      endereco_entrega: envio.endereco_entrega,
      custo_estimado: envio.custo_estimado,
      observacoes: envio.observacoes,
    });

    // Criar pedido no Tiny
    const resultado = await criarPedidoTiny(integracao.access_token, pedidoTiny);

    // Atualizar envio com ID do pedido Tiny
    await supabase.from("envios").update({
      erp_pedido_id: String(resultado.id || resultado.idPedido),
      erp_status: "Aberta",
      status: "processando",
    }).eq("id", envio_id);

    // Log
    await supabase.from("sync_log").insert({
      empresa_id: envio.empresa_id,
      integracao_id: integracao.id,
      tipo_sync: "pedidos",
      direcao: "envio",
      status: "sucesso",
      registros_processados: 1,
      detalhes: { envio_id, tiny_pedido_id: resultado.id },
    });

    return NextResponse.json({ sucesso: true, tiny_pedido_id: resultado.id || resultado.idPedido });
  } catch (error: any) {
    console.error("Erro ao criar pedido no Tiny:", error);
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
