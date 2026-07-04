'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ratelimit'

// Medidas corporais não têm separador de milhar — vírgula ou ponto decimal basta.
function parseMedida(raw: FormDataEntryValue | null): number | null {
  const n = Number(String(raw ?? '').trim().replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : null
}

export async function criarMedicaoAction(pacienteId: string, formData: FormData) {
  const data = String(formData.get('data') ?? '').trim()
  const peso_kg = parseMedida(formData.get('peso_kg'))
  const altura_cm = parseMedida(formData.get('altura_cm'))
  const perimetro_cefalico_cm = parseMedida(formData.get('perimetro_cefalico_cm'))

  if (!data) return { ok: false as const, error: 'Data é obrigatória' }
  if (!peso_kg && !altura_cm && !perimetro_cefalico_cm) {
    return { ok: false as const, error: 'Informe pelo menos uma medida' }
  }

  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const rl = await checkRateLimit('write', user.id)
  if (!rl.ok) return { ok: false as const, error: rl.error }

  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const { error } = await supabase.from('medicoes_pediatricas').insert({
    clinica_id: prof.clinica_id,
    paciente_id: pacienteId,
    data,
    peso_kg,
    altura_cm,
    perimetro_cefalico_cm,
    registrado_por: prof.id,
  })
  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/pacientes/${pacienteId}/crescimento`)
  return { ok: true as const }
}

export async function excluirMedicaoAction(id: string, pacienteId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('medicoes_pediatricas').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }

  revalidatePath(`/pacientes/${pacienteId}/crescimento`)
  return { ok: true as const }
}
