'use client'

import { useState } from 'react'
import { upsertWhatsappAction } from '../actions'

type Initial = { id: string; nome_instancia: string; numero: string }

export function WhatsappForm({ initial }: { initial: Initial | null }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setSaved(false)
    const result = await upsertWhatsappAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-7 flex flex-col gap-5">
      <div>
        <h2 className="font-playfair text-base font-bold mb-1">Instância WhatsApp</h2>
        <p className="text-xs text-muted">Configuração da Evolution API para envio de mensagens</p>
      </div>

      <input type="hidden" name="id" value={initial?.id ?? ''} />

      <div className="border-t border-border pt-5 grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Nome da instância</label>
          <input
            name="nome_instancia"
            required
            placeholder="ex: rosan-clinica"
            defaultValue={initial?.nome_instancia ?? ''}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Número (com DDI)</label>
          <input
            name="numero"
            required
            placeholder="5564999999999"
            defaultValue={initial?.numero ?? ''}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}
      {saved && <div className="text-xs text-green bg-green-light rounded-lg px-3 py-2 font-medium">Instância salva ✓</div>}

      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Salvando…' : initial ? 'Salvar alterações' : 'Cadastrar instância'}
        </button>
      </div>
    </form>
  )
}
