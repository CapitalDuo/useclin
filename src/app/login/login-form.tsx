'use client'

import { useState } from 'react'
import Image from 'next/image'
import { loginAction } from './actions'
import { PageLoader } from '@/components/page-loader'

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
    // Se ok, loginAction redireciona — o PageLoader fica visível até a nova página carregar
  }

  return (
    <>
      {pending && <PageLoader message="Entrando no sistema..." />}

      <div className="w-full max-w-[760px] rounded-[28px] overflow-hidden shadow-2xl flex min-h-[420px]">
        {/* Left panel — brand */}
        <div
          className="hidden md:flex flex-col items-center justify-between p-10 w-[320px] shrink-0"
          style={{ backgroundColor: '#5B66DA' }}
        >
          <div className="flex-1 flex items-center justify-center">
            <Image
              src="/useclin-logo-white.png"
              alt="Useclin"
              width={200}
              height={54}
              className="w-44 object-contain"
              priority
            />
          </div>

          <button
            type="button"
            className="flex items-center gap-2 px-7 py-3 bg-white rounded-full text-sm font-semibold transition-opacity hover:opacity-90 cursor-pointer"
            style={{ color: '#5B66DA' }}
          >
            <span>←</span>
            <span>Contrate agora</span>
          </button>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 bg-white flex flex-col justify-center px-6 sm:px-10 py-10 sm:py-12">
          <h1 className="text-2xl font-bold text-[#1e1b4b] mb-8">Bem vindo!</h1>

          <form action={handleSubmit} className="flex flex-col gap-6">
            <input type="hidden" name="next" value={next} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1e1b4b]">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="border-0 border-b border-[#d1d5db] pb-2 text-sm text-[#1e1b4b] placeholder:text-[#9ca3af] outline-none focus:border-[#5B66DA] transition-colors bg-transparent"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#1e1b4b]">Senha</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="sua senha"
                className="border-0 border-b border-[#d1d5db] pb-2 text-sm text-[#1e1b4b] placeholder:text-[#9ca3af] outline-none focus:border-[#5B66DA] transition-colors bg-transparent"
              />
              <button
                type="button"
                className="self-start text-xs mt-1 cursor-pointer hover:underline"
                style={{ color: '#5B66DA' }}
              >
                Esqueceu sua senha?
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 font-medium">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-px cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#1e1b4b' }}
            >
              {pending ? 'Entrando…' : 'Acessar →'}
            </button>

            <p className="text-xs text-center" style={{ color: '#5B66DA' }}>
              Precisa de ajuda?{' '}
              <button type="button" className="underline cursor-pointer hover:opacity-70">
                Clique aqui
              </button>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}
