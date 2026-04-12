import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded bg-zinc-800", className)} />
  );
}

export function SkeletonTabela({ linhas = 5, colunas = 4 }: { linhas?: number; colunas?: number }) {
  return (
    <div className="space-y-3 p-5">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: colunas }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: linhas }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: colunas }).map((_, j) => (
            <Skeleton key={j} className="h-10 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCards({ quantidade = 4 }: { quantidade?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: quantidade }).map((_, i) => (
        <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 space-y-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}
