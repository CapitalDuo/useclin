import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/avatar'
import { PacienteTabs } from '@/components/paciente-tabs'

export default async function PacienteLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: paciente } = await supabase
    .from('pacientes')
    .select('id, nome, iniciais, cor, status')
    .eq('id', id)
    .maybeSingle()

  if (!paciente) notFound()

  return (
    <div className="px-10 pt-7 pb-10">
      <div className="mb-5">
        <Link href="/pacientes" className="text-xs text-muted hover:text-text font-medium">
          ← Voltar para pacientes
        </Link>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <Avatar initials={paciente.iniciais ?? paciente.nome.slice(0, 2).toUpperCase()} cor={paciente.cor} size="lg" />
        <div className="flex items-center gap-3">
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">{paciente.nome}</h1>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-md ${
            paciente.status === 'ativo' ? 'bg-green-light text-green' : 'bg-orange-light text-orange'
          }`}>
            {paciente.status === 'ativo' ? 'Ativo' : 'Inativo'}
          </span>
        </div>
      </div>

      <PacienteTabs id={id} />

      {children}
    </div>
  )
}
