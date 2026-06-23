'use client'

import { useState } from 'react'
import { formatBrl } from '@/lib/currency'

export type SeriePonto = { label: string; valor: number; data: string }

export type EntradaRow = {
  id: string
  paciente_nome: string
  paciente_iniciais: string
  paciente_cor: string
  data: string
  hora: string | null
  valor: number
  status: 'pago' | 'pendente' | 'cancelado'
  descricao: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pago: { bg: 'bg-green-light', text: 'text-green', label: 'Confirmado' },
  pendente: { bg: 'bg-yellow-light', text: 'text-[#9c7a18]', label: 'Aguardando' },
  cancelado: { bg: 'bg-red-light', text: 'text-red', label: 'Cancelado' },
}

export function FinanceiroView({
  faturamentoMensal,
  recebidoPago,
  aReceber,
  weekSerie,
  monthSerie,
  ultimasEntradas,
}: {
  faturamentoMensal: number
  recebidoPago: number
  aReceber: number
  weekSerie: SeriePonto[]
  monthSerie: SeriePonto[]
  ultimasEntradas: EntradaRow[]
}) {
  const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana')
  const serie = periodo === 'semana' ? weekSerie : monthSerie

  return (
    <div className="px-10 pt-7 pb-10">
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="font-newsreader text-[36px] font-semibold tracking-tight leading-tight">
            Faturamento
          </h1>
          <p className="text-[15px] text-muted mt-1">Acompanhe suas receitas e recebimentos pendentes.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] border border-border bg-card text-sm font-semibold text-text hover:bg-bg transition-colors cursor-not-allowed opacity-60"
            title="Em breve"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            Filtros
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] bg-text text-white text-sm font-semibold hover:bg-[#333] transition-colors cursor-not-allowed opacity-60"
            title="Em breve"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <KpiCard
          title="Faturamento Mensal"
          value={faturamentoMensal}
          accent="#f5a623"
          accentBg="linear-gradient(135deg, #fdf2e0 0%, #f9e4bd 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
        />
        <KpiCard
          title="Recebido (Pago)"
          value={recebidoPago}
          accent="#2fb98a"
          accentBg="linear-gradient(135deg, #e9f7f1 0%, #c9ecdc 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="14 7 21 7 21 14" />
            </svg>
          }
        />
        <KpiCard
          title="A Receber"
          value={aReceber}
          accent="#6d5ae6"
          accentBg="linear-gradient(135deg, #f1eefb 0%, #ddd5f5 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <div className="bg-card border border-border rounded-[14px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-newsreader text-[20px] font-semibold tracking-tight">Evolução de Receita</h2>
            <div className="flex rounded-[10px] border border-border bg-bg p-0.5">
              <button
                type="button"
                onClick={() => setPeriodo('semana')}
                className={`px-3 py-1 rounded-[8px] text-[12px] font-semibold transition-colors cursor-pointer ${
                  periodo === 'semana' ? 'bg-[#f1eefb] text-[#5b4bd4]' : 'text-muted hover:text-text'
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setPeriodo('mes')}
                className={`px-3 py-1 rounded-[8px] text-[12px] font-semibold transition-colors cursor-pointer ${
                  periodo === 'mes' ? 'bg-[#f1eefb] text-[#5b4bd4]' : 'text-muted hover:text-text'
                }`}
              >
                Mês
              </button>
            </div>
          </div>
          <BarChart serie={serie} />
        </div>

        <div className="bg-card border border-border rounded-[14px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-newsreader text-[20px] font-semibold tracking-tight">Últimas entradas</h2>
            <span className="text-xs text-muted font-medium">
              {ultimasEntradas.length} {ultimasEntradas.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {ultimasEntradas.length === 0 ? (
              <div className="text-center text-sm text-muted py-8">
                Nenhuma entrada registrada ainda.
              </div>
            ) : (
              ultimasEntradas.map((e) => (
                <EntradaItem key={e.id} entrada={e} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  accent,
  accentBg,
  serie,
  icon,
}: {
  title: string
  value: number
  accent: string
  accentBg: string
  serie: SeriePonto[]
  icon: React.ReactNode
}) {
  return (
    <div
      className="rounded-[14px] p-5 relative overflow-hidden"
      style={{ background: accentBg }}
    >
      <div className="flex items-start justify-between mb-7">
        <div
          className="w-10 h-10 rounded-[11px] bg-white/70 flex items-center justify-center"
          style={{ color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="text-[13px] font-medium text-text/70 mb-1">{title}</div>
      <div className="text-[28px] font-newsreader font-semibold tracking-tight text-text leading-none">
        {formatBrl(value)}
      </div>
      <div className="mt-4 h-[40px] -mx-1">
        <MiniSparkline serie={serie} color={accent} />
      </div>
    </div>
  )
}

function MiniSparkline({ serie, color }: { serie: SeriePonto[]; color: string }) {
  if (serie.length === 0) return null
  const max = Math.max(1, ...serie.map((s) => s.valor))
  const width = 280
  const height = 40
  const pad = 4
  const stepX = (width - pad * 2) / Math.max(1, serie.length - 1)
  const points = serie.map((s, i) => {
    const x = pad + i * stepX
    const y = height - pad - (s.valor / max) * (height - pad * 2)
    return { x, y }
  })
  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    '',
  )
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function calcNiceMax(max: number): number {
  if (max <= 0) return 100
  const mag = Math.pow(10, Math.floor(Math.log10(max)))
  const frac = max / mag
  const nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10
  return nice * mag
}

function fmtY(v: number): string {
  if (v >= 1000) return `${Math.round(v / 1000)}k`
  return String(Math.round(v))
}

function BarChart({ serie }: { serie: SeriePonto[] }) {
  const [hovered, setHovered] = useState<number | null>(null)

  const W = 600
  const H = 260
  const PL = 42
  const PR = 12
  const PT = 16
  const PB = 32

  const max = Math.max(1, ...serie.map((s) => s.valor))
  const niceMax = calcNiceMax(max)
  const chartW = W - PL - PR
  const chartH = H - PT - PB

  const slotW = chartW / Math.max(1, serie.length)
  const barW = slotW * 0.55
  const barOff = (slotW - barW) / 2

  const bars = serie.map((s, i) => {
    const bh = Math.max(2, (s.valor / niceMax) * chartH)
    const x = PL + i * slotW + barOff
    const y = PT + chartH - bh
    const prev = serie[i - 1]
    const pct = prev && prev.valor > 0 ? ((s.valor - prev.valor) / prev.valor) * 100 : null
    return { x, y, bh, cx: x + barW / 2, label: s.label, valor: s.valor, pct }
  })

  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const v = (niceMax / ticks) * i
    return { v, y: PT + chartH - (v / niceMax) * chartH }
  })

  const GREEN = '#2fb98a'
  const GOLD = '#f5a623'

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full h-auto"
      preserveAspectRatio="xMidYMid meet"
      onMouseLeave={() => setHovered(null)}
    >
      {/* Grid + Y labels */}
      {yTicks.map((t, i) => (
        <g key={i}>
          <line x1={PL} x2={W - PR} y1={t.y} y2={t.y}
            stroke="#ecebe8" strokeWidth="1"
            strokeDasharray={i === 0 ? '' : '3 4'} />
          <text x={PL - 6} y={t.y + 4} textAnchor="end"
            style={{ fontSize: 10, fill: '#9b978e' }}>
            {fmtY(t.v)}
          </text>
        </g>
      ))}

      {/* Bars */}
      {bars.map((b, i) => {
        const isHov = hovered === i
        return (
          <g key={i} onMouseEnter={() => setHovered(i)} style={{ cursor: 'default' }}>
            {/* invisible hit area */}
            <rect x={PL + i * slotW} y={PT} width={slotW} height={chartH} fill="transparent" />
            {/* bar */}
            <rect x={b.x} y={b.y} width={barW} height={b.bh} rx={5}
              fill={isHov ? GOLD : GREEN}
              style={{ transition: 'fill 0.12s' }} />
            {/* dashed line + dot on hover */}
            {isHov && (
              <>
                <line x1={b.cx} y1={PT} x2={b.cx} y2={b.y}
                  stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
                <circle cx={b.cx} cy={b.y} r="5" fill="white" stroke={GOLD} strokeWidth="2" />
              </>
            )}
            {/* X label — bold when hovered */}
            <text x={b.cx} y={H - 8} textAnchor="middle"
              style={{ fontSize: 11, fill: isHov ? '#1a1a1a' : '#9b978e', fontWeight: isHov ? 600 : 400 }}>
              {b.label}
            </text>
          </g>
        )
      })}

      {/* Tooltip */}
      {hovered !== null && (() => {
        const b = bars[hovered]
        const TW = 138; const TH = 62; const R = 10
        let tx = b.cx - TW / 2
        if (tx < PL) tx = PL
        if (tx + TW > W - PR) tx = W - PR - TW
        const ty = Math.max(PT + 4, b.y - TH - 14)

        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={tx} y={ty} width={TW} height={TH} rx={R}
              fill="white" style={{ filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.13))' }} />
            {/* Month label */}
            <text x={tx + 12} y={ty + 20}
              style={{ fontSize: 12, fontWeight: 600, fill: '#1a1a1a' }}>
              {b.label}
            </text>
            {/* Dot + value */}
            <circle cx={tx + 14} cy={ty + 40} r={4} fill={GOLD} />
            <text x={tx + 24} y={ty + 45}
              style={{ fontSize: 13, fontWeight: 700, fill: '#1a1a1a' }}>
              {formatBrl(b.valor)}
            </text>
            {/* % change */}
            {b.pct !== null && (
              <text x={tx + TW - 10} y={ty + 45} textAnchor="end"
                style={{ fontSize: 12, fontWeight: 600, fill: b.pct >= 0 ? GREEN : '#e53e3e' }}>
                {b.pct >= 0 ? '↗' : '↘'} {Math.abs(Math.round(b.pct))}%
              </text>
            )}
          </g>
        )
      })()}
    </svg>
  )
}

function EntradaItem({ entrada }: { entrada: EntradaRow }) {
  const sty = STATUS_STYLE[entrada.status] ?? STATUS_STYLE.pendente
  const dateLabel = formatEntradaDate(entrada.data)

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
        style={{ background: entrada.paciente_cor }}
      >
        {(entrada.paciente_iniciais ?? '?').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-text truncate">{entrada.paciente_nome}</div>
        <div className="text-[11.5px] text-muted truncate">
          {dateLabel}
          {entrada.hora ? `, ${entrada.hora}` : ''}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[14px] font-bold text-text">{formatBrl(entrada.valor)}</div>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${sty.bg} ${sty.text}`}>
          {sty.label}
        </span>
      </div>
    </div>
  )
}

function formatEntradaDate(isoDate: string): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.getTime() === today.getTime()) return 'Hoje'
  if (d.getTime() === yesterday.getTime()) return 'Ontem'

  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
