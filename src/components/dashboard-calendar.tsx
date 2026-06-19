import Link from 'next/link'
import { ArrowRightIcon, ChevronDownIcon } from '@/components/icons'

const STATUS_COLOR: Record<string, string> = {
  agendado: '#6d5ae6',
  confirmado: '#6d5ae6',
  em_atendimento: '#f5a623',
  concluido: '#2fb98a',
  faltou: '#f06a6a',
  cancelado: '#f06a6a',
}

type Event = {
  id: string
  hora_inicio: string
  hora_fim: string
  status: string
  paciente_nome: string
  tipo_nome: string | null
}

function mondayOf(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

const WEEKDAYS = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM']

export function DashboardCalendar({
  events,
  weekDots,
}: {
  events: Event[]
  weekDots: Record<string, string | null>
}) {
  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)
  const monday = mondayOf(today)
  const monthLabel = today.toLocaleDateString('pt-BR', { month: 'long' })
  const todayLabelShort = today.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' }).toUpperCase().replace('.', '')

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })

  return (
    <div className="bg-card border border-border rounded-[18px] p-[18px]" style={{ boxShadow: '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-newsreader font-semibold text-[19px] text-text">Minha agenda</div>
        <button className="inline-flex items-center gap-[5px] text-[12.5px] font-semibold text-[#5b4bd4] bg-[#f1eefb] px-[11px] py-1.5 rounded-[9px] capitalize">
          {monthLabel}
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex justify-between">
        {days.map((d, i) => {
          const iso = d.toISOString().slice(0, 10)
          const isToday = iso === todayISO
          const dot = weekDots[iso]
          const isWeekend = i >= 5
          return (
            <Link
              key={i}
              href={`/agenda?view=day&date=${iso}`}
              className="flex flex-col items-center gap-[7px] group"
            >
              <span className={`text-[10px] font-bold ${isToday ? 'text-[#5b4bd4]' : 'text-[#b4b1a9]'}`}>{WEEKDAYS[i]}</span>
              <span
                className={`w-9 h-11 rounded-[13px] flex items-center justify-center text-sm font-semibold transition-all ${
                  isToday
                    ? 'text-white font-bold'
                    : isWeekend
                      ? 'text-[#cbc8c1] bg-soft group-hover:bg-border'
                      : 'text-[#5a5853] bg-soft group-hover:bg-border'
                }`}
                style={isToday ? { background: 'linear-gradient(160deg,#6d5ae6,#8472f2)' } : undefined}
              >
                {d.getDate()}
              </span>
              <span
                className="w-[5px] h-[5px] rounded-full"
                style={{ background: dot ?? 'transparent' }}
              />
            </Link>
          )
        })}
      </div>

      <div className="flex justify-between items-center border-t border-border pt-3.5 mt-4">
        <span className="text-[11px] font-bold tracking-[0.1em] text-muted">HOJE · {todayLabelShort}</span>
        <Link href="/agenda?view=day" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-text transition-colors">
          ver tudo
          <ArrowRightIcon className="w-[13px] h-[13px]" />
        </Link>
      </div>

      <div className="flex flex-col gap-[9px] mt-3.5 max-h-[280px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted">Sem consultas hoje ☕</div>
        ) : (
          events.map((ev) => {
            const color = STATUS_COLOR[ev.status] ?? '#7aa6d6'
            return (
              <Link
                key={ev.id}
                href={`/agenda/${ev.id}`}
                className="flex items-center gap-3 bg-soft rounded-[13px] p-[11px_13px] hover:bg-border/40 transition-colors"
                style={{ borderLeft: `3px solid ${color}` }}
              >
                <span className="text-[12.5px] font-bold text-text w-[42px]">{ev.hora_inicio.slice(0, 5)}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-text leading-tight truncate">{ev.paciente_nome}</div>
                  {ev.tipo_nome && <div className="text-[11px] text-muted truncate">{ev.tipo_nome}</div>}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
