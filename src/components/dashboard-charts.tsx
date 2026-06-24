'use client'

import { useState } from 'react'

export type DonutSlice = { label: string; value: number; color: string }

// Donut em SVG puro (sem chart.js): cada fatia é um <circle> com
// stroke-dasharray proporcional ao valor, posicionado via dashoffset.
export function DonutChart({ data, compact = false }: { data: DonutSlice[]; compact?: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const total = data.reduce((acc, s) => acc + s.value, 0)
  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null
  const size = compact ? 62 : 104
  const stroke = compact ? 11 : 16
  const r = (size - stroke) / 2
  const cx = size / 2
  const C = 2 * Math.PI * r

  let acc = 0
  const segments = data.map((s, i) => {
    const frac = total > 0 ? s.value / total : 0
    const offset = acc
    acc += frac
    return { ...s, i, frac, offset }
  })

  return (
    <div
      className={`flex items-center ${compact ? 'gap-2.5' : 'gap-4'}`}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f1f0ed" strokeWidth={stroke} />
          {total > 0 &&
            segments.map((s) => (
              <circle
                key={s.i}
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={hoveredIdx === s.i ? stroke + 2 : stroke}
                strokeDasharray={`${s.frac * C} ${C - s.frac * C}`}
                strokeDashoffset={-s.offset * C}
                opacity={hoveredIdx !== null && hoveredIdx !== s.i ? 0.35 : 1}
                onMouseEnter={() => setHoveredIdx(s.i)}
                style={{ transition: 'opacity .15s, stroke-width .15s', cursor: 'pointer' }}
              />
            ))}
        </svg>
        <div className="absolute rounded-full flex flex-col items-center justify-center pointer-events-none transition-all duration-150" style={{ inset: compact ? '10px' : '16px' }}>
          {hovered ? (
            <>
              <div className={`font-newsreader font-semibold leading-none ${compact ? 'text-lg' : 'text-2xl'}`} style={{ color: hovered.color }}>{hovered.value}</div>
              {!compact && <div className="text-[9px] text-muted text-center leading-tight mt-0.5 max-w-[48px] truncate">{hovered.label}</div>}
            </>
          ) : (
            <>
              <div className={`font-newsreader font-semibold text-text leading-none ${compact ? 'text-lg' : 'text-2xl'}`}>{total}</div>
              <div className={`text-muted ${compact ? 'text-[8.5px]' : 'text-[10px]'}`}>Total</div>
            </>
          )}
        </div>
      </div>
      <div className={`flex flex-col ${compact ? 'gap-[4px]' : 'gap-[9px]'} flex-1 min-w-0`}>
        {data.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-1.5 transition-opacity ${compact ? 'text-[10.5px]' : 'text-[12.5px]'} ${hoveredIdx !== null && hoveredIdx !== i ? 'opacity-40' : 'opacity-100'}`}
            onMouseEnter={() => setHoveredIdx(i)}
          >
            <span className={`rounded-full flex-shrink-0 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} style={{ background: s.color }} />
            <span className="text-muted flex-1 truncate">{s.label}</span>
            <span className="font-bold text-text">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export type WeekPoint = { label: string; value: number }

// Chart de área responsivo que preenche 100% do container.
// O SVG usa preserveAspectRatio="none" (escala livre) com vector-effect nas
// linhas pra não distorcer a espessura; os dots e textos são HTML por cima,
// garantindo círculos perfeitos e tipografia nítida em qualquer largura.
export function WeekChart({ points }: { points: WeekPoint[] }) {
  const max = Math.max(30, ...points.map((p) => p.value))
  const n = points.length
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const PAD_X = 4 // % de respiro lateral
  const PLOT_TOP = 8 // % topo (espaço pro dot do pico)
  const PLOT_H = 76 // % altura da área plotável (resto = labels do eixo X)

  const coords = points.map((p, i) => ({
    x: PAD_X + (n > 1 ? (i / (n - 1)) * (100 - 2 * PAD_X) : 50),
    y: PLOT_TOP + (1 - p.value / max) * PLOT_H,
    label: p.label,
    value: p.value,
  }))

  const baseY = PLOT_TOP + PLOT_H
  const linePath = 'M ' + coords.map((c) => `${c.x} ${c.y}`).join(' L ')
  const areaPath = `${linePath} L ${coords[n - 1]?.x ?? 0} ${baseY} L ${coords[0]?.x ?? 0} ${baseY} Z`
  const gridRows = [0, 1, 2, 3] // do topo (max) até a base (0)

  return (
    <div className="relative w-full h-full flex text-[10px] min-h-[180px]">
      {/* eixo Y */}
      <div className="relative w-6 flex-none">
        {gridRows.map((k) => (
          <span
            key={k}
            className="absolute right-1 -translate-y-1/2 text-[#b4b1a9]"
            style={{ top: `${PLOT_TOP + (k / 3) * PLOT_H}%` }}
          >
            {Math.round((max * (3 - k)) / 3)}
          </span>
        ))}
      </div>

      {/* área de plot */}
      <div className="relative flex-1 min-w-0">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {gridRows.map((k) => {
            const y = PLOT_TOP + (k / 3) * PLOT_H
            return (
              <line key={k} x1="0" x2="100" y1={y} y2={y} stroke="#f0efec" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            )
          })}
          <path d={areaPath} fill="#6d5ae6" fillOpacity="0.09" />
          <path
            d={linePath}
            fill="none"
            stroke="#6d5ae6"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* dots (HTML = círculos perfeitos) */}
        {coords.map((c, i) => (
          <span
            key={i}
            className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: i === todayIdx ? 11 : 8,
              height: i === todayIdx ? 11 : 8,
              background: i === todayIdx ? '#6d5ae6' : '#fff',
              border: '2.4px solid #6d5ae6',
              boxShadow: i === todayIdx ? '0 0 0 2.4px #fff' : undefined,
            }}
          />
        ))}

        {/* labels do eixo X */}
        {coords.map((c, i) => (
          <span
            key={i}
            className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap"
            style={{
              left: `${c.x}%`,
              fontWeight: i === todayIdx ? 700 : 400,
              color: i === todayIdx ? '#6d5ae6' : '#a3a09a',
            }}
          >
            {c.label}
          </span>
        ))}
      </div>
    </div>
  )
}
