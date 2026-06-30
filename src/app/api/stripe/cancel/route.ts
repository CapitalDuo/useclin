import { toggleCancelamento } from '@/lib/stripe'

// Cancela a assinatura no fim do período pago (mantém acesso até lá).
export async function POST() {
  try {
    const result = await toggleCancelamento(true)
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[stripe/cancel]', err)
    return Response.json({ error: 'Erro ao cancelar. Tente novamente.' }, { status: 500 })
  }
}
