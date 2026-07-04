// Gráfico de curva de crescimento — SVG server-rendered (padrão do projeto,
// como o donut/sparklines). Curvas de percentil da referência OMS/CDC +
// pontos do paciente por cima.
import { faixaIdade, valorNoZ, PERCENTIS_CURVA, type Medida, type Sexo } from '@/lib/growth'

const W = 760
const H = 420
const PAD = { top: 18, right: 48, bottom: 36, left: 48 }
const PLOT_W = W - PAD.left - PAD.right
const PLOT_H = H - PAD.top - PAD.bottom

export type PontoPaciente = { idade: number; valor: number }

function niceStep(raw: number): number {
  const pow = Math.pow(10, Math.floor(Math.log10(raw)))
  const n = raw / pow
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * pow
}

export function GrowthChart({
  medida,
  sexo,
  pontos,
  unidade,
}: {
  medida: Medida
  sexo: Sexo
  pontos: PontoPaciente[]
  unidade: string
}) {
  const faixa = faixaIdade(medida)
  const maxIdadePontos = pontos.length ? Math.max(...pontos.map((p) => p.idade)) : 0
  // Janela adaptada ao paciente: mínimo 12 meses, folga de 25%, teto na referência.
  const xMax = Math.min(faixa.max, Math.max(12, Math.ceil((maxIdadePontos * 1.25) / 6) * 6))

  const visiveis = pontos.filter((p) => p.idade >= 0 && p.idade <= xMax)
  const omitidos = pontos.length - visiveis.length

  // Amostra as curvas de percentil na janela
  const N = 60
  const xs = Array.from({ length: N + 1 }, (_, i) => (i * xMax) / N)
  const curvas = PERCENTIS_CURVA.map(({ label, z }) => ({
    label,
    valores: xs.map((x) => valorNoZ(medida, sexo, x, z)!),
  }))

  // Domínio Y: curvas extremas + pontos do paciente, com folga
  const tudo = [...curvas[0].valores, ...curvas[curvas.length - 1].valores, ...visiveis.map((p) => p.valor)]
  const spread = Math.max(...tudo) - Math.min(...tudo)
  const yMin = Math.min(...tudo) - spread * 0.06
  const yMax = Math.max(...tudo) + spread * 0.06

  const px = (idade: number) => PAD.left + (idade / xMax) * PLOT_W
  const py = (v: number) => PAD.top + (1 - (v - yMin) / (yMax - yMin)) * PLOT_H

  // Ticks
  const xStep = xMax <= 24 ? 3 : xMax <= 36 ? 6 : xMax <= 72 ? 12 : 24
  const xTicks: number[] = []
  for (let m = 0; m <= xMax; m += xStep) xTicks.push(m)
  const xLabel = (m: number) => (xMax <= 36 ? `${m}m` : `${Math.round(m / 12)}a`)

  const yStep = niceStep((yMax - yMin) / 5)
  const yTicks: number[] = []
  for (let v = Math.ceil(yMin / yStep) * yStep; v <= yMax; v += yStep) yTicks.push(Number(v.toFixed(4)))

  const path = (valores: number[]) =>
    valores.map((v, i) => `${i === 0 ? 'M' : 'L'}${px(xs[i]).toFixed(1)},${py(v).toFixed(1)}`).join('')

  const pontosOrdenados = [...visiveis].sort((a, b) => a.idade - b.idade)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {/* grid + eixos */}
        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={py(v)} y2={py(v)} stroke="#eceae5" strokeWidth="1" />
            <text x={PAD.left - 8} y={py(v) + 3.5} textAnchor="end" fontSize="10" fill="#9a978f">
              {String(v).replace('.', ',')}
            </text>
          </g>
        ))}
        {xTicks.map((m) => (
          <text key={`x${m}`} x={px(m)} y={H - PAD.bottom + 18} textAnchor="middle" fontSize="10" fill="#9a978f">
            {xLabel(m)}
          </text>
        ))}
        <text x={W - PAD.right} y={H - PAD.bottom + 32} textAnchor="end" fontSize="9" fill="#9a978f">
          idade
        </text>
        <text x={PAD.left - 8} y={PAD.top - 6} textAnchor="end" fontSize="9" fill="#9a978f">
          {unidade}
        </text>

        {/* curvas de percentil */}
        {curvas.map(({ label, valores }) => (
          <g key={label}>
            <path
              d={path(valores)}
              fill="none"
              stroke={label === 'P50' ? '#b7aee8' : '#ddd9d0'}
              strokeWidth={label === 'P50' ? 2 : 1.3}
            />
            <text
              x={W - PAD.right + 6}
              y={py(valores[valores.length - 1]) + 3.5}
              fontSize="10"
              fontWeight="600"
              fill={label === 'P50' ? '#8677d9' : '#b5b1a6'}
            >
              {label}
            </text>
          </g>
        ))}

        {/* trajetória do paciente */}
        {pontosOrdenados.length > 1 && (
          <path
            d={pontosOrdenados.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.idade).toFixed(1)},${py(p.valor).toFixed(1)}`).join('')}
            fill="none"
            stroke="#5b4bd4"
            strokeWidth="2"
          />
        )}
        {pontosOrdenados.map((p, i) => (
          <circle key={i} cx={px(p.idade)} cy={py(p.valor)} r="4" fill="#5b4bd4" stroke="#fff" strokeWidth="1.5" />
        ))}
      </svg>

      {omitidos > 0 && (
        <p className="text-[11px] text-muted mt-2">
          {omitidos} medição{omitidos === 1 ? '' : 'ões'} fora da faixa de idade da referência não aparece
          {omitidos === 1 ? '' : 'm'} no gráfico.
        </p>
      )}
    </div>
  )
}
