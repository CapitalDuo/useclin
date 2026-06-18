'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/app/login/actions'

const NAV = [
  { href: '/admin/clinicas', label: 'Clínicas', icon: '🏥' },
  { href: '/admin/usuarios', label: 'Usuários', icon: '👤' },
  { href: '/admin/suporte', label: 'Suporte', icon: '💬' },
]

export function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-[230px] bg-card border-r border-border flex flex-col">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-text text-white flex items-center justify-center text-[11px] font-bold">
          ADM
        </div>
        <div>
          <div className="font-playfair text-base font-extrabold tracking-tight leading-none">Rosan</div>
          <div className="text-[9px] font-semibold text-muted tracking-[2px] uppercase mt-0.5">Painel Admin</div>
        </div>
      </div>

      <nav className="flex-1 flex flex-col p-3 gap-1">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors ${
                active ? 'bg-bg text-text font-semibold' : 'text-muted hover:text-text hover:bg-bg'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-text text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
            {email.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold truncate">{email}</div>
            <div className="text-[10px] text-muted">Plataforma</div>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full px-3 py-2 rounded-lg text-xs font-semibold text-muted hover:text-red hover:bg-red-light transition-colors cursor-pointer text-left"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
