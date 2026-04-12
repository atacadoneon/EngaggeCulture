"use client";

import { useEffect, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/client";
import type { Colaborador, Empresa, PerfilAcesso, SessaoUsuario } from "@/types/database";

export function usarSessao() {
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const supabase = criarClienteNavegador();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSessao(null);
        setCarregando(false);
        return;
      }

      const { data: colaborador } = await supabase
        .from("colaboradores")
        .select("*")
        .eq("auth_user_id", user.id)
        .eq("status", "ativo")
        .single();

      if (!colaborador) {
        setSessao(null);
        setCarregando(false);
        return;
      }

      const [{ data: empresa }, { data: perfil }] = await Promise.all([
        supabase.from("empresas").select("*").eq("id", colaborador.empresa_id).single(),
        supabase.from("perfis_acesso").select("*").eq("id", colaborador.perfil_acesso_id).single(),
      ]);

      setSessao({
        colaborador: colaborador as Colaborador,
        empresa: empresa as Empresa,
        perfil: perfil as PerfilAcesso,
        e_master: false,
      });
      setCarregando(false);
    }

    carregar();

    const supabase = criarClienteNavegador();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      carregar();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { sessao, carregando };
}
