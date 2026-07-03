import { requireFeature } from '@/lib/supabase/server'

// Guard do módulo: 404 se a feature estiver desligada pro tipo/override da
// clínica. Cobre todas as subrotas (novo, [id], editar, prescrições, ...).
export default async function PacientesLayout({ children }: { children: React.ReactNode }) {
  await requireFeature('pacientes')
  return children
}
