import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: admin } = await supabase
    .from('plataforma_admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!admin) redirect('/')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar email={user.email ?? '—'} />
      <main className="flex-1 min-h-screen min-w-0">{children}</main>
    </div>
  )
}
