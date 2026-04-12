"use client";

import { usarSessao } from "./usar-sessao";

export function usarPermissao() {
  const { sessao } = usarSessao();

  function temPermissao(permissao: string): boolean {
    if (!sessao) return false;
    if (sessao.e_master) return true;
    const perms = sessao.perfil?.permissoes || [];
    return perms.includes("*") || perms.includes(permissao);
  }

  function ePerfil(...perfis: string[]): boolean {
    if (!sessao) return false;
    return perfis.includes(sessao.perfil?.nome || "");
  }

  return {
    temPermissao,
    ePerfil,
    eAdmin: ePerfil("admin"),
    eGestor: ePerfil("admin", "gestor"),
    eLider: ePerfil("admin", "gestor", "lider"),
    perfil: sessao?.perfil?.nome || null,
  };
}
