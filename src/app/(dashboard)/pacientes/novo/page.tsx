import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { NovoPacienteForm } from './form'

export default async function NovoPacientePage() {
  const supabase = await createClient()
  const { data: planos } = await supabase
    .from('planos')
    .select('id, nome, tipo')
    .order('nome', { ascending: true })

  return (
    <div className="px-10 pt-7 pb-10 max-w-[780px]">
      <div className="mb-5">
        <Link href="/pacientes" className="text-xs text-muted hover:text-text font-medium">
          ← Voltar para pacientes
        </Link>
      </div>
      <div className="mb-7">
        <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Novo paciente</h1>
        <p className="text-sm text-muted mt-0.5">Preencha os dados — só o nome é obrigatório</p>
      </div>

      <NovoPacienteForm planos={planos ?? []} />
    </div>
  )
}
