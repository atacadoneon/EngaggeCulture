import { NextRequest, NextResponse } from "next/server";
import { criarClienteAdmin } from "@/lib/supabase/server";
import { executarSyncCompleto } from "@/lib/integracoes/sync-service";

export async function POST(request: NextRequest) {
  try {
    const { empresa_id } = await request.json();
    if (!empresa_id) return NextResponse.json({ erro: "empresa_id obrigatorio" }, { status: 400 });

    const supabase = await criarClienteAdmin();

    const { data: integracao } = await supabase
      .from("integracoes_erp")
      .select("*")
      .eq("empresa_id", empresa_id)
      .eq("tipo", "tiny")
      .eq("status", "conectado")
      .single();

    if (!integracao) return NextResponse.json({ erro: "Integracao Tiny nao encontrada ou desconectada" }, { status: 400 });

    await executarSyncCompleto({
      id: integracao.id,
      empresa_id: integracao.empresa_id,
      access_token: integracao.access_token,
      config: integracao.config,
    });

    return NextResponse.json({ sucesso: true, sincronizado_em: new Date().toISOString() });
  } catch (error: any) {
    console.error("Erro no sync:", error);
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}
