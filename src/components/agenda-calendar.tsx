'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from '@/components/icons'
import { moveAgendamentoAction } from '@/app/(dashboard)/agenda/actions'

export type AgendaEvento = {
  id: string
  data: string
  hora_inicio: string
  hora_fim: string
  status: string
  notas: string | null
  paciente_nome: string
  profissional_nome: string
  tipo_nome: string | null
  tipo_cor: string | null
}

export type AgendaView = 'day' | 'week'

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const HOURS = Array.from({ length: 12 }, (_, i) => 7 + i) // 07h–18h

// Status colors — user-defined, 4 buckets covering 6 db statuses
const STATUS_COLORS: Record<string, string> = {
  agendado: '#6d5ae6',
  confirmado: '#6d5ae6',
  em_atendimento: '#f5a623',
  concluido: '#2fb98a',
  faltou: '#f06a6a',
  cancelado: '#f06a6a',
}

const STATUS_LABEL: Record<string, string> = {
  agendado: 'Agendado',
  confirmado: 'Agendado',
  em_atendimento: 'Em andamento',
  concluido: 'Finalizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
}

const STATUS_LEGEND = [
  { color: '#6d5ae6', label: 'Agendado' },
  { color: '#f5a623', label: 'Em andamento' },
  { color: '#2fb98a', label: 'Finalizado' },
  { color: '#f06a6a', label: 'Cancelado / Faltou' },
]

function isoToDate(iso: string) {
  return new Date(iso + 'T00:00:00')
}

function shiftDays(iso: string, days: number) {
  const d = isoToDate(iso)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function formatWeekRange(monday: Date) {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`
}

function formatDayLabel(d: Date) {
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  return `${cap}, ${d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

function parseHour(t: string): { h: number; m: number } {
  const [h, m] = t.split(':').map(Number)
  return { h, m }
}

function eventPosition(ev: AgendaEvento) {
  const start = parseHour(ev.hora_inicio)
  const end = parseHour(ev.hora_fim)
  const startMins = (start.h - HOURS[0]) * 60 + start.m
  const durMins = end.h * 60 + end.m - (start.h * 60 + start.m)
  const ROW_HEIGHT = 64 // px per hour
  return {
    top: (startMins / 60) * ROW_HEIGHT,
    height: Math.max(28, (durMins / 60) * ROW_HEIGHT - 4),
  }
}

function overlaps(a: AgendaEvento, b: AgendaEvento) {
  return a.hora_fim > b.hora_inicio && a.hora_inicio < b.hora_fim
}

function layoutDay(events: AgendaEvento[]): Map<string, { col: number; total: number }> {
  const sorted = [...events].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio))
  const placed: { ev: AgendaEvento; col: number }[] = []

  for (const ev of sorted) {
    const usedCols = new Set(placed.filter((p) => overlaps(p.ev, ev)).map((p) => p.col))
    let col = 0
    while (usedCols.has(col)) col++
    placed.push({ ev, col })
  }

  const layout = new Map<string, { col: number; total: number }>()
  for (const p of placed) {
    const cluster = placed.filter((q) => overlaps(q.ev, p.ev))
    const maxCol = Math.max(...cluster.map((q) => q.col))
    layout.set(p.ev.id, { col: p.col, total: maxCol + 1 })
  }
  return layout
}

function hexToBg(hex: string): string {
  return `${hex}33` // ~20% opacity
}

type DragPayload = { id: string; hora_inicio: string; hora_fim: string; data: string }

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function AgendaCalendar({
  view,
  anchorISO,
  eventos,
}: {
  view: AgendaView
  anchorISO: string
  eventos: AgendaEvento[]
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const anchor = isoToDate(anchorISO)
  const today = todayISO()

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropHint, setDropHint] = useState<{ day: string; top: number } | null>(null)
  const [isMoving, startMoveTransition] = useTransition()

  function snapToSlot(y: number): { minutes: number; top: number } {
    const ROW_HEIGHT = 64
    const startHour = HOURS[0]
    const minutesFromGridTop = (y / ROW_HEIGHT) * 60
    const totalMinutes = startHour * 60 + minutesFromGridTop
    const minutes = Math.max(startHour * 60, Math.round(totalMinutes / 15) * 15)
    const top = ((minutes - startHour * 60) / 60) * ROW_HEIGHT
    return { minutes, top }
  }

  function onColumnDragOver(e: React.DragEvent<HTMLDivElement>, dayISO: string) {
    if (!draggedId) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const { top } = snapToSlot(y)
    setDropHint({ day: dayISO, top })
  }

  function onColumnDragLeave() {
    setDropHint(null)
  }

  function onColumnDrop(e: React.DragEvent<HTMLDivElement>, dayISO: string) {
    e.preventDefault()
    const raw = e.dataTransfer.getData('application/x-agendamento')
    setDropHint(null)
    setDraggedId(null)
    if (!raw) return

    let payload: DragPayload
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const y = e.clientY - rect.top
    const { minutes } = snapToSlot(y)
    const newH = Math.floor(minutes / 60)
    const newM = minutes % 60
    const newHoraInicio = `${pad(newH)}:${pad(newM)}:00`

    const [oldStartH, oldStartM] = payload.hora_inicio.split(':').map(Number)
    const [oldEndH, oldEndM] = payload.hora_fim.split(':').map(Number)
    const durMin = oldEndH * 60 + oldEndM - (oldStartH * 60 + oldStartM)
    const endTotal = minutes + Math.max(durMin, 15)
    const endH = Math.floor(endTotal / 60)
    const endM = endTotal % 60
    const newHoraFim = `${pad(endH)}:${pad(endM)}:00`

    const samePlace =
      payload.data === dayISO &&
      payload.hora_inicio.slice(0, 5) === newHoraInicio.slice(0, 5)
    if (samePlace) return

    startMoveTransition(async () => {
      const result = await moveAgendamentoAction(payload.id, dayISO, newHoraInicio, newHoraFim)
      if (!result.ok) {
        alert('Erro ao mover consulta: ' + result.error)
        return
      }
      router.refresh()
    })
  }

  const days = view === 'week'
    ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(anchor)
        d.setDate(anchor.getDate() + i)
        return d
      })
    : [anchor]

  const dateLabel = view === 'week' ? formatWeekRange(anchor) : formatDayLabel(anchor)

  function navigate(delta: number) {
    const step = view === 'week' ? 7 : 1
    const next = shiftDays(anchorISO, delta * step)
    const params = new URLSearchParams(searchParams.toString())
    params.set('date', next)
    router.push(`/agenda?${params.toString()}`)
  }

  function goToday() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('date')
    router.push(`/agenda${params.toString() ? '?' + params.toString() : ''}`)
  }

  function setView(v: AgendaView) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    // When switching to day mode from week, anchor on the current week's monday OR today
    // When switching to week from day, anchor monday of the day's week
    router.push(`/agenda?${params.toString()}`)
  }

  const eventosByDay: Record<string, AgendaEvento[]> = {}
  for (const ev of eventos) {
    if (!eventosByDay[ev.data]) eventosByDay[ev.data] = []
    eventosByDay[ev.data].push(ev)
  }

  const gridCols = view === 'week' ? 'grid-cols-[60px_repeat(7,1fr)]' : 'grid-cols-[60px_1fr]'

  return (
    <>
      <div className="flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-[13px] border border-border bg-card flex items-center justify-center cursor-pointer hover:bg-bg transition-colors">
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(1)} className="w-9 h-9 rounded-[13px] border border-border bg-card flex items-center justify-center cursor-pointer hover:bg-bg transition-colors">
            <ChevronRightIcon className="w-4 h-4" />
          </button>
          <button onClick={goToday} className="px-[18px] py-2 rounded-[13px] border border-border bg-card text-[13px] font-semibold cursor-pointer hover:bg-bg transition-colors">
            Hoje
          </button>
          <div className="flex items-center gap-2 ml-3 text-sm font-medium text-text">
            <CalendarIcon className="w-[18px] h-[18px] text-muted" />
            <span>{dateLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3 mr-2">
            {STATUS_LEGEND.map((s) => (
              <div key={s.color} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-[11px] text-muted font-medium">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="flex rounded-[13px] border border-border bg-card p-0.5">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${
                view === 'day' ? 'bg-[#f1eefb] text-[#5b4bd4]' : 'text-muted hover:text-text'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-semibold cursor-pointer transition-all ${
                view === 'week' ? 'bg-[#f1eefb] text-[#5b4bd4]' : 'text-muted hover:text-text'
              }`}
            >
              Semana
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        <div className={`grid ${gridCols} border-b border-border bg-bg`}>
          <div />
          {days.map((d, i) => {
            const iso = d.toISOString().slice(0, 10)
            const isToday = iso === today
            const weekdayLabel = view === 'week'
              ? WEEKDAYS[i]
              : d.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^./, (c) => c.toUpperCase())
            return (
              <div key={i} className={`px-3 py-3 text-center border-l border-border ${isToday ? 'bg-card' : ''}`}>
                <div className={`text-xs font-semibold ${isToday ? 'text-text' : 'text-muted'}`}>{weekdayLabel}</div>
                <div className={`text-sm font-bold mt-0.5 ${isToday ? 'text-text' : 'text-muted'}`}>{String(d.getDate()).padStart(2, '0')}/{String(d.getMonth() + 1).padStart(2, '0')}</div>
              </div>
            )
          })}
        </div>

        <div className={`grid ${gridCols} relative`}>
          <div>
            {HOURS.map((h) => (
              <div key={h} className="h-16 border-b border-border text-[11px] text-muted text-center pt-1">
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {days.map((d, dayIdx) => {
            const iso = d.toISOString().slice(0, 10)
            const dayEvents = eventosByDay[iso] ?? []
            const layout = layoutDay(dayEvents)
            const isToday = iso === today
            const showHint = dropHint?.day === iso
            return (
              <div
                key={dayIdx}
                className={`relative border-l border-border ${isToday ? 'bg-blue/5' : ''}`}
                onDragOver={(e) => onColumnDragOver(e, iso)}
                onDragLeave={onColumnDragLeave}
                onDrop={(e) => onColumnDrop(e, iso)}
              >
                {HOURS.map((h) => (
                  <Link
                    key={h}
                    href={`/agenda/novo?data=${iso}`}
                    className="h-16 border-b border-border block hover:bg-bg/50 transition-colors cursor-pointer"
                  />
                ))}
                {showHint && dropHint && (
                  <div
                    className="absolute left-0 right-0 pointer-events-none border-t-2 border-text/60 z-10"
                    style={{ top: `${dropHint.top}px` }}
                  >
                    <div className="absolute -top-2 -left-1 w-3 h-3 rounded-full bg-text/60" />
                  </div>
                )}
                {dayEvents.map((ev) => {
                  const { top, height } = eventPosition(ev)
                  const color = STATUS_COLORS[ev.status] ?? '#7aa6d6'
                  const bg = hexToBg(color)
                  const slot = layout.get(ev.id) ?? { col: 0, total: 1 }
                  const widthPct = 100 / slot.total
                  const leftPct = slot.col * widthPct
                  const dimmed = ev.status === 'cancelado' || ev.status === 'faltou'
                  const isDragging = draggedId === ev.id
                  const titleParts = [
                    `${ev.hora_inicio.slice(0, 5)} – ${ev.hora_fim.slice(0, 5)} · ${ev.paciente_nome}`,
                    ev.profissional_nome,
                    ev.tipo_nome ?? '',
                    STATUS_LABEL[ev.status] ?? ev.status,
                    ev.notas ? `\n📝 ${ev.notas}` : '',
                  ].filter(Boolean).join(' · ')
                  return (
                    <Link
                      key={ev.id}
                      href={`/agenda/${ev.id}`}
                      draggable
                      onDragStart={(e) => {
                        const payload: DragPayload = {
                          id: ev.id,
                          hora_inicio: ev.hora_inicio,
                          hora_fim: ev.hora_fim,
                          data: ev.data,
                        }
                        e.dataTransfer.setData('application/x-agendamento', JSON.stringify(payload))
                        e.dataTransfer.effectAllowed = 'move'
                        setDraggedId(ev.id)
                      }}
                      onDragEnd={() => {
                        setDraggedId(null)
                        setDropHint(null)
                      }}
                      className={`absolute rounded-[8px] px-2 py-1.5 overflow-hidden text-[11px] cursor-grab active:cursor-grabbing hover:shadow-md hover:ring-2 hover:ring-text/20 transition-all ${dimmed ? 'opacity-60 line-through' : ''} ${isDragging ? 'opacity-30 ring-2 ring-text/40' : ''}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        left: `calc(${leftPct}% + 2px)`,
                        width: `calc(${widthPct}% - 4px)`,
                        background: bg,
                        borderLeft: `3px solid ${color}`,
                      }}
                      title={titleParts}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="font-bold text-[10px] truncate">{ev.hora_inicio.slice(0, 5)} – {ev.hora_fim.slice(0, 5)}</div>
                        {ev.notas && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 flex-shrink-0 text-text/70" aria-label="Tem observação">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                          </svg>
                        )}
                      </div>
                      <div className="font-semibold text-[11px] truncate">{ev.paciente_nome}</div>
                      {ev.tipo_nome && <div className="text-[10px] opacity-70 truncate">{ev.tipo_nome}</div>}
                    </Link>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {isMoving && (
        <div className="fixed bottom-6 right-6 bg-text text-white text-xs font-semibold px-4 py-2 rounded-[13px] shadow-lg">
          Movendo consulta…
        </div>
      )}

      {eventos.length === 0 && (
        <div className="mt-5 text-center text-sm text-muted">
          Nenhum agendamento {view === 'day' ? 'neste dia' : 'nesta semana'}. Clique num horário pra criar.
        </div>
      )}
    </>
  )
}
