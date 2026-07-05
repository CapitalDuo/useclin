// Sincronização agendamento → transação financeira. Extraído de
// agenda/actions.ts pra ser reutilizado pelo módulo Consultas (finalizar
// consulta também muda status e precisa refletir no financeiro).
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

type Sb = SupabaseClient<Database>

function transacaoStatusFromAgendamento(
  agendamentoStatus: string,
): 'pago' | 'pendente' | 'cancelado' {
  if (agendamentoStatus === 'concluido') return 'pago'
  if (agendamentoStatus === 'cancelado' || agendamentoStatus === 'faltou') return 'cancelado'
  return 'pendente'
}

/**
 * Sincroniza a transação vinculada a um agendamento.
 * - valor > 0: faz upsert da transação com status derivado do agendamento
 * - valor null/zero: deleta a transação se existir
 *
 * Roda como side-effect dos actions de create/update do agendamento. Falhas
 * são logadas mas não revertem o salvamento do agendamento (rede / RLS edge
 * cases não devem bloquear a marcação).
 */
export async function syncTransacao(
  sb: Sb,
  args: {
    agendamento_id: string
    paciente_id: string
    valor: number | null
    data: string
    status: string
    descricao?: string | null
  },
) {
  const { agendamento_id, paciente_id, valor, data, status, descricao } = args

  const { data: existing } = await sb
    .from('transacoes')
    .select('id')
    .eq('agendamento_id', agendamento_id)
    .maybeSingle()

  if (!valor || valor <= 0) {
    if (existing) {
      await sb.from('transacoes').delete().eq('id', existing.id)
    }
    return
  }

  const transacaoStatus = transacaoStatusFromAgendamento(status)

  const { data: paciente } = await sb
    .from('pacientes')
    .select('clinica_id')
    .eq('id', paciente_id)
    .maybeSingle()
  if (!paciente?.clinica_id) return

  if (existing) {
    await sb
      .from('transacoes')
      .update({
        paciente_id,
        clinica_id: paciente.clinica_id,
        valor,
        status: transacaoStatus,
        data,
        descricao: descricao ?? null,
      })
      .eq('id', existing.id)
  } else {
    await sb.from('transacoes').insert({
      agendamento_id,
      paciente_id,
      clinica_id: paciente.clinica_id,
      tipo: 'receita',
      valor,
      status: transacaoStatus,
      data,
      descricao: descricao ?? null,
    })
  }
}
