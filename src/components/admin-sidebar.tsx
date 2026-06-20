'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'
import { LeafIcon, LogOutIcon, UsersIcon, ChatIcon, HomeIcon } from '@/components/icons'

const NAV = [
  { href: '/admin/clinicas', label: 'Clínicas', Icon: HomeIcon },
  { href: '/admin/usuarios', label: 'Usuários', Icon: UsersIcon },
  { href: '/admin/suporte', label: 'Suporte', Icon: ChatIcon },
]

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <aside className="w-[232px] flex-none bg-white border-r border-border px-4 py-[26px] flex flex-col min-h-screen sticky top-0 self-start">
      <div className="flex items-center gap-3 px-2 pb-[30px]">
        <div className="w-11 h-11 rounded-full border-[1.5px] border-[#c2a766] flex items-center justify-center">
          <LeafIcon className="w-5 h-5 text-[#a9925a]" />
        </div>
        <div>
          <div className="font-newsreader text-[23px] font-semibold text-text leading-none">Rosan</div>
          <div className="text-[9px] font-bold tracking-[0.18em] text-[#a8a59d] mt-1">PAINEL ADMIN</div>
        </div>
      </div>

      <nav className="flex flex-col gap-[3px]">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-[12px] text-[14.5px] font-semibold transition-colors ${
                active
                  ? 'bg-[#f1eefb] text-[#5b4bd4]'
                  : 'text-[#6f6c67] font-medium hover:bg-soft'
              }`}
            >
              <item.Icon className={`w-[19px] h-[19px] ${active ? 'text-[#5b4bd4]' : 'text-[#9a978f]'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto">
        <div className="flex items-center gap-3 px-2 pt-3.5 border-t border-[#f0efec]">
          <div className="w-10 h-10 rounded-[12px] bg-text text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-text leading-tight truncate">{email}</div>
            <div className="text-[11.5px] text-[#a3a09a]">Plataforma</div>
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
