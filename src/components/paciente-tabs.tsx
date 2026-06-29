'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { label: string; href: string; icon: React.ReactNode }

function ConsultasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function DadosIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function ProntuarioIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

export function PacienteTabs({ id }: { id: string }) {
  const pathname = usePathname()
  const base = `/pacientes/${id}`

  const tabs: Tab[] = [
    { label: 'Consultas', href: base, icon: <ConsultasIcon /> },
    { label: 'Dados', href: `${base}/editar`, icon: <DadosIcon /> },
    { label: 'Prontuário', href: `${base}/prontuario`, icon: <ProntuarioIcon /> },
  ]

  return (
    <div className="flex items-center gap-1.5 border-b border-border mb-7">
      {tabs.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-[10px] -mb-px border-b-2 transition-colors cursor-pointer ${
              active
                ? 'border-text text-text'
                : 'border-transparent text-muted hover:text-text hover:bg-bg'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
