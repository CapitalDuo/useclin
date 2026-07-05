'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoader } from '@/components/page-loader'
import { criarDespesaFixaAction, atualizarDespesaFixaAction } from './actions'
import { formatBrlPlain } from '@/lib/currency'

const CATEGORIAS: { value: string; label: string }[] = [
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'salarios', label: 'Salários' },
  { value: 'utilidades', label: 'Água, luz, internet' },
  { value: 'material', label: 'Material / Insumos' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'impostos', label: 'Impostos / Taxas' },
  { value: 'assinaturas', label: 'Assinaturas / Sistemas' },
  { value: 'outros', label: 'Outros' },
]

type DespesaFixa = {
  id: string
  nome: string
  categoria: string
  valor: number
  dia_vencimento: number
  ativo: boolean
}

export function DespesaFixaForm({ despesaFixa }: { despesaFixa?: DespesaFixa }) {
  const router = useRouter()
  const isEdit = !!despesaFixa
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = despesaFixa
        ? await atualizarDespesaFixaAction(despesaFixa.id, formData)
        : await criarDespesaFixaAction(formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push('/financeiro/despesas-fixas')
      router.refresh()
    })
  }

  return (
    <>
      {isPending && <PageLoader message={isEdit ? 'Salvando…' : 'Cadastrando…'} />}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Nome *</label>
          <input
            name="nome"
            type="text"
            required
            defaultValue={despesaFixa?.nome}
            placeholder="Ex: Aluguel, salário da recepcionista..."
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Categoria</label>
            <select
              name="categoria"
              defaultValue={despesaFixa?.categoria ?? 'outros'}
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors cursor-pointer"
            >
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">Valor *</label>
            <input
              name="valor"
              type="text"
              inputMode="decimal"
              required
              defaultValue={despesaFixa ? formatBrlPlain(despesaFixa.valor) : ''}
              placeholder="0,00"
              className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted">Dia de vencimento *</label>
          <select
            name="dia_vencimento"
            defaultValue={despesaFixa?.dia_vencimento ?? 5}
            className="w-full border border-border rounded-[13px] px-4 py-3 text-sm bg-bg focus:outline-none focus:border-[#5b4bd4] transition-colors cursor-pointer"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>Dia {d}</option>
            ))}
          </select>
          <p className="text-[11px] text-muted">Vencimentos depois do dia 28 devem escolher o dia 28.</p>
        </div>

        {isEdit && (
          <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
            <input type="checkbox" name="ativo" defaultChecked={despesaFixa.ativo} className="w-4 h-4 rounded cursor-pointer" />
            Ativa (gera lançamento automaticamente todo mês)
          </label>
        )}

        {error && (
          <div className="bg-red-light border border-red/20 rounded-[13px] px-4 py-3 text-sm text-red">
            {error}
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
            {isPending ? 'Salvando...' : isEdit ? 'Salvar alterações' : 'Cadastrar despesa fixa'}
          </button>
        </div>
      </form>
    </>
  )
}
