'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { exportarTransacoesAction } from '@/app/(dashboard)/financeiro/actions'

const DEFAULTS: Record<string, string> = { periodo: 'este_mes', tipo: 'todas', status: 'todos', busca: '' }

const PERIODO_OPTIONS = [
  { value: 'este_mes', label: 'Este mês' },
  { value: 'mes_passado', label: 'Mês passado' },
  { value: 'este_ano', label: 'Este ano' },
  { value: 'tudo', label: 'Tudo' },
]

const TIPO_OPTIONS = [
  { value: 'todas', label: 'Todas' },
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' },
]

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pago', label: 'Pago' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'cancelado', label: 'Cancelado' },
]

export function FinanceiroFiltros() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const periodo = searchParams.get('periodo') ?? DEFAULTS.periodo
  const tipo = searchParams.get('tipo') ?? DEFAULTS.tipo
  const status = searchParams.get('status') ?? DEFAULTS.status
  const buscaAtual = searchParams.get('busca') ?? DEFAULTS.busca
  const filtrosAtivos = periodo !== DEFAULTS.periodo || tipo !== DEFAULTS.tipo || status !== DEFAULTS.status || buscaAtual !== DEFAULTS.busca

  const [open, setOpen] = useState(filtrosAtivos)
  const [busca, setBusca] = useState(buscaAtual)
  const [isExporting, startExport] = useTransition()

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === DEFAULTS[key]) params.delete(key)
    else params.set(key, value)
    router.push(`/financeiro?${params.toString()}`)
  }

  function limparFiltros() {
    setBusca('')
    router.push('/financeiro')
  }

  function handleExport() {
    startExport(async () => {
      const result = await exportarTransacoesAction({ periodo, tipo, status, busca: buscaAtual })
      if (!result.ok) return
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financeiro-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-[13px] border text-sm font-semibold transition-colors cursor-pointer ${
            filtrosAtivos
              ? 'border-[#5b4bd4]/30 bg-[#f1eefb] text-[#5b4bd4]'
              : 'border-border bg-card text-text hover:bg-bg'
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filtros
          {filtrosAtivos && <span className="w-1.5 h-1.5 rounded-full bg-[#5b4bd4]" />}
        </button>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] border border-border bg-card text-sm font-semibold text-text hover:bg-bg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isExporting ? 'Exportando...' : 'Exportar'}
        </button>
      </div>

      {open && (
        <div className="flex items-center gap-3 flex-wrap bg-card border border-border rounded-[13px] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Período</span>
            <select
              value={periodo}
              onChange={(e) => updateParam('periodo', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg border border-border outline-none cursor-pointer"
            >
              {PERIODO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Tipo</span>
            <select
              value={tipo}
              onChange={(e) => updateParam('tipo', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg border border-border outline-none cursor-pointer"
            >
              {TIPO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted font-medium">Status</span>
            <select
              value={status}
              onChange={(e) => updateParam('status', e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-bg border border-border outline-none cursor-pointer"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Buscar por paciente ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onBlur={() => updateParam('busca', busca.trim())}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateParam('busca', busca.trim())
            }}
            className="flex-1 min-w-[200px] px-3 py-1.5 rounded-lg text-xs bg-bg border border-border outline-none focus:border-[#5b4bd4] transition-colors"
          />
          {filtrosAtivos && (
            <button
              type="button"
              onClick={limparFiltros}
              className="text-xs font-semibold text-muted hover:text-text transition-colors cursor-pointer"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  )
}
