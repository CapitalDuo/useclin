import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NovoTicketForm } from './novo-ticket-form'

const statusLabel: Record<string, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  aguardando_cliente: 'Aguardando você',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
}

const statusStyles: Record<string, string> = {
  aberto: 'bg-blue/10 text-blue',
  em_andamento: 'bg-orange-light text-orange',
  aguardando_cliente: 'bg-orange-light text-orange',
  resolvido: 'bg-green-light text-green',
  fechado: 'bg-bg text-muted',
}

export default async function SuporteClientePage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('suporte_tickets')
    .select('id, assunto, categoria, status, prioridade, created_at, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <div className="px-10 pt-7 pb-10 max-w-[820px]">
      <div className="mb-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Suporte</h1>
        <p className="text-sm text-muted mt-0.5">
          Abra um ticket para falar com o time da plataforma
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <NovoTicketForm />

        <div className="bg-card border border-border rounded-[14px] overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-playfair text-base font-bold">Meus tickets</h2>
          </div>
          {!tickets || tickets.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted">Nenhum ticket aberto.</div>
          ) : (
            <div className="flex flex-col">
              {tickets.map((t, i) => (
                <Link
                  key={t.id}
                  href={`/configuracoes/suporte/${t.id}`}
                  className={`flex items-center gap-4 px-6 py-4 hover:bg-bg transition-colors ${
                    i < tickets.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold mb-0.5 truncate">{t.assunto}</div>
                    <div className="text-xs text-muted">
                      {t.categoria} · aberto em {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-md flex-shrink-0 ${statusStyles[t.status]}`}>
                    {statusLabel[t.status]}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
