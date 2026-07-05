'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatBrl, formatBrlPlain, parseBrlInput } from '@/lib/currency'
import { excluirLancamentoAction, pagarDespesaFixaAction } from '@/app/(dashboard)/financeiro/actions'

export type SeriePonto = { label: string; valor: number; data: string }

export type ContaAPagarRow = {
  id: string
  nome: string
  valor: number
  data: string
  vencida: boolean
}

export type EntradaRow = {
  id: string
  tipo: 'receita' | 'despesa'
  avulsa: boolean
  paciente_nome: string
  paciente_iniciais: string
  paciente_cor: string
  data: string
  hora: string | null
  valor: number
  status: 'pago' | 'pendente' | 'cancelado'
  descricao: string
}

const STATUS_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  pago: { bg: 'bg-green-light', text: 'text-green', label: 'Confirmado' },
  pendente: { bg: 'bg-yellow-light', text: 'text-[#9c7a18]', label: 'Aguardando' },
  cancelado: { bg: 'bg-red-light', text: 'text-red', label: 'Cancelado' },
}

export function FinanceiroView({
  faturamentoMensal,
  recebidoPago,
  aReceber,
  despesasMensal,
  weekSerie,
  contasAPagar,
  ultimasEntradas,
}: {
  faturamentoMensal: number
  recebidoPago: number
  aReceber: number
  despesasMensal: number
  weekSerie: SeriePonto[]
  contasAPagar: ContaAPagarRow[]
  ultimasEntradas: EntradaRow[]
}) {
  return (
    <div className="px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-10">
      <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="font-newsreader text-[36px] font-semibold tracking-tight leading-tight">
            Faturamento
          </h1>
          <p className="text-[15px] text-muted mt-1">Acompanhe suas receitas e recebimentos pendentes.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] border border-border bg-card text-sm font-semibold text-text hover:bg-bg transition-colors cursor-not-allowed opacity-60"
            title="Em breve"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            Filtros
          </button>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] border border-border bg-card text-sm font-semibold text-text hover:bg-bg transition-colors cursor-not-allowed opacity-60"
            title="Em breve"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Exportar
          </button>
          <Link
            href="/financeiro/nova"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-[13px] bg-text text-white text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Novo lançamento
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <KpiCard
          title="Faturamento Mensal"
          value={faturamentoMensal}
          accent="#f5a623"
          accentBg="linear-gradient(135deg, #fdf2e0 0%, #f9e4bd 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          }
        />
        <KpiCard
          title="Recebido (Pago)"
          value={recebidoPago}
          accent="#2fb98a"
          accentBg="linear-gradient(135deg, #e9f7f1 0%, #c9ecdc 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="3 17 9 11 13 15 21 7" />
              <polyline points="14 7 21 7 21 14" />
            </svg>
          }
        />
        <KpiCard
          title="A Receber"
          value={aReceber}
          accent="#6d5ae6"
          accentBg="linear-gradient(135deg, #f1eefb 0%, #ddd5f5 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        />
        <KpiCard
          title="Despesas do Mês"
          value={despesasMensal}
          accent="#e5534b"
          accentBg="linear-gradient(135deg, #fcebea 0%, #f6cdca 100%)"
          serie={weekSerie}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
              <polyline points="3 7 9 13 13 9 21 17" />
              <polyline points="14 17 21 17 21 10" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        <ContasAPagarCard contas={contasAPagar} />

        <div className="bg-card border border-border rounded-[14px] p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-newsreader text-[20px] font-semibold tracking-tight">Últimas entradas</h2>
            <span className="text-xs text-muted font-medium">
              {ultimasEntradas.length} {ultimasEntradas.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            {ultimasEntradas.length === 0 ? (
              <div className="text-center text-sm text-muted py-8">
                Nenhuma entrada registrada ainda.
              </div>
            ) : (
              ultimasEntradas.map((e) => (
                <EntradaItem key={e.id} entrada={e} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  title,
  value,
  accent,
  accentBg,
  serie,
  icon,
}: {
  title: string
  value: number
  accent: string
  accentBg: string
  serie: SeriePonto[]
  icon: React.ReactNode
}) {
  return (
    <div
      className="rounded-[14px] p-5 relative overflow-hidden"
      style={{ background: accentBg }}
    >
      <div className="flex items-start justify-between mb-7">
        <div
          className="w-10 h-10 rounded-[11px] bg-white/70 flex items-center justify-center"
          style={{ color: accent }}
        >
          {icon}
        </div>
      </div>
      <div className="text-[13px] font-medium text-text/70 mb-1">{title}</div>
      <div className="text-[28px] font-newsreader font-semibold tracking-tight text-text leading-none">
        {formatBrl(value)}
      </div>
      <div className="mt-4 h-[40px] -mx-1">
        <MiniSparkline serie={serie} color={accent} />
      </div>
    </div>
  )
}

function MiniSparkline({ serie, color }: { serie: SeriePonto[]; color: string }) {
  if (serie.length === 0) return null
  const max = Math.max(1, ...serie.map((s) => s.valor))
  const width = 280
  const height = 40
  const pad = 4
  const stepX = (width - pad * 2) / Math.max(1, serie.length - 1)
  const points = serie.map((s, i) => {
    const x = pad + i * stepX
    const y = height - pad - (s.valor / max) * (height - pad * 2)
    return { x, y }
  })
  const path = points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M${p.x},${p.y}` : ` L${p.x},${p.y}`),
    '',
  )
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="white" stroke={color} strokeWidth="1.5" />
      ))}
    </svg>
  )
}

function ContasAPagarCard({ contas }: { contas: ContaAPagarRow[] }) {
  return (
    <div className="bg-card border border-border rounded-[14px] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-newsreader text-[20px] font-semibold tracking-tight">Contas a pagar</h2>
        <Link href="/financeiro/despesas-fixas" className="text-xs font-semibold text-[#5b4bd4] hover:underline">
          Gerenciar →
        </Link>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {contas.length === 0 ? (
          <div className="text-center text-sm text-muted py-8 flex-1 flex flex-col items-center justify-center gap-3">
            <span>Nenhuma despesa fixa cadastrada.</span>
            <Link
              href="/financeiro/despesas-fixas/nova"
              className="inline-flex items-center gap-2 px-4 py-2 bg-text text-white rounded-[11px] text-xs font-semibold hover:bg-[#333] transition-colors"
            >
              + Cadastrar despesa fixa
            </Link>
          </div>
        ) : (
          contas.map((c) => <ContaAPagarItem key={c.id} conta={c} />)
        )}
      </div>
    </div>
  )
}

function ContaAPagarItem({ conta }: { conta: ContaAPagarRow }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-text truncate">{conta.nome}</div>
        <div className={`text-[11.5px] truncate ${conta.vencida ? 'text-red font-semibold' : 'text-muted'}`}>
          {conta.vencida ? 'Venceu em ' : 'Vence em '}
          {formatEntradaDate(conta.data)}
        </div>
      </div>
      <PagarDespesaButton transacaoId={conta.id} valorSugerido={conta.valor} />
    </div>
  )
}

function PagarDespesaButton({ transacaoId, valorSugerido }: { transacaoId: string; valorSugerido: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [valor, setValor] = useState(formatBrlPlain(valorSugerido))
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    const parsed = parseBrlInput(valor)
    if (!parsed || parsed.valor <= 0) return
    const formData = new FormData()
    formData.set('valor', valor)
    startTransition(async () => {
      await pagarDespesaFixaAction(transacaoId, formData)
      setEditing(false)
      router.refresh()
    })
  }

  if (!editing) {
    return (
      <div className="text-right flex-shrink-0">
        <div className="text-[14px] font-bold text-text mb-1">{formatBrl(valorSugerido)}</div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[11px] font-semibold px-2.5 py-1 rounded-[8px] bg-green-light text-green hover:bg-green hover:text-white transition-colors cursor-pointer"
        >
          Marcar como pago
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted pointer-events-none">R$</span>
        <input
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="w-24 pl-7 pr-2 py-1.5 rounded-[8px] border border-border text-[12px] outline-none focus:border-[#5b4bd4]"
          autoFocus
        />
      </div>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-[8px] bg-green text-white hover:bg-green/90 transition-colors cursor-pointer disabled:opacity-50"
      >
        {isPending ? '...' : 'Confirmar'}
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        disabled={isPending}
        className="text-[11px] font-semibold px-2 py-1.5 rounded-[8px] bg-bg text-muted hover:text-text transition-colors cursor-pointer border border-border"
      >
        ×
      </button>
    </div>
  )
}

function EntradaItem({ entrada }: { entrada: EntradaRow }) {
  const sty = STATUS_STYLE[entrada.status] ?? STATUS_STYLE.pendente
  const dateLabel = formatEntradaDate(entrada.data)
  const isDespesa = entrada.tipo === 'despesa'
  const titulo = entrada.paciente_nome !== '—' ? entrada.paciente_nome : entrada.descricao

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
        style={{ background: isDespesa ? '#e5534b' : entrada.paciente_cor }}
      >
        {isDespesa ? '−' : (entrada.paciente_iniciais ?? '?').slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-text truncate">{titulo}</div>
        <div className="text-[11.5px] text-muted truncate">
          {dateLabel}
          {entrada.hora ? `, ${entrada.hora}` : ''}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`text-[14px] font-bold ${isDespesa ? 'text-red' : 'text-text'}`}>
          {isDespesa ? '− ' : ''}
          {formatBrl(entrada.valor)}
        </div>
        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${sty.bg} ${sty.text}`}>
          {sty.label}
        </span>
      </div>
      {entrada.avulsa && <DeleteLancamentoButton id={entrada.id} />}
    </div>
  )
}

function DeleteLancamentoButton({ id }: { id: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await excluirLancamentoAction(id)
      setConfirming(false)
      router.refresh()
    })
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-[11px] font-semibold px-2 py-1 rounded-[8px] bg-red/10 text-red hover:bg-red hover:text-white transition-colors disabled:opacity-50"
        >
          {isPending ? '...' : 'Sim'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="text-[11px] font-semibold px-2 py-1 rounded-[8px] bg-bg text-muted hover:text-text transition-colors border border-border"
        >
          Não
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="p-1.5 rounded-[8px] text-muted hover:text-red hover:bg-red/10 transition-colors flex-shrink-0"
      title="Excluir lançamento"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
      </svg>
    </button>
  )
}

function formatEntradaDate(isoDate: string): string {
  if (!isoDate) return '—'
  const d = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (d.getTime() === today.getTime()) return 'Hoje'
  if (d.getTime() === yesterday.getTime()) return 'Ontem'

  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
}
