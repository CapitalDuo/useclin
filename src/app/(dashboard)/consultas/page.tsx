import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { todayISO } from '@/lib/date'
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/agendamento-status'
import { Avatar } from '@/components/avatar'

function shiftDia(dia: string, delta: number): string {
  const d = new Date(dia + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + delta)
  return d.toISOString().slice(0, 10)
}

function labelDia(dia: string): string {
  return new Date(dia + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const hhmm = (t: string) => t.slice(0, 5)

export default async function ConsultasDoDiaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string }>
}) {
  const { data: dataParam } = await searchParams
  const hoje = todayISO()
  const dia = dataParam && /^\d{4}-\d{2}-\d{2}$/.test(dataParam) ? dataParam : hoje

  const supabase = await createClient()
  const { data: agendamentos } = await supabase
    .from('v_agenda')
    .select('id, hora_inicio, hora_fim, status, paciente_nome, paciente_iniciais, profissional_nome, tipo_nome, tipo_cor')
    .eq('data', dia)
    .order('hora_inicio')

  const rows = agendamentos ?? []

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10">
      <div className="flex items-end justify-between gap-4 flex-wrap mb-6 max-w-[980px]">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Consultas</h1>
          <p className="text-sm text-muted mt-0.5">Atendimentos do dia — clique em Atender para abrir a consulta.</p>
        </div>

        {/* navegação de dia */}
        <div className="flex items-center gap-2">
          <Link
            href={`/consultas?data=${shiftDia(dia, -1)}`}
            className="px-3 py-2 rounded-[11px] border border-border text-sm font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
          >
            ←
          </Link>
          <span className="text-sm font-semibold px-2 capitalize min-w-[210px] text-center">{labelDia(dia)}</span>
          <Link
            href={`/consultas?data=${shiftDia(dia, 1)}`}
            className="px-3 py-2 rounded-[11px] border border-border text-sm font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
          >
            →
          </Link>
          {dia !== hoje && (
            <Link
              href="/consultas"
              className="px-3.5 py-2 rounded-[11px] border border-border text-sm font-semibold text-muted hover:text-text hover:bg-bg transition-colors"
            >
              Hoje
            </Link>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-14 text-sm text-muted bg-card border border-border rounded-[14px] max-w-[980px]">
          Nenhuma consulta marcada para este dia.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-[14px] max-w-[980px] overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-[105px_1fr_1fr_140px_120px_100px] gap-3 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-muted border-b border-border">
              <span>Horário</span>
              <span>Paciente</span>
              <span>Tipo</span>
              <span>Profissional</span>
              <span>Status</span>
              <span />
            </div>
            {rows.map((a) => {
              const cor = STATUS_COLORS[a.status ?? ''] ?? '#6d5ae6'
              const label = STATUS_LABEL[a.status ?? ''] ?? a.status
              return (
                <div
                  key={a.id}
                  className="grid grid-cols-[105px_1fr_1fr_140px_120px_100px] gap-3 px-5 py-3.5 items-center text-sm border-b border-border last:border-0"
                >
                  <span className="font-semibold">
                    {hhmm(a.hora_inicio ?? '')}–{hhmm(a.hora_fim ?? '')}
                  </span>
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Avatar initials={a.paciente_iniciais ?? '??'} size="sm" />
                    <span className="font-semibold truncate">{a.paciente_nome}</span>
                  </span>
                  <span className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: a.tipo_cor ?? '#cdcbc4' }} />
                    <span className="truncate">{a.tipo_nome ?? 'Consulta'}</span>
                  </span>
                  <span className="text-muted truncate">{a.profissional_nome ?? '—'}</span>
                  <span>
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: `${cor}1a`, color: cor }}
                    >
                      {label}
                    </span>
                  </span>
                  <Link
                    href={`/consultas/${a.id}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-text text-white rounded-[11px] text-[13px] font-semibold hover:bg-[#333] transition-all"
                  >
                    Atender
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
