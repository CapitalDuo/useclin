import { describe, it, expect } from 'vitest'
import { hasFeature } from './features'

describe('hasFeature — gating de módulo por tipo de clínica', () => {
  it('sem override, usa o default do tipo', () => {
    expect(hasFeature({ tipo_clinica: 'geral', features: {} }, 'financeiro')).toBe(true)
  })

  it('override da clínica vence o default do tipo', () => {
    expect(
      hasFeature({ tipo_clinica: 'geral', features: { atendimento: false } }, 'atendimento'),
    ).toBe(false)
  })

  it('override pode LIGAR o que o tipo tem desligado', () => {
    expect(
      hasFeature({ tipo_clinica: 'geral', features: { pediatria_completa: true } }, 'pediatria_completa'),
    ).toBe(true)
  })

  it('tipo desconhecido cai nos defaults de geral (nunca tranca a clínica)', () => {
    expect(hasFeature({ tipo_clinica: 'inexistente', features: {} }, 'agenda')).toBe(true)
  })

  it('features null/undefined (linha antiga) não quebra', () => {
    expect(hasFeature({ tipo_clinica: 'geral', features: null }, 'agenda')).toBe(true)
    expect(hasFeature({ tipo_clinica: 'geral', features: undefined }, 'pacientes')).toBe(true)
  })

  it('pediatria_completa: ligada só por padrão pro tipo pediatrica', () => {
    expect(hasFeature({ tipo_clinica: 'geral', features: {} }, 'pediatria_completa')).toBe(false)
    expect(hasFeature({ tipo_clinica: 'pediatrica', features: {} }, 'pediatria_completa')).toBe(true)
  })
})
