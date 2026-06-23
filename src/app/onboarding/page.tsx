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
    .select('nome, clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prof?.clinica_id) {
    redirect('/login?error=Sua%20conta%20n%C3%A3o%20tem%20cl%C3%ADnica%20vinculada')
  }

  const { data: clinica } = await supabase
    .from('clinica')
    .select('id, nome, telefone, cnpj, endereco, maps_url, onboarding_completo')
    .eq('id', prof.clinica_id)
    .maybeSingle()

  if (!clinica) {
    redirect('/login?error=Cl%C3%ADnica%20n%C3%A3o%20encontrada')
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
          maps_url: clinica.maps_url ?? '',
        }}
      />
    </div>
  )
}
