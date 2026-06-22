'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  updateClinicaAction,
  updateHorariosAction,
  upsertWhatsappAction,
  updateMeuPerfilAction,
  toggleNotificacaoAction,
  type NotificacaoTipo,
} from '@/app/(dashboard)/configuracoes/actions'

export type Clinica = {
  id: string
  nome: string
  subtitulo: string | null
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
}

export type Profissional = {
  id: string
  nome: string
  especialidade: string | null
  registro: string | null
  email: string | null
  telefone: string | null
  role: string
}

export type HorarioRow = {
  dia_semana: number
  aberto: boolean
  hora_inicio: string
  hora_fim: string
}

export type WhatsappInstancia = {
  id: string
  nome_instancia: string
  numero: string
  status: string
} | null

export type Notificacoes = Record<NotificacaoTipo, boolean>

const DAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

const NOTIF_ITEMS: { tipo: NotificacaoTipo; label: string; descricao: string }[] = [
  { tipo: 'lembrete_consulta', label: 'Lembrete de consulta', descricao: 'Enviar lembrete 24h antes da consulta' },
  { tipo: 'confirmacao_whatsapp', label: 'Confirmação por WhatsApp', descricao: 'Solicitar confirmação via mensagem' },
  { tipo: 'email_pos_consulta', label: 'E-mail pós-consulta', descricao: 'Enviar resumo da consulta por e-mail' },
]

const WHATSAPP_STATUS_LABEL: Record<string, string> = {
  conectado: 'Conectado',
  aguardando_scan: 'Aguardando scan',
  desconectado: 'Desconectado',
  erro: 'Erro',
}
const WHATSAPP_STATUS_STYLE: Record<string, string> = {
  conectado: 'bg-green-light text-green',
  aguardando_scan: 'bg-orange-light text-orange',
  desconectado: 'bg-bg text-muted',
  erro: 'bg-red-light text-red',
}

export function ConfiguracoesView({
  clinica,
  horarios,
  whatsapp,
  profissional,
  notificacoes,
}: {
  clinica: Clinica
  horarios: HorarioRow[]
  whatsapp: WhatsappInstancia
  profissional: Profissional
  notificacoes: Notificacoes
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editKind = searchParams.get('edit')

  function openEdit(kind: 'clinica' | 'horarios' | 'whatsapp' | 'meu-perfil') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('edit', kind)
    router.push(`/configuracoes?${params.toString()}`)
  }

  function closeModal() {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('edit')
    const qs = params.toString()
    router.replace(qs ? `/configuracoes?${qs}` : '/configuracoes')
  }

  const horariosByDay = new Map(horarios.map((h) => [h.dia_semana, h]))

  return (
    <div className="px-10 pt-7 pb-10 max-w-[920px] flex flex-col gap-6">
      <SectionCard title="Perfil da Clínica" onEdit={() => openEdit('clinica')}>
        <Row label="Nome da clínica" hint="Nome exibido no sistema" value={clinica.nome} />
        <Row label="CNPJ" value={clinica.cnpj ?? '—'} />
        <Row label="Telefone" value={clinica.telefone ?? '—'} />
        <Row label="E-mail" value={clinica.email ?? '—'} />
        {clinica.endereco && <Row label="Endereço" value={clinica.endereco} />}
      </SectionCard>

      <SectionCard title="Notificações">
        {NOTIF_ITEMS.map((item) => (
          <NotificacaoRow
            key={item.tipo}
            label={item.label}
            descricao={item.descricao}
            tipo={item.tipo}
            ativo={notificacoes[item.tipo] ?? false}
          />
        ))}
      </SectionCard>

      <SectionCard title="Horário de Funcionamento" onEdit={() => openEdit('horarios')}>
        {DAY_ORDER.map((dia) => {
          const h = horariosByDay.get(dia)
          const label = DAY_LABELS[dia]
          const valor = h?.aberto
            ? `${h.hora_inicio.slice(0, 5)} – ${h.hora_fim.slice(0, 5)}`
            : 'Fechado'
          return <Row key={dia} label={label} value={valor} dim={!h?.aberto} />
        })}
      </SectionCard>

      <SectionCard title="WhatsApp" onEdit={() => openEdit('whatsapp')}>
        {whatsapp ? (
          <>
            <Row label="Instância" value={whatsapp.nome_instancia} />
            <Row label="Número" value={whatsapp.numero} />
            <Row
              label="Status"
              value={
                <span className={`inline-flex text-[11px] font-semibold px-3 py-1 rounded-md ${WHATSAPP_STATUS_STYLE[whatsapp.status] ?? 'bg-bg text-muted'}`}>
                  {WHATSAPP_STATUS_LABEL[whatsapp.status] ?? whatsapp.status}
                </span>
              }
            />
          </>
        ) : (
          <div className="py-3 text-sm text-muted">Nenhuma instância WhatsApp configurada ainda.</div>
        )}
      </SectionCard>

      <SectionCard title="Meu Perfil" onEdit={() => openEdit('meu-perfil')}>
        <Row label="Nome completo" value={profissional.nome} />
        <Row label="Especialidade" value={profissional.especialidade ?? '—'} />
        <Row label="Registro (CRM/CRO)" value={profissional.registro ?? '—'} />
        <Row label="Telefone" value={profissional.telefone ?? '—'} />
        <Row label="E-mail" value={profissional.email ?? '—'} hint="Usado para login — fale com o admin para alterar" />
      </SectionCard>

      {editKind === 'clinica' && <ClinicaModal clinica={clinica} onClose={closeModal} />}
      {editKind === 'horarios' && <HorariosModal initial={horarios} onClose={closeModal} />}
      {editKind === 'whatsapp' && <WhatsappModal initial={whatsapp} onClose={closeModal} />}
      {editKind === 'meu-perfil' && <MeuPerfilModal profissional={profissional} onClose={closeModal} />}
    </div>
  )
}

function SectionCard({
  title,
  onEdit,
  children,
}: {
  title: string
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border">
        <h2 className="font-playfair text-[20px] font-extrabold tracking-tight">{title}</h2>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[10px] border border-border text-xs font-semibold text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Editar
          </button>
        )}
      </div>
      <div className="px-7 py-2 flex flex-col">{children}</div>
    </section>
  )
}

function Row({
  label,
  hint,
  value,
  dim,
}: {
  label: string
  hint?: string
  value: React.ReactNode
  dim?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div>
        <div className="text-[14px] font-semibold text-text">{label}</div>
        {hint && <div className="text-xs text-muted mt-0.5">{hint}</div>}
      </div>
      <div className={`text-sm text-right ${dim ? 'text-muted' : 'text-muted'}`}>{value}</div>
    </div>
  )
}

function NotificacaoRow({
  label,
  descricao,
  tipo,
  ativo: initialAtivo,
}: {
  label: string
  descricao: string
  tipo: NotificacaoTipo
  ativo: boolean
}) {
  const [ativo, setAtivo] = useState(initialAtivo)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function toggle() {
    const next = !ativo
    setAtivo(next)
    setError(null)
    startTransition(async () => {
      const result = await toggleNotificacaoAction(tipo, next)
      if (!result.ok) {
        setAtivo(!next)
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-border last:border-0">
      <div>
        <div className="text-[14px] font-semibold text-text">{label}</div>
        <div className="text-xs text-muted mt-0.5">{descricao}</div>
        {error && <div className="text-xs text-red mt-1">{error}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={ativo}
        onClick={toggle}
        disabled={pending}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-50 ${
          ativo ? 'bg-[#2fb98a]' : 'bg-[#d4d2cd]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform mt-1 ${
            ativo ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}

// -----------------------------------------------------------------------------
// Modal shell + helpers
// -----------------------------------------------------------------------------

function useEscClose(onClose: () => void) {
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
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}) {
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center px-4 py-8 sm:py-10 bg-text/30 backdrop-blur-sm overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onMouseDown={onBackdropClick}
    >
      <div className="bg-card border border-border rounded-[18px] shadow-2xl w-full max-w-[720px] my-auto animate-[modalIn_180ms_ease-out]">
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-border">
          <div>
            <h2 className="font-playfair text-[22px] font-extrabold tracking-tight">{title}</h2>
            {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
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
        {children}
      </div>
    </div>
  )
}

function ModalFooter({
  onClose,
  pending,
  submitLabel,
}: {
  onClose: () => void
  pending: boolean
  submitLabel: string
}) {
  return (
    <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
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
        {pending ? 'Salvando…' : submitLabel}
      </button>
    </div>
  )
}

function Field({
  label,
  name,
  type = 'text',
  defaultValue = '',
  placeholder,
  required = false,
  full = false,
}: {
  label: string
  name: string
  type?: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  full?: boolean
}) {
  return (
    <div className={full ? 'col-span-1 sm:col-span-2' : ''}>
      <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors bg-bg"
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Clínica modal
// -----------------------------------------------------------------------------

function ClinicaModal({ clinica, onClose }: { clinica: Clinica; onClose: () => void }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEscClose(onClose)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updateClinicaAction(formData)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <ModalShell title="Editar perfil da clínica" subtitle="Informações exibidas no sistema e nas comunicações" onClose={onClose}>
      <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome da clínica *" name="nome" defaultValue={clinica.nome} full required />
          <Field label="Subtítulo" name="subtitulo" defaultValue={clinica.subtitulo ?? ''} placeholder="Ex: Clínica Integrativa" full />
          <Field label="CNPJ" name="cnpj" defaultValue={clinica.cnpj ?? ''} placeholder="00.000.000/0001-00" />
          <Field label="Telefone" name="telefone" defaultValue={clinica.telefone ?? ''} placeholder="(11) 99999-9999" />
          <Field label="E-mail" name="email" type="email" defaultValue={clinica.email ?? ''} placeholder="contato@clinica.com.br" full />
          <Field label="Endereço" name="endereco" defaultValue={clinica.endereco ?? ''} placeholder="Rua, número, bairro, cidade" full />
        </div>

        {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

        <ModalFooter onClose={onClose} pending={pending} submitLabel="Salvar alterações" />
      </form>
    </ModalShell>
  )
}

// -----------------------------------------------------------------------------
// Horários modal
// -----------------------------------------------------------------------------

function HorariosModal({ initial, onClose }: { initial: HorarioRow[]; onClose: () => void }) {
  const router = useRouter()
  const [rows, setRows] = useState<HorarioRow[]>(initial)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEscClose(onClose)

  function updateRow(dia: number, patch: Partial<HorarioRow>) {
    setRows((current) => current.map((r) => (r.dia_semana === dia ? { ...r, ...patch } : r)))
  }

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updateHorariosAction(formData)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <ModalShell title="Editar horário de funcionamento" subtitle="Dias e horários em que a clínica atende" onClose={onClose}>
      <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          {DAY_ORDER.map((dia) => {
            const row = rows.find((r) => r.dia_semana === dia)
            if (!row) return null
            const key = DAY_KEYS[dia]
            return (
              <div key={dia} className="flex items-center gap-4 py-2.5 px-4 rounded-[13px] bg-bg">
                <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[180px]">
                  <input
                    type="checkbox"
                    name={`${key}_aberto`}
                    checked={row.aberto}
                    onChange={(e) => updateRow(dia, { aberto: e.target.checked })}
                    className="w-4 h-4 rounded accent-green cursor-pointer"
                  />
                  <span className={`text-sm font-medium ${row.aberto ? 'text-text' : 'text-muted line-through'}`}>
                    {DAY_LABELS[dia]}
                  </span>
                </label>
                {row.aberto ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      name={`${key}_inicio`}
                      value={row.hora_inicio}
                      onChange={(e) => updateRow(dia, { hora_inicio: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                    />
                    <span className="text-xs text-muted">às</span>
                    <input
                      type="time"
                      name={`${key}_fim`}
                      value={row.hora_fim}
                      onChange={(e) => updateRow(dia, { hora_fim: e.target.value })}
                      className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted font-medium">Fechado</span>
                )}
              </div>
            )
          })}
        </div>

        {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

        <ModalFooter onClose={onClose} pending={pending} submitLabel="Salvar horários" />
      </form>
    </ModalShell>
  )
}

// -----------------------------------------------------------------------------
// WhatsApp modal
// -----------------------------------------------------------------------------

function WhatsappModal({ initial, onClose }: { initial: WhatsappInstancia; onClose: () => void }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEscClose(onClose)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await upsertWhatsappAction(formData)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <ModalShell title={initial ? 'Editar WhatsApp' : 'Configurar WhatsApp'} subtitle="Conecte seu WhatsApp ao sistema" onClose={onClose}>
      <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
        <input type="hidden" name="id" value={initial?.id ?? ''} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome *" name="nome_instancia" defaultValue={initial?.nome_instancia ?? ''} placeholder="ex: rosan-clinica" required />
          <Field label="Número (com DDD e país) *" name="numero" defaultValue={initial?.numero ?? ''} placeholder="5564999999999" required />
        </div>

        {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

        <ModalFooter onClose={onClose} pending={pending} submitLabel={initial ? 'Salvar alterações' : 'Cadastrar instância'} />
      </form>
    </ModalShell>
  )
}

// -----------------------------------------------------------------------------
// Meu Perfil modal
// -----------------------------------------------------------------------------

function MeuPerfilModal({ profissional, onClose }: { profissional: Profissional; onClose: () => void }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEscClose(onClose)

  async function handleSubmit(formData: FormData) {
    setPending(true)
    setError(null)
    const result = await updateMeuPerfilAction(formData)
    if (!result.ok) {
      setPending(false)
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  return (
    <ModalShell title="Editar meu perfil" subtitle="Suas informações como profissional" onClose={onClose}>
      <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome completo *" name="nome" defaultValue={profissional.nome} full required />
          <Field label="Especialidade" name="especialidade" defaultValue={profissional.especialidade ?? ''} placeholder="Ex: Dermatologia" />
          <Field label="Registro (CRM/CRO)" name="registro" defaultValue={profissional.registro ?? ''} placeholder="CRM 123456" />
          <Field label="Telefone" name="telefone" defaultValue={profissional.telefone ?? ''} placeholder="(11) 99999-9999" />
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">E-mail</label>
            <input
              value={profissional.email ?? ''}
              disabled
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg text-muted cursor-not-allowed"
            />
            <p className="text-[10px] text-muted mt-1">Usado para login — fale com o admin para alterar.</p>
          </div>
        </div>

        {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

        <ModalFooter onClose={onClose} pending={pending} submitLabel="Salvar alterações" />
      </form>
    </ModalShell>
  )
}
