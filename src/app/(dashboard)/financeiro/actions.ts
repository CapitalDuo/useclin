'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { parseBrlInput } from '@/lib/currency'
import { isValidISODate } from '@/lib/financeiro-periodo'

const EXPORT_COLS = 'data, tipo, status, paciente_nome, tipo_consulta_nome, descricao, forma_pagamento, valor'

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

export type FiltrosFinanceiro = {
  de?: string
  ate?: string
  tipo?: string
  status?: string
  busca?: string
}

export async function exportarTransacoesAction(
  filtros: FiltrosFinanceiro,
): Promise<{ ok: true; csv: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const de = isValidISODate(filtros.de ?? '') ? filtros.de! : null
  const ate = isValidISODate(filtros.ate ?? '') ? filtros.ate! : null
  const busca = (filtros.busca ?? '').replace(/[,()]/g, ' ').trim()

  let query = supabase
    .from('v_financeiro_entradas')
    .select(EXPORT_COLS)
    .order('data', { ascending: false })
    .limit(5000)
  if (de) query = query.gte('data', de)
  if (ate) query = query.lte('data', ate)
  if (filtros.tipo && filtros.tipo !== 'todas') query = query.eq('tipo', filtros.tipo)
  if (filtros.status && filtros.status !== 'todos') query = query.eq('status', filtros.status)
  if (busca) query = query.or(`paciente_nome.ilike.%${busca}%,descricao.ilike.%${busca}%`)

  const { data, error } = await query
  if (error) return { ok: false, error: error.message }

  const header = 'Data,Tipo,Status,Paciente,Descrição,Forma de pagamento,Valor'
  const rows = (data ?? []).map((r) =>
    [
      r.data ?? '',
      r.tipo ?? '',
      r.status ?? '',
      csvEscape(r.paciente_nome ?? ''),
      csvEscape(r.tipo_consulta_nome ?? r.descricao ?? ''),
      r.forma_pagamento ?? '',
      String(r.valor ?? 0).replace('.', ','),
    ].join(','),
  )

  return { ok: true, csv: [header, ...rows].join('\n') }
}

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

export async function pagarDespesaFixaAction(
  transacaoId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const valorRaw = String(formData.get('valor') ?? '').trim()
  const parsed = parseBrlInput(valorRaw)
  if (!parsed || parsed.valor <= 0) return { ok: false, error: 'Valor inválido' }

  // Guard despesa_fixa_id IS NOT NULL: impede que essa action seja usada
  // pra editar valor/status de um lançamento avulso qualquer.
  const { error } = await supabase
    .from('transacoes')
    .update({ status: 'pago', valor: parsed.valor })
    .eq('id', transacaoId)
    .not('despesa_fixa_id', 'is', null)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/financeiro')
  return { ok: true }
}
