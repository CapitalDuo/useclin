'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { isTrialAtivo, trialDiasRestantes } from '@/lib/plano'
import {
  updateClinicaAction,
  updateHorariosAction,
  criarConexaoWhatsappAction,
  verificarStatusWhatsappAction,
  updateMeuPerfilAction,
  toggleNotificacaoAction,
  type NotificacaoTipo,
} from '@/app/(dashboard)/configuracoes/actions'
import { WalletIcon, HomeIcon, UserIcon, BellIcon, ClockIcon, ChatIcon } from '@/components/icons'

export type Clinica = {
  id: string
  nome: string
  subtitulo: string | null
  cnpj: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  logo_url: string | null
  maps_url: string | null
  plano_slug: string
  plano_status: string
  plano_periodo_fim: string | null
  plano_cancelando: boolean
  trial_ends_at: string | null
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
  intervalo_inicio: string | null
  intervalo_fim: string | null
}

export type WhatsappInstancia = {
  id: string
  nome_instancia: string
  numero: string
  status: string
  api_key: string | null
} | null

export type Notificacoes = Record<NotificacaoTipo, boolean>

const DAY_LABELS = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const DAY_KEYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']

const NOTIF_ITEMS: { tipo: NotificacaoTipo; label: string; descricao: string }[] = [
  { tipo: 'lembrete_consulta', label: 'Lembrete de consulta', descricao: 'Enviar lembrete 24h antes da consulta' },
  { tipo: 'confirmacao_whatsapp', label: 'Confirmação por WhatsApp', descricao: 'Solicitar confirmação via mensagem' },
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

const ICON_CLS = 'w-[18px] h-[18px] text-[#9a978f]'
const SECTION_ICONS = {
  plano: <WalletIcon className={ICON_CLS} />,
  clinica: <HomeIcon className={ICON_CLS} />,
  perfil: <UserIcon className={ICON_CLS} />,
  notificacoes: <BellIcon className={ICON_CLS} />,
  horarios: <ClockIcon className={ICON_CLS} />,
  whatsapp: <ChatIcon className={ICON_CLS} />,
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
      <SectionCard title="Plano" icon={SECTION_ICONS.plano}>
        <PlanCard plano_slug={clinica.plano_slug} plano_status={clinica.plano_status} plano_periodo_fim={clinica.plano_periodo_fim} plano_cancelando={clinica.plano_cancelando} trial_ends_at={clinica.trial_ends_at} />
      </SectionCard>

      <SectionCard title="Perfil da Clínica" icon={SECTION_ICONS.clinica} onEdit={() => openEdit('clinica')}>
        {clinica.logo_url && (
          <div className="py-3 border-b border-border">
            <img src={clinica.logo_url} alt="Logo da clínica" className="w-16 h-16 rounded-full object-cover border border-border" />
          </div>
        )}
        <Row label="Nome da clínica" hint="Nome exibido no sistema" value={clinica.nome} />
        <Row label="CNPJ" value={clinica.cnpj ?? '—'} />
        <Row label="Telefone" value={clinica.telefone ?? '—'} />
        <Row label="E-mail" value={clinica.email ?? '—'} />
        {clinica.endereco && <Row label="Endereço" value={clinica.endereco} />}
        {clinica.maps_url && (
          <Row label="Localização"
            value={<a href={clinica.maps_url} target="_blank" rel="noopener noreferrer" className="text-[#5b4bd4] hover:underline text-sm">Ver no Google Maps →</a>} />
        )}
      </SectionCard>

      <SectionCard title="Meu Perfil" icon={SECTION_ICONS.perfil} onEdit={() => openEdit('meu-perfil')}>
        <Row label="Nome completo" value={profissional.nome} />
        <Row label="Especialidade" value={profissional.especialidade ?? '—'} />
        <Row label="Registro (CRM/CRO)" value={profissional.registro ?? '—'} />
        <Row label="Telefone" value={profissional.telefone ?? '—'} />
        <Row label="E-mail" value={profissional.email ?? '—'} hint="Usado para login — fale com o admin para alterar" />
      </SectionCard>

      <SectionCard title="Notificações" icon={SECTION_ICONS.notificacoes}>
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

      <SectionCard title="Horário de Funcionamento" icon={SECTION_ICONS.horarios} onEdit={() => openEdit('horarios')}>
        {DAY_ORDER.map((dia) => {
          const h = horariosByDay.get(dia)
          const label = DAY_LABELS[dia]
          let valor = 'Fechado'
          if (h?.aberto) {
            valor = `${h.hora_inicio.slice(0, 5)} – ${h.hora_fim.slice(0, 5)}`
            if (h.intervalo_inicio) {
              valor += ` · Intervalo: ${h.intervalo_inicio.slice(0, 5)} – ${(h.intervalo_fim ?? '').slice(0, 5)}`
            }
          }
          return <Row key={dia} label={label} value={valor} dim={!h?.aberto} />
        })}
      </SectionCard>

      <SectionCard title="WhatsApp" icon={SECTION_ICONS.whatsapp} onEdit={() => openEdit('whatsapp')}>
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

      {editKind === 'clinica' && <ClinicaModal clinica={clinica} onClose={closeModal} />}
      {editKind === 'horarios' && <HorariosModal initial={horarios} onClose={closeModal} />}
      {editKind === 'whatsapp' && <WhatsappModal initial={whatsapp} onClose={closeModal} />}
      {editKind === 'meu-perfil' && <MeuPerfilModal profissional={profissional} onClose={closeModal} />}
    </div>
  )
}

// -----------------------------------------------------------------------------
// Plan card
// -----------------------------------------------------------------------------

const PLAN_INFO: Record<string, { nome: string; descricao: string; cor: string; bg: string }> = {
  gratuito: { nome: 'Gratuito', descricao: 'Acesso básico à plataforma', cor: '#6f6c67', bg: '#f0efed' },
  basico:   { nome: 'Básico',   descricao: 'Agenda, Pacientes e Financeiro', cor: '#5b4bd4', bg: '#f1eefb' },
  completo: { nome: 'Completo', descricao: 'Tudo + WhatsApp e Agente de IA', cor: '#2fb98a', bg: '#eaf8f3' },
}

const PLAN_CARDS: {
  slug: 'basico' | 'completo'
  nome: string
  preco: string
  destaque?: boolean
  features: string[]
}[] = [
  {
    slug: 'basico',
    nome: 'Básico',
    preco: '247',
    features: ['Dashboard', 'Agenda', 'Pacientes', 'Suporte direto da plataforma'],
  },
  {
    slug: 'completo',
    nome: 'Completo',
    preco: '349',
    destaque: true,
    features: ['Tudo do Básico', 'Atendimento com cliente direto da plataforma', 'Agente de IA integrado'],
  },
]

function PlanCard({ plano_slug, plano_status, plano_periodo_fim, plano_cancelando, trial_ends_at }: {
  plano_slug: string
  plano_status: string
  plano_periodo_fim: string | null
  plano_cancelando: boolean
  trial_ends_at: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const justUpgraded = searchParams.get('upgrade') === 'success'
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [changed, setChanged] = useState<string | null>(null)
  const [confirmPlano, setConfirmPlano] = useState<'basico' | 'completo' | null>(null)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const info = PLAN_INFO[plano_slug] ?? PLAN_INFO.gratuito
  const isPastDue = plano_status === 'past_due'
  const isCanceled = plano_status === 'cancelado'
  const isSubscriber = plano_slug !== 'gratuito'
  const fimFmt = plano_periodo_fim ? new Date(plano_periodo_fim).toLocaleDateString('pt-BR') : null
  const trialAtivo = plano_slug === 'gratuito' && isTrialAtivo(trial_ends_at)
  const trialDias = trialAtivo ? trialDiasRestantes(trial_ends_at) : 0
  const trialExpirou = plano_slug === 'gratuito' && !trialAtivo

  // Ao voltar do checkout, o webhook pode levar alguns segundos para gravar o
  // novo plano. Atualiza a página uma vez para refletir a mudança.
  useEffect(() => {
    if (!justUpgraded) return
    const t = setTimeout(() => router.refresh(), 3000)
    return () => clearTimeout(t)
  }, [justUpgraded, router])

  // Inicia assinatura nova (Gratuito → pago) via Stripe Checkout.
  async function startCheckout(plano: 'basico' | 'completo') {
    setLoading(plano)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else {
        setError(data.error ?? 'Não foi possível iniciar o pagamento.')
        setLoading(null)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(null)
    }
  }

  // Troca de plano de quem já assina (confirmada no modal).
  async function changePlan(plano: 'basico' | 'completo') {
    setLoading(plano)
    setError(null)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plano }),
      })
      const data = await res.json()
      if (data.updated || data.url) {
        setConfirmPlano(null)
        setChanged(PLAN_INFO[plano].nome)
        router.refresh()
      } else {
        setError(data.error ?? 'Não foi possível trocar de plano.')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  async function callBilling(endpoint: 'cancel' | 'reactivate') {
    setLoading(endpoint)
    setError(null)
    try {
      const res = await fetch(`/api/stripe/${endpoint}`, { method: 'POST' })
      const data = await res.json()
      if (data.ok) {
        setConfirmCancel(false)
        router.refresh()
      } else {
        setError(data.error ?? 'Não foi possível concluir.')
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(null)
    }
  }

  async function goToPortal() {
    setLoading('portal')
    setError(null)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else {
        setError(data.error ?? 'Não foi possível abrir o portal.')
        setLoading(null)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
      setLoading(null)
    }
  }

  function onCardCta(plano: 'basico' | 'completo') {
    if (!isSubscriber) startCheckout(plano)
    else setConfirmPlano(plano)
  }

  return (
    <div className="py-3 flex flex-col gap-4">
      {justUpgraded && plano_slug === 'gratuito' && (
        <Banner tone="green">Pagamento confirmado! Seu plano será ativado em instantes…</Banner>
      )}
      {changed && (
        <Banner tone="green">Plano alterado para {changed} com sucesso.</Banner>
      )}
      {isPastDue && (
        <Banner tone="amber">Pagamento pendente. Atualize seu método de pagamento para continuar.</Banner>
      )}
      {trialAtivo && (
        <Banner tone="amber">
          Período de teste ativo —{' '}
          {trialDias === 0
            ? 'último dia. Escolha um plano para manter o acesso completo.'
            : `${trialDias} dia${trialDias !== 1 ? 's' : ''} restante${trialDias !== 1 ? 's' : ''}. Você tem acesso a todos os recursos.`}
        </Banner>
      )}
      {trialExpirou && (
        <Banner tone="amber">Período de teste encerrado. Assine um plano para acessar o módulo de Atendimento.</Banner>
      )}
      {plano_cancelando && fimFmt && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 rounded-[13px] bg-[#fff8f0] border border-[#f5a623]/30 text-sm text-[#b87a00]">
          <span>Assinatura cancelada — você mantém acesso até {fimFmt}.</span>
          <button onClick={() => callBilling('reactivate')} disabled={loading !== null}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-md bg-[#5b4bd4] text-white hover:bg-[#4a3cb8] transition-colors cursor-pointer disabled:opacity-50">
            {loading === 'reactivate' ? 'Reativando…' : 'Reativar plano'}
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 px-4 py-4 rounded-[13px] border border-border bg-bg">
        <div className="w-10 h-10 rounded-[11px] flex items-center justify-center flex-shrink-0" style={{ background: info.bg }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={info.cor} strokeWidth="1.8" className="w-5 h-5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold text-text">Plano {info.nome}</div>
          <div className="text-xs text-muted mt-0.5">{info.descricao}</div>
          {fimFmt && !isCanceled && (
            <div className="text-xs text-muted mt-0.5">
              {plano_cancelando ? `Acesso até ${fimFmt}` : `Renova em ${fimFmt}`}
            </div>
          )}
        </div>
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide flex-shrink-0"
          style={plano_cancelando
            ? { background: '#fff1dd', color: '#b87a00' }
            : trialAtivo
              ? { background: '#fff8f0', color: '#b87a00' }
              : { background: info.bg, color: info.cor }}>
          {isCanceled ? 'CANCELADO' : isPastDue ? 'INADIMPLENTE' : plano_cancelando ? 'CANCELANDO' : trialAtivo ? 'TESTE' : 'ATIVO'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLAN_CARDS.map((p) => {
          const isCurrent = plano_slug === p.slug
          let ctaLabel: string
          if (isCurrent) ctaLabel = 'Plano atual'
          else if (plano_slug === 'completo' && p.slug === 'basico') ctaLabel = 'Mudar para Básico'
          else if (plano_slug === 'basico' && p.slug === 'completo') ctaLabel = 'Fazer upgrade'
          else ctaLabel = `Assinar ${p.nome}`
          const disabled = isCurrent || plano_cancelando || loading !== null

          return (
            <div
              key={p.slug}
              className={`relative flex flex-col rounded-[14px] border p-5 ${
                p.destaque ? 'border-[#5b4bd4] bg-[#faf9ff]' : 'border-border bg-bg'
              }`}
            >
              {p.destaque && (
                <span className="absolute -top-2.5 left-5 px-2.5 py-0.5 rounded-full bg-[#5b4bd4] text-white text-[10px] font-bold tracking-wide">
                  RECOMENDADO
                </span>
              )}
              <div className="text-[15px] font-bold text-text">{p.nome}</div>
              <div className="mt-1 mb-3">
                <span className="text-[24px] font-extrabold text-text">R$ {p.preco}</span>
                <span className="text-xs text-muted">/mês</span>
              </div>
              <ul className="flex flex-col gap-2 mb-4 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-muted">
                    <svg viewBox="0 0 24 24" fill="none" stroke={p.destaque ? '#5b4bd4' : '#2fb98a'} strokeWidth="2.5" className="w-4 h-4 flex-shrink-0 mt-0.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => onCardCta(p.slug)}
                disabled={disabled}
                className={`w-full px-4 py-2.5 rounded-[11px] text-sm font-semibold transition-colors disabled:cursor-default ${
                  isCurrent
                    ? 'bg-bg border border-border text-muted'
                    : p.destaque
                      ? 'bg-[#5b4bd4] text-white hover:bg-[#4a3cb8] cursor-pointer disabled:opacity-50'
                      : 'border border-[#5b4bd4] text-[#5b4bd4] hover:bg-[#f1eefb] cursor-pointer disabled:opacity-50'
                }`}
              >
                {loading === p.slug ? 'Aguarde…' : ctaLabel}
              </button>
            </div>
          )
        })}
      </div>

      {isSubscriber && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={goToPortal} disabled={loading !== null}
            className="flex-1 px-5 py-3 rounded-[13px] border border-border text-sm font-semibold text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer disabled:opacity-50">
            {loading === 'portal' ? 'Abrindo…' : 'Gerenciar pagamento'}
          </button>
          {!plano_cancelando && (
            <button
              onClick={() => { setError(null); setConfirmPlano(null); setConfirmCancel(true) }}
              disabled={loading !== null}
              className="flex-1 px-5 py-3 rounded-[13px] border border-border text-sm font-semibold text-[#d24343] hover:bg-[#fdeaea] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar plano
            </button>
          )}
        </div>
      )}
      {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}

      {confirmPlano && (
        <ConfirmDialog
          title={`Mudar para o plano ${PLAN_INFO[confirmPlano].nome}?`}
          body={`A diferença de valor é ajustada proporcionalmente (proração) no seu próximo ciclo. A mudança vale a partir de agora.`}
          confirmLabel={loading ? 'Aplicando…' : 'Confirmar mudança'}
          confirmTone="purple"
          pending={loading !== null}
          onConfirm={() => changePlan(confirmPlano)}
          onClose={() => setConfirmPlano(null)}
        />
      )}
      {confirmCancel && (
        <ConfirmDialog
          title="Cancelar sua assinatura?"
          body={fimFmt
            ? `Você mantém acesso ao plano ${info.nome} até ${fimFmt}. Depois disso, sua conta volta para o plano Gratuito. Você pode reativar antes dessa data.`
            : `Sua assinatura será cancelada no fim do período atual.`}
          confirmLabel={loading === 'cancel' ? 'Cancelando…' : 'Sim, cancelar'}
          confirmTone="red"
          pending={loading !== null}
          onConfirm={() => callBilling('cancel')}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </div>
  )
}

function Banner({ tone, children }: { tone: 'green' | 'amber'; children: React.ReactNode }) {
  const styles = tone === 'green'
    ? 'bg-[#eaf8f3] border-[#2fb98a]/30 text-[#1c8b66]'
    : 'bg-[#fff8f0] border-[#f5a623]/30 text-[#b87a00]'
  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-[13px] border text-sm ${styles}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0">
        {tone === 'green'
          ? <><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>
          : <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>}
      </svg>
      {children}
    </div>
  )
}

function ConfirmDialog({
  title, body, confirmLabel, confirmTone, pending, onConfirm, onClose,
}: {
  title: string
  body: string
  confirmLabel: string
  confirmTone: 'purple' | 'red'
  pending: boolean
  onConfirm: () => void
  onClose: () => void
}) {
  useEscClose(onClose)
  const confirmCls = confirmTone === 'red'
    ? 'bg-[#d24343] text-white hover:bg-[#b83838]'
    : 'bg-[#5b4bd4] text-white hover:bg-[#4a3cb8]'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-text/30 backdrop-blur-sm"
      role="dialog" aria-modal="true"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-card border border-border rounded-[18px] shadow-2xl w-full max-w-[440px] p-7 animate-[modalIn_180ms_ease-out]">
        <h3 className="font-playfair text-[20px] font-extrabold tracking-tight mb-2">{title}</h3>
        <p className="text-sm text-muted leading-relaxed mb-6">{body}</p>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} disabled={pending}
            className="px-5 py-2.5 rounded-[13px] border border-border text-sm font-semibold hover:bg-bg transition-colors cursor-pointer disabled:opacity-50">
            Voltar
          </button>
          <button type="button" onClick={onConfirm} disabled={pending}
            className={`px-6 py-2.5 rounded-[13px] text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50 ${confirmCls}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string
  icon?: React.ReactNode
  onEdit?: () => void
  children: React.ReactNode
}) {
  return (
    <section className="bg-card border border-border rounded-[14px] overflow-hidden">
      <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-border">
        <h2 className="font-playfair text-[20px] font-extrabold tracking-tight flex items-center gap-2.5">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {title}
        </h2>
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
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)

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

  const logoSrc = logoPreview ?? clinica.logo_url
  const logoInitials = clinica.nome.slice(0, 2).toUpperCase()

  return (
    <ModalShell title="Editar perfil da clínica" subtitle="Informações exibidas no sistema e nas comunicações" onClose={onClose}>
      <form action={handleSubmit} encType="multipart/form-data" className="px-7 py-6 flex flex-col gap-5">
        {/* Logo upload */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border overflow-hidden flex items-center justify-center bg-bg flex-shrink-0">
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-muted">{logoInitials}</span>
            )}
          </div>
          <div>
            <label className="cursor-pointer text-sm font-semibold text-[#5b4bd4] hover:underline">
              {logoSrc ? 'Trocar logo' : 'Enviar logo'}
              <input
                type="file"
                name="logo"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setLogoError(null)
                  if (f.size > 2 * 1024 * 1024) {
                    setLogoError('Imagem muito grande. Use uma foto de até 2 MB.')
                    e.target.value = ''
                    return
                  }
                  setLogoPreview(URL.createObjectURL(f))
                }}
              />
            </label>
            <p className="text-xs text-muted mt-0.5">PNG, JPG ou WebP · máx. 2 MB</p>
            {logoError && (
              <p className="text-xs text-red font-medium mt-1">{logoError}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nome da clínica *" name="nome" defaultValue={clinica.nome} full required />
          <Field label="Subtítulo" name="subtitulo" defaultValue={clinica.subtitulo ?? ''} placeholder="Ex: Clínica Integrativa" full />
          <Field label="CNPJ" name="cnpj" defaultValue={clinica.cnpj ?? ''} placeholder="00.000.000/0001-00" />
          <Field label="Telefone" name="telefone" defaultValue={clinica.telefone ?? ''} placeholder="(11) 99999-9999" />
          <Field label="E-mail" name="email" type="email" defaultValue={clinica.email ?? ''} placeholder="contato@clinica.com.br" full />
          <Field label="Endereço" name="endereco" defaultValue={clinica.endereco ?? ''} placeholder="Rua, número, bairro, cidade" full />
          <Field label="Link do Google Maps" name="maps_url" defaultValue={clinica.maps_url ?? ''} placeholder="https://maps.google.com/..." full />
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
              <div key={dia} className="flex flex-col py-2.5 px-4 rounded-[13px] bg-bg">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[160px]">
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
                    <span className="text-xs text-muted font-medium ml-auto">Fechado</span>
                  )}
                </div>

                {row.aberto && (
                  <div className="flex items-center gap-2 mt-1.5 pl-7 flex-wrap">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name={`${key}_int_ativo`}
                        checked={!!row.intervalo_inicio}
                        onChange={(e) =>
                          updateRow(dia, e.target.checked
                            ? { intervalo_inicio: '12:00', intervalo_fim: '13:00' }
                            : { intervalo_inicio: null, intervalo_fim: null }
                          )
                        }
                        className="w-3.5 h-3.5 rounded accent-[#5b4bd4] cursor-pointer"
                      />
                      <span className="text-xs text-muted">Intervalo (almoço)</span>
                    </label>
                    {row.intervalo_inicio && (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="time"
                          name={`${key}_int_inicio`}
                          value={row.intervalo_inicio}
                          onChange={(e) => updateRow(dia, { intervalo_inicio: e.target.value || null })}
                          className="px-2 py-1 rounded-md border border-border text-xs bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                        />
                        <span className="text-xs text-muted">às</span>
                        <input
                          type="time"
                          name={`${key}_int_fim`}
                          value={row.intervalo_fim ?? ''}
                          onChange={(e) => updateRow(dia, { intervalo_fim: e.target.value || null })}
                          className="px-2 py-1 rounded-md border border-border text-xs bg-card outline-none focus:border-[#5b4bd4] transition-colors"
                        />
                      </div>
                    )}
                  </div>
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

type WhatsappStep = 'form' | 'loading' | 'qr' | 'connected'

function WhatsappModal({ initial, onClose }: { initial: WhatsappInstancia; onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<WhatsappStep>('form')
  const [error, setError] = useState<string | null>(null)
  const [qrcode, setQrcode] = useState<string | null>(null)
  const [instToken, setInstToken] = useState<string | null>(null)

  useEscClose(onClose)

  useEffect(() => {
    if (step !== 'qr' || !instToken) return
    const id = setInterval(async () => {
      const res = await verificarStatusWhatsappAction(instToken)
      if (res.connected) {
        clearInterval(id)
        setStep('connected')
        router.refresh()
        setTimeout(onClose, 2200)
      }
    }, 4000)
    return () => clearInterval(id)
  }, [step, instToken, router, onClose])

  async function handleSubmit(formData: FormData) {
    setStep('loading')
    setError(null)
    const result = await criarConexaoWhatsappAction(formData)
    if (!result.ok) {
      setStep('form')
      setError(result.error)
      return
    }
    setQrcode(result.qrcode)
    setInstToken(result.token)
    setStep('qr')
  }

  const title =
    step === 'connected' ? 'WhatsApp conectado!'
    : step === 'qr' ? 'Escaneie o QR Code'
    : initial ? 'Reconectar WhatsApp'
    : 'Configurar WhatsApp'

  const subtitle =
    step === 'qr'
      ? 'Abra o WhatsApp → Dispositivos conectados → Conectar dispositivo'
      : 'Cria a instância na UAZAPI e salva automaticamente'

  return (
    <ModalShell title={title} subtitle={subtitle} onClose={onClose}>

      {/* ── Form / Loading ── */}
      {(step === 'form' || step === 'loading') && (
        <form action={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nome da instância *"
              name="nome_instancia"
              defaultValue={initial?.nome_instancia ?? ''}
              placeholder="ex: useclin-clinica"
              required
            />
            <Field
              label="Número (DDD + país) *"
              name="numero"
              defaultValue={initial?.numero ?? ''}
              placeholder="5564999999999"
              required
            />
          </div>

          {error && (
            <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>
          )}

          <ModalFooter
            onClose={onClose}
            pending={step === 'loading'}
            submitLabel={
              step === 'loading' ? 'Criando instância…' : initial ? 'Reconectar' : 'Criar e conectar'
            }
          />
        </form>
      )}

      {/* ── QR Code ── */}
      {step === 'qr' && (
        <div className="px-7 py-8 flex flex-col items-center gap-5">
          {qrcode ? (
            <img
              src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
              alt="QR Code WhatsApp"
              className="w-52 h-52 rounded-[14px] border border-border"
            />
          ) : (
            <div className="w-52 h-52 rounded-[14px] bg-bg border border-border flex items-center justify-center text-xs text-muted">
              QR não disponível
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            Aguardando scan…
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted hover:text-text underline transition-colors cursor-pointer"
          >
            Fechar (instância salva, mas ainda não conectada)
          </button>
        </div>
      )}

      {/* ── Connected ── */}
      {step === 'connected' && (
        <div className="px-7 py-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#f0fdf4] flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="#2fb98a" strokeWidth="2.5" className="w-8 h-8">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-text">WhatsApp conectado com sucesso!</p>
          <p className="text-xs text-muted">Fechando automaticamente…</p>
        </div>
      )}

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
