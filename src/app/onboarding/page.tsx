import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/onboarding-flow'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/onboarding')

  const { data: prof } = await supabase
    .from('profissionais')
    .select('nome, clinica:clinica_id(id, nome, telefone, cnpj, endereco, onboarding_completo)')
    .eq('user_id', user.id)
    .maybeSingle()

  const clinica = prof?.clinica as
    | { id: string; nome: string; telefone: string | null; cnpj: string | null; endereco: string | null; onboarding_completo: boolean }
    | null

  if (!prof || !clinica) {
    redirect('/login?error=Sua%20conta%20n%C3%A3o%20tem%20cl%C3%ADnica%20vinculada')
  }

  if (clinica.onboarding_completo) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <OnboardingFlow
        userName={prof.nome}
        clinicName={clinica.nome}
        initialClinic={{
          telefone: clinica.telefone ?? '',
          cnpj: clinica.cnpj ?? '',
          endereco: clinica.endereco ?? '',
        }}
      />
    </div>
  )
}
