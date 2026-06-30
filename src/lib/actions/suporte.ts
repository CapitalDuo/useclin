'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'

export async function createTicketAction(formData: FormData) {
  const assunto = String(formData.get('assunto') ?? '').trim()
  const categoria = String(formData.get('categoria') ?? 'geral')
  const conteudo = String(formData.get('conteudo') ?? '').trim()

  if (!assunto || !conteudo) {
    return { ok: false as const, error: 'Assunto e mensagem são obrigatórios' }
  }

  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('ticket', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  if (!prof?.clinica_id) {
    return { ok: false as const, error: 'Sua conta não está vinculada a uma clínica' }
  }

  const { data: ticket, error: ticketError } = await supabase
    .from('suporte_tickets')
    .insert({
      clinica_id: prof.clinica_id,
      criado_por: user.id,
      assunto,
      categoria,
    })
    .select('id')
    .single()

  if (ticketError || !ticket) {
    return { ok: false as const, error: ticketError?.message ?? 'Falha ao criar ticket' }
  }

  const { error: msgError } = await supabase.from('suporte_mensagens').insert({
    ticket_id: ticket.id,
    autor_id: user.id,
    autor_tipo: 'cliente',
    conteudo,
  })

  if (msgError) return { ok: false as const, error: msgError.message }

  revalidatePath('/configuracoes/suporte')
  return { ok: true as const, ticketId: ticket.id }
}

export async function addMensagemAction(formData: FormData) {
  const ticketId = String(formData.get('ticket_id') ?? '')
  const autorTipo = String(formData.get('autor_tipo') ?? 'cliente')
  const conteudo = String(formData.get('conteudo') ?? '').trim()

  if (!ticketId || !conteudo) {
    return { ok: false as const, error: 'Mensagem vazia' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('message', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  const { data: mensagem, error } = await supabase
    .from('suporte_mensagens')
    .insert({
      ticket_id: ticketId,
      autor_id: user.id,
      autor_tipo: autorTipo,
      conteudo,
    })
    .select('id, autor_tipo, conteudo, created_at')
    .single()

  if (error || !mensagem) {
    return { ok: false as const, error: error?.message ?? 'Falha ao enviar' }
  }

  revalidatePath(`/admin/suporte/${ticketId}`)
  revalidatePath(`/configuracoes/suporte/${ticketId}`)

  return { ok: true as const, mensagem }
}

export async function updateTicketStatusAction(ticketId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('suporte_tickets')
    .update({ status })
    .eq('id', ticketId)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/admin/suporte`)
  revalidatePath(`/admin/suporte/${ticketId}`)
  return { ok: true as const }
}
