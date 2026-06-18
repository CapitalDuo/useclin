'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

function iniciais(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export async function createClinicaAction(formData: FormData) {
  const clinicaNome = String(formData.get('clinica_nome') ?? '').trim()
  const adminNome = String(formData.get('admin_nome') ?? '').trim()
  const adminEmail = String(formData.get('admin_email') ?? '').trim().toLowerCase()

  if (!clinicaNome || !adminNome || !adminEmail) {
    return { ok: false as const, error: 'Todos os campos são obrigatórios' }
  }

  const supabase = await createClient()

  const { data: clinica, error: clinicError } = await supabase
    .from('clinica')
    .insert({
      nome: clinicaNome,
      email: adminEmail,
      onboarding_completo: false,
      onboarding_step: 0,
    })
    .select('id')
    .single()

  if (clinicError || !clinica) {
    return { ok: false as const, error: clinicError?.message ?? 'Falha ao criar clínica' }
  }

  const { error: profError } = await supabase.from('profissionais').insert({
    clinica_id: clinica.id,
    nome: adminNome,
    email: adminEmail,
    role: 'admin',
    iniciais: iniciais(adminNome),
    cor: '#b8a88a',
  })

  if (profError) {
    return { ok: false as const, error: profError.message }
  }

  revalidatePath('/admin/clinicas')
  revalidatePath('/admin/usuarios')

  return { ok: true as const, clinicaId: clinica.id, adminEmail }
}
