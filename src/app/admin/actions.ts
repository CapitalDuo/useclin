'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

type Result = { ok: true } | { ok: false; error: string }

// Garante que o chamador é admin da plataforma (CapitalDuo).
async function assertPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: admin } = await supabase
    .from('plataforma_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  return !!admin
}

// Remove os usuários de auth (login) de forma best-effort.
async function deleteAuthUsers(db: ReturnType<typeof createAdminClient>, userIds: (string | null)[]) {
  for (const id of userIds) {
    if (!id) continue
    try {
      await db.auth.admin.deleteUser(id)
    } catch {
      // best-effort: usuário pode já não existir
    }
  }
}

export async function deleteClinicaAction(clinicaId: string): Promise<Result> {
  if (!(await assertPlatformAdmin())) return { ok: false, error: 'Não autorizado' }
  if (!clinicaId) return { ok: false, error: 'Clínica inválida' }

  const db = createAdminClient()

  const { data: clinica } = await db
    .from('clinica')
    .select('stripe_subscription_id')
    .eq('id', clinicaId)
    .maybeSingle()

  const { data: profs } = await db
    .from('profissionais')
    .select('user_id')
    .eq('clinica_id', clinicaId)
  const userIds = (profs ?? []).map((p) => p.user_id)

  // Cancela assinatura Stripe órfã (best-effort) antes de apagar.
  if (clinica?.stripe_subscription_id) {
    try {
      await stripe.subscriptions.cancel(clinica.stripe_subscription_id)
    } catch {
      // best-effort
    }
  }

  // Cascade no banco apaga profissionais, pacientes, agendamentos,
  // transações, conversas, mensagens, suporte, whatsapp,
  // horários e notificações ligados a esta clínica.
  const { error } = await db.from('clinica').delete().eq('id', clinicaId)
  if (error) return { ok: false, error: error.message }

  await deleteAuthUsers(db, userIds)

  revalidatePath('/admin/clinicas')
  revalidatePath('/admin/usuarios')
  return { ok: true }
}

export async function deleteUsuarioAction(profissionalId: string): Promise<Result> {
  if (!(await assertPlatformAdmin())) return { ok: false, error: 'Não autorizado' }
  if (!profissionalId) return { ok: false, error: 'Usuário inválido' }

  const db = createAdminClient()

  const { data: prof } = await db
    .from('profissionais')
    .select('user_id')
    .eq('id', profissionalId)
    .maybeSingle()

  // Cascade apaga agendamentos deste profissional.
  const { error } = await db.from('profissionais').delete().eq('id', profissionalId)
  if (error) return { ok: false, error: error.message }

  await deleteAuthUsers(db, [prof?.user_id ?? null])

  revalidatePath('/admin/usuarios')
  revalidatePath('/admin/clinicas')
  return { ok: true }
}
