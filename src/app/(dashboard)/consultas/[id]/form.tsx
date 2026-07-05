'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { salvarRegistroAction, mudarStatusConsultaAction } from './actions'

type Registro = { anamnese: string | null; exame_fisico: string | null; conclusao: string | null }

function Campo({
  label,
  name,
  placeholder,
  defaultValue,
  rows = 4,
}: {
  label: string
  name: string
  placeholder: string
  defaultValue: string | null
  rows?: number
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <textarea
        name={name}
        rows={rows}
        placeholder={placeholder}
        defaultValue={defaultValue ?? ''}
        className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-y"
      />
    </div>
  )
}

export function RegistroForm({ agendamentoId, registro }: { agendamentoId: string; registro: Registro | null }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [salvo, setSalvo] = useState(false)

  function handleSubmit(formData: FormData) {
    setError(null)
    setSalvo(false)
    startTransition(async () => {
      const result = await salvarRegistroAction(agendamentoId, formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSalvo(true)
    })
  }

  return (
    <form action={handleSubmit} className="bg-card border border-border rounded-[14px] p-6 flex flex-col gap-5">
      <h2 className="font-playfair text-lg font-bold tracking-tight">Registro clínico</h2>

      <Campo label="Anamnese" name="anamnese" rows={5} placeholder="Anamnese clínica" defaultValue={registro?.anamnese ?? null} />
      <Campo label="Exame físico" name="exame_fisico" placeholder="Exame físico descritivo" defaultValue={registro?.exame_fisico ?? null} />
      <Campo label="Conclusão diagnóstica" name="conclusao" placeholder="Conclusão diagnóstica / plano" defaultValue={registro?.conclusao ?? null} />

      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      <div className="flex items-center justify-end gap-3">
        {salvo && !isPending && <span className="text-xs font-semibold text-green">Registro salvo ✓</span>}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Salvando…' : 'Salvar registro'}
        </button>
      </div>
    </form>
  )
}

export function MudarStatusButton({
  agendamentoId,
  novoStatus,
  label,
  destaque = false,
}: {
  agendamentoId: string
  novoStatus: 'em_atendimento' | 'concluido'
  label: string
  destaque?: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await mudarStatusConsultaAction(agendamentoId, novoStatus)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
        destaque
          ? 'bg-[#2fb98a] text-white hover:bg-[#28a67a] hover:-translate-y-px hover:shadow-lg'
          : 'border border-border text-muted hover:text-text hover:bg-bg'
      }`}
    >
      {isPending ? '…' : label}
    </button>
  )
}
