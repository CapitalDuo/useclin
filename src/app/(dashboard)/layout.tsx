import { redirect } from 'next/navigation'
import { createClient, getCurrentUser, getClinicaAtual } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { PlanoGate } from '@/components/plano-gate'
import { isTrialAtivo, planoEfetivo, trialDiasRestantes } from '@/lib/plano'
import { hasFeature, type FeatureKey } from '@/lib/features'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // admin e prof são independentes → buscamos em paralelo (um round-trip a menos).
  const [{ data: admin }, { data: prof }] = await Promise.all([
    supabase.from('plataforma_admins').select('user_id').eq('user_id', user.id).maybeSingle(),
    supabase
      .from('profissionais')
      .select('nome, role, iniciais, clinica_id')
      .eq('user_id', user.id)
      .maybeSingle(),
  ])

  if (admin) redirect('/admin')

  let clinicLogoUrl: string | null = null
  let trialBanner: { dias: number; expirou: boolean } | null = null
  let bloqueado = false
  let enabledFeatures: Record<FeatureKey, boolean> | undefined

  // Deduplicada com os guards de módulo (requireFeature) via React cache().
  const clinica = prof?.clinica_id ? await getClinicaAtual() : null

  if (clinica) {
    if (!clinica.onboarding_completo) {
      redirect('/onboarding')
    }
    clinicLogoUrl = clinica.logo_url ?? null

    if (clinica.plano_slug === 'gratuito') {
      const ativo = isTrialAtivo(clinica.trial_ends_at ?? null)
      const dias = trialDiasRestantes(clinica.trial_ends_at ?? null)
      trialBanner = { dias, expirou: !ativo }
    }

    // Bloqueio total: gratuito com teste expirado (planoEfetivo retorna 'gratuito').
    // Planos pagos / trial ativo nunca caem aqui.
    bloqueado = planoEfetivo(clinica.plano_slug, clinica.trial_ends_at ?? null) === 'gratuito'

    enabledFeatures = {
      financeiro: hasFeature(clinica, 'financeiro'),
      agenda: hasFeature(clinica, 'agenda'),
      pacientes: hasFeature(clinica, 'pacientes'),
      atendimento: hasFeature(clinica, 'atendimento'),
      pediatria_completa: hasFeature(clinica, 'pediatria_completa'),
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#1e1b4b' }}>
      <Sidebar
        userName={prof?.nome ?? user.email ?? '—'}
        userRole={prof?.role === 'admin' ? 'Administrador' : 'Profissional'}
        userInitials={prof?.iniciais ?? user.email?.slice(0, 2).toUpperCase() ?? '??'}
        clinicLogoUrl={clinicLogoUrl}
        enabledFeatures={enabledFeatures}
      />
      {/* Painel de conteúdo: fundo do projeto com cantos esquerdos arredondados,
          revelando o navy do container → curvas no topo e na base, conectando
          com o notch da aba ativa. */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col bg-[#f4f3f1] rounded-l-[26px]">
        {trialBanner && (
          trialBanner.expirou ? (
            <div className="flex items-center justify-between gap-4 px-8 py-2.5 bg-[#fdeaea] border-b border-[#d24343]/20 text-sm text-[#d24343] rounded-tl-[26px]">
              <span className="font-medium">Seu período de teste encerrou — assine um plano para continuar usando a plataforma.</span>
              <a href="/configuracoes" className="whitespace-nowrap font-semibold underline hover:opacity-80 transition-opacity">
                Assinar agora →
              </a>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 px-8 py-2.5 bg-[#fff8f0] border-b border-[#f5a623]/25 text-sm text-[#b87a00] rounded-tl-[26px]">
              <span>
                <span className="font-semibold">Período de teste:</span>{' '}
                {trialBanner.dias === 0
                  ? 'último dia — acesso completo ativo até meia-noite.'
                  : `${trialBanner.dias} dia${trialBanner.dias !== 1 ? 's' : ''} restante${trialBanner.dias !== 1 ? 's' : ''} — acesso completo ativo.`}
              </span>
              <a href="/configuracoes" className="whitespace-nowrap font-semibold underline hover:opacity-80 transition-opacity">
                Escolher plano →
              </a>
            </div>
          )
        )}
        <main className="flex-1 flex flex-col">
          <PlanoGate bloqueado={bloqueado}>{children}</PlanoGate>
        </main>
      </div>
    </div>
  )
}
