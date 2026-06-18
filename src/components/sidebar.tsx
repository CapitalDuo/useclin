'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CalendarIcon,
  UsersIcon,
  HeadsetIcon,
  SettingsIcon,
} from '@/components/icons'
import { logoutAction } from '@/app/login/actions'

const navItems = [
  { href: '/', label: 'Dashboard', icon: HomeIcon },
  { href: '/agenda', label: 'Agenda', icon: CalendarIcon },
  { href: '/pacientes', label: 'Pacientes', icon: UsersIcon },
  { href: '/atendimento', label: 'Atendimento', icon: HeadsetIcon },
  { href: '/configuracoes', label: 'Configurações', icon: SettingsIcon },
]

export function Sidebar({
  userName,
  userRole,
  userInitials,
}: {
  userName: string
  userRole: string
  userInitials: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-[230px] bg-card border-r border-border flex flex-col fixed top-0 left-0 bottom-0 z-50">
      <div className="px-6 pt-7 pb-6 flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
            <circle cx="20" cy="20" r="18" stroke="#d4c5a9" strokeWidth="1.5" />
            <path d="M20 8 C16 12, 12 14, 12 20 C12 24, 14 28, 20 32 C26 28, 28 24, 28 20 C28 14, 24 12, 20 8Z" stroke="#d4c5a9" strokeWidth="1.2" fill="none" />
            <path d="M14 16 Q17 20, 20 16 Q23 20, 26 16" stroke="#d4c5a9" strokeWidth="1" fill="none" />
            <path d="M15 22 Q17.5 26, 20 22 Q22.5 26, 25 22" stroke="#d4c5a9" strokeWidth="1" fill="none" />
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-playfair text-lg font-extrabold text-text tracking-tight">Rosan</span>
          <span className="text-[9px] font-semibold text-muted tracking-[2px] uppercase">Clínica Integrativa</span>
        </div>
      </div>

      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] text-sm transition-all ${
                isActive
                  ? 'bg-bg text-text font-semibold'
                  : 'text-muted font-medium hover:bg-bg hover:text-text'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-2">
        <Link
          href="/configuracoes/suporte"
          className={`flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-xs font-semibold transition-all ${
            pathname.startsWith('/configuracoes/suporte')
              ? 'bg-bg text-text'
              : 'text-muted hover:bg-bg hover:text-text'
          }`}
        >
          <span>💬</span>
          <span>Suporte</span>
        </Link>
      </div>

      <div className="px-5 py-4 border-t border-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-bg flex items-center justify-center text-[13px] font-bold text-text">
          {userInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-text truncate">{userName}</div>
          <div className="text-[11px] text-muted">{userRole}</div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            title="Sair"
            className="text-muted hover:text-red transition-colors cursor-pointer text-lg"
          >
            ⏻
          </button>
        </form>
      </div>
    </aside>
  )
}
