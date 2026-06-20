'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProntuarioAction } from './actions'

export function NovoProntuarioForm({ pacienteId }: { pacienteId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createProntuarioAction(pacienteId, formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full text-left bg-card border border-dashed border-border rounded-[14px] px-6 py-5 hover:border-text hover:bg-bg transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[13px] bg-bg flex items-center justify-center text-lg">+</div>
          <div>
            <div className="text-sm font-semibold">Novo registro de prontuário</div>
            <div className="text-xs text-muted">Anote descrição, diagnóstico e prescrição da consulta</div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-6 flex flex-col gap-4">
      <h3 className="font-playfair text-base font-bold">Novo registro</h3>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Descrição *</label>
        <textarea
          name="descricao"
          required
          rows={3}
          placeholder="O que aconteceu na consulta, queixa, evolução…"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Diagnóstico</label>
        <textarea
          name="diagnostico"
          rows={2}
          placeholder="CID, hipótese diagnóstica, conclusão clínica…"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Prescrição</label>
        <textarea
          name="prescricao"
          rows={3}
          placeholder="Medicamentos, posologia, conduta, orientações…"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      <div className="flex justify-end gap-3 pt-3 border-t border-border">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-5 py-2.5 rounded-[13px] border border-border text-sm font-semibold hover:bg-bg transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Salvando…' : 'Salvar registro'}
        </button>
      </div>
    </form>
  )
}
