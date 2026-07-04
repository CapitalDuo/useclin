function SecaoEmConstrucao({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-8">
      <h2 className="font-playfair text-lg font-bold tracking-tight">{titulo}</h2>
      <p className="text-sm text-muted mt-1">{descricao}</p>
      <div className="mt-5 rounded-[12px] border border-dashed border-border py-10 text-center text-sm text-muted">
        Em construção
      </div>
    </div>
  )
}

export default function PediatriaPage() {
  return (
    <>
      <div className="px-10 pt-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Pediatria Completa</h1>
        <p className="text-sm text-muted mt-0.5">Ferramentas específicas para o acompanhamento pediátrico.</p>
      </div>
      <div className="px-10 py-6 flex flex-col gap-5">
        <SecaoEmConstrucao
          titulo="Curvas de crescimento"
          descricao="Peso, altura e perímetro cefálico plotados por idade (percentis)."
        />
        <SecaoEmConstrucao
          titulo="Marcos de desenvolvimento"
          descricao="Checklist de desenvolvimento motor e cognitivo por faixa etária."
        />
      </div>
    </>
  )
}
