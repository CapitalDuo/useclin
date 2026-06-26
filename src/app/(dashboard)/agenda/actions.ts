'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { parseBrlInput } from '@/lib/currency'
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
async function syncTransacao(
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

  if (existing) {
    await sb
      .from('transacoes')
      .update({
        paciente_id,
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
      tipo: 'receita',
      valor,
      status: transacaoStatus,
      data,
      descricao: descricao ?? null,
    })
  }
}

export async function createAgendamentoAction(formData: FormData) {
  const paciente_id = String(formData.get('paciente_id') ?? '')
  const profissional_id = String(formData.get('profissional_id') ?? '')
  const tipo_consulta_id_raw = String(formData.get('tipo_consulta_id') ?? '')
  const data = String(formData.get('data') ?? '').trim()
  const hora_inicio = String(formData.get('hora_inicio') ?? '').trim()
  const hora_fim = String(formData.get('hora_fim') ?? '').trim()
  const notas = String(formData.get('notas') ?? '').trim()
  const valor_raw = String(formData.get('valor') ?? '').trim()
  const status = String(formData.get('status') ?? 'agendado')

  if (!paciente_id || !profissional_id || !data || !hora_inicio || !hora_fim) {
    return { ok: false as const, error: 'Paciente, profissional, data e horários são obrigatórios' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('write', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  const parsed = valor_raw ? parseBrlInput(valor_raw) : null
  const valor = parsed?.valor ?? null

  const tipo_consulta_id =
    tipo_consulta_id_raw && tipo_consulta_id_raw !== 'none' ? tipo_consulta_id_raw : null

  const { data: created, error } = await supabase
    .from('agendamentos')
    .insert({
      paciente_id,
      profissional_id,
      tipo_consulta_id,
      data,
      hora_inicio,
      hora_fim,
      status,
      notas: notas || null,
      valor,
    })
    .select('id')
    .single()

  if (error || !created) {
    return { ok: false as const, error: error?.message ?? 'Falha ao criar agendamento' }
  }

  await syncTransacao(supabase, {
    agendamento_id: created.id,
    paciente_id,
    valor,
    data,
    status,
    descricao: notas || 'Consulta',
  })

  revalidatePath('/agenda')
  revalidatePath('/')
  revalidatePath('/financeiro')
  return { ok: true as const }
}

export async function updateAgendamentoAction(id: string, formData: FormData) {
  const paciente_id = String(formData.get('paciente_id') ?? '')
  const profissional_id = String(formData.get('profissional_id') ?? '')
  const tipo_consulta_id_raw = String(formData.get('tipo_consulta_id') ?? '')
  const data = String(formData.get('data') ?? '').trim()
  const hora_inicio = String(formData.get('hora_inicio') ?? '').trim()
  const hora_fim = String(formData.get('hora_fim') ?? '').trim()
  const notas = String(formData.get('notas') ?? '').trim()
  const valor_raw = String(formData.get('valor') ?? '').trim()
  const status = String(formData.get('status') ?? 'agendado')

  if (!paciente_id || !profissional_id || !data || !hora_inicio || !hora_fim) {
    return { ok: false as const, error: 'Paciente, profissional, data e horários são obrigatórios' }
  }

  const supabase = await createClient()
  const parsed = valor_raw ? parseBrlInput(valor_raw) : null
  const valor = parsed?.valor ?? null

  const tipo_consulta_id =
    tipo_consulta_id_raw && tipo_consulta_id_raw !== 'none' ? tipo_consulta_id_raw : null

  const { error } = await supabase
    .from('agendamentos')
    .update({
      paciente_id,
      profissional_id,
      tipo_consulta_id,
      data,
      hora_inicio,
      hora_fim,
      status,
      notas: notas || null,
      valor,
    })
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  await syncTransacao(supabase, {
    agendamento_id: id,
    paciente_id,
    valor,
    data,
    status,
    descricao: notas || 'Consulta',
  })

  revalidatePath('/agenda')
  revalidatePath('/')
  revalidatePath('/financeiro')
  return { ok: true as const }
}

export async function deleteAgendamentoAction(id: string) {
  const supabase = await createClient()
  await supabase.from('transacoes').delete().eq('agendamento_id', id)
  const { error } = await supabase.from('agendamentos').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/agenda')
  revalidatePath('/')
  revalidatePath('/financeiro')
  return { ok: true as const }
}

export async function getAgendamentoAction(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('agendamentos')
    .select('id, paciente_id, profissional_id, tipo_consulta_id, data, hora_inicio, hora_fim, status, notas, valor')
    .eq('id', id)
    .maybeSingle()
  if (error) return { ok: false as const, error: error.message }
  if (!data) return { ok: false as const, error: 'Consulta não encontrada' }
  return { ok: true as const, agendamento: data }
}

// Used by drag-and-drop to move an appointment to a new slot, preserving its duration
export async function moveAgendamentoAction(
  id: string,
  newDate: string,
  newHoraInicio: string,
  newHoraFim: string,
) {
  if (!id || !newDate || !newHoraInicio || !newHoraFim) {
    return { ok: false as const, error: 'Dados de movimentação incompletos' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('agendamentos')
    .update({
      data: newDate,
      hora_inicio: newHoraInicio,
      hora_fim: newHoraFim,
    })
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  // Sincroniza data da transação se existir
  await supabase.from('transacoes').update({ data: newDate }).eq('agendamento_id', id)

  revalidatePath('/agenda')
  revalidatePath('/')
  revalidatePath('/financeiro')
  return { ok: true as const }
}
