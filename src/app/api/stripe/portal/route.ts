import type { NextRequest } from 'next/server'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { user, prof } = await getProfissional(supabase)
    if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })
    if (!prof?.clinica_id) return Response.json({ error: 'Clínica não encontrada' }, { status: 404 })

    const { data: clinica } = await supabase
      .from('clinica')
      .select('stripe_customer_id')
      .eq('id', prof.clinica_id)
      .maybeSingle()
    if (!clinica?.stripe_customer_id) return Response.json({ error: 'Sem assinatura ativa' }, { status: 400 })

    const origin = req.headers.get('origin') ?? 'https://useclin.com.br'

    const session = await stripe.billingPortal.sessions.create({
      customer: clinica.stripe_customer_id,
      return_url: `${origin}/configuracoes`,
    })

    return Response.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/portal]', err)
    return Response.json({ error: 'Erro ao abrir o portal. Tente novamente.' }, { status: 500 })
  }
}
