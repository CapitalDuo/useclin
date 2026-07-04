'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Field } from '@/components/ui/field'
import { criarMedicaoAction, excluirMedicaoAction } from './actions'

export function NovaMedicaoForm({ pacienteId, hoje }: { pacienteId: string; hoje: string }) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await criarMedicaoAction(pacienteId, formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      formRef.current?.reset()
      router.refresh()
    })
  }

  return (
    <form ref={formRef} action={handleSubmit} className="bg-card border border-border rounded-[14px] p-6">
      <h3 className="font-playfair text-base font-bold mb-4">Nova medição</h3>
      <div className="grid grid-cols-4 gap-4">
        <Field label="Data" name="data" type="date" required defaultValue={hoje} />
        <Field label="Peso (kg)" name="peso_kg" placeholder="7,4" />
        <Field label="Altura (cm)" name="altura_cm" placeholder="68,5" />
        <Field label="Perím. cefálico (cm)" name="perimetro_cefalico_cm" placeholder="43,2" />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium mt-4">{error}</div>}

      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Salvando…' : 'Registrar medição'}
        </button>
      </div>
    </form>
  )
}

export function ExcluirMedicaoButton({ id, pacienteId }: { id: string; pacienteId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await excluirMedicaoAction(id, pacienteId)
      setConfirming(false)
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0 justify-end">
        <span className="text-[11px] text-muted">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-red/10 text-red hover:bg-red hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-bg text-muted hover:text-text transition-colors border border-border"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-[8px] text-muted hover:text-red hover:bg-red/10 transition-colors flex-shrink-0"
      title="Excluir medição"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    </button>
  )
}
