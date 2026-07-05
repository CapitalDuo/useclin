import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PrescricaoForm } from './form'

export default async function NovaPrescricaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ de?: string; voltar?: string }>
}) {
  const { id } = await params
  const { de: agendamentoId, voltar } = await searchParams

  const supabase = await createClient()

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('nome')
    .eq('id', id)
    .maybeSingle()

  if (!paciente) notFound()

  let dataDefault = new Date().toISOString().slice(0, 10)
  let consultaInfo: string | null = null

  if (agendamentoId) {
    const { data: ag } = await supabase
      .from('agendamentos')
      .select('data, hora_inicio')
      .eq('id', agendamentoId)
      .maybeSingle()

    if (ag) {
      dataDefault = ag.data
      consultaInfo = new Date(ag.data + 'T00:00:00').toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    }
  }

  return (
    <div className="max-w-[700px]">
      <div className="mb-7">
        <h2 className="font-playfair text-[20px] font-extrabold tracking-tight">
          Nova Prescrição
        </h2>
        <p className="text-sm text-muted mt-1">
          {consultaInfo
            ? `Vinculada à consulta de ${consultaInfo} — ${paciente.nome}`
            : `Prescrição avulsa — ${paciente.nome}`}
        </p>
      </div>

      <div className="bg-card border border-border rounded-[18px] p-7">
        <PrescricaoForm
          pacienteId={id}
          agendamentoId={agendamentoId}
          dataConsultaDefault={dataDefault}
          voltar={voltar?.startsWith('/') ? voltar : undefined}
        />
      </div>
    </div>
  )
}
