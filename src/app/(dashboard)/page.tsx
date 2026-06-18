import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { KpiCard } from '@/components/kpi-card'
import { CalendarIcon, UsersIcon, DollarIcon, ClockIcon } from '@/components/icons'
import { DonutChart, WeekChart, PatientsChart } from '@/components/dashboard-charts'

const statusStyles = {
  agendado: 'bg-blue/10 text-blue',
  confirmado: 'bg-green-light text-green',
  em_atendimento: 'bg-orange-light text-orange',
  concluido: 'bg-green-light text-green',
  cancelado: 'bg-red-light text-red',
  faltou: 'bg-red-light text-red',
} as const

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite'
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function formatHora(t: string | null) {
  return (t ?? '').slice(0, 5)
}

function formatDataCurta(d: string | null) {
  if (!d) return ''
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function formatBRL(n: number | null) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n ?? 0)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()

  const [{ data: prof }, { data: kpis }, { data: hoje }, { data: proximos }, { data: proxima }] = await Promise.all([
    supabase.from('profissionais').select('nome').eq('user_id', user.id).maybeSingle(),
    supabase.from('v_dashboard_kpis').select('*').maybeSingle(),
    supabase
      .from('v_agenda')
      .select('id, hora_inicio, hora_fim, status, paciente_nome, tipo_nome')
      .eq('data', today)
      .order('hora_inicio', { ascending: true }),
    supabase
      .from('v_agenda')
      .select('id, data, hora_inicio, status, paciente_nome, tipo_nome')
      .gt('data', today)
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(5),
    supabase
      .from('v_agenda')
      .select('hora_inicio, paciente_nome')
      .gte('data', today)
      .in('status', ['agendado', 'confirmado'])
      .order('data', { ascending: true })
      .order('hora_inicio', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const firstName = prof?.nome?.split(' ').slice(0, 2).join(' ') ?? 'Doutor(a)'

  return (
    <>
      <div className="flex items-center justify-between px-10 pt-7">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">{greeting()}, {firstName}</h1>
          <p className="text-sm text-muted mt-0.5">Aqui está o resumo da sua agenda e atendimentos de hoje.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[10px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer">
          + Nova consulta
        </button>
      </div>

      <div className="px-10 pt-7 pb-10">
        <div className="grid grid-cols-4 gap-4 mb-7">
          <KpiCard
            icon={<CalendarIcon className="w-[22px] h-[22px]" />}
            label="Consultas hoje"
            value={String(kpis?.consultas_hoje ?? 0)}
            change={`${kpis?.consultas_mes ?? 0} no mês`}
            color="blue"
          />
          <KpiCard
            icon={<UsersIcon className="w-[22px] h-[22px]" />}
            label="Pacientes ativos"
            value={String(kpis?.pacientes_ativos ?? 0)}
            change={`+${kpis?.pacientes_novos_mes ?? 0} esse mês`}
            color="green"
          />
          <KpiCard
            icon={<DollarIcon className="w-[22px] h-[22px]" />}
            label="Faturamento do mês"
            value={formatBRL(kpis?.receita_mensal ?? 0)}
            change="Receita paga em transações"
            color="orange"
            valueSmall
          />
          <KpiCard
            icon={<ClockIcon className="w-[22px] h-[22px]" />}
            label="Próxima consulta"
            value={proxima ? formatHora(proxima.hora_inicio) : '—'}
            change={proxima?.paciente_nome ?? 'Nada agendado'}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="bg-card border border-border rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-base font-bold">Agenda de hoje</h2>
              <span className="text-[13px] text-muted font-medium cursor-pointer hover:text-text transition-colors">Ver agenda completa</span>
            </div>
            {!hoje || hoje.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted">Sem consultas hoje. Bom dia tranquilo ☕</div>
            ) : (
              <div className="flex flex-col">
                {hoje.map((apt, i) => (
                  <div key={apt.id} className={`flex items-center gap-4 py-3.5 ${i < hoje.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="min-w-[52px]">
                      <div className="text-sm font-bold">{formatHora(apt.hora_inicio)}</div>
                      <div className="text-[11px] text-muted">{formatHora(apt.hora_fim)}</div>
                    </div>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{apt.paciente_nome}</div>
                      <div className="text-xs text-muted">{apt.tipo_nome ?? '—'}</div>
                    </div>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-md ${statusStyles[apt.status as keyof typeof statusStyles] ?? 'bg-bg text-muted'}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-playfair text-base font-bold">Próximos compromissos</h2>
            </div>
            {!proximos || proximos.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted">Nenhum próximo compromisso agendado.</div>
            ) : (
              <div className="flex flex-col">
                {proximos.map((apt, i) => (
                  <div key={apt.id} className={`flex items-center gap-3.5 py-[13px] ${i < proximos.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue" />
                    <div className="flex-1">
                      <div className="text-[13px] font-semibold">{apt.tipo_nome ?? 'Consulta'}</div>
                      <div className="text-xs text-muted">{apt.paciente_nome}</div>
                    </div>
                    <div className="text-xs text-muted font-medium whitespace-nowrap">
                      {formatDataCurta(apt.data)}, {formatHora(apt.hora_inicio)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="bg-card border border-border rounded-[14px] p-6 relative">
            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-muted bg-bg px-2 py-1 rounded">Demo</div>
            <h3 className="font-playfair text-sm font-bold mb-5">Consultas por status</h3>
            <DonutChart />
          </div>
          <div className="bg-card border border-border rounded-[14px] p-6 relative">
            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-muted bg-bg px-2 py-1 rounded">Demo</div>
            <h3 className="font-playfair text-sm font-bold mb-5">Atendimentos da semana</h3>
            <div className="h-[150px]">
              <WeekChart />
            </div>
          </div>
          <div className="bg-card border border-border rounded-[14px] p-6 relative">
            <div className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-muted bg-bg px-2 py-1 rounded">Demo</div>
            <h3 className="font-playfair text-sm font-bold mb-5">Pacientes novos (mês)</h3>
            <div className="font-playfair text-[40px] font-extrabold tracking-tighter leading-none mb-1">{kpis?.pacientes_novos_mes ?? 0}</div>
            <div className="text-xs text-muted font-medium mb-4">este mês</div>
            <div className="h-[90px]">
              <PatientsChart />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
