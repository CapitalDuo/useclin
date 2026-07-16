export type PeriodoFiltro = 'este_mes' | 'mes_passado' | 'este_ano' | 'tudo'

export function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

export function resolvePeriodo(periodo: string, hoje: Date): { start: string | null; end: string | null } {
  if (periodo === 'mes_passado') {
    const prevMonth = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
    return { start: iso(startOfMonth(prevMonth)), end: iso(endOfMonth(prevMonth)) }
  }
  if (periodo === 'este_ano') {
    return { start: `${hoje.getFullYear()}-01-01`, end: `${hoje.getFullYear()}-12-31` }
  }
  if (periodo === 'tudo') {
    return { start: null, end: null }
  }
  // 'este_mes' é o default
  return { start: iso(startOfMonth(hoje)), end: iso(endOfMonth(hoje)) }
}
