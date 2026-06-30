import Stripe from 'stripe'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Lazy singleton — não instancia no nível do módulo para não quebrar o build
// quando STRIPE_SECRET_KEY não está disponível no ambiente de build.
let _stripe: Stripe | undefined

function getInstance(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}

export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_, prop: string | symbol) {
    return Reflect.get(getInstance(), prop)
  },
})

export const PLANS = {
  basico: {
    slug: 'basico' as const,
    nome: 'Básico',
    priceId: process.env.STRIPE_PRICE_BASICO!,
    preco: 'R$ 247/mês',
    descricao: 'Agenda, Pacientes, Financeiro',
    features: ['Agenda ilimitada', 'Gestão de pacientes', 'Controle financeiro', 'Suporte por e-mail'],
  },
  completo: {
    slug: 'completo' as const,
    nome: 'Completo',
    priceId: process.env.STRIPE_PRICE_COMPLETO!,
    preco: 'R$ 349/mês',
    descricao: 'Tudo + WhatsApp e Agente de IA',
    features: ['Tudo do Básico', 'Atendimento via WhatsApp', 'Agente de IA', 'Suporte prioritário'],
  },
} as const

/**
 * Liga/desliga `cancel_at_period_end` da assinatura — lógica compartilhada
 * por /api/stripe/cancel e /api/stripe/reactivate, que eram o mesmo arquivo
 * exceto por esse boolean.
 */
export async function toggleCancelamento(
  cancelando: boolean,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false, status: 401, error: 'Não autorizado' }
  if (!prof?.clinica_id) return { ok: false, status: 404, error: 'Clínica não encontrada' }

  const { data: clinica } = await supabase
    .from('clinica')
    .select('id, stripe_subscription_id')
    .eq('id', prof.clinica_id)
    .maybeSingle()
  if (!clinica?.stripe_subscription_id) {
    return { ok: false, status: 400, error: 'Sem assinatura ativa' }
  }

  await stripe.subscriptions.update(clinica.stripe_subscription_id, {
    cancel_at_period_end: cancelando,
  })

  // Reflete na hora (o webhook também sincroniza).
  await createAdminClient().from('clinica').update({ plano_cancelando: cancelando }).eq('id', clinica.id)

  return { ok: true }
}
