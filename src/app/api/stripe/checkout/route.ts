import type { NextRequest } from 'next/server'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { stripe, PLANS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, prof } = await getProfissional(supabase)
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

    const { plano } = await req.json() as { plano: 'basico' | 'completo' }
    const plan = PLANS[plano]
    if (!plan) return Response.json({ error: 'Plano inválido' }, { status: 400 })

    if (!prof?.clinica_id) return Response.json({ error: 'Clínica não encontrada' }, { status: 404 })

    const { data: clinica } = await supabase
      .from('clinica')
      .select('id, nome, email, stripe_customer_id, stripe_subscription_id, plano_slug')
      .eq('id', prof.clinica_id)
      .maybeSingle()
    if (!clinica) return Response.json({ error: 'Clínica não encontrada' }, { status: 404 })

    if (clinica.plano_slug === plano) {
      return Response.json({ error: 'Você já está neste plano.' }, { status: 400 })
    }

    // Já é assinante (ex: Básico → Completo): troca o preço da assinatura
    // existente com proração, em vez de criar uma segunda assinatura.
    if (clinica.stripe_subscription_id && clinica.plano_slug !== 'gratuito') {
      const sub = await stripe.subscriptions.retrieve(clinica.stripe_subscription_id)
      const itemId = sub.items.data[0]?.id
      if (!itemId) return Response.json({ error: 'Assinatura inválida' }, { status: 400 })

      await stripe.subscriptions.update(clinica.stripe_subscription_id, {
        items: [{ id: itemId, price: plan.priceId }],
        proration_behavior: 'create_prorations',
        metadata: { clinica_id: clinica.id, plano },
      })
      // O webhook customer.subscription.updated sincroniza o banco.
      return Response.json({ updated: true })
    }

    // Primeira assinatura (Gratuito → pago): Stripe Checkout hospedado.
    let customerId = clinica.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: clinica.nome,
        email: clinica.email ?? user.email,
        metadata: { clinica_id: clinica.id },
      })
      customerId = customer.id
    }

    const origin = req.headers.get('origin') ?? 'https://useclin.com.br'

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${origin}/configuracoes?upgrade=success`,
      cancel_url: `${origin}/configuracoes`,
      metadata: { clinica_id: clinica.id, plano },
      subscription_data: {
        metadata: { clinica_id: clinica.id, plano },
      },
      locale: 'pt-BR',
      allow_promotion_codes: true,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err)
    return Response.json({ error: 'Erro ao processar pagamento. Tente novamente.' }, { status: 500 })
  }
}
