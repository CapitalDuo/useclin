'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/page-loader'
import { criarLancamentoAction } from '../actions'

export function LancamentoForm({ pacientes }: { pacientes: { id: string; nome: string }[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [tipo, setTipo] = useState<'receita' | 'despesa'>('despesa')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    startTransition(async () => {
      const result = await criarLancamentoAction(new FormData(e.currentTarget))
      if (!result.ok) {
        setErro(result.error)
      } else {
        router.push('/financeiro')
        router.refresh()
      }
    })
  }

  return (
    <>
      {isPending && <PageLoader />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex rounded-[13px] border border-border bg-bg p-1 w-fit">
          <button
            type="button"
            onClick={() => setTipo('despesa')}
            className={`px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer ${
              tipo === 'despesa' ? 'bg-red-light text-red' : 'text-muted hover:text-text'
            }`}
          >
            Despesa
          </button>
          <button
            type="button"
            onClick={() => setTipo('receita')}
            className={`px-5 py-2 rounded-[10px] text-sm font-semibold transition-colors cursor-pointer ${
              tipo === 'receita' ? 'bg-green-light text-green' : 'text-muted hover:text-text'
            }`}
          >
            Receita
          </button>
        </div>
        <input type="hidden" name="tipo" value={tipo} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Descrição *
          </label>
          <input
            name="descricao"
            type="text"
            required
            placeholder={tipo === 'despesa' ? 'Ex: Aluguel, material, salário...' : 'Ex: Venda de produto, reembolso...'}
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Valor *
            </label>
            <input
              name="valor"
              type="text"
              inputMode="decimal"
              required
              placeholder="0,00"
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Data
            </label>
            <input
              name="data"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Status
            </label>
            <select
              name="status"
              defaultValue="pago"
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors cursor-pointer"
            >
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Forma de pagamento
            </label>
            <input
              name="forma_pagamento"
              type="text"
              placeholder="Pix, cartão, dinheiro... (opcional)"
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">
            Paciente (opcional)
          </label>
          <select
            name="paciente_id"
            defaultValue=""
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors cursor-pointer"
          >
            <option value="">— sem paciente —</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>{p.nome}</option>
            ))}
          </select>
        </div>

        {erro && (
          <div className="bg-red-light border border-red/20 rounded-[13px] px-4 py-3 text-sm text-red">
            {erro}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-5">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted hover:text-text transition-colors font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#5b4bd4] text-white rounded-[13px] text-sm font-semibold hover:bg-[#4a3cb8] transition-all hover:-translate-y-px hover:shadow-lg disabled:opacity-60 disabled:pointer-events-none"
          >
            {isPending ? 'Salvando...' : 'Salvar lançamento'}
          </button>
        </div>
      </form>
    </>
  )
}
