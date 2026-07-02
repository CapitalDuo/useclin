import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeletePrescricaoButton } from '@/components/delete-prescricao-button'

type Med = { nome: string; dosagem: string; frequencia: string; duracao: string }

type Prescricao = {
  id: string
  data_consulta: string
  diagnostico: string | null
  medicamentos: Med[]
  pdf_url: string | null
  agendamento_id: string | null
  profissional_id: string
  convenio: string | null
  created_at: string
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// pdf_url agora guarda o path do objeto, mas linhas antigas podem ter a URL
// pública completa (/object/public/...). Normaliza pra path antes de assinar.
function toStoragePath(u: string) {
  return u
    .replace(/^.*\/storage\/v1\/object\/(?:public|sign)\/prescricoes\//, '')
    .replace(/\?.*$/, '')
}

export default async function PrescricoesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: rows } = await supabase
    .from('prescricoes')
    .select(
      'id, data_consulta, diagnostico, medicamentos, pdf_url, agendamento_id, profissional_id, convenio, created_at',
    )
    .eq('paciente_id', id)
    .order('created_at', { ascending: false })

  const prescricoes = (rows ?? []) as Prescricao[]

  // Bucket privado: gera URLs assinadas (120s) em lote pra esta página.
  // RLS do Storage garante o escopo da clínica.
  const pdfPaths = Array.from(
    new Set(
      prescricoes
        .map((p) => p.pdf_url)
        .filter((u): u is string => !!u)
        .map(toStoragePath),
    ),
  )
  const { data: signed } = pdfPaths.length
    ? await supabase.storage.from('prescricoes').createSignedUrls(pdfPaths, 120)
    : { data: null }
  const signedByPath = new Map(
    (signed ?? [])
      .filter((s) => s.signedUrl)
      .map((s) => [s.path, s.signedUrl as string]),
  )

  const profIds = Array.from(new Set(prescricoes.map((p) => p.profissional_id)))
  const { data: profs } = profIds.length
    ? await supabase.from('profissionais').select('id, nome').in('id', profIds)
    : { data: [] as { id: string; nome: string }[] }

  const profById = new Map((profs ?? []).map((p) => [p.id, p.nome]))

  return (
    <div className="max-w-[860px]">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted">
          {prescricoes.length} {prescricoes.length === 1 ? 'prescrição' : 'prescrições'}
        </p>
        <Link
          href={`/pacientes/${id}/prescricoes/nova`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
        >
          + Nova prescrição
        </Link>
      </div>

      {prescricoes.length === 0 ? (
        <div className="text-center py-12 text-sm text-muted bg-card border border-border rounded-[14px]">
          Nenhuma prescrição ainda. Use "Nova prescrição" ou o botão "Prescrever" em uma consulta.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {prescricoes.map((p) => (
            <PrescricaoItem
              key={p.id}
              p={p}
              pacienteId={id}
              profNome={profById.get(p.profissional_id) ?? null}
              pdfHref={p.pdf_url ? signedByPath.get(toStoragePath(p.pdf_url)) ?? null : null}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function PrescricaoItem({
  p,
  pacienteId,
  profNome,
  pdfHref,
}: {
  p: Prescricao
  pacienteId: string
  profNome: string | null
  pdfHref: string | null
}) {
  const meds = Array.isArray(p.medicamentos) ? p.medicamentos : []
  const medicamentosTexto =
    meds.length === 0
      ? 'Sem medicamentos'
      : meds.length === 1
        ? meds[0].nome
        : `${meds[0].nome} +${meds.length - 1} mais`

  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-[14px] px-5 py-4 hover:border-text hover:shadow-sm transition-all">
      {/* Ícone */}
      <div className="w-9 h-9 rounded-xl bg-[#eeeaf9] flex items-center justify-center flex-shrink-0">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#5b4bd4"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatDate(p.data_consulta)}</span>
          {p.agendamento_id && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#eeeaf9] text-[#5b4bd4]">
              Via consulta
            </span>
          )}
          {p.convenio && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-bg text-muted border border-border">
              {p.convenio}
            </span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5 truncate">
          {p.diagnostico ? `${p.diagnostico} · ` : ''}
          {medicamentosTexto}
          {profNome ? ` · ${profNome}` : ''}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {pdfHref ? (
          <a
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-[10px] bg-[#eeeaf9] text-[#5b4bd4] hover:bg-[#5b4bd4] hover:text-white transition-colors"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            PDF
          </a>
        ) : (
          <span className="text-[11px] text-muted">Sem PDF</span>
        )}
        <DeletePrescricaoButton prescricaoId={p.id} pacienteId={pacienteId} />
      </div>
    </div>
  )
}
