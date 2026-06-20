'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function clinicaIdOf(userId: string) {
  const supabase = await createClient()
  const { data: prof } = await supabase
    .from('profissionais')
    .select('id, clinica_id')
    .eq('user_id', userId)
    .maybeSingle()
  return { supabase, prof }
}

export async function updateClinicaAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { prof } = await clinicaIdOf(user.id)
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const nome = String(formData.get('nome') ?? '').trim()
  const subtitulo = String(formData.get('subtitulo') ?? '').trim()
  const cnpj = String(formData.get('cnpj') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const endereco = String(formData.get('endereco') ?? '').trim()

  if (!nome) return { ok: false as const, error: 'Nome da clínica é obrigatório' }

  const { error } = await supabase
    .from('clinica')
    .update({
      nome,
      subtitulo: subtitulo || null,
      cnpj: cnpj || null,
      telefone: telefone || null,
      email: email || null,
      endereco: endereco || null,
    })
    .eq('id', prof.clinica_id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  revalidatePath('/admin/clinicas')
  return { ok: true as const }
}

const WEEKDAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'] as const

export async function updateHorariosAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { prof } = await clinicaIdOf(user.id)
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const rows = WEEKDAY_KEYS.map((key, dia) => ({
    clinica_id: prof.clinica_id!,
    dia_semana: dia,
    aberto: formData.get(`${key}_aberto`) === 'on',
    hora_inicio: (formData.get(`${key}_inicio`) as string) || null,
    hora_fim: (formData.get(`${key}_fim`) as string) || null,
  })).map((r) => ({
    ...r,
    hora_inicio: r.aberto ? r.hora_inicio : null,
    hora_fim: r.aberto ? r.hora_fim : null,
  }))

  const { error } = await supabase
    .from('horarios_funcionamento')
    .upsert(rows, { onConflict: 'clinica_id,dia_semana' })

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}

export async function upsertWhatsappAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { prof } = await clinicaIdOf(user.id)
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const id = String(formData.get('id') ?? '').trim()
  const nome_instancia = String(formData.get('nome_instancia') ?? '').trim()
  const numero = String(formData.get('numero') ?? '').trim()

  if (!nome_instancia || !numero) {
    return { ok: false as const, error: 'Nome da instância e número são obrigatórios' }
  }

  if (id) {
    const { error } = await supabase
      .from('whatsapp_instancias')
      .update({ nome_instancia, numero })
      .eq('id', id)
    if (error) return { ok: false as const, error: error.message }
  } else {
    const { error } = await supabase.from('whatsapp_instancias').insert({
      clinica_id: prof.clinica_id,
      nome_instancia,
      numero,
      status: 'desconectado',
    })
    if (error) return { ok: false as const, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}

export async function updateMeuPerfilAction(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { prof } = await clinicaIdOf(user.id)
  if (!prof) return { ok: false as const, error: 'Profissional não encontrado' }

  const nome = String(formData.get('nome') ?? '').trim()
  const especialidade = String(formData.get('especialidade') ?? '').trim()
  const registro = String(formData.get('registro') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()

  if (!nome) return { ok: false as const, error: 'Nome é obrigatório' }

  const { error } = await supabase
    .from('profissionais')
    .update({
      nome,
      especialidade: especialidade || null,
      registro: registro || null,
      telefone: telefone || null,
    })
    .eq('id', prof.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}

const NOTIF_TIPOS = ['lembrete_consulta', 'confirmacao_whatsapp', 'email_pos_consulta'] as const
export type NotificacaoTipo = (typeof NOTIF_TIPOS)[number]

export async function toggleNotificacaoAction(tipo: NotificacaoTipo, ativo: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { prof } = await clinicaIdOf(user.id)
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  if (!NOTIF_TIPOS.includes(tipo)) return { ok: false as const, error: 'Tipo inválido' }

  const { error } = await supabase
    .from('notificacao_config')
    .upsert(
      { clinica_id: prof.clinica_id, tipo, ativo },
      { onConflict: 'clinica_id,tipo' },
    )

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}
