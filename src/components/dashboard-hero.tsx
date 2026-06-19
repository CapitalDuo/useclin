import Link from 'next/link'
import { CalendarIcon, VideoIcon, WalletIcon, CheckCircleIcon } from '@/components/icons'

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
  consultasOnline,
  receitaMes,
}: {
  userName: string
  consultasHoje: number
  proximaHora: string | null
  consultasOnline: number
  receitaMes: number
}) {
  const now = new Date()
  const hour = now.getHours()
  const firstName = userName.split(' ').slice(0, 2).join(' ')
  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  const receitaFormatted = receitaMes >= 1000
    ? `R$ ${(receitaMes / 1000).toFixed(1).replace('.', ',')}k`
    : `R$ ${receitaMes.toFixed(0)}`

  const subtitle = consultasHoje > 0
    ? `Você tem ${consultasHoje} consulta${consultasHoje === 1 ? '' : 's'} hoje${proximaHora ? `. A próxima é às ${proximaHora}.` : '.'}`
    : 'Sem consultas hoje. Bom momento pra revisar pacientes.'

  return (
    <div
      className="relative overflow-hidden rounded-[22px] p-[30px_32px] text-white"
      style={{ background: 'linear-gradient(125deg,#5546c9 0%,#6d5ae6 52%,#8472f2 100%)' }}
    >
      <div className="flex justify-between gap-6">
        <div className="relative z-10 max-w-[440px]">
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
              href="/agenda/novo"
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

        <div className="relative w-[250px] flex-none hidden md:block">
          <div className="absolute -right-[10px] -top-[30px] w-[280px] h-[280px] rounded-full border border-white/15" />
          <div className="absolute right-[30px] top-[10px] w-[200px] h-[200px] rounded-full bg-white/[0.07]" />
          <div
            className="absolute left-2 top-[18px] w-[30px] h-[30px] bg-white/55"
            style={{ clipPath: 'polygon(40% 0,60% 0,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%)' }}
          />
          <div
            className="absolute left-[62px] bottom-[30px] w-[18px] h-[18px] bg-white/40"
            style={{ clipPath: 'polygon(40% 0,60% 0,60% 40%,100% 40%,100% 60%,60% 60%,60% 100%,40% 100%,40% 60%,0 60%,0 40%,40% 40%)' }}
          />
          <DoctorIllustration />
        </div>
      </div>

      <div className="flex gap-[10px] mt-[22px] flex-wrap relative z-10">
        <Chip icon={<CheckCircleIcon className="w-[17px] h-[17px]" />} label="Consultas hoje" value={String(consultasHoje)} />
        <Chip icon={<VideoIcon className="w-[17px] h-[17px]" />} label="Online" value={String(consultasOnline)} />
        <Chip icon={<WalletIcon className="w-[17px] h-[17px]" />} label="Receita" value={receitaFormatted} />
      </div>
    </div>
  )
}

function Chip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[9px] bg-white/[0.13] border border-white/[0.16] px-[14px] py-[10px] rounded-[13px]">
      {icon}
      <span className="text-[13px] text-white/85">{label}</span>
      <span className="font-newsreader font-semibold text-[18px]">{value}</span>
    </div>
  )
}

function DoctorIllustration() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="absolute right-[18px] -bottom-[30px] w-[176px] h-[206px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <ellipse cx="100" cy="220" rx="60" ry="6" fill="white" fillOpacity="0.1" />
      <path d="M55 100 L40 235 L160 235 L145 100 Q145 80 100 80 Q55 80 55 100 Z" fill="#ffffff" />
      <path d="M75 80 L100 110 L125 80 L125 76 Q113 70 100 70 Q87 70 75 76 Z" fill="#f5f4f1" />
      <path d="M90 80 L100 100 L110 80" stroke="#6d5ae6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="55" r="26" fill="#fcd9b6" />
      <path d="M73 55 Q73 28 100 25 Q127 28 127 55 L120 50 Q120 32 100 32 Q80 32 80 50 Z" fill="#3b2a20" />
      <circle cx="92" cy="56" r="2" fill="#1c1b1a" />
      <circle cx="108" cy="56" r="2" fill="#1c1b1a" />
      <path d="M93 66 Q100 71 107 66" stroke="#1c1b1a" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="125" cy="155" r="7" fill="none" stroke="#1c1b1a" strokeWidth="2" />
      <path d="M125 148 Q138 130 113 116 Q92 105 92 90" stroke="#1c1b1a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="78" y="110" width="14" height="18" rx="2" fill="#e9e7e0" />
      <circle cx="85" cy="113" r="1.5" fill="#a3a09a" />
    </svg>
  )
}
