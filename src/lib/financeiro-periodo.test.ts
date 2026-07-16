import { describe, it, expect } from 'vitest'
import { resolvePeriodo } from './financeiro-periodo'

const hoje = new Date(2026, 6, 16) // 16/07/2026

describe('resolvePeriodo', () => {
  it('este_mes retorna o mês corrente', () => {
    expect(resolvePeriodo('este_mes', hoje)).toEqual({ start: '2026-07-01', end: '2026-07-31' })
  })

  it('mes_passado retorna o mês anterior', () => {
    expect(resolvePeriodo('mes_passado', hoje)).toEqual({ start: '2026-06-01', end: '2026-06-30' })
  })

  it('mes_passado em janeiro volta pro ano anterior', () => {
    const janeiro = new Date(2026, 0, 15)
    expect(resolvePeriodo('mes_passado', janeiro)).toEqual({ start: '2025-12-01', end: '2025-12-31' })
  })

  it('este_ano retorna o ano inteiro', () => {
    expect(resolvePeriodo('este_ano', hoje)).toEqual({ start: '2026-01-01', end: '2026-12-31' })
  })

  it('tudo não limita por data', () => {
    expect(resolvePeriodo('tudo', hoje)).toEqual({ start: null, end: null })
  })
})
