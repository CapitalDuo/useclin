import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { STATUS_COLORS, STATUS_LABEL } from '@/lib/agendamento-status'
import type { Sexo } from '@/lib/growth'
import { Avatar } from '@/components/avatar'
import { CurvasSection } from '@/components/curvas-section'
import { NovaMedicaoForm } from '@/app/(dashboard)/pacientes/[id]/crescimento/form'
import { RegistroForm, MudarStatusButton, ExcluirPrescricaoButton } from './form'

type Med = { nome: string }

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const hhmm = (t: string) => t.slice(0, 5)

// pdf_url guarda o path do objeto; linhas antigas podem ter URL pública completa.
function toStoragePath(u: string) {
  return u.replace(/^.*\/storage\/v1\/object\/(?:public|sign)\/prescricoes\//, '').replace(/\?.*$/, '')
}

export default async function AtendimentoConsultaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: consulta } = await supabase
    .from('v_agenda')
    .select('id, data, hora_inicio, hora_fim, status, paciente_id, paciente_nome, paciente_iniciais, profissional_nome, tipo_nome, tipo_cor')
    .eq('id', id)
    .maybeSingle()

  if (!consulta || !consulta.paciente_id || !consulta.data) notFound()

  const [{ data: paciente }, { data: registro }, { data: medicoes }, { data: prescricoes }] = await Promise.all([
    supabase.from('pacientes').select('id, sexo, data_nascimento, cor').eq('id', consulta.paciente_id).maybeSingle(),
    supabase
      .from('registros_consulta')
      .select('anamnese, exame_fisico, conclusao')
      .eq('agendamento_id', id)
      .maybeSingle(),
    supabase
      .from('medicoes_pediatricas')
      .select('data, peso_kg, altura_cm, perimetro_cefalico_cm')
      .eq('paciente_id', consulta.paciente_id)
      .order('data'),
    supabase
      .from('prescricoes')
      .select('id, data_consulta, diagnostico, medicamentos, pdf_url')
      .eq('agendamento_id', id)
      .order('created_at', { ascending: false }),
  ])

  // URLs assinadas dos PDFs (bucket privado)
  const pdfPaths = (prescricoes ?? [])
    .map((p) => p.pdf_url)
    .filter((u): u is string => !!u)
    .map(toStoragePath)
  const { data: signed } = pdfPaths.length
    ? await supabase.storage.from('prescricoes').createSignedUrls(pdfPaths, 120)
    : { data: null }
  const signedByPath = new Map((signed ?? []).filter((s) => s.signedUrl).map((s) => [s.path, s.signedUrl as string]))

  const status = consulta.status ?? 'agendado'
  const cor = STATUS_COLORS[status] ?? '#6d5ae6'
  const podeIniciar = status === 'agendado' || status === 'confirmado'
  const podeFinalizar = podeIniciar || status === 'em_atendimento'
  const dadosCompletos = !!paciente?.sexo && !!paciente?.data_nascimento

  return (
    <div className="px-10 pt-7 pb-10 max-w-[900px]">
      <div className="mb-5">
        <Link href={`/consultas?data=${consulta.data}`} className="text-xs text-muted hover:text-text font-medium">
          ← Voltar para consultas do dia
        </Link>
      </div>

      {/* Cabeçalho da consulta */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-7">
        <div className="flex items-center gap-4">
          <Avatar initials={consulta.paciente_iniciais ?? '??'} cor={paciente?.cor} size="lg" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-playfair text-[26px] font-extrabold tracking-tight">{consulta.paciente_nome}</h1>
              <span
                className="text-[10px] font-semibold px-2.5 py-1 rounded-md"
                style={{ backgroundColor: `${cor}1a`, color: cor }}
              >
                {STATUS_LABEL[status] ?? status}
              </span>
            </div>
            <p className="text-sm text-muted mt-0.5 capitalize">
              {formatDate(consulta.data)} · {hhmm(consulta.hora_inicio ?? '')}–{hhmm(consulta.hora_fim ?? '')}
              {consulta.tipo_nome ? ` · ${consulta.tipo_nome}` : ''}
              {consulta.profissional_nome ? ` · ${consulta.profissional_nome}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {podeIniciar && (
            <MudarStatusButton agendamentoId={id} novoStatus="em_atendimento" label="Iniciar atendimento" />
          )}
          {podeFinalizar && (
            <MudarStatusButton agendamentoId={id} novoStatus="concluido" label="Finalizar consulta" destaque />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Registro clínico */}
        <RegistroForm agendamentoId={id} registro={registro ?? null} />

        {/* Medições + curvas */}
        {dadosCompletos ? (
          <>
            <NovaMedicaoForm pacienteId={consulta.paciente_id} hoje={consulta.data} />
            <div className="bg-card border border-border rounded-[14px] p-6">
              <h2 className="font-playfair text-lg font-bold tracking-tight mb-4">Curvas de crescimento</h2>
              <CurvasSection
                medicoes={medicoes ?? []}
                sexo={paciente!.sexo as Sexo}
                nascimento={paciente!.data_nascimento!}
              />
            </div>
          </>
        ) : (
          <div className="bg-card border border-border rounded-[14px] p-6 text-center text-sm text-muted">
            Para registrar medições e ver as curvas, preencha <strong>sexo</strong> e{' '}
            <strong>data de nascimento</strong> do paciente.{' '}
            <Link href={`/pacientes/${consulta.paciente_id}/editar`} className="font-semibold text-[#5b4bd4] hover:underline">
              Completar cadastro →
            </Link>
          </div>
        )}

        {/* Prescrições da consulta */}
        <div className="bg-card border border-border rounded-[14px] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-playfair text-lg font-bold tracking-tight">Prescrições desta consulta</h2>
            <Link
              href={`/pacientes/${consulta.paciente_id}/prescricoes/nova?de=${id}&voltar=/consultas/${id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-text text-white rounded-[11px] text-[13px] font-semibold hover:bg-[#333] transition-all"
            >
              + Nova prescrição
            </Link>
          </div>

          {(prescricoes ?? []).length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-border py-8 text-center text-sm text-muted">
              Nenhuma prescrição nesta consulta ainda.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(prescricoes ?? []).map((p) => {
                const meds = Array.isArray(p.medicamentos) ? (p.medicamentos as Med[]) : []
                const pdfHref = p.pdf_url ? signedByPath.get(toStoragePath(p.pdf_url)) ?? null : null
                return (
                  <div key={p.id} className="flex items-center gap-3 border border-border rounded-[12px] px-4 py-3 text-sm">
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
                    <ExcluirPrescricaoButton id={p.id} agendamentoId={id} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
