import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/kpi-card'
import { CalendarIcon, UsersIcon, VideoIcon, WalletIcon } from '@/components/icons'
import { DonutChart, WeekChart, type WeekPoint } from '@/components/dashboard-charts'
import { DashboardHero } from '@/components/dashboard-hero'
import { DashboardCalendar } from '@/components/dashboard-calendar'
import { DashboardTopbar } from '@/components/dashboard-topbar'
import { DailyGoals } from '@/components/daily-goals'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatHora(t: string | null) {
  return (t ?? '').slice(0, 5)
}

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

const WEEK_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const STATUS_COLOR_FOR_DOT: Record<string, string> = {
  agendado: '#6d5ae6',
  confirmado: '#6d5ae6',
  em_atendimento: '#f5a623',
  concluido: '#2fb98a',
  faltou: '#f06a6a',
  cancelado: '#f06a6a',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()
  const nowTime = new Date().toTimeString().slice(0, 8)
  const firstOfMonth = today.slice(0, 7) + '-01'
  const monday = mondayOf(new Date())
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)

  const [{ data: prof }, { data: kpis }, { data: hoje }, { data: candidates }, { data: monthAppts }, { data: weekAppts }] = await Promise.all([
    supabase.from('profissionais').select('nome').eq('user_id', user.id).maybeSingle(),
    supabase.from('v_dashboard_kpis').select('*').maybeSingle(),
    supabase
      .from('v_agenda')
      .select('id, hora_inicio, hora_fim, status, paciente_nome, tipo_nome')
      .eq('data', today)
      .order('hora_inicio', { ascending: true }),
    supabase
      .from('v_agenda')
      .select('data, hora_inicio, paciente_nome')
      .gte('data', today)
      .in('status', ['agendado', 'confirmado'])
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(20),
    supabase
      .from('agendamentos')
      .select('status')
      .gte('data', firstOfMonth),
    supabase
      .from('agendamentos')
      .select('data, status')
      .gte('data', isoDate(monday))
      .lte('data', isoDate(sunday)),
  ])

  const proxima = candidates?.find(
    (c) => (c.data ?? '') > today || ((c.data ?? '') === today && (c.hora_inicio ?? '') >= nowTime),
  ) ?? null

  const statusBuckets = { agendado: 0, em_atendimento: 0, concluido: 0, cancelado: 0 }
  for (const a of monthAppts ?? []) {
    if (a.status === 'agendado' || a.status === 'confirmado') statusBuckets.agendado++
    else if (a.status === 'em_atendimento') statusBuckets.em_atendimento++
    else if (a.status === 'concluido') statusBuckets.concluido++
    else if (a.status === 'cancelado' || a.status === 'faltou') statusBuckets.cancelado++
  }
  const statusChart = [
    { label: 'Agendado', value: statusBuckets.agendado, color: '#6d5ae6' },
    { label: 'Em andamento', value: statusBuckets.em_atendimento, color: '#f5a623' },
    { label: 'Finalizado', value: statusBuckets.concluido, color: '#2fb98a' },
    { label: 'Cancelado', value: statusBuckets.cancelado, color: '#f06a6a' },
  ]

  // Weekly chart points (real counts)
  const weekPoints: WeekPoint[] = []
  const weekDots: Record<string, string | null> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = isoDate(d)
    const dayAppts = (weekAppts ?? []).filter((a) => a.data === iso)
    weekPoints.push({ label: WEEK_LABELS[i], value: dayAppts.length })
    // dot color: pick the "highest priority" status of the day (em_atendimento > agendado > concluido)
    if (dayAppts.length === 0) {
      weekDots[iso] = null
    } else {
      const priorities = ['em_atendimento', 'agendado', 'confirmado', 'concluido', 'cancelado', 'faltou']
      const found = priorities.find((p) => dayAppts.some((a) => a.status === p))
      weekDots[iso] = STATUS_COLOR_FOR_DOT[found ?? 'agendado'] ?? '#6d5ae6'
    }
  }

  // Daily goals (compute from data)
  const concluidasHoje = (hoje ?? []).filter((h) => h.status === 'concluido').length
  const totalHoje = (hoje ?? []).length
  const consultasMetaPct = totalHoje > 0 ? Math.round((concluidasHoje / totalHoje) * 100) : 0
  const avaliacoesHoje = (hoje ?? []).filter((h) => /avalia/i.test(h.tipo_nome ?? '')).length
  const avaliacoesPct = totalHoje > 0 ? Math.round((avaliacoesHoje / totalHoje) * 100) : 0
  const retornosHoje = (hoje ?? []).filter((h) => /retorno/i.test(h.tipo_nome ?? '')).length
  const retornosPct = totalHoje > 0 ? Math.round((retornosHoje / totalHoje) * 100) : 0

  const userName = prof?.nome ?? user.email ?? 'Doutor(a)'

  return (
    <div className="px-8 py-6 flex flex-col gap-[22px] max-w-[1500px] w-full mx-auto min-w-0">
      <DashboardTopbar />

      <div className="flex gap-[26px] items-start">
        <div className="flex-1 flex flex-col gap-[22px] min-w-0">
          <DashboardHero
            userName={userName}
            consultasHoje={kpis?.consultas_hoje ?? 0}
            proximaHora={proxima ? formatHora(proxima.hora_inicio) : null}
            consultasOnline={0}
            receitaMes={Number(kpis?.receita_mensal ?? 0)}
          />

          <div className="grid grid-cols-4 gap-4">
            <KpiCard
              icon={<CalendarIcon className="w-[19px] h-[19px]" />}
              label="Consultas hoje"
              value={String(kpis?.consultas_hoje ?? 0)}
              color="purple"
              sparkline="up"
            />
            <KpiCard
              icon={<UsersIcon className="w-[19px] h-[19px]" />}
              label="Pacientes ativos"
              value={String(kpis?.pacientes_ativos ?? 0)}
              color="green"
              sparkline="climb"
            />
            <KpiCard
              icon={<VideoIcon className="w-[19px] h-[19px]" />}
              label="Atend. online"
              value="0"
              color="blue"
              sparkline="wave"
            />
            <KpiCard
              icon={<WalletIcon className="w-[19px] h-[19px]" />}
              label="Faturamento"
              value={`R$ ${((Number(kpis?.receita_mensal ?? 0)) / 1000).toFixed(1).replace('.', ',')}k`}
              color="orange"
              sparkline="flat"
              valueSmall
            />
          </div>

          <div className="bg-card border border-border rounded-[18px] p-5" style={{ boxShadow: '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)' }}>
            <div className="flex justify-between items-center">
              <div className="font-newsreader font-semibold text-[19px] text-text">Atendimentos da semana</div>
              <div className="flex gap-1.5">
                <span className="text-xs font-semibold text-[#5b4bd4] bg-[#f1eefb] px-3 py-1.5 rounded-[9px]">Semana</span>
                <span className="text-xs font-semibold text-muted px-3 py-1.5 rounded-[9px]">Mês</span>
              </div>
            </div>
            <div className="mt-3.5">
              <WeekChart points={weekPoints} />
            </div>
          </div>
        </div>

        <aside className="w-[340px] flex-none flex flex-col gap-[18px]">
          <DashboardCalendar
            events={(hoje ?? []).map((e) => ({
              id: e.id ?? '',
              hora_inicio: e.hora_inicio ?? '00:00',
              hora_fim: e.hora_fim ?? '00:00',
              status: e.status ?? 'agendado',
              paciente_nome: e.paciente_nome ?? '—',
              tipo_nome: e.tipo_nome ?? null,
            }))}
            weekDots={weekDots}
          />

          <div className="bg-card border border-border rounded-[18px] p-[18px]" style={{ boxShadow: '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)' }}>
            <div className="font-newsreader font-semibold text-[18px] text-text mb-3.5">Consultas por status</div>
            <DonutChart data={statusChart} />
          </div>

          <DailyGoals
            goals={[
              { label: 'Consultas concluídas', pct: consultasMetaPct, gradient: 'linear-gradient(90deg,#6d5ae6,#8472f2)' },
              { label: 'Avaliações', pct: avaliacoesPct, gradient: 'linear-gradient(90deg,#2fb98a,#46c89a)' },
              { label: 'Retornos', pct: retornosPct, gradient: 'linear-gradient(90deg,#e7942a,#f5b04d)' },
            ]}
          />
        </aside>
      </div>
    </div>
  )
}
