import { describe, it, expect } from 'vitest'
import { parseBrlInput, formatBrl, formatBrlPlain } from './currency'

// Intl.NumberFormat('pt-BR', { style: 'currency' }) usa NBSP ( ) entre
// "R$" e o número, visualmente igual a um espaço comum mas byte-diferente —
// normaliza antes de comparar strings exatas.
function semNbsp(s: string) {
  return s.replace(/ /g, ' ')
}

describe('parseBrlInput', () => {
  it('parseia valor simples com vírgula decimal', () => {
    const result = parseBrlInput('150,50')
    expect(result?.valor).toBe(150.5)
    expect(semNbsp(result?.formatted ?? '')).toBe('R$ 150,50')
  })

  it('parseia valor com separador de milhar BR ("1.234,56")', () => {
    // Bug histórico do projeto: "1.234,56" virava NaN antes de parseBrlInput existir.
    expect(parseBrlInput('1.234,56')?.valor).toBe(1234.56)
  })

  it('parseia valor sem separador decimal', () => {
    expect(parseBrlInput('150')?.valor).toBe(150)
  })

  it('parseia formato US ("1,234.56")', () => {
    expect(parseBrlInput('1,234.56')?.valor).toBe(1234.56)
  })

  it('ignora prefixo "R$" e espaços', () => {
    expect(parseBrlInput('R$ 1.200,00')?.valor).toBe(1200)
  })

  it('retorna null pra string vazia', () => {
    expect(parseBrlInput('')).toBeNull()
    expect(parseBrlInput('   ')).toBeNull()
  })

  it('retorna null pra valor negativo', () => {
    expect(parseBrlInput('-50')).toBeNull()
  })

  it('arredonda pra 2 casas decimais', () => {
    expect(parseBrlInput('10,999')?.valor).toBe(11)
  })
})

describe('formatBrl', () => {
  it('formata com prefixo R$ e 2 casas decimais', () => {
    expect(semNbsp(formatBrl(1234.5))).toBe('R$ 1.234,50')
  })

  it('trata null/undefined como zero', () => {
    expect(semNbsp(formatBrl(null))).toBe('R$ 0,00')
    expect(semNbsp(formatBrl(undefined))).toBe('R$ 0,00')
  })
})

describe('formatBrlPlain', () => {
  it('formata sem prefixo, pronto pra reeditar em input', () => {
    expect(formatBrlPlain(1200)).toBe('1.200,00')
  })

  it('retorna string vazia pra null/undefined', () => {
    expect(formatBrlPlain(null)).toBe('')
  })
})
