import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icone?: React.ElementType;
  titulo: string;
  descricao?: string;
  acaoLabel?: string;
  acaoHref?: string;
  acaoOnClick?: () => void;
  className?: string;
}

export function EmptyState({
  icone: Icone = Inbox,
  titulo,
  descricao,
  acaoLabel,
  acaoHref,
  acaoOnClick,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center", className)}>
      <div className="h-16 w-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-4">
        <Icone className="h-8 w-8 text-zinc-600" />
      </div>
      <h3 className="text-base font-semibold text-zinc-300 mb-1">{titulo}</h3>
      {descricao && <p className="text-sm text-zinc-500 max-w-sm">{descricao}</p>}
      {acaoLabel && (acaoHref ? (
        <Link
          href={acaoHref}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {acaoLabel}
        </Link>
      ) : acaoOnClick ? (
        <button
          onClick={acaoOnClick}
          className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {acaoLabel}
        </button>
      ) : null)}
    </div>
  );
}
