import type { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe'

// Cancela a assinatura no fim do período pago (mantém acesso até lá).
export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

    const { data: prof } = await supabase
      .from('profissionais')
      .select('clinica_id')
      .eq('user_id', user.id)
      .maybeSingle()
    if (!prof?.clinica_id) return Response.json({ error: 'Clínica não encontrada' }, { status: 404 })

    const { data: clinica } = await supabase
      .from('clinica')
      .select('id, stripe_subscription_id')
      .eq('id', prof.clinica_id)
      .maybeSingle()
    if (!clinica?.stripe_subscription_id) return Response.json({ error: 'Sem assinatura ativa' }, { status: 400 })

    await stripe.subscriptions.update(clinica.stripe_subscription_id, {
      cancel_at_period_end: true,
    })

    // Reflete na hora (o webhook também sincroniza).
    await createAdminClient().from('clinica').update({ plano_cancelando: true }).eq('id', clinica.id)

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[stripe/cancel]', err)
    return Response.json({ error: 'Erro ao cancelar. Tente novamente.' }, { status: 500 })
  }
}
