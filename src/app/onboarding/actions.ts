'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const WEEKDAY_MAP: Record<string, number> = {
  dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6,
}

const PALETTE = ['#b8a88a', '#8ab89b', '#a88ab8', '#8a8ab8', '#b88a8a', '#8ab8b8']

function iniciais(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export type OnboardingPayload = {
  clinic: { telefone: string; cnpj: string; endereco: string }
  myProfile: { especialidade: string; registro: string }
  additionalProfessionals: { nome: string; especialidade: string; registro: string }[]
  schedule: Record<string, { aberto: boolean; inicio: string; fim: string }>
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
      onboarding_completo: true,
      onboarding_step: 4,
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
      cor: PALETTE[(i + 1) % PALETTE.length],
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
  }))

  const { error: schedError } = await supabase.from('horarios_funcionamento').insert(horarios)
  if (schedError) return { ok: false as const, error: schedError.message }

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

export async function skipToDashboardAction() {
  redirect('/')
}
