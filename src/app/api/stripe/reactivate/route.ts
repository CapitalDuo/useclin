import { toggleCancelamento } from '@/lib/stripe'

// Desfaz o cancelamento agendado (volta a renovar normalmente).
export async function POST() {
  try {
    const result = await toggleCancelamento(false)
    if (!result.ok) return Response.json({ error: result.error }, { status: result.status })
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[stripe/reactivate]', err)
    return Response.json({ error: 'Erro ao reativar. Tente novamente.' }, { status: 500 })
  }
}
