"use client";

import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icone?: React.ElementType;
  perigo?: boolean;
}

interface DropdownProps {
  itens: DropdownItem[];
}

export function Dropdown({ itens }: DropdownProps) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAberto(!aberto)}
        className="p-1.5 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {aberto && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1">
          {itens.map((item, i) => {
            const Icone = item.icone;
            return (
              <button
                key={i}
                onClick={() => { item.onClick(); setAberto(false); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors text-left",
                  item.perigo
                    ? "text-red-400 hover:bg-red-500/10"
                    : "text-zinc-300 hover:bg-zinc-700"
                )}
              >
                {Icone && <Icone className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
