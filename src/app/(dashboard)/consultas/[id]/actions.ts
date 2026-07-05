'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { syncTransacao } from '@/lib/agenda-sync'

export async function salvarRegistroAction(agendamentoId: string, formData: FormData) {
  const anamnese = String(formData.get('anamnese') ?? '').trim()
  const exame_fisico = String(formData.get('exame_fisico') ?? '').trim()
  const conclusao = String(formData.get('conclusao') ?? '').trim()

  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('write', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const { data: ag } = await supabase
    .from('agendamentos')
    .select('paciente_id')
    .eq('id', agendamentoId)
    .maybeSingle()
  if (!ag) return { ok: false as const, error: 'Consulta não encontrada' }

  // 1 registro por agendamento — salvar de novo sobrescreve o mesmo registro.
  const { error } = await supabase.from('registros_consulta').upsert(
    {
      clinica_id: prof.clinica_id,
      agendamento_id: agendamentoId,
      paciente_id: ag.paciente_id,
      anamnese: anamnese || null,
      exame_fisico: exame_fisico || null,
      conclusao: conclusao || null,
    },
    { onConflict: 'agendamento_id' },
  )
  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/consultas/${agendamentoId}`)
  return { ok: true as const }
}

const STATUS_PERMITIDOS = ['em_atendimento', 'concluido'] as const

export async function mudarStatusConsultaAction(agendamentoId: string, novoStatus: string) {
  if (!STATUS_PERMITIDOS.includes(novoStatus as (typeof STATUS_PERMITIDOS)[number])) {
    return { ok: false as const, error: 'Status inválido' }
  }

  const supabase = await createClient()
  const { data: ag } = await supabase
    .from('agendamentos')
    .select('paciente_id, valor, data, notas')
    .eq('id', agendamentoId)
    .maybeSingle()
  if (!ag) return { ok: false as const, error: 'Consulta não encontrada' }

  const { error } = await supabase
    .from('agendamentos')
    .update({ status: novoStatus })
    .eq('id', agendamentoId)
  if (error) return { ok: false as const, error: error.message }

  // Mesmo sync da agenda: concluir a consulta marca a transação como paga.
  await syncTransacao(supabase, {
    agendamento_id: agendamentoId,
    paciente_id: ag.paciente_id,
    valor: ag.valor,
    data: ag.data,
    status: novoStatus,
    descricao: ag.notas || 'Consulta',
  })

  revalidatePath(`/consultas/${agendamentoId}`)
  revalidatePath('/consultas')
  revalidatePath('/agenda')
  revalidatePath('/financeiro')
  return { ok: true as const }
}
