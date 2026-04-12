import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  rotulo?: string;
  erro?: string;
  opcoes: { valor: string; texto: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ rotulo, erro, opcoes, placeholder, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {rotulo && (
          <label className="block text-sm font-medium text-zinc-300">
            {rotulo}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-zinc-800 border rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors appearance-none",
            erro ? "border-red-500" : "border-zinc-700",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-zinc-500">
              {placeholder}
            </option>
          )}
          {opcoes.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.texto}
            </option>
          ))}
        </select>
        {erro && <p className="text-red-400 text-xs">{erro}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
