// Helpers de moeda BRL — padrão "R$ 1.234,56"

/**
 * Parse de string vinda do form (ex: "150", "150,5", "150,50", "1.234,56",
 * "150.50") pra centavos inteiros, retornando { valor: number, formatted: string }.
 * Sempre normaliza com 2 casas decimais.
 */
export function parseBrlInput(raw: string): { valor: number; formatted: string } | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  // Remove "R$", espaços, e qualquer letra. Mantém dígitos, ponto e vírgula.
  let s = trimmed.replace(/[^0-9.,-]/g, '')
  if (!s) return null

  // Se tem ambos . e ,: o último separador é decimal, o outro é milhar.
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  let normalized: string

  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) {
      // formato BR "1.234,56" → "1234.56"
      normalized = s.replace(/\./g, '').replace(',', '.')
    } else {
      // formato US "1,234.56" → "1234.56"
      normalized = s.replace(/,/g, '')
    }
  } else if (lastComma >= 0) {
    // só vírgula → decimal BR
    normalized = s.replace(',', '.')
  } else {
    // só ponto ou só dígitos
    normalized = s
  }

  const num = Number(normalized)
  if (!Number.isFinite(num) || num < 0) return null

  const rounded = Math.round(num * 100) / 100
  return { valor: rounded, formatted: formatBrl(rounded) }
}

/**
 * Formata número como BRL: "R$ 1.234,56". Sempre 2 casas decimais.
 */
export function formatBrl(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return 'R$ 0,00'
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formata número como "1.234,56" (sem prefixo). Usado em inputs.
 */
export function formatBrlPlain(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return ''
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
