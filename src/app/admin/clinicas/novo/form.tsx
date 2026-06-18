'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClinicaAction } from './actions'

export function NovaClinicaForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ email: string } | null>(null)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await createClinicaAction(formData)
    setPending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setSuccess({ email: result.adminEmail })
  }

  if (success) {
    return (
      <div className="bg-card border border-border rounded-[14px] p-8 flex flex-col gap-5">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-green-light flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="font-playfair text-xl font-extrabold tracking-tight">Clínica criada</h2>
          <p className="text-sm text-muted mt-1">Próximo passo: convidar o usuário admin</p>
        </div>

        <div className="bg-bg rounded-[12px] p-5 text-sm">
          <p className="font-semibold mb-2">Como convidar o usuário:</p>
          <ol className="text-muted space-y-1.5 list-decimal list-inside">
            <li>Vá ao painel Supabase → Authentication → Users</li>
            <li>Clique em &quot;Invite user&quot; e cole: <span className="font-mono font-semibold text-text">{success.email}</span></li>
            <li>O sistema vincula automaticamente o usuário ao profissional admin da clínica</li>
            <li>Ele recebe o link por email e define a senha</li>
          </ol>
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/clinicas"
            className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-border rounded-[10px] text-sm font-semibold hover:bg-bg transition-colors"
          >
            Ver clínicas
          </Link>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-text text-white rounded-[10px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
          >
            Criar outra
          </button>
        </div>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-8 flex flex-col gap-5">
      <div>
        <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Nome da clínica</label>
        <input
          name="clinica_nome"
          required
          placeholder="Ex: Clínica Bella Vita"
          className="w-full px-4 py-3 rounded-[10px] border border-border text-sm outline-none focus:border-text transition-colors bg-bg"
        />
      </div>

      <div className="border-t border-border pt-5">
        <h3 className="font-playfair text-base font-bold mb-1">Usuário admin da clínica</h3>
        <p className="text-xs text-muted mb-4">
          Esta pessoa será o primeiro acesso e completará o onboarding
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Nome completo</label>
            <input
              name="admin_nome"
              required
              placeholder="Dr. João Silva"
              className="w-full px-4 py-3 rounded-[10px] border border-border text-sm outline-none focus:border-text transition-colors bg-bg"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Email</label>
            <input
              name="admin_email"
              type="email"
              required
              placeholder="joao@clinica.com.br"
              className="w-full px-4 py-3 rounded-[10px] border border-border text-sm outline-none focus:border-text transition-colors bg-bg"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
        <Link
          href="/admin/clinicas"
          className="px-5 py-2.5 rounded-[10px] border border-border text-sm font-semibold hover:bg-bg transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[10px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Criando…' : 'Criar clínica →'}
        </button>
      </div>
    </form>
  )
}
