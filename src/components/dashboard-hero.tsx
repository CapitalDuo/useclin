import { CalendarIcon } from '@/components/icons'
import { TZ } from '@/lib/date'

function greeting(hour: number) {
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
}

function leafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#d8e9c4" strokeWidth="2" className="w-5 h-5 inline-block ml-2 align-middle">
      <path d="M11 20A7 7 0 0 1 4 13C4 8 7 4 12 3a7 7 0 0 0 8 8" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}

export function DashboardHero({
  userName,
  consultasHoje,
  proximaHora,
}: {
  userName: string
  consultasHoje: number
  proximaHora: string | null
}) {
  const now = new Date()
  const hour = parseInt(now.toLocaleString('en-US', { timeZone: TZ, hour: 'numeric', hour12: false })) % 24
  const firstName = userName.split(' ').slice(0, 2).join(' ')
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ })

  return (
    <div
      className="relative overflow-hidden rounded-[20px] px-7 py-5 text-white"
      style={{ background: 'linear-gradient(125deg,#5546c9 0%,#6d5ae6 52%,#8472f2 100%)' }}
    >
      <div className="relative z-10 flex items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1 rounded-[9px] text-[11px] font-semibold capitalize mb-3">
            <CalendarIcon className="w-3 h-3" />
            {dateStr} · {timeStr}
          </div>
          <h1 className="font-newsreader font-semibold text-[28px] leading-tight flex items-center">
            {greeting(hour)}, {firstName}!{leafIcon()}
          </h1>
          <p className="text-[13px] text-white/75 mt-1">
            {consultasHoje > 0 ? (
              <>
                Você tem <strong className="font-bold">{consultasHoje} consulta{consultasHoje === 1 ? '' : 's'}</strong>{' '}
                hoje{proximaHora && <>. Próxima às {proximaHora}.</>}
              </>
            ) : (
              'Sem consultas hoje. Bom momento pra revisar pacientes.'
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
