import { type ReactNode } from 'react'

const palette = {
  purple: {
    bg: '#f1eefb',
    border: '#e7e1fa',
    label: '#7c6fae',
    value: '#2c2456',
    icon: '#6d5ae6',
    iconShadow: 'rgba(109,90,230,.14)',
  },
  green: {
    bg: '#e9f7f1',
    border: '#d7efe5',
    label: '#5b9a83',
    value: '#194d3c',
    icon: '#2fb98a',
    iconShadow: 'rgba(47,185,138,.14)',
  },
  blue: {
    bg: '#eaf1fe',
    border: '#d8e5fb',
    label: '#5c7cb0',
    value: '#1d3a6b',
    icon: '#3b82f6',
    iconShadow: 'rgba(59,130,246,.14)',
  },
  orange: {
    bg: '#fdf2e0',
    border: '#f6e6c8',
    label: '#b08742',
    value: '#7a541a',
    icon: '#e7942a',
    iconShadow: 'rgba(231,148,42,.16)',
  },
} as const

export type KpiColor = keyof typeof palette

interface KpiCardProps {
  icon: ReactNode
  label: string
  value: string
  color: KpiColor
  sparkline?: 'up' | 'flat' | 'wave' | 'climb'
  valueSmall?: boolean
}

const sparklinePaths: Record<NonNullable<KpiCardProps['sparkline']>, { area: string; line: string }> = {
  up: {
    area: 'M0,30 L33,24 L66,27 L100,15 L133,19 L166,9 L200,12 L200,40 L0,40 Z',
    line: 'M0,30 L33,24 L66,27 L100,15 L133,19 L166,9 L200,12',
  },
  climb: {
    area: 'M0,28 L33,30 L66,21 L100,24 L133,13 L166,11 L200,9 L200,40 L0,40 Z',
    line: 'M0,28 L33,30 L66,21 L100,24 L133,13 L166,11 L200,9',
  },
  wave: {
    area: 'M0,24 L33,19 L66,26 L100,14 L133,22 L166,13 L200,16 L200,40 L0,40 Z',
    line: 'M0,24 L33,19 L66,26 L100,14 L133,22 L166,13 L200,16',
  },
  flat: {
    area: 'M0,31 L33,25 L66,27 L100,18 L133,12 L166,7 L200,6 L200,40 L0,40 Z',
    line: 'M0,31 L33,25 L66,27 L100,18 L133,12 L166,7 L200,6',
  },
}

export function KpiCard({ icon, label, value, color, sparkline = 'up', valueSmall }: KpiCardProps) {
  const c = palette[color]
  const sp = sparklinePaths[sparkline]
  return (
    <div
      className="relative overflow-hidden rounded-[18px] p-[14px_14px_0] h-[152px] border"
      style={{ background: c.bg, borderColor: c.border }}
    >
      <div
        className="w-[34px] h-[34px] rounded-[10px] bg-white flex items-center justify-center"
        style={{ boxShadow: `0 2px 6px ${c.iconShadow}`, color: c.icon }}
      >
        {icon}
      </div>
      <div className="text-[11.5px] font-semibold mt-2.5" style={{ color: c.label }}>{label}</div>
      <div
        className={`font-newsreader font-semibold leading-none mt-0.5 ${valueSmall ? 'text-[22px]' : 'text-[28px]'}`}
        style={{ color: c.value }}
      >
        {value}
      </div>
      <svg
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        className="absolute left-0 right-0 bottom-0 w-full h-[48px]"
      >
        <path d={sp.area} fill={c.icon} fillOpacity="0.16" />
        <path d={sp.line} fill="none" stroke={c.icon} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
