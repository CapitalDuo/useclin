'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'
import { LeafIcon, LogOutIcon, UsersIcon, ChatIcon, HomeIcon } from '@/components/icons'

const NAV_BG = '#1e1b4b'
const CONTENT_BG = '#f4f3f1'

const NAV = [
  { href: '/admin/clinicas', label: 'Clínicas', Icon: HomeIcon },
  { href: '/admin/usuarios', label: 'Usuários', Icon: UsersIcon },
  { href: '/admin/suporte', label: 'Suporte', Icon: ChatIcon },
]

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

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <aside
      className="w-[232px] flex-none pl-4 pr-0 py-[26px] flex flex-col min-h-screen sticky top-0 self-start"
      style={{ background: NAV_BG }}
    >
      <div className="flex items-center gap-3 px-2 pr-5 pb-[30px]">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-white/20 flex items-center justify-center">
          <LeafIcon className="w-5 h-5 text-white/50" />
        </div>
        <div>
          <div className="font-newsreader text-[23px] font-semibold text-white leading-none">Useclin</div>
          <div className="text-[9px] font-bold tracking-[0.18em] text-white/35 mt-1">PAINEL ADMIN</div>
        </div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3.5 py-[11px] text-[14.5px] font-semibold transition-colors ${
                active
                  ? 'bg-[#f4f3f1] text-[#1e1b4b] rounded-l-[18px] z-[1]'
                  : 'text-white/60 font-medium rounded-[12px] mr-4 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              {active && (
                <>
                  <NavNotch position="top" />
                  <NavNotch position="bottom" />
                </>
              )}
              <item.Icon className={`w-[19px] h-[19px] flex-shrink-0 ${active ? 'text-[#5b4bd4]' : 'text-white/40'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pr-4">
        <div className="flex items-center gap-3 px-2 pt-3.5 border-t border-white/10">
          <div className="w-10 h-10 rounded-[12px] bg-white/10 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-tight truncate">{email}</div>
            <div className="text-[11.5px] text-white/45">Plataforma</div>
          </div>
        </div>
        <form action={logoutAction} className="mt-2">
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
