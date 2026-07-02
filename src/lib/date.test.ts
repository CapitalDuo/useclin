import { describe, it, expect } from 'vitest'
import { mondayOf, isoDate } from './date'

// todayISO()/todayBrazil() dependem do relógio real e do fuso America/Sao_Paulo
// (Intl da máquina que roda o teste) — testados indiretamente via mondayOf/isoDate,
// que são puros e determinísticos a partir de um Date dado.

describe('isoDate', () => {
  it('formata a partir das partes locais (sem depender de UTC)', () => {
    expect(isoDate(new Date(2026, 6, 2))).toBe('2026-07-02') // mês 6 = julho
  })

  it('preenche zero à esquerda em mês/dia de um dígito', () => {
    expect(isoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('mondayOf', () => {
  it('retorna a própria data se já for segunda', () => {
    const segunda = new Date(2026, 5, 29) // 29/06/2026 é segunda
    expect(isoDate(mondayOf(segunda))).toBe('2026-06-29')
  })

  it('volta pra segunda anterior quando a data é no meio da semana', () => {
    const quinta = new Date(2026, 6, 2) // 02/07/2026 é quinta
    expect(isoDate(mondayOf(quinta))).toBe('2026-06-29')
  })

  it('trata domingo corretamente (volta 6 dias, não avança)', () => {
    // Bug comum em cálculo de "segunda da semana": domingo (getDay()===0)
    // precisa voltar 6 dias, não ficar preso num loop de +1.
    const domingo = new Date(2026, 6, 5) // 05/07/2026 é domingo
    expect(isoDate(mondayOf(domingo))).toBe('2026-06-29')
  })

  it('zera a hora pra meia-noite local', () => {
    const comHora = new Date(2026, 6, 2, 15, 30)
    const seg = mondayOf(comHora)
    expect(seg.getHours()).toBe(0)
    expect(seg.getMinutes()).toBe(0)
  })
})
