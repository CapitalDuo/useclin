'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { iniciais, COR_AVATAR_PADRAO } from '@/lib/avatar'
import { TIPOS_CLINICA } from '@/lib/features'

export async function createClinicaAction(formData: FormData) {
  const clinicaNome = String(formData.get('clinica_nome') ?? '').trim()
  const adminNome = String(formData.get('admin_nome') ?? '').trim()
  const adminEmail = String(formData.get('admin_email') ?? '').trim().toLowerCase()
  const tipoRaw = String(formData.get('tipo_clinica') ?? 'geral')
  const tipoClinica = tipoRaw in TIPOS_CLINICA ? tipoRaw : 'geral'

  if (!clinicaNome || !adminNome || !adminEmail) {
    return { ok: false as const, error: 'Todos os campos são obrigatórios' }
  }

  const supabase = await createClient()

  const { data: clinica, error: clinicError } = await supabase
    .from('clinica')
    .insert({
      nome: clinicaNome,
      email: adminEmail,
      tipo_clinica: tipoClinica,
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
    cor: COR_AVATAR_PADRAO,
  })

  if (profError) {
    return { ok: false as const, error: profError.message }
  }

  revalidatePath('/admin/clinicas')
  revalidatePath('/admin/usuarios')

  return { ok: true as const, clinicaId: clinica.id, adminEmail }
}
