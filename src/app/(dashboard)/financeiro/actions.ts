'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { parseBrlInput } from '@/lib/currency'

export async function criarLancamentoAction(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false, error: 'Profissional não encontrado' }

  const tipo = String(formData.get('tipo') ?? '')
  if (tipo !== 'receita' && tipo !== 'despesa') return { ok: false, error: 'Tipo inválido' }

  const valorRaw = String(formData.get('valor') ?? '').trim()
  const parsed = parseBrlInput(valorRaw)
  if (!parsed || parsed.valor <= 0) return { ok: false, error: 'Valor inválido' }

  const descricao = String(formData.get('descricao') ?? '').trim()
  if (!descricao) return { ok: false, error: 'Descrição é obrigatória' }

  const status = String(formData.get('status') ?? 'pago')
  const formaPagamento = String(formData.get('forma_pagamento') ?? '').trim() || null
  const data = String(formData.get('data') ?? new Date().toISOString().slice(0, 10))
  const pacienteId = String(formData.get('paciente_id') ?? '').trim() || null

  const { error } = await supabase.from('transacoes').insert({
    clinica_id: prof.clinica_id,
    paciente_id: pacienteId,
    tipo,
    valor: parsed.valor,
    descricao,
    forma_pagamento: formaPagamento,
    status,
    data,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath('/financeiro')
  return { ok: true }
}

export async function excluirLancamentoAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  // Só permite excluir lançamentos avulsos — os vinculados a uma consulta
  // são gerenciados pela agenda (criados/removidos junto com o agendamento).
  const { error } = await supabase.from('transacoes').delete().eq('id', id).is('agendamento_id', null)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/financeiro')
  return { ok: true }
}
