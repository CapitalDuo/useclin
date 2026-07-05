// Valor de uma medição com o badge de percentil — usado na aba Crescimento
// do paciente e nas Fichas de atendimento.
import { percentil, type Medida, type Sexo } from '@/lib/growth'

export function MedidaValor({
  medida,
  valor,
  unidade,
  sexo,
  idade,
}: {
  medida: Medida
  valor: number | null
  unidade: string
  sexo: Sexo
  idade: number
}) {
  if (valor == null) return <span className="text-muted">—</span>
  const p = percentil(medida, sexo, idade, valor)
  return (
    <span>
      <span className="font-semibold">
        {String(valor).replace('.', ',')} {unidade}
      </span>
      {p !== null && (
        <span className="text-[11px] font-semibold text-[#5b4bd4] bg-[#f0edfb] rounded-md px-1.5 py-0.5 ml-2">
          P{Math.round(p)}
        </span>
      )}
    </span>
  )
}
