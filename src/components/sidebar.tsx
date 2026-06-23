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
} from '@/components/icons'
import { logoutAction } from '@/app/login/actions'

const navItems = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/financeiro', label: 'Financeiro', icon: WalletIcon },
  { href: '/agenda', label: 'Agenda', icon: CalendarIcon },
  { href: '/pacientes', label: 'Pacientes', icon: UsersIcon },
  { href: '/atendimento', label: 'Atendimento', icon: HeadsetIcon },
  { href: '/configuracoes', label: 'Configurações', icon: SettingsIcon },
]

export function Sidebar({
  userName,
  userRole,
  userInitials,
  clinicLogoUrl,
}: {
  userName: string
  userRole: string
  userInitials: string
  clinicLogoUrl?: string | null
}) {
  const pathname = usePathname()
  const suporteActive = pathname.startsWith('/configuracoes/suporte')

  return (
    <aside className="w-[232px] flex-none bg-white border-r border-border px-4 py-[26px] flex flex-col min-h-screen sticky top-0 self-start">
      <div className="flex items-center gap-3 px-2 pb-[30px]">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-[#c2a766] flex items-center justify-center">
          <LeafIcon className="w-5 h-5 text-[#a9925a]" />
        </div>
        <div>
          <div className="font-newsreader text-[23px] font-semibold text-text leading-none">Useclin</div>
          <div className="text-[9px] font-bold tracking-[0.18em] text-[#a8a59d] mt-1">GESTÃO DE CLÍNICAS</div>
        </div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && !suporteActive
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-[14.5px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[#f1eefb] text-[#5b4bd4]'
                  : 'text-[#6f6c67] font-medium hover:bg-soft'
              }`}
            >
              <item.icon className={`w-[19px] h-[19px] ${isActive ? 'text-[#5b4bd4]' : 'text-[#9a978f]'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/configuracoes/suporte"
          className={`flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-sm font-medium transition-colors ${
            suporteActive ? 'bg-[#f1eefb] text-[#5b4bd4]' : 'text-[#9a978f] hover:text-text hover:bg-soft'
          }`}
        >
          <ChatIcon className={`w-[19px] h-[19px] ${suporteActive ? 'text-[#5b4bd4]' : 'text-[#b4b1a9]'}`} />
          Suporte
        </Link>
        <div className="flex items-center gap-3 mt-3.5 px-2 pt-3.5 border-t border-[#f0efec]">
          <div className="w-10 h-10 rounded-[12px] bg-text text-white flex items-center justify-center font-bold text-sm flex-shrink-0 overflow-hidden">
            {clinicLogoUrl ? (
              <img src={clinicLogoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              userInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text leading-tight truncate">{userName}</div>
            <div className="text-[11.5px] text-[#a3a09a]">{userRole}</div>
          </div>
        </div>
        <form action={logoutAction} className="mt-2">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-[14.5px] font-semibold text-[#d24343] bg-[#fdeaea] hover:bg-[#fad2d2] transition-colors cursor-pointer"
          >
            <LogOutIcon className="w-[19px] h-[19px]" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
