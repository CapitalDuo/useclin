import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const statusStyles: Record<string, string> = {
  aberto: 'bg-blue/10 text-blue',
  em_andamento: 'bg-orange-light text-orange',
  aguardando_cliente: 'bg-orange-light text-orange',
  resolvido: 'bg-green-light text-green',
  fechado: 'bg-bg text-muted',
}

const prioridadeStyles: Record<string, string> = {
  baixa: 'text-muted',
  normal: 'text-text',
  alta: 'text-orange',
  urgente: 'text-red',
}

export default async function AdminSuportePage() {
  const supabase = await createClient()

  const { data: tickets } = await supabase
    .from('v_suporte_inbox')
    .select('*')
    .order('updated_at', { ascending: false })

  return (
    <div className="px-10 pt-7 pb-10">
      <div className="mb-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Suporte</h1>
        <p className="text-sm text-muted mt-0.5">
          {tickets?.length ?? 0} solicita{tickets?.length === 1 ? 'ção' : 'ções'} de clientes
        </p>
      </div>

      <div className="bg-card border border-border rounded-[14px] overflow-hidden">
        {tickets?.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted">
            Nenhuma solicitação aberta. Tudo tranquilo por aqui ✨
          </div>
        ) : (
          <div className="flex flex-col">
            {tickets?.map((t, i) => (
              <Link
                key={t.id}
                href={`/admin/suporte/${t.id}`}
                className={`flex items-start gap-4 px-6 py-4 hover:bg-bg transition-colors ${
                  i < (tickets.length - 1) ? 'border-b border-border' : ''
                }`}
              >
                <div className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  t.status === 'aberto' ? 'bg-blue' : t.status === 'resolvido' ? 'bg-green' : 'bg-orange'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold truncate">{t.assunto}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${prioridadeStyles[t.prioridade ?? 'normal']}`}>
                      {t.prioridade}
                    </span>
                  </div>
                  <div className="text-xs text-muted mb-1">{t.clinica_nome}</div>
                  {t.ultima_mensagem && (
                    <div className="text-xs text-muted truncate">{t.ultima_mensagem}</div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-md ${statusStyles[t.status ?? 'aberto']}`}>
                    {(t.status ?? '').replace('_', ' ')}
                  </span>
                  <span className="text-[11px] text-muted">{t.total_mensagens} msg</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
