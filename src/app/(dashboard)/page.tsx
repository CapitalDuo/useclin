import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/kpi-card'
import { CalendarIcon, WalletIcon } from '@/components/icons'
import { DonutChart, WeekChart, type WeekPoint } from '@/components/dashboard-charts'
import { DashboardHero } from '@/components/dashboard-hero'
import { DashboardCalendar } from '@/components/dashboard-calendar'

const TZ = 'America/Sao_Paulo'

function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
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
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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

const CARD_SHADOW = '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()
  const nowTime = new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const firstOfMonth = today.slice(0, 7) + '-01'
  const [ty, tm, td] = today.split('-').map(Number)
  const monday = mondayOf(new Date(ty, tm - 1, td))
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

  const weekPoints: WeekPoint[] = []
  const weekDots: Record<string, string | null> = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const iso = isoDate(d)
    const dayAppts = (weekAppts ?? []).filter((a) => a.data === iso)
    weekPoints.push({ label: WEEK_LABELS[i], value: dayAppts.length })
    if (dayAppts.length === 0) {
      weekDots[iso] = null
    } else {
      const priorities = ['em_atendimento', 'agendado', 'confirmado', 'concluido', 'cancelado', 'faltou']
      const found = priorities.find((p) => dayAppts.some((a) => a.status === p))
      weekDots[iso] = STATUS_COLOR_FOR_DOT[found ?? 'agendado'] ?? '#6d5ae6'
    }
  }

  const userName = prof?.nome ?? user.email ?? 'Doutor(a)'

  return (
    <div className="px-8 py-6 flex flex-col gap-[22px] max-w-[1500px] w-full mx-auto min-w-0">

      {/* Barra de ações — acima do hero */}
      <div className="flex items-center gap-3">
        <Link
          href="/agenda?new=1"
          className="inline-flex items-center gap-2 bg-[#5b4bd4] text-white px-5 py-2.5 rounded-[12px] text-[14px] font-semibold hover:bg-[#4f40c0] transition-colors shadow-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova consulta
        </Link>
        <Link
          href="/agenda"
          className="inline-flex items-center gap-2 border border-[#5b4bd4]/30 text-[#5b4bd4] px-5 py-2.5 rounded-[12px] text-[14px] font-semibold hover:bg-[#f1eefb] transition-colors"
        >
          Ver agenda
        </Link>
      </div>

      <div className="flex gap-[26px] items-start">

        {/* Coluna principal */}
        <div className="flex-1 flex flex-col gap-[22px] min-w-0">
          <DashboardHero
            userName={userName}
            consultasHoje={kpis?.consultas_hoje ?? 0}
            proximaHora={proxima ? formatHora(proxima.hora_inicio) : null}
          />

          {/* KPIs — 3 cards compactos abaixo do hero */}
          <div className="grid grid-cols-3 gap-4">
            <KpiCard
              icon={<CalendarIcon className="w-[18px] h-[18px]" />}
              label="Consultas hoje"
              value={String(kpis?.consultas_hoje ?? 0)}
              color="purple"
              sparkline="up"
            />
            <KpiCard
              icon={<WalletIcon className="w-[18px] h-[18px]" />}
              label="Faturamento"
              value={`R$ ${((Number(kpis?.receita_mensal ?? 0)) / 1000).toFixed(1).replace('.', ',')}k`}
              color="orange"
              sparkline="flat"
              valueSmall
            />
            {/* Consultas por status — compacto, no lugar do 3º KPI */}
            <div
              className="bg-[#f1eefb] border border-[#e7e1fa] rounded-[18px] p-[14px_14px_14px] relative overflow-hidden"
            >
              <div className="text-[11.5px] font-semibold text-[#7c6fae] mb-2.5">Consultas por status</div>
              <DonutChart data={statusChart} compact />
            </div>
          </div>

          {/* Gráfico semanal + Minha Agenda lado a lado */}
          <div className="grid grid-cols-2 gap-[22px]">
            <div className="bg-card border border-border rounded-[18px] p-5" style={{ boxShadow: CARD_SHADOW }}>
              <div className="flex justify-between items-center mb-3.5">
                <div className="font-newsreader font-semibold text-[17px] text-text">Atendimentos da semana</div>
                <div className="flex gap-1.5">
                  <span className="text-[11px] font-semibold text-[#5b4bd4] bg-[#f1eefb] px-2.5 py-1 rounded-[8px]">Semana</span>
                  <span className="text-[11px] font-semibold text-muted px-2.5 py-1 rounded-[8px]">Mês</span>
                </div>
              </div>
              <WeekChart points={weekPoints} />
            </div>

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
          </div>
        </div>

        {/* Coluna lateral — Avisos */}
        <aside className="w-[300px] flex-none flex flex-col gap-[18px]">
          <div className="bg-card border border-border rounded-[18px] p-[18px]" style={{ boxShadow: CARD_SHADOW }}>
            <div className="font-newsreader font-semibold text-[18px] text-text mb-3">Avisos</div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-start gap-3 bg-[#f1eefb] rounded-[13px] px-3.5 py-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-[#6d5ae6] flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3 h-3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <div className="text-[13px] font-semibold text-[#2c2456] leading-snug">Bem-vindo ao Useclin!</div>
                  <div className="text-[11.5px] text-[#7c6fae] mt-0.5">Os avisos da clínica aparecerão aqui.</div>
                </div>
              </div>
              <div className="text-center py-4 text-[12px] text-muted">
                Nenhum aviso no momento.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
