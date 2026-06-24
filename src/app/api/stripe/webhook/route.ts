import type { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import type Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return Response.json({ error: 'Sem assinatura' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Assinatura inválida' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const clinica_id = session.metadata?.clinica_id
        const plano = session.metadata?.plano as 'basico' | 'completo' | undefined
        if (!clinica_id || !plano) break

        const subId = session.subscription as string
        let periodoFim: string | null = null
        if (subId) {
          const sub = await stripe.subscriptions.retrieve(subId)
          const end = sub.items.data[0]?.current_period_end
          periodoFim = end ? new Date(end * 1000).toISOString() : null
        }

        await supabase.from('clinica').update({
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subId,
          plano_slug: plano,
          plano_status: 'ativo',
          plano_periodo_fim: periodoFim,
        }).eq('id', clinica_id)
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const clinica_id = sub.metadata?.clinica_id
        if (!clinica_id) break

        const plano = (sub.metadata?.plano ?? 'basico') as 'basico' | 'completo'
        const status = sub.status === 'active' ? 'ativo' : sub.status === 'past_due' ? 'past_due' : 'cancelado'
        const end = sub.items.data[0]?.current_period_end

        await supabase.from('clinica').update({
          plano_slug: plano,
          plano_status: status,
          plano_periodo_fim: end ? new Date(end * 1000).toISOString() : null,
          plano_cancelando: sub.cancel_at_period_end ?? false,
        }).eq('id', clinica_id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const clinica_id = sub.metadata?.clinica_id
        if (!clinica_id) break

        await supabase.from('clinica').update({
          plano_slug: 'gratuito',
          plano_status: 'cancelado',
          stripe_subscription_id: null,
          plano_periodo_fim: null,
          plano_cancelando: false,
        }).eq('id', clinica_id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string
        await supabase.from('clinica').update({ plano_status: 'past_due' })
          .eq('stripe_customer_id', customerId)
        break
      }
    }
  } catch (err) {
    console.error(`[stripe/webhook] erro ao processar ${event.type}:`, err)
    // 500 faz a Stripe reenviar o evento automaticamente.
    return Response.json({ error: 'Erro ao processar evento' }, { status: 500 })
  }

  return Response.json({ received: true })
}
