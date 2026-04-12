import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: "primario" | "secundario" | "fantasma" | "perigo";
  tamanho?: "sm" | "md" | "lg";
}

const variantes = {
  primario: "bg-violet-600 hover:bg-violet-700 text-white",
  secundario: "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
  fantasma: "hover:bg-zinc-800 text-zinc-400 hover:text-white",
  perigo: "bg-red-600 hover:bg-red-700 text-white",
};

const tamanhos = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  children,
  variante = "primario",
  tamanho = "md",
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variantes[variante],
        tamanhos[tamanho],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
