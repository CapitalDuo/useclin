import { createClient, getProfissional } from '@/lib/supabase/server'
import { AgendaCalendar, type AgendaView } from '@/components/agenda-calendar'
import { mondayOf, isoDate, todayBrazil } from '@/lib/date'

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; view?: string; new?: string; edit?: string }>
}) {
  const sp = await searchParams
  const view: AgendaView = sp.view === 'day' ? 'day' : 'week'
  const ref = sp.date ? new Date(sp.date + 'T00:00:00') : todayBrazil()

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
  const { prof } = await getProfissional(supabase)

  const [{ data: eventos }, { data: pacientes }, { data: profissionais }, { data: tipos }, { data: clinica }] = await Promise.all([
    supabase
      .from('v_agenda')
      .select('id, data, hora_inicio, hora_fim, status, notas, paciente_nome, profissional_nome, tipo_nome, tipo_cor')
      .gte('data', isoDate(from))
      .lte('data', isoDate(to))
      .order('data')
      .order('hora_inicio'),
    supabase.from('pacientes').select('id, nome, protegido').eq('status', 'ativo').order('nome'),
    supabase.from('profissionais').select('id, nome, especialidade').eq('ativo', true).order('nome'),
    supabase.from('tipos_consulta').select('id, nome, cor, duracao_padrao').order('nome'),
    prof?.clinica_id
      ? supabase.from('clinica').select('agenda_intervalo_minutos').eq('id', prof.clinica_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10">
      <AgendaCalendar
        view={view}
        anchorISO={isoDate(anchor)}
        intervaloMinutos={clinica?.agenda_intervalo_minutos ?? 60}
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
        pacientes={pacientes ?? []}
        profissionais={profissionais ?? []}
        tipos={tipos ?? []}
      />
    </div>
  )
}
