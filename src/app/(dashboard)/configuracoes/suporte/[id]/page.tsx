import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TicketThread } from '@/components/ticket-thread'

export default async function ClienteTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: ticket } = await supabase
    .from('suporte_tickets')
    .select('id, assunto, categoria, status, prioridade, created_at')
    .eq('id', id)
    .maybeSingle()

  if (!ticket) notFound()

  const { data: mensagens } = await supabase
    .from('suporte_mensagens')
    .select('id, autor_tipo, conteudo, created_at')
    .eq('ticket_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10 max-w-[820px]">
      <div className="mb-5">
        <Link href="/configuracoes/suporte" className="text-xs text-muted hover:text-text font-medium">
          ← Voltar para minhas solicitações
        </Link>
      </div>
      <TicketThread ticket={ticket} mensagens={mensagens ?? []} asRole="cliente" />
    </div>
  )
}
