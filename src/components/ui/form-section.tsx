interface FormSectionProps {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}

export function FormSection({ titulo, descricao, children }: FormSectionProps) {
  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-800 pb-2">
        <h3 className="text-base font-semibold text-white">{titulo}</h3>
        {descricao && <p className="text-sm text-zinc-500 mt-0.5">{descricao}</p>}
      </div>
      <div>{children}</div>
    </div>
  );
}
