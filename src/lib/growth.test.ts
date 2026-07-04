import { describe, it, expect } from 'vitest'
import { zScore, percentil, valorNoZ, idadeEmMeses, faixaIdade } from './growth'

describe('percentil LMS — valores de referência conhecidos', () => {
  it('mediana da OMS no nascimento é P50 (peso menino 3.3464 kg)', () => {
    // 3.3464 é o M exato da tabela OMS (weianthro, sexo 1, dia 0)
    expect(percentil('peso', 'M', 0, 3.3464)).toBeCloseTo(50, 1)
  })

  it('P97 do CDC aos 24 meses bate com a coluna publicada (peso menino 15.5965 kg)', () => {
    // 15.59648294 é a coluna P97 do cdc wtage (Sex=1, Agemos=24)
    expect(percentil('peso', 'M', 24, 15.59648294)).toBeCloseTo(97, 1)
  })

  it('mediana da OMS no nascimento é P50 (altura menina 49.1477 cm ± tabela)', () => {
    // M da lenanthro sexo 2 dia 0 = 49.1477
    expect(percentil('altura', 'F', 0, 49.1477)).toBeCloseTo(50, 0)
  })
})

describe('zScore / valorNoZ são inversos', () => {
  it('valorNoZ(zScore(x)) recupera x', () => {
    const z = zScore('peso', 'F', 6, 7.3)!
    expect(valorNoZ('peso', 'F', 6, z)).toBeCloseTo(7.3, 3)
  })

  it('z=0 devolve a mediana', () => {
    expect(valorNoZ('peso', 'M', 0, 0)).toBeCloseTo(3.3464, 3)
  })
})

describe('limites da referência', () => {
  it('fora da faixa de idade retorna null', () => {
    expect(percentil('pc', 'M', 40, 50)).toBeNull() // PC só vai até 36 meses
    expect(percentil('peso', 'M', 241, 70)).toBeNull()
    expect(percentil('peso', 'M', -1, 3)).toBeNull()
  })

  it('valor inválido retorna null', () => {
    expect(percentil('peso', 'M', 12, 0)).toBeNull()
    expect(percentil('peso', 'M', 12, -2)).toBeNull()
  })

  it('faixaIdade reflete as tabelas', () => {
    expect(faixaIdade('peso')).toEqual({ min: 0, max: 240 })
    expect(faixaIdade('pc').max).toBe(36)
  })
})

describe('idadeEmMeses', () => {
  it('mesma data = 0', () => {
    expect(idadeEmMeses('2026-01-01', '2026-01-01')).toBe(0)
  })

  it('um ano ≈ 12 meses', () => {
    expect(idadeEmMeses('2025-01-01', '2026-01-01')).toBeCloseTo(12, 1)
  })
})
