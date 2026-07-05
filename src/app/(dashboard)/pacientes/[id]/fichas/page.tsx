import Link from 'next/link'
import { createClient, requireFeature } from '@/lib/supabase/server'
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/agendamento-status'
import { idadeEmMeses, type Sexo } from '@/lib/growth'
import { signPrescricaoUrls, toStoragePath } from '@/lib/prescricoes'
import { MedidaValor } from '@/components/medida-valor'

type Med = { nome: string }
type MedicaoDia = { peso_kg: number | null; altura_cm: number | null; perimetro_cefalico_cm: number | null }
type Prescricao = {
  id: string
  agendamento_id: string | null
  diagnostico: string | null
  medicamentos: unknown
  pdf_url: string | null
}

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

  const [{ data: paciente }, { data: consultas }, { data: prescricoes }, { data: medicoes }] = await Promise.all([
    supabase.from('pacientes').select('sexo, data_nascimento').eq('id', id).maybeSingle(),
    agIds.length
      ? supabase
          .from('v_agenda')
          .select('id, data, hora_inicio, status, profissional_nome, tipo_nome')
          .in('id', agIds)
      : Promise.resolve({ data: [] as never[] }),
    agIds.length
      ? supabase
          .from('prescricoes')
          .select('id, agendamento_id, diagnostico, medicamentos, pdf_url')
          .in('agendamento_id', agIds)
      : Promise.resolve({ data: [] as Prescricao[] }),
    supabase
      .from('medicoes_pediatricas')
      .select('data, peso_kg, altura_cm, perimetro_cefalico_cm')
      .eq('paciente_id', id),
  ])

  const sexo = paciente?.sexo as Sexo | null
  const nascimento = paciente?.data_nascimento ?? null

  const consultaById = new Map((consultas ?? []).map((c) => [c.id, c]))

  const prescricoesPorAg = new Map<string, Prescricao[]>()
  for (const p of (prescricoes ?? []) as Prescricao[]) {
    if (!p.agendamento_id) continue
    const lista = prescricoesPorAg.get(p.agendamento_id) ?? []
    lista.push(p)
    prescricoesPorAg.set(p.agendamento_id, lista)
  }
  const signedByPath = await signPrescricaoUrls(
    supabase,
    ((prescricoes ?? []) as Prescricao[]).map((p) => p.pdf_url),
  )

  // Medições não têm agendamento_id — correlaciona pela data da consulta
  // (mesma convenção usada ao registrar uma medição durante o atendimento).
  const medicaoPorData = new Map<string, MedicaoDia>((medicoes ?? []).map((m) => [m.data, m]))

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
            const prescricoesDaFicha = prescricoesPorAg.get(registro.agendamento_id) ?? []
            const medicao = consulta?.data ? medicaoPorData.get(consulta.data) : undefined
            const idade = sexo && nascimento && consulta?.data ? idadeEmMeses(nascimento, consulta.data) : null
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

                {idade !== null && medicao && (medicao.peso_kg || medicao.altura_cm || medicao.perimetro_cefalico_cm) && (
                  <div className="mt-4 pt-3.5 border-t border-border">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-1.5">Medições</div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      {medicao.peso_kg != null && (
                        <MedidaValor medida="peso" valor={medicao.peso_kg} unidade="kg" sexo={sexo!} idade={idade} />
                      )}
                      {medicao.altura_cm != null && (
                        <MedidaValor medida="altura" valor={medicao.altura_cm} unidade="cm" sexo={sexo!} idade={idade} />
                      )}
                      {medicao.perimetro_cefalico_cm != null && (
                        <MedidaValor medida="pc" valor={medicao.perimetro_cefalico_cm} unidade="cm" sexo={sexo!} idade={idade} />
                      )}
                    </div>
                  </div>
                )}

                {prescricoesDaFicha.length > 0 && (
                  <div className="mt-4 pt-3.5 border-t border-border">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-muted mb-2">
                      {prescricoesDaFicha.length === 1 ? 'Prescrição' : 'Prescrições'}
                    </div>
                    <div className="flex flex-col gap-2">
                      {prescricoesDaFicha.map((p) => {
                        const meds = Array.isArray(p.medicamentos) ? (p.medicamentos as Med[]) : []
                        const pdfHref = p.pdf_url ? signedByPath.get(toStoragePath(p.pdf_url)) ?? null : null
                        return (
                          <div key={p.id} className="flex items-center gap-3 border border-border rounded-[12px] px-4 py-2.5 text-sm">
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold">
                                {meds.length === 0 ? 'Sem medicamentos' : meds.length === 1 ? meds[0].nome : `${meds[0].nome} +${meds.length - 1}`}
                              </span>
                              {p.diagnostico && <span className="text-muted"> · {p.diagnostico}</span>}
                            </div>
                            {pdfHref ? (
                              <a
                                href={pdfHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-semibold px-3 py-1.5 rounded-[10px] bg-[#eeeaf9] text-[#5b4bd4] hover:bg-[#5b4bd4] hover:text-white transition-colors flex-shrink-0"
                              >
                                PDF
                              </a>
                            ) : (
                              <span className="text-[11px] text-muted flex-shrink-0">Sem PDF</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
