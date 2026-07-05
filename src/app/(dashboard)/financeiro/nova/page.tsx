import { createClient } from '@/lib/supabase/server'
import { LancamentoForm } from './form'

export default async function NovoLancamentoPage() {
  const supabase = await createClient()

  const { data: pacientes } = await supabase
    .from('pacientes')
    .select('id, nome')
    .eq('status', 'ativo')
    .order('nome')

  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10 max-w-[640px]">
      <div className="mb-7">
        <h1 className="font-newsreader text-[28px] font-semibold tracking-tight leading-tight">
          Novo lançamento
        </h1>
        <p className="text-sm text-muted mt-1">
          Registre uma receita ou despesa avulsa, vinculada ou não a um paciente.
        </p>
      </div>

      <div className="bg-card border border-border rounded-[18px] p-7">
        <LancamentoForm pacientes={pacientes ?? []} />
      </div>
    </div>
  )
}
