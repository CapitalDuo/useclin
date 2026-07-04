'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient, getProfissional, getClinicaAtual } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'
import { iniciais, randomColor } from '@/lib/avatar'
import { parseBrlInput } from '@/lib/currency'
import { hasFeature } from '@/lib/features'

// Sexo é obrigatório só pra clínicas com pediatria_completa (curvas de
// crescimento dependem dele). Validado aqui além do `required` do form.
async function validarSexo(formData: FormData) {
  const raw = String(formData.get('sexo') ?? '').trim()
  const sexo = raw === 'M' || raw === 'F' ? raw : null
  if (!sexo) {
    const clinica = await getClinicaAtual()
    if (clinica && hasFeature(clinica, 'pediatria_completa')) {
      return { sexo, error: 'Sexo é obrigatório para clínicas pediátricas' }
    }
  }
  return { sexo, error: null }
}

export async function createPacienteAction(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const cpf = String(formData.get('cpf') ?? '').trim()
  const data_nascimento = String(formData.get('data_nascimento') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()
  const whatsapp = String(formData.get('whatsapp') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const endereco = String(formData.get('endereco') ?? '').trim()
  const observacoes = String(formData.get('observacoes') ?? '').trim()
  const plano_id_raw = String(formData.get('plano_id') ?? '')
  const valor_plano_raw = String(formData.get('valor_plano') ?? '').trim()

  if (!nome) {
    return { ok: false as const, error: 'Nome é obrigatório' }
  }

  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('write', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const { sexo, error: sexoError } = await validarSexo(formData)
  if (sexoError) return { ok: false as const, error: sexoError }

  const valor = parseBrlInput(valor_plano_raw)?.valor ?? null

  const { error } = await supabase.from('pacientes').insert({
    clinica_id: prof.clinica_id,
    nome,
    cpf: cpf || null,
    sexo,
    data_nascimento: data_nascimento || null,
    telefone: telefone || null,
    whatsapp: whatsapp || null,
    email: email || null,
    endereco: endereco || null,
    observacoes: observacoes || null,
    plano_id: plano_id_raw && plano_id_raw !== 'none' ? plano_id_raw : null,
    valor_plano: valor && !Number.isNaN(valor) ? valor : null,
    iniciais: iniciais(nome),
    cor: randomColor(),
    status: 'ativo',
  })

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/pacientes')
  redirect('/pacientes')
}

export async function updatePacienteAction(id: string, formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const cpf = String(formData.get('cpf') ?? '').trim()
  const data_nascimento = String(formData.get('data_nascimento') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()
  const whatsapp = String(formData.get('whatsapp') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const endereco = String(formData.get('endereco') ?? '').trim()
  const observacoes = String(formData.get('observacoes') ?? '').trim()
  const plano_id_raw = String(formData.get('plano_id') ?? '')
  const valor_plano_raw = String(formData.get('valor_plano') ?? '').trim()
  const status = String(formData.get('status') ?? 'ativo')

  if (!nome) return { ok: false as const, error: 'Nome é obrigatório' }

  const { sexo, error: sexoError } = await validarSexo(formData)
  if (sexoError) return { ok: false as const, error: sexoError }

  const supabase = await createClient()
  const valor = parseBrlInput(valor_plano_raw)?.valor ?? null

  const { error } = await supabase
    .from('pacientes')
    .update({
      nome,
      cpf: cpf || null,
      sexo,
      data_nascimento: data_nascimento || null,
      telefone: telefone || null,
      whatsapp: whatsapp || null,
      email: email || null,
      endereco: endereco || null,
      observacoes: observacoes || null,
      plano_id: plano_id_raw && plano_id_raw !== 'none' ? plano_id_raw : null,
      valor_plano: valor && !Number.isNaN(valor) ? valor : null,
      iniciais: iniciais(nome),
      status,
    })
    .eq('id', id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/pacientes')
  revalidatePath(`/pacientes/${id}/editar`)
  redirect('/pacientes')
}

export async function deletePacienteAction(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false, error: 'Conta sem clínica vinculada' }

  const { error } = await supabase
    .from('pacientes')
    .delete()
    .eq('id', id)
    .eq('clinica_id', prof.clinica_id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/pacientes')
  redirect('/pacientes')
}
