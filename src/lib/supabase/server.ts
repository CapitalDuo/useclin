import { cache } from 'react'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Database } from '../database.types'
import { hasFeature, type FeatureKey } from '../features'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Server Components can't write cookies; proxy.ts refreshes session
          }
        },
      },
    },
  )
}

/**
 * Usuário autenticado, deduplicado por request com React `cache()`. Assim o
 * layout do dashboard e a página compartilham UMA única chamada a `getUser()`
 * em vez de cada um fazer seu próprio round-trip ao Supabase Auth. O proxy roda
 * em outro contexto (middleware) e mantém a própria verificação.
 */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

/**
 * Usuário autenticado + seu registro de profissional (com clinica_id). Fonte
 * única do lookup "user → profissionais" que estava repetido em cada server
 * action — quem chama decide a mensagem de erro pra cada caso (sem usuário /
 * sem clínica vinculada).
 */
export async function getProfissional(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { user: null, prof: null }

  const { data: prof } = await supabase
    .from('profissionais')
    .select('id, nome, registro, especialidade, clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return { user, prof }
}

/**
 * Clínica do usuário logado, deduplicada por request com React `cache()` —
 * layout do dashboard e guards de módulo (requireFeature) compartilham UMA
 * query. Retorna null se não houver usuário ou clínica vinculada.
 */
export const getClinicaAtual = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  const { data: prof } = await supabase
    .from('profissionais')
    .select('clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!prof?.clinica_id) return null

  const { data: clinica } = await supabase
    .from('clinica')
    .select('*')
    .eq('id', prof.clinica_id)
    .maybeSingle()
  return clinica
})

/**
 * Guard de rota por feature: 404 se o módulo estiver desligado pro tipo (ou
 * override) da clínica. Usar no topo do layout/page do módulo — esconder o
 * item do menu não basta, a URL direta precisa bloquear também.
 */
export async function requireFeature(feat: FeatureKey) {
  const clinica = await getClinicaAtual()
  if (clinica && !hasFeature(clinica, feat)) notFound()
}
