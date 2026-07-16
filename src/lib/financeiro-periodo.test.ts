import { describe, it, expect } from 'vitest'
import { isValidISODate } from './financeiro-periodo'

describe('isValidISODate', () => {
  it('aceita data válida', () => {
    expect(isValidISODate('2026-07-16')).toBe(true)
  })

  it('rejeita formato errado', () => {
    expect(isValidISODate('16/07/2026')).toBe(false)
    expect(isValidISODate('2026-7-16')).toBe(false)
    expect(isValidISODate('')).toBe(false)
  })

  it('rejeita data inexistente', () => {
    expect(isValidISODate('2026-02-30')).toBe(false)
    expect(isValidISODate('2026-13-01')).toBe(false)
  })

  it('rejeita injeção de texto', () => {
    expect(isValidISODate('2026-07-16;drop')).toBe(false)
  })
})
