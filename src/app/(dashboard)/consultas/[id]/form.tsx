'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { PrescricaoForm } from '@/app/(dashboard)/pacientes/[id]/prescricoes/nova/form'
import { salvarRegistroAction, mudarStatusConsultaAction, excluirPrescricaoAction } from './actions'

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

export function ExcluirPrescricaoButton({ id, agendamentoId }: { id: string; agendamentoId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await excluirPrescricaoAction(id, agendamentoId)
      setConfirming(false)
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[11px] text-muted">Excluir?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-red/10 text-red hover:bg-red hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-bg text-muted hover:text-text transition-colors border border-border"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-[8px] text-muted hover:text-red hover:bg-red/10 transition-colors flex-shrink-0"
      title="Excluir prescrição"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    </button>
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

export function NovaPrescricaoButton({
  pacienteId,
  agendamentoId,
  dataConsultaDefault,
}: {
  pacienteId: string
  agendamentoId: string
  dataConsultaDefault: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-text text-white rounded-[11px] text-[13px] font-semibold hover:bg-[#333] transition-all cursor-pointer"
      >
        + Nova prescrição
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 sm:py-10 bg-text/30 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nova-prescricao-title"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="bg-card border border-border rounded-[18px] shadow-2xl w-full max-w-[700px] my-auto animate-[modalIn_180ms_ease-out]">
            <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border">
              <div>
                <h2 id="nova-prescricao-title" className="font-playfair text-[22px] font-extrabold tracking-tight">
                  Nova prescrição
                </h2>
                <p className="text-xs text-muted mt-0.5">Vinculada a esta consulta</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer -mr-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="px-7 py-6">
              <PrescricaoForm
                pacienteId={pacienteId}
                agendamentoId={agendamentoId}
                dataConsultaDefault={dataConsultaDefault}
                onSuccess={() => {
                  setOpen(false)
                  router.refresh()
                }}
                onCancel={() => setOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
