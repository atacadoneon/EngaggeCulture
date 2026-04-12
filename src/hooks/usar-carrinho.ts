"use client";

import { create } from "zustand";

export interface ItemCarrinho {
  id: string;
  nome: string;
  imagem?: string;
  preco: number;
  quantidade: number;
  categoria: string;
  sku?: string;
}

interface CarrinhoState {
  itens: ItemCarrinho[];
  adicionarItem: (item: Omit<ItemCarrinho, "quantidade">, quantidade?: number) => void;
  removerItem: (id: string) => void;
  atualizarQuantidade: (id: string, quantidade: number) => void;
  limparCarrinho: () => void;
  totalItens: () => number;
  totalValor: () => number;
}

export const usarCarrinho = create<CarrinhoState>((set, get) => ({
  itens: [],

  adicionarItem: (item, quantidade = 1) => {
    set((state) => {
      const existente = state.itens.find((i) => i.id === item.id);
      if (existente) {
        return {
          itens: state.itens.map((i) =>
            i.id === item.id ? { ...i, quantidade: i.quantidade + quantidade } : i
          ),
        };
      }
      return { itens: [...state.itens, { ...item, quantidade }] };
    });
  },

  removerItem: (id) => {
    set((state) => ({ itens: state.itens.filter((i) => i.id !== id) }));
  },

  atualizarQuantidade: (id, quantidade) => {
    if (quantidade <= 0) {
      get().removerItem(id);
      return;
    }
    set((state) => ({
      itens: state.itens.map((i) => (i.id === id ? { ...i, quantidade } : i)),
    }));
  },

  limparCarrinho: () => set({ itens: [] }),

  totalItens: () => get().itens.reduce((a, i) => a + i.quantidade, 0),

  totalValor: () => get().itens.reduce((a, i) => a + i.preco * i.quantidade, 0),
}));
