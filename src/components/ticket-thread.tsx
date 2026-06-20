'use client'

import { useState } from 'react'
import { addMensagemAction, updateTicketStatusAction } from '@/app/suporte/actions'

type Mensagem = {
  id: string
  autor_tipo: string
  conteudo: string
  created_at: string
}

type Ticket = {
  id: string
  assunto: string
  categoria: string
  status: string
  prioridade: string
  created_at: string
  clinica_nome?: string | null
}

const statusOptions = [
  { value: 'aberto', label: 'Aberto' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'aguardando_cliente', label: 'Aguardando cliente' },
  { value: 'resolvido', label: 'Resolvido' },
  { value: 'fechado', label: 'Fechado' },
]

export function TicketThread({
  ticket,
  mensagens,
  asRole,
}: {
  ticket: Ticket
  mensagens: Mensagem[]
  asRole: 'cliente' | 'admin'
}) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conteudo, setConteudo] = useState('')
  const [status, setStatus] = useState(ticket.status)
  const [items, setItems] = useState(mensagens)

  async function handleReply(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await addMensagemAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setConteudo('')
    if (result.mensagem) setItems([...items, result.mensagem])
  }

  async function handleStatusChange(newStatus: string) {
    setStatus(newStatus)
    await updateTicketStatusAction(ticket.id, newStatus)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="bg-card border border-border rounded-[14px] p-6">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h1 className="font-playfair text-2xl font-extrabold tracking-tight">{ticket.assunto}</h1>
            {ticket.clinica_nome && (
              <p className="text-sm text-muted mt-1">{ticket.clinica_nome}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {asRole === 'admin' ? (
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-card outline-none focus:border-[#5b4bd4] transition-colors cursor-pointer"
              >
                {statusOptions.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <span className="text-[11px] font-semibold px-3 py-1 rounded-md bg-bg text-text">
                {statusOptions.find(o => o.value === status)?.label}
              </span>
            )}
            <span className="text-[11px] text-muted">
              {ticket.categoria} · {ticket.prioridade}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 && (
          <div className="text-center py-8 text-sm text-muted">Sem mensagens ainda.</div>
        )}
        {items.map((m) => {
          const isMine = m.autor_tipo === asRole
          return (
            <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-[14px] p-4 ${
                isMine ? 'bg-text text-white' : 'bg-card border border-border'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isMine ? 'text-white/60' : 'text-muted'}`}>
                  {m.autor_tipo === 'admin' ? 'Suporte' : 'Cliente'}
                </div>
                <div className="text-sm whitespace-pre-wrap">{m.conteudo}</div>
                <div className={`text-[10px] mt-2 ${isMine ? 'text-white/60' : 'text-muted'}`}>
                  {new Date(m.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form action={handleReply} className="bg-card border border-border rounded-[14px] p-5 flex flex-col gap-3">
        <input type="hidden" name="ticket_id" value={ticket.id} />
        <input type="hidden" name="autor_tipo" value={asRole} />
        <textarea
          name="conteudo"
          required
          rows={3}
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder={asRole === 'admin' ? 'Responder ao cliente…' : 'Escreva sua mensagem…'}
          className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
        />
        {error && <div className="text-xs text-red font-medium">{error}</div>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending || !conteudo.trim()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {pending ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  )
}
