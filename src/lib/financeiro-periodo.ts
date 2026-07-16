export function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

export function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

// Valida data vinda de URL param antes de usar em filtro de query.
export function isValidISODate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false
  const d = new Date(s + 'T00:00:00')
  return !Number.isNaN(d.getTime()) && iso(d) === s
}
