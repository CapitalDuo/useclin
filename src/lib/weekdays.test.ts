import { describe, it, expect } from 'vitest'
import { WEEKDAY_KEYS, WEEKDAY_MAP, DAY_LABELS } from './weekdays'

describe('WEEKDAY_MAP', () => {
  it('mapeia domingo pra 0, igual a Date.getDay()', () => {
    expect(WEEKDAY_MAP['dom']).toBe(0)
  })

  it('mapeia sábado pra 6', () => {
    expect(WEEKDAY_MAP['sab']).toBe(6)
  })

  it('tem uma entrada por cada key, na ordem de WEEKDAY_KEYS', () => {
    WEEKDAY_KEYS.forEach((key, i) => {
      expect(WEEKDAY_MAP[key]).toBe(i)
    })
  })
})

describe('DAY_LABELS', () => {
  it('tem 7 labels, na mesma ordem de WEEKDAY_MAP (domingo primeiro)', () => {
    expect(DAY_LABELS).toHaveLength(7)
    expect(DAY_LABELS[0]).toBe('Domingo')
    expect(DAY_LABELS[6]).toBe('Sábado')
  })
})
