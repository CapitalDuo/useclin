'use client'

import { useState } from 'react'
import { loginAction } from './actions'

export function LoginForm({ next, initialError }: { next: string; initialError?: string }) {
  const [error, setError] = useState<string | null>(initialError ?? null)
  const [pending, setPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await loginAction(formData)
    if (result && !result.ok) {
      setPending(false)
      setError(result.error)
    }
    // redirect on success happens server-side
  }

  return (
    <div className="w-full max-w-[420px]">
      <div className="flex items-center justify-center gap-3 mb-8">
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <circle cx="20" cy="20" r="18" stroke="#d4c5a9" strokeWidth="1.5" />
          <path d="M20 8 C16 12, 12 14, 12 20 C12 24, 14 28, 20 32 C26 28, 28 24, 28 20 C28 14, 24 12, 20 8Z" stroke="#d4c5a9" strokeWidth="1.2" fill="none" />
          <path d="M14 16 Q17 20, 20 16 Q23 20, 26 16" stroke="#d4c5a9" strokeWidth="1" fill="none" />
          <path d="M15 22 Q17.5 26, 20 22 Q22.5 26, 25 22" stroke="#d4c5a9" strokeWidth="1" fill="none" />
        </svg>
        <div>
          <span className="font-playfair text-xl font-extrabold tracking-tight">Rosan</span>
          <span className="text-[9px] font-semibold text-muted tracking-[2px] uppercase block -mt-0.5">Clínica Integrativa</span>
        </div>
      </div>

      <form
        action={handleSubmit}
        className="bg-card border border-border rounded-[18px] p-8 shadow-sm flex flex-col gap-5"
      >
        <div className="text-center mb-2">
          <h1 className="font-playfair text-2xl font-extrabold tracking-tight">Entrar</h1>
          <p className="text-sm text-muted mt-1">Acesse sua conta para continuar</p>
        </div>

        <input type="hidden" name="next" value={next} />

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Email</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@clinica.com.br"
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Senha</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
          />
        </div>

        {error && (
          <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Entrando…' : 'Entrar →'}
        </button>

        <p className="text-[11px] text-muted text-center mt-2">
          Sua clínica ainda não tem acesso? Entre em contato com o administrador da plataforma.
        </p>
      </form>
    </div>
  )
}
