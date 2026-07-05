'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  HeadsetIcon,
  SettingsIcon,
  ChatIcon,
  LeafIcon,
  LogOutIcon,
  WalletIcon,
  ClipboardIcon,
} from '@/components/icons'
import { logoutAction } from '@/app/login/actions'
import type { FeatureKey } from '@/lib/features'

const NAV_BG = '#1e1b4b'
const CONTENT_BG = '#f4f3f1' // cor de fundo do conteúdo — aba ativa e notch usam ela

const navItems: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  feature?: FeatureKey // sem feature = sempre visível (Dashboard, Configurações)
}[] = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/financeiro', label: 'Financeiro', icon: WalletIcon, feature: 'financeiro' },
  { href: '/agenda', label: 'Agenda', icon: CalendarIcon, feature: 'agenda' },
  { href: '/pacientes', label: 'Pacientes', icon: UsersIcon, feature: 'pacientes' },
  { href: '/atendimento', label: 'Atendimento', icon: HeadsetIcon, feature: 'atendimento' },
  { href: '/consultas', label: 'Consultas', icon: ClipboardIcon, feature: 'pediatria_completa' },
  { href: '/configuracoes', label: 'Configurações', icon: SettingsIcon },
]

// Canto côncavo: caixa branca (cor do conteúdo) com um quadrado escuro
// por cima que tem só UM canto arredondado — o arredondado revela o branco,
// criando a ilusão de que a aba "curva" para fora, conectando ao conteúdo.
function NavNotch({ position }: { position: 'top' | 'bottom' }) {
  const isTop = position === 'top'
  return (
    <span
      aria-hidden
      className="absolute right-0 w-4 h-4 pointer-events-none"
      style={{ [isTop ? 'bottom' : 'top']: '100%', background: CONTENT_BG }}
    >
      <span
        className={`block w-full h-full ${isTop ? 'rounded-br-[16px]' : 'rounded-tr-[16px]'}`}
        style={{ background: NAV_BG }}
      />
    </span>
  )
}

export function Sidebar({
  userName,
  userRole,
  userInitials,
  clinicLogoUrl,
  enabledFeatures,
}: {
  userName: string
  userRole: string
  userInitials: string
  clinicLogoUrl?: string | null
  enabledFeatures?: Record<FeatureKey, boolean>
}) {
  const pathname = usePathname()
  const suporteActive = pathname.startsWith('/configuracoes/suporte')
  // Sem enabledFeatures (ex: clínica ainda não carregada) mostra tudo.
  const items = enabledFeatures
    ? navItems.filter((i) => !i.feature || enabledFeatures[i.feature])
    : navItems

  return (
    <aside
      className="w-[232px] flex-none pl-4 pr-0 py-[26px] flex flex-col min-h-screen sticky top-0 self-start"
      style={{ background: NAV_BG }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 pr-5 pb-[30px]">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-white/20 flex items-center justify-center">
          <LeafIcon className="w-5 h-5 text-white/50" />
        </div>
        <div>
          <div className="font-newsreader text-[23px] font-semibold text-white leading-none">Useclin</div>
          <div className="text-[9px] font-bold tracking-[0.18em] text-white/35 mt-1">GESTÃO DE CLÍNICAS</div>
        </div>
      </div>

      {/* Navegação principal */}
      <nav className="flex flex-col gap-[3px]">
        {items.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && !suporteActive
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3.5 py-[11px] text-[14.5px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#f4f3f1] text-[#1e1b4b] rounded-l-[18px] z-[1]'
                  : 'text-white/60 font-medium rounded-[12px] mr-4 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              {isActive && (
                <>
                  <NavNotch position="top" />
                  <NavNotch position="bottom" />
                </>
              )}
              <item.icon
                className={`w-[19px] h-[19px] flex-shrink-0 ${isActive ? 'text-[#5b4bd4]' : 'text-white/40'}`}
              />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="mt-auto">
        {/* Suporte */}
        <Link
          href="/configuracoes/suporte"
          className={`relative flex items-center gap-3 px-3.5 py-[11px] text-sm font-medium transition-colors ${
            suporteActive
              ? 'bg-[#f4f3f1] text-[#1e1b4b] rounded-l-[18px] z-[1]'
              : 'text-white/50 rounded-[12px] mr-4 hover:text-white/80 hover:bg-white/8'
          }`}
        >
          {suporteActive && (
            <>
              <NavNotch position="top" />
              <NavNotch position="bottom" />
            </>
          )}
          <ChatIcon
            className={`w-[19px] h-[19px] flex-shrink-0 ${suporteActive ? 'text-[#5b4bd4]' : 'text-white/35'}`}
          />
          Suporte
        </Link>

        {/* Usuário */}
        <div className="flex items-center gap-3 mt-3.5 px-2 pr-5 pt-3.5 border-t border-white/10">
          <div className="w-10 h-10 rounded-[12px] bg-white/10 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
            {clinicLogoUrl ? (
              <img src={clinicLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-tight truncate">{userName}</div>
            <div className="text-[11.5px] text-white/45">{userRole}</div>
          </div>
        </div>

        {/* Sair */}
        <form action={logoutAction} className="mt-2 pr-4">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-[14.5px] font-semibold text-[#f87171] bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOutIcon className="w-[19px] h-[19px] text-[#f87171]" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
