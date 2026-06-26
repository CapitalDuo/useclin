'use server'

import { createClient } from '@/lib/supabase/server'
import { iniciais, AVATAR_PALETTE } from '@/lib/avatar'
import { parseBrlInput } from '@/lib/currency'

const WEEKDAY_MAP: Record<string, number> = {
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
}

export type OnboardingPayload = {
  clinic: { telefone: string; cnpj: string; endereco: string; logo_url?: string | null; maps_url?: string | null }
  myProfile: { especialidade: string; registro: string }
  additionalProfessionals: { nome: string; especialidade: string; registro: string }[]
  schedule: Record<string, { aberto: boolean; inicio: string; fim: string; intervalo: boolean; intervalo_inicio: string; intervalo_fim: string }>
  servicos: { nome: string; valor: string }[]
  convenios: { nome: string; valor: string }[]
  whatsapp: { instancia: string; numero: string }
}

export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { data: meuProf } = await supabase
    .from('profissionais')
    .select('id, clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!meuProf?.clinica_id) {
    return { ok: false as const, error: 'Sua conta não está vinculada a uma clínica' }
  }

  const clinicaId = meuProf.clinica_id

  const { error: clinicError } = await supabase
    .from('clinica')
    .update({
      telefone: payload.clinic.telefone || null,
      cnpj: payload.clinic.cnpj || null,
      endereco: payload.clinic.endereco || null,
      logo_url: payload.clinic.logo_url ?? null,
      maps_url: payload.clinic.maps_url || null,
      onboarding_completo: true,
      onboarding_step: 5,
    })
    .eq('id', clinicaId)

  if (clinicError) return { ok: false as const, error: clinicError.message }

  const { error: meProfError } = await supabase
    .from('profissionais')
    .update({
      especialidade: payload.myProfile.especialidade || null,
      registro: payload.myProfile.registro || null,
    })
    .eq('id', meuProf.id)

  if (meProfError) return { ok: false as const, error: meProfError.message }

  const extras = payload.additionalProfessionals
    .filter(p => p.nome.trim())
    .map((p, i) => ({
      clinica_id: clinicaId,
      nome: p.nome,
      especialidade: p.especialidade || null,
      registro: p.registro || null,
      role: 'profissional',
      iniciais: iniciais(p.nome),
      cor: AVATAR_PALETTE[(i + 1) % AVATAR_PALETTE.length],
    }))

  if (extras.length > 0) {
    const { error: profError } = await supabase.from('profissionais').insert(extras)
    if (profError) return { ok: false as const, error: profError.message }
  }

  const horarios = Object.entries(payload.schedule).map(([key, day]) => ({
    clinica_id: clinicaId,
    dia_semana: WEEKDAY_MAP[key],
    aberto: day.aberto,
    hora_inicio: day.aberto ? day.inicio : null,
    hora_fim: day.aberto ? day.fim : null,
    intervalo_inicio: day.aberto && day.intervalo ? day.intervalo_inicio : null,
    intervalo_fim: day.aberto && day.intervalo ? day.intervalo_fim : null,
  }))

  const { error: schedError } = await supabase
    .from('horarios_funcionamento')
    .upsert(horarios, { onConflict: 'clinica_id,dia_semana' })
  if (schedError) return { ok: false as const, error: schedError.message }

  const servicosToSave = payload.servicos
    .filter(s => s.nome.trim())
    .map(s => ({ clinica_id: clinicaId, nome: s.nome.trim(), valor: parseBrlInput(s.valor)?.valor ?? null }))

  if (servicosToSave.length > 0) {
    const { error: servError } = await supabase.from('clinica_servicos').insert(servicosToSave)
    if (servError) return { ok: false as const, error: servError.message }
  }

  const conveniosToSave = payload.convenios
    .filter(c => c.nome.trim())
    .map(c => ({ clinica_id: clinicaId, nome: c.nome.trim(), valor: parseBrlInput(c.valor)?.valor ?? null }))

  if (conveniosToSave.length > 0) {
    const { error: convError } = await supabase.from('clinica_convenios').insert(conveniosToSave)
    if (convError) return { ok: false as const, error: convError.message }
  }

  if (payload.whatsapp.instancia.trim() && payload.whatsapp.numero.trim()) {
    const { error: waError } = await supabase.from('whatsapp_instancias').insert({
      clinica_id: clinicaId,
      nome_instancia: payload.whatsapp.instancia,
      numero: payload.whatsapp.numero,
      status: 'desconectado',
    })
    if (waError) return { ok: false as const, error: waError.message }
  }

  return { ok: true as const, clinicaId }
}

export async function uploadLogoAction(
  formData: FormData,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Não autenticado' }

  const file = formData.get('logo') as File | null
  if (!file || file.size === 0) return { ok: false, error: 'Arquivo inválido' }
  if (file.size > 2 * 1024 * 1024) return { ok: false, error: 'Imagem muito grande (máx. 2 MB)' }

  const { data: prof } = await supabase
    .from('profissionais')
    .select('clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!prof?.clinica_id) return { ok: false, error: 'Clínica não encontrada' }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `${prof.clinica_id}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (uploadError) return { ok: false, error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
  return { ok: true, url: publicUrl }
}
