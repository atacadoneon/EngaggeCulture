import { cn } from "@/lib/utils";

const cores: Record<string, string> = {
  violet: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  green: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  red: "bg-red-500/20 text-red-400 border-red-500/30",
  amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  blue: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  zinc: "bg-zinc-700/50 text-zinc-400 border-zinc-600/30",
  pink: "bg-pink-500/20 text-pink-400 border-pink-500/30",
};

interface BadgeProps {
  children: React.ReactNode;
  cor?: keyof typeof cores;
  className?: string;
}

export function Badge({ children, cor = "violet", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        cores[cor],
        className
      )}
    >
      {children}
    </span>
  );
}
