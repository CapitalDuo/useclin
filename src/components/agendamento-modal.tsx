'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  createAgendamentoAction,
  updateAgendamentoAction,
  deleteAgendamentoAction,
  getAgendamentoAction,
} from '@/app/(dashboard)/agenda/actions'
import { formatBrlPlain, parseBrlInput } from '@/lib/currency'
import { todayISO } from '@/lib/date'
import { PageLoader } from '@/components/page-loader'

type Paciente = { id: string; nome: string }
type Profissional = { id: string; nome: string; especialidade: string | null }
type Tipo = { id: string; nome: string; cor: string; duracao_padrao: string | null }

export type AgendamentoModalMode =
  | { kind: 'new'; data?: string; hora?: string }
  | { kind: 'edit'; id: string }

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const nh = Math.floor((total % (24 * 60)) / 60)
  const nm = total % 60
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`
}

function parseInterval(pgInterval: string | null): number {
  if (!pgInterval) return 30
  const m = pgInterval.match(/(\d+):(\d+):(\d+)/)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  const num = pgInterval.match(/(\d+)/)
  return num ? Number(num[1]) : 30
}

export function AgendamentoModal({
  mode,
  onClose,
  pacientes,
  profissionais,
  tipos,
}: {
  mode: AgendamentoModalMode
  onClose: () => void
  pacientes: Paciente[]
  profissionais: Profissional[]
  tipos: Tipo[]
}) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(mode.kind === 'edit')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Seed inicial a partir do modo. O call site passa `key` derivada do modo,
  // então trocar de agendamento (ou de slot no 'new') remonta e re-seeda —
  // padrão React de resetar estado por prop, sem setState síncrono em effect.
  const [pacienteId, setPacienteId] = useState(() => (mode.kind === 'new' ? pacientes[0]?.id ?? '' : ''))
  const [profissionalId, setProfissionalId] = useState(() => (mode.kind === 'new' ? profissionais[0]?.id ?? '' : ''))
  const [tipoId, setTipoId] = useState('none')
  const [data, setData] = useState(() => (mode.kind === 'new' ? mode.data ?? todayISO() : ''))
  const [horaInicio, setHoraInicio] = useState(() => (mode.kind === 'new' ? mode.hora ?? '09:00' : '09:00'))
  const [horaFim, setHoraFim] = useState(() =>
    mode.kind === 'new' ? (mode.hora ? addMinutes(mode.hora, 30) : '09:30') : '09:30',
  )
  const [status, setStatus] = useState('agendado')
  const [valor, setValor] = useState('')
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (mode.kind !== 'edit') return
    let cancelled = false

    getAgendamentoAction(mode.id).then((res) => {
      if (cancelled) return
      if (res.ok) {
        const a = res.agendamento
        setPacienteId(a.paciente_id)
        setProfissionalId(a.profissional_id)
        setTipoId(a.tipo_consulta_id ?? 'none')
        setData(a.data)
        setHoraInicio(a.hora_inicio.slice(0, 5))
        setHoraFim(a.hora_fim.slice(0, 5))
        setStatus(a.status)
        setValor(a.valor != null ? formatBrlPlain(a.valor) : '')
        setNotas(a.notas ?? '')
      } else {
        setError(res.error)
      }
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [mode])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  function handleTipoChange(id: string) {
    setTipoId(id)
    const tipo = tipos.find((t) => t.id === id)
    if (tipo) {
      const dur = parseInterval(tipo.duracao_padrao)
      setHoraFim(addMinutes(horaInicio, dur))
    }
  }

  function handleHoraInicioChange(t: string) {
    setHoraInicio(t)
    const tipo = tipos.find((x) => x.id === tipoId)
    const dur = tipo ? parseInterval(tipo.duracao_padrao) : 30
    setHoraFim(addMinutes(t, dur))
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result =
      mode.kind === 'new'
        ? await createAgendamentoAction(formData)
        : await updateAgendamentoAction(mode.id, formData)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  async function handleDelete() {
    if (mode.kind !== 'edit') return
    setPending(true)
    setError(null)
    const result = await deleteAgendamentoAction(mode.id)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  const isEdit = mode.kind === 'edit'
  const title = isEdit ? 'Editar consulta' : 'Nova consulta'
  const subtitle = isEdit
    ? 'Atualize os dados da consulta'
    : 'Agendar uma nova consulta para um paciente'

  return (
    <>
      {pending && <PageLoader message={isEdit ? 'Salvando…' : 'Agendando consulta…'} />}
      <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 sm:py-10 bg-text/30 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="agendamento-modal-title"
      onMouseDown={onBackdropClick}
    >
      <div
        ref={dialogRef}
        className="bg-card border border-border rounded-[18px] shadow-2xl w-full max-w-[720px] my-auto animate-[modalIn_180ms_ease-out]"
      >
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border">
          <div>
            <h2 id="agendamento-modal-title" className="font-playfair text-[22px] font-extrabold tracking-tight">
              {title}
            </h2>
            <p className="text-xs text-muted mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer -mr-2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[18px] h-[18px]">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="px-7 py-14 text-center text-sm text-muted">Carregando…</div>
        ) : pacientes.length === 0 && !isEdit ? (
          <div className="px-7 py-10 text-center">
            <h3 className="font-playfair text-lg font-bold mb-2">Cadastre um paciente primeiro</h3>
            <p className="text-sm text-muted mb-5">Você precisa ter pelo menos um paciente ativo pra agendar uma consulta.</p>
            <Link
              href="/pacientes/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all cursor-pointer"
            >
              + Cadastrar paciente
            </Link>
          </div>
        ) : (
          <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Paciente *</label>
              <select
                name="paciente_id"
                required
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
                className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
              >
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Profissional *</label>
                <select
                  name="profissional_id"
                  required
                  value={profissionalId}
                  onChange={(e) => setProfissionalId(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
                >
                  {profissionais.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}{p.especialidade ? ` · ${p.especialidade}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Tipo de consulta</label>
                <select
                  name="tipo_consulta_id"
                  value={tipoId}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
                >
                  <option value="none">— sem tipo —</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Data *</label>
                <input
                  type="date"
                  name="data"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Início *</label>
                <input
                  type="time"
                  name="hora_inicio"
                  required
                  value={horaInicio}
                  onChange={(e) => handleHoraInicioChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Fim *</label>
                <input
                  type="time"
                  name="hora_fim"
                  required
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Status</label>
                <select
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg cursor-pointer"
                >
                  <option value="agendado">Agendado</option>
                  <option value="em_atendimento">Em andamento</option>
                  <option value="concluido">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="faltou">Faltou</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">Valor (R$) {isEdit ? '' : '(opcional)'}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted pointer-events-none">R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="valor"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    onBlur={() => {
                      if (!valor.trim()) return
                      const parsed = parseBrlInput(valor)
                      if (parsed) setValor(formatBrlPlain(parsed.valor))
                    }}
                    placeholder="150,00"
                    className="w-full pl-10 pr-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">
                {isEdit ? 'Notas / Observações' : 'Notas'}
              </label>
              <textarea
                name="notas"
                rows={3}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Observações sobre a consulta…"
                className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg resize-none"
              />
            </div>

            {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
              {isEdit ? (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red font-semibold">Excluir?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={pending}
                      className="px-4 py-2 rounded-[13px] bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Sim, excluir
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-4 py-2 rounded-[13px] border border-border text-xs font-semibold hover:bg-bg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="px-4 py-2 rounded-[13px] border border-red/30 text-xs font-semibold text-red hover:bg-red-light transition-colors cursor-pointer"
                  >
                    Excluir consulta
                  </button>
                )
              ) : (
                <span />
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-[13px] border border-border text-sm font-semibold hover:bg-bg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending
                    ? isEdit ? 'Salvando…' : 'Agendando…'
                    : isEdit ? 'Salvar alterações' : 'Agendar consulta →'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      </div>
    </>
  )
}
