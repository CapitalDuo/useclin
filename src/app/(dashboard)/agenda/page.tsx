import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AgendaCalendar, type AgendaView } from '@/components/agenda-calendar'

function mondayOf(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10)
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string }>
}) {
  const sp = await searchParams
  const view: AgendaView = sp.view === 'day' ? 'day' : 'week'
  const ref = sp.date ? new Date(sp.date + 'T00:00:00') : new Date()

  let anchor: Date
  let from: Date
  let to: Date

  if (view === 'week') {
    anchor = mondayOf(ref)
    from = anchor
    to = new Date(anchor)
    to.setDate(anchor.getDate() + 6)
  } else {
    anchor = new Date(ref)
    anchor.setHours(0, 0, 0, 0)
    from = anchor
    to = anchor
  }

  const supabase = await createClient()
  const { data: eventos } = await supabase
    .from('v_agenda')
    .select('id, data, hora_inicio, hora_fim, status, notas, paciente_nome, profissional_nome, tipo_nome, tipo_cor')
    .gte('data', isoDate(from))
    .lte('data', isoDate(to))
    .order('data')
    .order('hora_inicio')

  return (
    <>
      <div className="flex items-center justify-between px-10 pt-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Agenda</h1>
        <Link
          href="/agenda/novo"
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
        >
          + Nova consulta
        </Link>
      </div>
      <div className="px-10 pb-10">
        <AgendaCalendar
          view={view}
          anchorISO={isoDate(anchor)}
          eventos={(eventos ?? []).map((e) => ({
            id: e.id ?? '',
            data: e.data ?? '',
            hora_inicio: e.hora_inicio ?? '00:00',
            hora_fim: e.hora_fim ?? '00:00',
            status: e.status ?? 'agendado',
            notas: e.notas ?? null,
            paciente_nome: e.paciente_nome ?? '—',
            profissional_nome: e.profissional_nome ?? '—',
            tipo_nome: e.tipo_nome ?? null,
            tipo_cor: e.tipo_cor ?? null,
          }))}
        />
      </div>
    </>
  )
}
