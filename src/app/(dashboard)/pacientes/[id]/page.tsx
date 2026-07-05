import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { formatBrl } from '@/lib/currency'
import { todayISO } from '@/lib/date'
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/agendamento-status'

type Consulta = {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  status: string
  valor: number | null
  notas: string | null
  tipo_nome: string | null
  tipo_cor: string | null
  prof_nome: string | null
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const hhmm = (t: string) => t.slice(0, 5)

export default async function ConsultasPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select('id, data, hora_inicio, hora_fim, status, valor, notas, tipo_consulta_id, profissional_id')
    .eq('paciente_id', id)
    .order('data', { ascending: false })
    .order('hora_inicio', { ascending: false })

  const rows = agendamentos ?? []

  const tipoIds = Array.from(new Set(rows.map((r) => r.tipo_consulta_id).filter((v): v is string => !!v)))
  const profIds = Array.from(new Set(rows.map((r) => r.profissional_id)))

  const [{ data: tipos }, { data: profs }] = await Promise.all([
    tipoIds.length
      ? supabase.from('tipos_consulta').select('id, nome, cor').in('id', tipoIds)
      : Promise.resolve({ data: [] as { id: string; nome: string; cor: string }[] }),
    profIds.length
      ? supabase.from('profissionais').select('id, nome').in('id', profIds)
      : Promise.resolve({ data: [] as { id: string; nome: string }[] }),
  ])

  const tipoById = new Map((tipos ?? []).map((t) => [t.id, t]))
  const profById = new Map((profs ?? []).map((p) => [p.id, p.nome]))

  const consultas: Consulta[] = rows.map((r) => {
    const tipo = r.tipo_consulta_id ? tipoById.get(r.tipo_consulta_id) : undefined
    return {
      id: r.id,
      data: r.data,
      hora_inicio: r.hora_inicio,
      hora_fim: r.hora_fim,
      status: r.status,
      valor: r.valor,
      notas: r.notas,
      tipo_nome: tipo?.nome ?? null,
      tipo_cor: tipo?.cor ?? null,
      prof_nome: profById.get(r.profissional_id) ?? null,
    }
  })

  const hoje = todayISO()
  const proximas = consultas
    .filter((c) => c.data >= hoje)
    .sort((a, b) => (a.data + a.hora_inicio).localeCompare(b.data + b.hora_inicio))
  const anteriores = consultas.filter((c) => c.data < hoje) // já em ordem desc

  return (
    <div className="max-w-[860px]">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">
          {consultas.length} consulta{consultas.length === 1 ? '' : 's'} registrada{consultas.length === 1 ? '' : 's'}
        </p>
        <Link
          href={`/agenda/novo?paciente=${id}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
        >
          + Nova consulta
        </Link>
      </div>

      {consultas.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted bg-card border border-border rounded-[14px]">
          Nenhuma consulta registrada ainda. Use "Nova consulta" para agendar a primeira.
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          {proximas.length > 0 && <Grupo titulo="Próximas" consultas={proximas} pacienteId={id} />}
          {anteriores.length > 0 && <Grupo titulo="Anteriores" consultas={anteriores} pacienteId={id} />}
        </div>
      )}
    </div>
  )
}

function Grupo({ titulo, consultas, pacienteId }: { titulo: string; consultas: Consulta[]; pacienteId: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5">{titulo}</div>
      <div className="flex flex-col gap-2.5">
        {consultas.map((c) => (
          <ConsultaItem key={c.id} c={c} pacienteId={pacienteId} />
        ))}
      </div>
    </div>
  )
}

function ConsultaItem({ c, pacienteId }: { c: Consulta; pacienteId: string }) {
  const cor = STATUS_COLORS[c.status] ?? '#6d5ae6'
  const label = STATUS_LABEL[c.status] ?? c.status

  return (
    <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-[14px] px-5 py-4 hover:border-text hover:shadow-sm transition-all">
      <Link
        href={`/agenda?edit=${c.id}`}
        className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1 min-w-[240px] cursor-pointer"
      >
        <div className="w-[88px] flex-shrink-0">
          <div className="text-sm font-semibold">{formatDate(c.data)}</div>
          <div className="text-xs text-muted mt-0.5">{hhmm(c.hora_inicio)}–{hhmm(c.hora_fim)}</div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.tipo_cor ?? '#cdcbc4' }} />
            <span className="text-sm font-semibold truncate">{c.tipo_nome ?? 'Consulta'}</span>
          </div>
          <div className="text-xs text-muted mt-0.5 truncate">
            {c.prof_nome ?? '—'}
            {c.notas ? ` · ${c.notas}` : ''}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {c.valor != null && <span className="text-sm font-semibold">{formatBrl(c.valor)}</span>}
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
            style={{ backgroundColor: `${cor}1a`, color: cor }}
          >
            {label}
          </span>
        </div>
      </Link>

      <Link
        href={`/pacientes/${pacienteId}/prescricoes/nova?de=${c.id}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-[10px] border border-border hover:bg-bg hover:border-[#5b4bd4] hover:text-[#5b4bd4] text-muted transition-colors whitespace-nowrap flex-shrink-0"
        title="Gerar prescrição para esta consulta"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
          <path d="M9 12h6m-3-3v6M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Prescrever
      </Link>
    </div>
  )
}
