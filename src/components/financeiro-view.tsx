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
          <LineChart serie={serie} />
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

function LineChart({ serie }: { serie: SeriePonto[] }) {
  const width = 600
  const height = 260
  const padLeft = 36
  const padRight = 10
  const padTop = 10
  const padBottom = 28

  const max = Math.max(1, ...serie.map((s) => s.valor))
  const niceMax = Math.ceil(max / 50) * 50 || 50
  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom
  const stepX = chartW / Math.max(1, serie.length - 1)

  const points = serie.map((s, i) => {
    const x = padLeft + i * stepX
    const y = padTop + chartH - (s.valor / niceMax) * chartH
    return { x, y, label: s.label, valor: s.valor }
  })

  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    '',
  )

  // Y-axis ticks
  const ticks = 4
  const yTicks = Array.from({ length: ticks + 1 }, (_, i) => {
    const value = (niceMax / ticks) * i
    const y = padTop + chartH - (value / niceMax) * chartH
    return { value, y }
  })

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {yTicks.map((t, i) => (
        <line
          key={i}
          x1={padLeft}
          x2={width - padRight}
          y1={t.y}
          y2={t.y}
          stroke="#ecebe8"
          strokeWidth="1"
          strokeDasharray={i === 0 ? '' : '3 4'}
        />
      ))}
      {/* Y-axis labels */}
      {yTicks.map((t, i) => (
        <text
          key={i}
          x={padLeft - 8}
          y={t.y + 4}
          textAnchor="end"
          className="fill-muted"
          style={{ fontSize: 10 }}
        >
          {Math.round(t.value)}
        </text>
      ))}
      {/* Line */}
      <path d={path} fill="none" stroke="#5b4bd4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Points */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#5b4bd4" strokeWidth="2" />
          <title>{`${p.label}: ${formatBrl(p.valor)}`}</title>
        </g>
      ))}
      {/* X-axis labels */}
      {points.map((p, i) => (
        <text
          key={i}
          x={p.x}
          y={height - 8}
          textAnchor="middle"
          className="fill-muted"
          style={{ fontSize: 11 }}
        >
          {p.label}
        </text>
      ))}
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
