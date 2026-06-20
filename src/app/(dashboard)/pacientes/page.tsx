import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PacientesTable } from '@/components/pacientes-table'

export default async function PacientesPage() {
  const supabase = await createClient()
  const { data: pacientes } = await supabase
    .from('v_pacientes_tabela')
    .select('id, codigo, nome, iniciais, cor, cpf, data_nascimento, telefone, status, plano_nome, ultima_consulta, proxima_consulta, tags')
    .order('codigo', { ascending: false })

  const total = pacientes?.length ?? 0
  const ativos = pacientes?.filter((p) => p.status === 'ativo').length ?? 0

  return (
    <>
      <div className="flex items-center justify-between px-10 pt-7">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Pacientes</h1>
          <p className="text-sm text-muted mt-0.5">{total} cadastrado{total === 1 ? '' : 's'} · {ativos} ativo{ativos === 1 ? '' : 's'}</p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/pacientes/novo"
            className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
          >
            + Novo paciente
          </Link>
        </div>
      </div>
      <PacientesTable pacientes={pacientes ?? []} />
    </>
  )
}
