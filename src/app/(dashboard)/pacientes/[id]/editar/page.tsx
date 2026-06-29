import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditarPacienteForm } from './form'

export default async function EditarPacientePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: paciente }, { data: planos }] = await Promise.all([
    supabase
      .from('pacientes')
      .select('id, nome, cpf, data_nascimento, telefone, whatsapp, email, endereco, observacoes, plano_id, valor_plano, status')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('planos').select('id, nome, tipo').order('nome'),
  ])

  if (!paciente) notFound()

  return (
    <div className="max-w-[780px]">
      <EditarPacienteForm paciente={paciente} planos={planos ?? []} />
    </div>
  )
}
