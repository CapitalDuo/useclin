'use client'

import { useState } from 'react'
import { updateHorariosAction } from '../actions'

type HorarioRow = {
  dia_semana: number
  aberto: boolean
  hora_inicio: string
  hora_fim: string
}

const KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
const LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']

export function HorariosForm({ initial }: { initial: HorarioRow[] }) {
  const [rows, setRows] = useState<HorarioRow[]>(initial)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function updateRow(dia: number, patch: Partial<HorarioRow>) {
    setRows(rows.map((r) => (r.dia_semana === dia ? { ...r, ...patch } : r)))
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setSaved(false)
    const result = await updateHorariosAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  // Sort to display Monday-first
  const order = [1, 2, 3, 4, 5, 6, 0]

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-7 flex flex-col gap-5">
      <div>
        <h2 className="font-playfair text-base font-bold mb-1">Horário de funcionamento</h2>
        <p className="text-xs text-muted">Defina os dias e horários em que a clínica atende</p>
      </div>

      <div className="border-t border-border pt-5 flex flex-col gap-2.5">
        {order.map((dia) => {
          const row = rows.find((r) => r.dia_semana === dia)
          if (!row) return null
          const key = KEYS[dia]
          return (
            <div key={dia} className="flex items-center gap-4 py-2.5 px-4 rounded-[13px] bg-bg">
              <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[180px]">
                <input
                  type="checkbox"
                  name={`${key}_aberto`}
                  checked={row.aberto}
                  onChange={(e) => updateRow(dia, { aberto: e.target.checked })}
                  className="w-4 h-4 rounded accent-green cursor-pointer"
                />
                <span className={`text-sm font-medium ${row.aberto ? 'text-text' : 'text-muted line-through'}`}>
                  {LABELS[dia]}
                </span>
              </label>
              {row.aberto ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    name={`${key}_inicio`}
                    value={row.hora_inicio}
                    onChange={(e) => updateRow(dia, { hora_inicio: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                  />
                  <span className="text-xs text-muted">às</span>
                  <input
                    type="time"
                    name={`${key}_fim`}
                    value={row.hora_fim}
                    onChange={(e) => updateRow(dia, { hora_fim: e.target.value })}
                    className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                  />
                </div>
              ) : (
                <span className="text-xs text-muted font-medium">Fechado</span>
              )}
            </div>
          )
        })}
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}
      {saved && <div className="text-xs text-green bg-green-light rounded-lg px-3 py-2 font-medium">Horários salvos ✓</div>}

      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Salvando…' : 'Salvar horários'}
        </button>
      </div>
    </form>
  )
}
