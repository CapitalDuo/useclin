import { requireFeature } from '@/lib/supabase/server'

// Guard do módulo: 404 se a feature estiver desligada pro tipo/override da clínica.
export default async function ConsultasLayout({ children }: { children: React.ReactNode }) {
  await requireFeature('pediatria_completa')
  return children
}
