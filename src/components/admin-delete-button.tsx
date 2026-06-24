'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteClinicaAction, deleteUsuarioAction } from '@/app/admin/actions'

export function AdminDeleteButton({
  kind,
  id,
  nome,
}: {
  kind: 'clinica' | 'usuario'
  id: string
  nome: string
}) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function onDelete() {
    setError(null)
    startTransition(async () => {
      const res = kind === 'clinica' ? await deleteClinicaAction(id) : await deleteUsuarioAction(id)
      if (!res.ok) {
        setError(res.error)
        setConfirming(false)
      } else {
        router.refresh()
      }
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="text-[11px] text-muted hidden sm:inline">
          Apagar {nome} e tudo ligado?
        </span>
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-md bg-[#d24343] text-white hover:bg-[#b83838] transition-colors cursor-pointer disabled:opacity-50"
        >
          {pending ? 'Excluindo…' : 'Sim, excluir'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="text-[11px] font-semibold px-3 py-1.5 rounded-md border border-border text-muted hover:bg-bg transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-[11px] text-[#d24343]">{error}</span>}
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Excluir ${nome}`}
        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-md text-[#d24343] bg-[#fdeaea] hover:bg-[#fbdada] transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
        </svg>
        Excluir
      </button>
    </div>
  )
}
