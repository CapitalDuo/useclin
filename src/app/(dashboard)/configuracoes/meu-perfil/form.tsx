'use client'

import { useState } from 'react'
import { updateMeuPerfilAction } from '../actions'

type Profissional = {
  id: string
  nome: string
  especialidade: string | null
  registro: string | null
  email: string | null
  telefone: string | null
  role: string
}

export function MeuPerfilForm({ profissional }: { profissional: Profissional }) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    setSaved(false)
    const result = await updateMeuPerfilAction(formData)
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
        <h2 className="font-playfair text-base font-bold mb-1">Meus dados</h2>
        <p className="text-xs text-muted">Suas informações como profissional</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-border pt-5">
        <div className="col-span-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Nome completo</label>
          <input
            name="nome"
            required
            defaultValue={profissional.nome}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Especialidade</label>
          <input
            name="especialidade"
            placeholder="Ex: Dermatologia"
            defaultValue={profissional.especialidade ?? ''}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Registro (CRM/CRO)</label>
          <input
            name="registro"
            placeholder="CRM 123456"
            defaultValue={profissional.registro ?? ''}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Telefone</label>
          <input
            name="telefone"
            placeholder="(11) 99999-9999"
            defaultValue={profissional.telefone ?? ''}
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">E-mail</label>
          <input
            value={profissional.email ?? ''}
            disabled
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg text-muted cursor-not-allowed"
          />
          <p className="text-[10px] text-muted mt-1">Usado para login — entre em contato com o administrador para alterar.</p>
        </div>
      </div>

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}
      {saved && <div className="text-xs text-green bg-green-light rounded-lg px-3 py-2 font-medium">Perfil atualizado ✓</div>}

      <div className="flex justify-end pt-3 border-t border-border">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
