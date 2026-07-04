import { requireFeature } from '@/lib/supabase/server'
import { PediatriaTabs } from '@/components/pediatria-tabs'

// Guard do módulo: 404 se a feature estiver desligada pro tipo/override da clínica.
export default async function PediatriaLayout({ children }: { children: React.ReactNode }) {
  await requireFeature('pediatria_completa')

  return (
    <div className="px-10 pt-7 pb-10">
      <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Pediatria Completa</h1>
      <p className="text-sm text-muted mt-0.5 mb-6">Ferramentas específicas para o acompanhamento pediátrico.</p>

      <PediatriaTabs />

      {children}
    </div>
  )
}
