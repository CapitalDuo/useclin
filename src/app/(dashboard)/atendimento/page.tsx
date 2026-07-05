import { redirect } from 'next/navigation'
import { createClient, getCurrentUser, getClinicaAtual, requireFeature } from '@/lib/supabase/server'
import { PacientesView } from '@/components/pacientes-view'
import { AtendimentoLocked } from '@/components/atendimento-locked'
import { planoEfetivo } from '@/lib/plano'

export default async function AtendimentoPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  // Dois eixos independentes: feature (tipo de clínica) → 404; plano (billing) → upsell.
  await requireFeature('atendimento')
  const clinica = await getClinicaAtual() // cache: mesma query do requireFeature

  if (!clinica || planoEfetivo(clinica.plano_slug, clinica.trial_ends_at ?? null) !== 'completo') {
    return <AtendimentoLocked />
  }

  const supabase = await createClient()
  const { data: whatsapp } = await supabase
    .from('whatsapp_instancias')
    .select('id, nome_instancia, numero, status, qrcode_base64, api_key')
    .eq('clinica_id', clinica.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <>
      <div className="flex items-center justify-between gap-3 flex-wrap px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7">
        <div>
          <h1 className="font-playfair text-[28px] font-extrabold tracking-tight">Atendimento</h1>
          <p className="text-sm text-muted mt-0.5">Converse com seus pacientes e gerencie atendimentos.</p>
        </div>
        <div className="flex gap-2.5">
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer">
            + Novo agendamento
          </button>
        </div>
      </div>
      <PacientesView whatsapp={whatsapp} />
    </>
  )
}
