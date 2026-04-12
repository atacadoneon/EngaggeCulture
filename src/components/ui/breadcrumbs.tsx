"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  itens: BreadcrumbItem[];
}

export function Breadcrumbs({ itens }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-zinc-500 mb-4">
      <Link href="/painel" className="hover:text-white transition-colors">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {itens.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-zinc-700" />
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-300 font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
