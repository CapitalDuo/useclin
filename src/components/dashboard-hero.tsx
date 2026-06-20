import Link from 'next/link'
import { CalendarIcon } from '@/components/icons'

function greeting(hour: number) {
  return hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
}

function leafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#d8e9c4" strokeWidth="2" className="w-6 h-6 inline-block ml-2 align-middle">
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
  const hour = now.getHours()
  const firstName = userName.split(' ').slice(0, 2).join(' ')
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  const subtitle = consultasHoje > 0
    ? `Você tem ${consultasHoje} consulta${consultasHoje === 1 ? '' : 's'} hoje${proximaHora ? `. A próxima é às ${proximaHora}.` : '.'}`
    : 'Sem consultas hoje. Bom momento pra revisar pacientes.'

  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-[30px_32px] text-white"
      style={{ background: 'linear-gradient(125deg,#5546c9 0%,#6d5ae6 52%,#8472f2 100%)' }}
    >
      <div className="relative z-10 max-w-[640px]">
        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 px-3 py-1.5 rounded-[11px] text-xs font-semibold capitalize">
          <CalendarIcon className="w-3.5 h-3.5" />
          {dateStr} · {timeStr}
        </div>
        <h1 className="font-newsreader font-semibold text-[35px] leading-tight mt-4 mb-2 flex items-center">
          {greeting(hour)}, {firstName}!{leafIcon()}
        </h1>
        <p className="text-[14.5px] text-white/80 leading-relaxed mb-5">
          {consultasHoje > 0 ? (
            <>
              Você tem <strong className="font-bold">{consultasHoje} consulta{consultasHoje === 1 ? '' : 's'}</strong>{' '}
              hoje{proximaHora && <>. A próxima é às {proximaHora}.</>}
            </>
          ) : (
            subtitle
          )}
        </p>
        <div className="flex gap-3">
          <Link
            href="/agenda?new=1"
            className="inline-flex items-center gap-2 bg-white text-[#3a2fae] px-[22px] py-[13px] rounded-[13px] text-[14.5px] font-bold shadow-lg hover:-translate-y-px transition-transform"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-[18px] h-[18px]">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova consulta
          </Link>
          <Link
            href="/agenda"
            className="inline-flex items-center gap-2 bg-white/15 border border-white/25 text-white px-5 py-[13px] rounded-[13px] text-[14.5px] font-semibold hover:bg-white/20 transition-colors"
          >
            Ver agenda
          </Link>
        </div>
      </div>
    </div>
  )
}
