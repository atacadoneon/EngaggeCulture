"use client";

import { cn } from "@/lib/utils";

interface TabItem {
  id: string;
  label: string;
  contagem?: number;
}

interface TabsProps {
  itens: TabItem[];
  ativo: string;
  onChange: (id: string) => void;
}

export function Tabs({ itens, ativo, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-zinc-800">
      {itens.map((item) => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            ativo === item.id
              ? "border-violet-500 text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
          )}
        >
          {item.label}
          {item.contagem !== undefined && (
            <span className={cn(
              "ml-2 text-xs px-1.5 py-0.5 rounded-full",
              ativo === item.id ? "bg-violet-500/20 text-violet-400" : "bg-zinc-800 text-zinc-500"
            )}>
              {item.contagem.toLocaleString("pt-BR")}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
