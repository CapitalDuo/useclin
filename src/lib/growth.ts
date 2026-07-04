// Curvas de crescimento — método LMS (OMS/CDC).
// Referência em growth-reference/*.json: [idadeMeses, L, M, S][] por sexo.
// Fontes oficiais: OMS Child Growth Standards (0–23 meses, tabela diária
// amostrada mensalmente) + CDC 2000 (24+ meses) — a troca aos 24 meses é a
// convenção recomendada pelo próprio CDC. Há um pequeno degrau esperado na
// junção (OMS mede comprimento deitado, CDC estatura em pé).
import peso from './growth-reference/peso.json'
import altura from './growth-reference/altura.json'
import pc from './growth-reference/pc.json'

export type Sexo = 'M' | 'F'
export type Medida = 'peso' | 'altura' | 'pc'

const TABELAS: Record<Medida, Record<Sexo, number[][]>> = { peso, altura, pc }

/** Percentis desenhados no gráfico, com o z exato de cada um. */
export const PERCENTIS_CURVA = [
  { label: 'P3', z: -1.88079 },
  { label: 'P15', z: -1.03643 },
  { label: 'P50', z: 0 },
  { label: 'P85', z: 1.03643 },
  { label: 'P97', z: 1.88079 },
] as const

/** Idade em meses (fracionária) entre nascimento e data da medição (ISO yyyy-mm-dd). */
export function idadeEmMeses(nascimento: string, data: string): number {
  const ms = new Date(data + 'T00:00:00Z').getTime() - new Date(nascimento + 'T00:00:00Z').getTime()
  return ms / 86400000 / 30.4375
}

/** Faixa de idade coberta pela referência (meses). */
export function faixaIdade(medida: Medida): { min: number; max: number } {
  const t = TABELAS[medida].M
  return { min: t[0][0], max: t[t.length - 1][0] }
}

// Interpolação linear de L/M/S entre os pontos da tabela. Null fora do range.
function lmsEm(tabela: number[][], idadeMeses: number): [number, number, number] | null {
  if (idadeMeses < tabela[0][0] || idadeMeses > tabela[tabela.length - 1][0]) return null
  const i = tabela.findIndex((p) => p[0] >= idadeMeses) // ≤242 pontos, scan linear basta
  const b = tabela[i]
  if (b[0] === idadeMeses) return [b[1], b[2], b[3]]
  const a = tabela[i - 1]
  const t = (idadeMeses - a[0]) / (b[0] - a[0])
  return [a[1] + t * (b[1] - a[1]), a[2] + t * (b[2] - a[2]), a[3] + t * (b[3] - a[3])]
}

/** Z-score LMS: ((X/M)^L − 1) / (L·S), ou ln(X/M)/S quando L=0. */
export function zScore(medida: Medida, sexo: Sexo, idadeMeses: number, valor: number): number | null {
  if (!(valor > 0)) return null
  const lms = lmsEm(TABELAS[medida][sexo], idadeMeses)
  if (!lms) return null
  const [l, m, s] = lms
  return l === 0 ? Math.log(valor / m) / s : (Math.pow(valor / m, l) - 1) / (l * s)
}

/** Percentil (0–100) da medição, ou null fora da faixa de idade da referência. */
export function percentil(medida: Medida, sexo: Sexo, idadeMeses: number, valor: number): number | null {
  const z = zScore(medida, sexo, idadeMeses, valor)
  return z === null ? null : normalCdf(z) * 100
}

/** Valor da medida num z dado (inverso do LMS) — usado pra desenhar as curvas. */
export function valorNoZ(medida: Medida, sexo: Sexo, idadeMeses: number, z: number): number | null {
  const lms = lmsEm(TABELAS[medida][sexo], idadeMeses)
  if (!lms) return null
  const [l, m, s] = lms
  return l === 0 ? m * Math.exp(s * z) : m * Math.pow(1 + l * s * z, 1 / l)
}

// CDF da normal padrão — aproximação de Abramowitz & Stegun 26.2.17 (erro < 7.5e-8).
function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989422804014327 * Math.exp((-z * z) / 2)
  const p =
    d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return z >= 0 ? 1 - p : p
}
