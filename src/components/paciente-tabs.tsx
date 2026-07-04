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

function PrescricoesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 12h6m-3-3v6m-7 3h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function CrescimentoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.1-2.8-2.8L4.7 16.4" />
    </svg>
  )
}

export function PacienteTabs({ id, crescimento = false }: { id: string; crescimento?: boolean }) {
  const pathname = usePathname()
  const base = `/pacientes/${id}`

  const tabs: Tab[] = [
    { label: 'Consultas', href: base, icon: <ConsultasIcon /> },
    // Só pra clínicas com pediatria_completa (a página tem requireFeature também)
    ...(crescimento ? [{ label: 'Crescimento', href: `${base}/crescimento`, icon: <CrescimentoIcon /> }] : []),
    { label: 'Dados', href: `${base}/editar`, icon: <DadosIcon /> },
    { label: 'Prescrições', href: `${base}/prescricoes`, icon: <PrescricoesIcon /> },
  ]

  return (
    <div className="flex items-center gap-1.5 border-b border-border mb-7">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href !== base && pathname.startsWith(tab.href + '/'))
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
