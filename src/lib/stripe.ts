import Stripe from 'stripe'

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
