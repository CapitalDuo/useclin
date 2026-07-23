export function isTrialAtivo(trial_ends_at: string | null): boolean {
  if (!trial_ends_at) return false
  return new Date(trial_ends_at) > new Date()
}

export function trialDiasRestantes(trial_ends_at: string | null): number {
  if (!trial_ends_at) return 0
  const diff = new Date(trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

export function diasAtePeriodoFim(plano_periodo_fim: string | null): number | null {
  if (!plano_periodo_fim) return null
  const diff = new Date(plano_periodo_fim).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Retorna o plano efetivo: gratuito em trial = completo
export function planoEfetivo(plano_slug: string, trial_ends_at: string | null): string {
  if (plano_slug === 'gratuito' && isTrialAtivo(trial_ends_at)) return 'completo'
  return plano_slug
}
