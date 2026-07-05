import Link from 'next/link'
import { createClient, requireFeature } from '@/lib/supabase/server'
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/agendamento-status'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const hhmm = (t: string) => t.slice(0, 5)

function Secao({ titulo, texto }: { titulo: string; texto: string | null }) {
  if (!texto) return null
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1">{titulo}</div>
      <p className="text-sm whitespace-pre-wrap">{texto}</p>
    </div>
  )
}

export default async function FichasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await requireFeature('pediatria_completa')
  const supabase = await createClient()

  const { data: registros } = await supabase
    .from('registros_consulta')
    .select('id, agendamento_id, anamnese, exame_fisico, conclusao')
    .eq('paciente_id', id)

  const rows = registros ?? []
  const agIds = rows.map((r) => r.agendamento_id)

  const [{ data: consultas }, { data: prescricoes }] = await Promise.all([
    agIds.length
      ? supabase
          .from('v_agenda')
          .select('id, data, hora_inicio, status, profissional_nome, tipo_nome')
          .in('id', agIds)
      : Promise.resolve({ data: [] as never[] }),
    agIds.length
      ? supabase.from('prescricoes').select('id, agendamento_id').in('agendamento_id', agIds)
      : Promise.resolve({ data: [] as never[] }),
  ])

  const consultaById = new Map((consultas ?? []).map((c) => [c.id, c]))
  const prescricoesPorAg = new Map<string, number>()
  for (const p of prescricoes ?? []) {
    if (p.agendamento_id) {
      prescricoesPorAg.set(p.agendamento_id, (prescricoesPorAg.get(p.agendamento_id) ?? 0) + 1)
    }
  }

  // Mais recentes primeiro, pela data/hora da consulta
  const fichas = rows
    .map((r) => ({ registro: r, consulta: consultaById.get(r.agendamento_id) }))
    .sort((a, b) =>
      `${b.consulta?.data ?? ''}${b.consulta?.hora_inicio ?? ''}`.localeCompare(
        `${a.consulta?.data ?? ''}${a.consulta?.hora_inicio ?? ''}`,
      ),
    )

  return (
    <div className="max-w-[860px]">
      <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2.5">
        {fichas.length} {fichas.length === 1 ? 'ficha de atendimento' : 'fichas de atendimento'}
      </div>

      {fichas.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted bg-card border border-border rounded-[14px]">
          Nenhum atendimento registrado ainda — as fichas aparecem aqui quando o médico salvar o registro
          clínico em Consultas.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {fichas.map(({ registro, consulta }) => {
            const status = consulta?.status ?? 'agendado'
            const cor = STATUS_COLORS[status] ?? '#6d5ae6'
            const nPrescricoes = prescricoesPorAg.get(registro.agendamento_id) ?? 0
            return (
              <div key={registro.id} className="bg-card border border-border rounded-[14px] p-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-semibold">
                      {consulta?.data ? formatDate(consulta.data) : '—'}
                      {consulta?.hora_inicio ? ` · ${hhmm(consulta.hora_inicio)}` : ''}
                    </span>
                    {consulta?.tipo_nome && <span className="text-sm text-muted">· {consulta.tipo_nome}</span>}
                    {consulta?.profissional_nome && (
                      <span className="text-sm text-muted">· {consulta.profissional_nome}</span>
                    )}
                    <span
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: `${cor}1a`, color: cor }}
                    >
                      {STATUS_LABEL[status] ?? status}
                    </span>
                  </div>
                  <Link
                    href={`/consultas/${registro.agendamento_id}`}
                    className="text-xs font-semibold text-[#5b4bd4] hover:underline whitespace-nowrap"
                  >
                    Abrir atendimento →
                  </Link>
                </div>

                <div className="flex flex-col gap-3.5">
                  <Secao titulo="Anamnese" texto={registro.anamnese} />
                  <Secao titulo="Exame físico" texto={registro.exame_fisico} />
                  <Secao titulo="Conclusão diagnóstica" texto={registro.conclusao} />
                  {!registro.anamnese && !registro.exame_fisico && !registro.conclusao && (
                    <p className="text-sm text-muted">Registro sem anotações.</p>
                  )}
                </div>

                {nPrescricoes > 0 && (
                  <div className="mt-4 pt-3 border-t border-border text-xs text-muted">
                    {nPrescricoes} {nPrescricoes === 1 ? 'prescrição emitida' : 'prescrições emitidas'} nesta
                    consulta
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
