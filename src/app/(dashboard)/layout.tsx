import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: prof } = await supabase
    .from('profissionais')
    .select('nome, role, iniciais, clinica:clinica_id(nome, onboarding_completo)')
    .eq('user_id', user.id)
    .maybeSingle()

  const clinica = prof?.clinica as { nome: string; onboarding_completo: boolean } | null

  if (clinica && !clinica.onboarding_completo) {
    redirect('/onboarding')
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={prof?.nome ?? user.email ?? '—'}
        userRole={prof?.role === 'admin' ? 'Administrador' : 'Profissional'}
        userInitials={prof?.iniciais ?? user.email?.slice(0, 2).toUpperCase() ?? '??'}
      />
      <main className="flex-1 ml-[230px] min-h-screen">{children}</main>
    </div>
  )
}
