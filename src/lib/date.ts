// Utilitários de data compartilhados. Fonte única do fuso da clínica (Brasília)
// e dos helpers de semana/ISO que estavam duplicados em agenda, dashboard e
// modais.

export const TZ = 'America/Sao_Paulo'

/** Data de hoje no fuso de Brasília, em ISO `YYYY-MM-DD`. */
export function todayISO(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TZ })
}

/** `Date` (meia-noite local) representando o dia de hoje em Brasília. */
export function todayBrazil(): Date {
  const [y, m, d] = todayISO().split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Segunda-feira da semana que contém `d`, à meia-noite. */
export function mondayOf(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

/** Formata um `Date` como `YYYY-MM-DD` a partir das partes locais da data. */
export function isoDate(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}
