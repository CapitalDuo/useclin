import { requireFeature } from '@/lib/supabase/server'

// Guard do módulo: 404 se a feature estiver desligada pro tipo/override da
// clínica. Cobre todas as subrotas (nova, despesas-fixas, ...).
export default async function FinanceiroLayout({ children }: { children: React.ReactNode }) {
  await requireFeature('financeiro')
  return children
}
