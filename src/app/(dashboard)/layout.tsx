import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/sidebar'
import { isTrialAtivo, trialDiasRestantes } from '@/lib/plano'

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

  let clinicLogoUrl: string | null = null
  let trialBanner: { dias: number; expirou: boolean } | null = null

  if (prof?.clinica_id) {
    const { data: clinica } = await supabase
      .from('clinica')
      .select('nome, onboarding_completo, logo_url, plano_slug, trial_ends_at')
      .eq('id', prof.clinica_id)
      .maybeSingle()

    if (clinica && !clinica.onboarding_completo) {
      redirect('/onboarding')
    }
    clinicLogoUrl = clinica?.logo_url ?? null

    if (clinica?.plano_slug === 'gratuito') {
      const ativo = isTrialAtivo(clinica.trial_ends_at ?? null)
      const dias = trialDiasRestantes(clinica.trial_ends_at ?? null)
      trialBanner = { dias, expirou: !ativo }
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#1e1b4b' }}>
      <Sidebar
        userName={prof?.nome ?? user.email ?? '—'}
        userRole={prof?.role === 'admin' ? 'Administrador' : 'Profissional'}
        userInitials={prof?.iniciais ?? user.email?.slice(0, 2).toUpperCase() ?? '??'}
        clinicLogoUrl={clinicLogoUrl}
      />
      {/* Painel de conteúdo: fundo do projeto com cantos esquerdos arredondados,
          revelando o navy do container → curvas no topo e na base, conectando
          com o notch da aba ativa. */}
      <div className="flex-1 min-h-screen min-w-0 flex flex-col bg-[#f4f3f1] rounded-l-[26px]">
        {trialBanner && (
          trialBanner.expirou ? (
            <div className="flex items-center justify-between gap-4 px-8 py-2.5 bg-[#fdeaea] border-b border-[#d24343]/20 text-sm text-[#d24343] rounded-tl-[26px]">
              <span className="font-medium">Seu período de teste encerrou — o módulo de Atendimento está restrito.</span>
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
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
