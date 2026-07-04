import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { idadeEmMeses, type Medida, type Sexo } from '@/lib/growth'
import { GrowthChart } from '@/components/growth-chart'
import { PacienteSelect } from './paciente-select'

const MEDIDAS: { key: Medida; label: string; unidade: string }[] = [
  { key: 'peso', label: 'Peso', unidade: 'kg' },
  { key: 'altura', label: 'Altura', unidade: 'cm' },
  { key: 'pc', label: 'Perímetro cefálico', unidade: 'cm' },
]

export default async function CurvasCrescimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ paciente?: string; medida?: string }>
}) {
  const { paciente: pacienteId, medida: medidaRaw } = await searchParams
  const medida: Medida = medidaRaw === 'altura' || medidaRaw === 'pc' ? medidaRaw : 'peso'
  const medidaInfo = MEDIDAS.find((m) => m.key === medida)!

  const supabase = await createClient()

  // Elegíveis pras curvas: têm sexo + nascimento (RLS já isola por clínica)
  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, nome, sexo, data_nascimento')
    .not('sexo', 'is', null)
    .not('data_nascimento', 'is', null)
    .eq('protegido', false)
    .order('nome')

  const elegiveis = pacientes ?? []
  const selecionado = elegiveis.find((p) => p.id === pacienteId) ?? null

  const { data: medicoes } = selecionado
    ? await supabase
        .from('medicoes_pediatricas')
        .select('data, peso_kg, altura_cm, perimetro_cefalico_cm')
        .eq('paciente_id', selecionado.id)
        .order('data')
    : { data: null }

  const pontos = (medicoes ?? [])
    .map((m) => ({
      idade: idadeEmMeses(selecionado!.data_nascimento!, m.data),
      valor: medida === 'peso' ? m.peso_kg : medida === 'altura' ? m.altura_cm : m.perimetro_cefalico_cm,
    }))
    .filter((p): p is { idade: number; valor: number } => p.valor != null)

  return (
    <div className="max-w-[900px] flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <PacienteSelect pacientes={elegiveis} value={selecionado?.id ?? ''} />

        {/* seletor de medida preserva o paciente na URL */}
        <div className="flex items-center gap-1.5">
          {MEDIDAS.map((m) => (
            <Link
              key={m.key}
              href={`/pediatria?${new URLSearchParams({
                ...(selecionado ? { paciente: selecionado.id } : {}),
                medida: m.key,
              }).toString()}`}
              className={`px-4 py-2 rounded-[11px] text-[13px] font-semibold transition-colors ${
                m.key === medida
                  ? 'bg-text text-white'
                  : 'border border-border text-muted hover:text-text hover:bg-bg'
              }`}
            >
              {m.label}
            </Link>
          ))}
        </div>
      </div>

      {elegiveis.length === 0 ? (
        <div className="bg-card border border-border rounded-[14px] p-8 text-center text-sm text-muted">
          Nenhum paciente com <strong>sexo</strong> e <strong>data de nascimento</strong> preenchidos ainda —
          complete o cadastro dos pacientes para acompanhar as curvas.
        </div>
      ) : !selecionado ? (
        <div className="bg-card border border-border rounded-[14px] p-8 text-center text-sm text-muted">
          Selecione um paciente para ver as curvas de crescimento.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[14px] p-6">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h2 className="font-playfair text-lg font-bold tracking-tight">
                {medidaInfo.label} × idade — {selecionado.sexo === 'M' ? 'menino' : 'menina'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                Referência OMS (0–2 anos) e CDC (2+) · percentis P3 · P15 · P50 · P85 · P97
              </p>
            </div>
            <Link
              href={`/pacientes/${selecionado.id}/crescimento`}
              className="text-xs font-semibold text-[#5b4bd4] hover:underline"
            >
              Registrar medição →
            </Link>
          </div>

          {pontos.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border py-10 text-center text-sm text-muted">
              Sem medições de {medidaInfo.label.toLowerCase()} pra este paciente ainda.
            </div>
          ) : (
            <GrowthChart medida={medida} sexo={selecionado.sexo as Sexo} pontos={pontos} unidade={medidaInfo.unidade} />
          )}
        </div>
      )}
    </div>
  )
}
