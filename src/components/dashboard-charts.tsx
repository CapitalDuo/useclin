'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Filler,
  Tooltip,
  DoughnutController,
  LineController,
} from 'chart.js'

ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Filler, Tooltip, DoughnutController, LineController)

export type DonutSlice = { label: string; value: number; color: string }

export function DonutChart({ data }: { data: DonutSlice[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const total = data.reduce((acc, s) => acc + s.value, 0)
  const hovered = hoveredIdx !== null ? data[hoveredIdx] : null

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    chartRef.current = new ChartJS(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels: data.map((s) => s.label),
        datasets: [{
          data: data.map((s) => Math.max(s.value, 0.0001)),
          backgroundColor: data.map((s) => s.color),
          borderWidth: 0,
          hoverOffset: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
        },
        onHover: (_evt, elements) => {
          setHoveredIdx(elements.length > 0 ? elements[0].index : null)
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [data])

  return (
    <div className="flex items-center gap-4" onMouseLeave={() => setHoveredIdx(null)}>
      <div className="relative w-[104px] h-[104px] flex-shrink-0">
        {total > 0 ? (
          <canvas ref={canvasRef} />
        ) : (
          <div className="w-full h-full rounded-full border-[16px] border-[#f1f0ed]" />
        )}
        <div className="absolute inset-4 rounded-full bg-card flex flex-col items-center justify-center pointer-events-none transition-all duration-150">
          {hovered ? (
            <>
              <div className="font-newsreader font-semibold text-2xl leading-none" style={{ color: hovered.color }}>{hovered.value}</div>
              <div className="text-[9px] text-muted text-center leading-tight mt-0.5 max-w-[48px] truncate">{hovered.label}</div>
            </>
          ) : (
            <>
              <div className="font-newsreader font-semibold text-2xl text-text leading-none">{total}</div>
              <div className="text-[10px] text-muted">Total</div>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-[9px] flex-1">
        {data.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-2 text-[12.5px] transition-opacity ${hoveredIdx !== null && hoveredIdx !== i ? 'opacity-40' : 'opacity-100'}`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-muted flex-1">{s.label}</span>
            <span className="font-bold text-text">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export type WeekPoint = { label: string; value: number }

export function WeekChart({ points }: { points: WeekPoint[] }) {
  const max = Math.max(30, ...points.map((p) => p.value))
  const W = 980
  const H = 200
  const PADDING_LEFT = 70
  const PADDING_RIGHT = 25
  const TOP = 20
  const BOTTOM = 160
  const usableWidth = W - PADDING_LEFT - PADDING_RIGHT
  const step = points.length > 1 ? usableWidth / (points.length - 1) : 0
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  const coords = points.map((p, i) => ({
    x: PADDING_LEFT + step * i,
    y: TOP + (BOTTOM - TOP) * (1 - p.value / max),
    label: p.label,
    value: p.value,
  }))

  const linePath = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x},${c.y}`).join(' ')
  const areaPath = `${linePath} L${coords[coords.length - 1]?.x ?? 0},${BOTTOM} L${coords[0]?.x ?? 0},${BOTTOM} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[180px] overflow-visible">
      {[0, 1, 2, 3].map((i) => {
        const y = TOP + ((BOTTOM - TOP) * i) / 3
        return (
          <g key={i}>
            <line x1={PADDING_LEFT - 26} y1={y} x2={W - PADDING_RIGHT} y2={y} stroke="#f0efec" strokeWidth="1" />
            <text x={PADDING_LEFT - 40} y={y + 4} textAnchor="end" fontSize="11" fill="#b4b1a9">
              {Math.round((max * (3 - i)) / 3)}
            </text>
          </g>
        )
      })}

      <path d={areaPath} fill="#6d5ae6" fillOpacity="0.08" />
      <path d={linePath} fill="none" stroke="#6d5ae6" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

      {coords.map((c, i) => (
        <circle
          key={i}
          cx={c.x}
          cy={c.y}
          r={i === todayIdx ? 5.5 : 4}
          fill={i === todayIdx ? '#6d5ae6' : '#fff'}
          stroke={i === todayIdx ? '#fff' : '#6d5ae6'}
          strokeWidth="2.4"
        />
      ))}

      {coords.map((c, i) => (
        <text
          key={i}
          x={c.x}
          y={H - 18}
          textAnchor="middle"
          fontSize="11.5"
          fontWeight={i === todayIdx ? 700 : 400}
          fill={i === todayIdx ? '#6d5ae6' : '#a3a09a'}
        >
          {c.label}
        </text>
      ))}
    </svg>
  )
}

export function PatientsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<ChartJS | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    chartRef.current?.destroy()
    chartRef.current = new ChartJS(canvasRef.current, {
      type: 'line',
      data: {
        labels: ['1', '5', '10', '15', '20', '25', '30'],
        datasets: [{
          data: [10, 11, 12, 14, 13, 16, 18],
          borderColor: '#6d5ae6',
          backgroundColor: 'rgba(109,90,230,0.06)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6d5ae6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#a3a09a' } },
          y: { display: false },
        },
      },
    })
    return () => { chartRef.current?.destroy() }
  }, [])

  return <canvas ref={canvasRef} />
}
