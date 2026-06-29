import { createClient } from '@/lib/supabase/server'
import { NovoProntuarioForm } from './form'

export default async function ProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: prontuarios } = await supabase
    .from('prontuarios')
    .select('id, descricao, diagnostico, prescricao, created_at, profissional_id')
    .eq('paciente_id', id)
    .order('created_at', { ascending: false })

  const profIds = Array.from(new Set((prontuarios ?? []).map((p) => p.profissional_id)))
  const { data: profs } = profIds.length
    ? await supabase.from('profissionais').select('id, nome').in('id', profIds)
    : { data: [] }
  const profNomeById = new Map((profs ?? []).map((p) => [p.id, p.nome]))

  return (
    <div className="max-w-[820px]">
      <p className="text-sm text-muted mb-6">
        {prontuarios?.length ?? 0} registro{prontuarios?.length === 1 ? '' : 's'} no prontuário
      </p>

      <NovoProntuarioForm pacienteId={id} />

      <div className="mt-8 flex flex-col gap-4">
        {!prontuarios || prontuarios.length === 0 ? (
          <div className="text-center py-12 text-sm text-muted bg-card border border-border rounded-[14px]">
            Nenhum registro no prontuário ainda. Use o formulário acima pra criar o primeiro.
          </div>
        ) : (
          prontuarios.map((r) => (
            <div key={r.id} className="bg-card border border-border rounded-[14px] p-6">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-border">
                <div className="text-xs text-muted">
                  <span className="font-semibold text-text">{profNomeById.get(r.profissional_id) ?? 'Profissional'}</span>
                  {' · '}
                  {new Date(r.created_at).toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Section title="Descrição" content={r.descricao} />
                {r.diagnostico && <Section title="Diagnóstico" content={r.diagnostico} />}
                {r.prescricao && <Section title="Prescrição" content={r.prescricao} />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1">{title}</div>
      <div className="text-sm leading-relaxed whitespace-pre-wrap">{content}</div>
    </div>
  )
}
