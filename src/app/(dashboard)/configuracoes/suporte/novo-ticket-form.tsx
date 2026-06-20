'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTicketAction } from '@/lib/actions/suporte'

const CATEGORIAS = [
  { value: 'geral', label: 'Geral' },
  { value: 'bug', label: 'Reportar bug' },
  { value: 'duvida', label: 'Dúvida' },
  { value: 'feature', label: 'Sugestão' },
  { value: 'cobranca', label: 'Cobrança' },
]

export function NovoTicketForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createTicketAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    router.push(`/configuracoes/suporte/${result.ticketId}`)
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
            <div className="text-sm font-semibold">Abrir nova solicitação</div>
            <div className="text-xs text-muted">Manda uma dúvida, bug ou sugestão pra gente</div>
          </div>
        </div>
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-6 flex flex-col gap-4">
      <h2 className="font-playfair text-base font-bold">Nova solicitação</h2>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Assunto</label>
        <input
          name="assunto"
          required
          maxLength={120}
          placeholder="Resumo do que você precisa"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Categoria</label>
        <select
          name="categoria"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
        >
          {CATEGORIAS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Mensagem</label>
        <textarea
          name="conteudo"
          required
          rows={4}
          placeholder="Descreva com detalhes o que está acontecendo ou o que você precisa"
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
      </div>

      {error && <div className="text-xs text-red font-medium">{error}</div>}

      <div className="flex justify-end gap-3 pt-2 border-t border-border">
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
          {pending ? 'Enviando…' : 'Abrir solicitação'}
        </button>
      </div>
    </form>
  )
}
