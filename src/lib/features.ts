// Feature = módulo que um TIPO de clínica usa. Eixo ortogonal ao plano/billing
// (gating de plano continua em lib/plano.ts — uma rota pode exigir os dois).
//
// Os defaults por tipo vivem AQUI em código, não no banco: feature nova passa a
// valer pra todas as clínicas sem migration/backfill. A coluna clinica.features
// (jsonb) guarda só overrides individuais, ex: '{"atendimento": false}'.

export type FeatureKey = 'financeiro' | 'agenda' | 'pacientes' | 'atendimento'

// slug → label (label usado no select do admin)
export const TIPOS_CLINICA = {
  geral: 'Geral',
  pediatrica: 'Pediátrica',
  estetica: 'Estética',
} as const
export type TipoClinica = keyof typeof TIPOS_CLINICA

const TUDO_LIGADO: Record<FeatureKey, boolean> = {
  financeiro: true,
  agenda: true,
  pacientes: true,
  atendimento: true,
}

// ponytail: todos os tipos começam com tudo ligado — zero mudança de
// comportamento no deploy. Ajustar por tipo quando a matriz real for definida.
const FEATURE_DEFAULTS: Record<TipoClinica, Record<FeatureKey, boolean>> = {
  geral: TUDO_LIGADO,
  pediatrica: TUDO_LIGADO,
  estetica: TUDO_LIGADO,
}

/**
 * Resolução: override da clínica → default do tipo → default de 'geral'
 * (tipo desconhecido nunca tranca a clínica). Função pura — recebe a linha
 * de `clinica` já carregada, zero query (mesmo padrão de planoEfetivo).
 */
export function hasFeature(
  clinica: { tipo_clinica: string; features: unknown },
  feat: FeatureKey,
): boolean {
  const overrides = (clinica.features ?? {}) as Partial<Record<FeatureKey, boolean>>
  const defaults = FEATURE_DEFAULTS[clinica.tipo_clinica as TipoClinica] ?? FEATURE_DEFAULTS.geral
  return overrides[feat] ?? defaults[feat]
}
