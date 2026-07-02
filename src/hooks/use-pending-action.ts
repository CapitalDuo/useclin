'use client'

import { useState } from 'react'

type ActionResult = { ok: boolean; error?: string } | void

/**
 * Padrão pending+error+PageLoader repetido em vários forms (criar/editar
 * paciente, lançamentos, despesas fixas, tickets de suporte...). Cada
 * instância do hook é independente — um form com ação de excluir separada
 * da de salvar usa duas instâncias (ver EditarPacienteForm).
 */
export function usePendingAction() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run(action: () => Promise<ActionResult>): Promise<boolean> {
    setPending(true)
    setError(null)
    const result = await action()
    if (result && !result.ok) {
      setPending(false)
      setError(result.error ?? 'Erro inesperado')
      return false
    }
    return true
  }

  return { pending, error, setError, run }
}
