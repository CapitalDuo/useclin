import { describe, it, expect } from 'vitest'
import { isTrialAtivo, trialDiasRestantes, planoEfetivo } from './plano'

describe('isTrialAtivo', () => {
  it('é falso sem trial_ends_at', () => {
    expect(isTrialAtivo(null)).toBe(false)
  })

  it('é true quando a data ainda não passou', () => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(isTrialAtivo(amanha)).toBe(true)
  })

  it('é false quando a data já passou', () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(isTrialAtivo(ontem)).toBe(false)
  })
})

describe('trialDiasRestantes', () => {
  it('é zero sem trial_ends_at', () => {
    expect(trialDiasRestantes(null)).toBe(0)
  })

  it('nunca retorna negativo após expirar', () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(trialDiasRestantes(ontem)).toBe(0)
  })

  it('arredonda pra cima os dias restantes', () => {
    const em25h = new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString()
    expect(trialDiasRestantes(em25h)).toBe(2)
  })
})

describe('planoEfetivo — gating de acesso', () => {
  it('gratuito com trial ativo vira completo', () => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    expect(planoEfetivo('gratuito', amanha)).toBe('completo')
  })

  it('gratuito com trial expirado continua gratuito (bloqueia acesso)', () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    expect(planoEfetivo('gratuito', ontem)).toBe('gratuito')
  })

  it('plano pago nunca é afetado pelo trial', () => {
    expect(planoEfetivo('completo', null)).toBe('completo')
    expect(planoEfetivo('basico', null)).toBe('basico')
  })
})
