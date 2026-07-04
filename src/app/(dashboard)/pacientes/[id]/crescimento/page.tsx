import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient, requireFeature } from '@/lib/supabase/server'
import { idadeEmMeses, percentil, type Medida, type Sexo } from '@/lib/growth'
import { todayISO } from '@/lib/date'
import { NovaMedicaoForm, ExcluirMedicaoButton } from './form'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Idade exibida em meses COMPLETOS de calendário (como pediatras falam),
// não pela média de 30.4375 dias usada no cálculo do percentil.
function formatIdade(nascimento: string, data: string): string {
  const n = new Date(nascimento + 'T00:00:00Z')
  const d = new Date(data + 'T00:00:00Z')
  if (d < n) return '—'
  let meses = (d.getUTCFullYear() - n.getUTCFullYear()) * 12 + (d.getUTCMonth() - n.getUTCMonth())
  if (d.getUTCDate() < n.getUTCDate()) meses--
  if (meses < 1) return `${Math.round((d.getTime() - n.getTime()) / 86400000)} d`
  if (meses < 24) return `${meses} m`
  const anos = Math.floor(meses / 12)
  const resto = meses % 12
  return resto ? `${anos}a ${resto}m` : `${anos}a`
}

function Valor({
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
      <span className="font-semibold">{String(valor).replace('.', ',')} {unidade}</span>
      {p !== null && (
        <span className="text-[11px] font-semibold text-[#5b4bd4] bg-[#f0edfb] rounded-md px-1.5 py-0.5 ml-2">
          P{Math.round(p)}
        </span>
      )}
    </span>
  )
}

export default async function CrescimentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireFeature('pediatria_completa')
  const supabase = await createClient()

  const [{ data: paciente }, { data: medicoes }] = await Promise.all([
    supabase.from('pacientes').select('id, sexo, data_nascimento').eq('id', id).maybeSingle(),
    supabase
      .from('medicoes_pediatricas')
      .select('id, data, peso_kg, altura_cm, perimetro_cefalico_cm')
      .eq('paciente_id', id)
      .order('data', { ascending: false }),
  ])

  if (!paciente) notFound()

  if (!paciente.sexo || !paciente.data_nascimento) {
    return (
      <div className="max-w-[860px] bg-card border border-border rounded-[14px] p-8 text-center">
        <p className="text-sm text-muted">
          Para acompanhar o crescimento, preencha <strong>sexo</strong> e <strong>data de nascimento</strong> do paciente.
        </p>
        <Link
          href={`/pacientes/${id}/editar`}
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all"
        >
          Completar cadastro →
        </Link>
      </div>
    )
  }

  const sexo = paciente.sexo as Sexo
  const nascimento = paciente.data_nascimento
  const rows = medicoes ?? []

  return (
    <div className="max-w-[860px] flex flex-col gap-6">
      <NovaMedicaoForm pacienteId={id} hoje={todayISO()} />

      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted">
            {rows.length} {rows.length === 1 ? 'medição' : 'medições'}
          </div>
          {rows.length > 0 && (
            <Link href={`/pediatria?paciente=${id}`} className="text-xs font-semibold text-[#5b4bd4] hover:underline">
              Ver curvas de crescimento →
            </Link>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="text-center py-10 text-sm text-muted bg-card border border-border rounded-[14px]">
            Nenhuma medição registrada ainda.
          </div>
        ) : (
          <div className="bg-card border border-border rounded-[14px] overflow-hidden">
            <div className="grid grid-cols-[100px_70px_1fr_1fr_1fr_36px] gap-2 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-border">
              <span>Data</span>
              <span>Idade</span>
              <span>Peso</span>
              <span>Altura</span>
              <span>Perím. cef.</span>
              <span />
            </div>
            {rows.map((m) => {
              const idade = idadeEmMeses(nascimento, m.data)
              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[100px_70px_1fr_1fr_1fr_36px] gap-2 px-5 py-3.5 items-center text-sm border-b border-border last:border-0"
                >
                  <span className="font-semibold">{formatDate(m.data)}</span>
                  <span className="text-muted">{formatIdade(nascimento, m.data)}</span>
                  <Valor medida="peso" valor={m.peso_kg} unidade="kg" sexo={sexo} idade={idade} />
                  <Valor medida="altura" valor={m.altura_cm} unidade="cm" sexo={sexo} idade={idade} />
                  <Valor medida="pc" valor={m.perimetro_cefalico_cm} unidade="cm" sexo={sexo} idade={idade} />
                  <ExcluirMedicaoButton id={m.id} pacienteId={id} />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
