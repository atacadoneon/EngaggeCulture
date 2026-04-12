import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  erro?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ rotulo, erro, className, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {rotulo && (
          <label className="block text-sm font-medium text-zinc-300">
            {rotulo}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-zinc-800 border rounded-lg text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors",
            erro ? "border-red-500" : "border-zinc-700",
            className
          )}
          {...props}
        />
        {erro && <p className="text-red-400 text-xs">{erro}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
