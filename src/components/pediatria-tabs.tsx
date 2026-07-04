'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type Tab = { label: string; href: string; icon: React.ReactNode }

function CurvasIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.1-2.8-2.8L4.7 16.4" />
    </svg>
  )
}

function MarcosIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
    </svg>
  )
}

export function PediatriaTabs() {
  const pathname = usePathname()
  const base = '/pediatria'

  const tabs: Tab[] = [
    { label: 'Curvas de crescimento', href: base, icon: <CurvasIcon /> },
    { label: 'Marcos de desenvolvimento', href: `${base}/marcos`, icon: <MarcosIcon /> },
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
