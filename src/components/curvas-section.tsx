// Curvas de crescimento com seletor de medida — usado na tela de atendimento
// (/consultas/[id]) e na aba Crescimento do paciente. Server component: os 3
// gráficos são renderizados no servidor e o MedidaTabs só alterna entre eles.
import { idadeEmMeses, type Medida, type Sexo } from '@/lib/growth'
import { GrowthChart } from './growth-chart'
import { MedidaTabs } from './medida-tabs'

export type MedicaoRow = {
  data: string
  peso_kg: number | null
  altura_cm: number | null
  perimetro_cefalico_cm: number | null
}

const MEDIDAS: { key: Medida; label: string; unidade: string; get: (m: MedicaoRow) => number | null }[] = [
  { key: 'peso', label: 'Peso', unidade: 'kg', get: (m) => m.peso_kg },
  { key: 'altura', label: 'Altura', unidade: 'cm', get: (m) => m.altura_cm },
  { key: 'pc', label: 'Perímetro cefálico', unidade: 'cm', get: (m) => m.perimetro_cefalico_cm },
]

export function CurvasSection({
  medicoes,
  sexo,
  nascimento,
}: {
  medicoes: MedicaoRow[]
  sexo: Sexo
  nascimento: string
}) {
  const abas = MEDIDAS.map((md) => {
    const pontos = medicoes
      .map((m) => ({ idade: idadeEmMeses(nascimento, m.data), valor: md.get(m) }))
      .filter((p): p is { idade: number; valor: number } => p.valor != null)

    return {
      label: md.label,
      conteudo:
        pontos.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-border py-10 text-center text-sm text-muted">
            Sem medições de {md.label.toLowerCase()} ainda.
          </div>
        ) : (
          <GrowthChart medida={md.key} sexo={sexo} pontos={pontos} unidade={md.unidade} />
        ),
    }
  })

  return (
    <div>
      <MedidaTabs abas={abas} />
      <p className="text-[11px] text-muted mt-3">
        Referência OMS (0–2 anos) e CDC (2+) · percentis P3 · P15 · P50 · P85 · P97 ·{' '}
        {sexo === 'M' ? 'menino' : 'menina'}
      </p>
    </div>
  )
}
