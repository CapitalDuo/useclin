import { notFound } from 'next/navigation'
import { createClient, getClinicaAtual } from '@/lib/supabase/server'
import { hasFeature } from '@/lib/features'
import { EditarPacienteForm } from './form'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: paciente }, { data: planos }, clinica] = await Promise.all([
    supabase
      .from('pacientes')
      .select('id, nome, cpf, sexo, data_nascimento, telefone, whatsapp, email, endereco, observacoes, plano_id, valor_plano, status')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('planos').select('id, nome, tipo').order('nome'),
    getClinicaAtual(),
  ])

  if (!paciente) notFound()

  const sexoObrigatorio = !!clinica && hasFeature(clinica, 'pediatria_completa')

  return (
    <div className="max-w-[780px]">
      <EditarPacienteForm paciente={paciente} planos={planos ?? []} sexoObrigatorio={sexoObrigatorio} />
    </div>
  )
}
