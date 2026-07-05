import { DespesaFixaForm } from '../form'

export default function NovaDespesaFixaPage() {
  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10 max-w-[640px]">
      <div className="mb-7">
        <h1 className="font-newsreader text-[28px] font-semibold tracking-tight leading-tight">
          Nova despesa fixa
        </h1>
        <p className="text-sm text-muted mt-1">
          Cadastre uma despesa mensal recorrente — ela vira uma pendência automática todo mês.
        </p>
      </div>

      <div className="bg-card border border-border rounded-[18px] p-7">
        <DespesaFixaForm />
      </div>
    </div>
  )
}
