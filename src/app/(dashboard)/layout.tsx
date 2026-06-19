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

  const { data: admin } = await supabase
    .from('plataforma_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (admin) redirect('/admin')

  const { data: prof } = await supabase
    .from('profissionais')
    .select('nome, role, iniciais, clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (prof?.clinica_id) {
    const { data: clinica } = await supabase
      .from('clinica')
      .select('nome, onboarding_completo')
      .eq('id', prof.clinica_id)
      .maybeSingle()

    if (clinica && !clinica.onboarding_completo) {
      redirect('/onboarding')
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        userName={prof?.nome ?? user.email ?? '—'}
        userRole={prof?.role === 'admin' ? 'Administrador' : 'Profissional'}
        userInitials={prof?.iniciais ?? user.email?.slice(0, 2).toUpperCase() ?? '??'}
      />
      <main className="flex-1 min-h-screen min-w-0">{children}</main>
    </div>
  )
}
