import Link from 'next/link'
import { ArrowRightIcon, ChevronDownIcon } from '@/components/icons'
import { mondayOf } from '@/lib/date'

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
    <div className="bg-card border border-border rounded-[18px] p-[18px] flex flex-col" style={{ boxShadow: '0 1px 2px rgba(28,27,26,.04),0 10px 26px rgba(28,27,26,.035)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="font-newsreader font-semibold text-[17px] text-text">Minha agenda</div>
        <button className="inline-flex items-center gap-[5px] text-[12px] font-semibold text-[#5b4bd4] bg-[#f1eefb] px-[10px] py-1 rounded-[8px] capitalize">
          {monthLabel}
          <ChevronDownIcon className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-3.5 flex-1 min-h-0">
        {/* Esquerda: faixa da semana */}
        <div className="flex flex-col justify-between flex-none">
          <div className="flex gap-1">
            {days.map((d, i) => {
              const iso = d.toISOString().slice(0, 10)
              const isToday = iso === todayISO
              const dot = weekDots[iso]
              const isWeekend = i >= 5
              return (
                <Link
                  key={i}
                  href={`/agenda?view=day&date=${iso}`}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className={`text-[9px] font-bold ${isToday ? 'text-[#5b4bd4]' : 'text-[#b4b1a9]'}`}>{WEEKDAYS[i]}</span>
                  <span
                    className={`w-8 h-10 rounded-[11px] flex items-center justify-center text-[13px] font-semibold transition-all ${
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
          <span className="text-[11px] font-bold tracking-[0.1em] text-muted mt-3">HOJE · {todayLabelShort}</span>
        </div>

        {/* Divisória vertical */}
        <div className="w-px bg-border flex-none self-stretch" />

        {/* Direita: consultas do dia */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex justify-end mb-2">
            <Link href="/agenda?view=day" className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-text transition-colors">
              ver tudo
              <ArrowRightIcon className="w-[13px] h-[13px]" />
            </Link>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0">
            {events.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-center text-xs text-muted">Sem consultas hoje ☕</div>
            ) : (
              events.map((ev) => {
                const color = STATUS_COLOR[ev.status] ?? '#7aa6d6'
                return (
                  <Link
                    key={ev.id}
                    href={`/agenda?edit=${ev.id}`}
                    className="flex items-center gap-2.5 bg-soft rounded-[11px] p-[9px_11px] hover:bg-border/40 transition-colors"
                    style={{ borderLeft: `3px solid ${color}` }}
                  >
                    <span className="text-[12px] font-bold text-text flex-none">{ev.hora_inicio.slice(0, 5)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12.5px] font-semibold text-text leading-tight truncate">{ev.paciente_nome}</div>
                      {ev.tipo_nome && <div className="text-[10.5px] text-muted truncate">{ev.tipo_nome}</div>}
                    </div>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
