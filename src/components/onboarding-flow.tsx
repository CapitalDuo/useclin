'use client'

import { useState } from 'react'
import { completeOnboarding } from '@/app/onboarding/actions'

const STEPS = [
  { label: 'Clínica', icon: '🏥' },
  { label: 'Profissionais', icon: '👨‍⚕️' },
  { label: 'Horários', icon: '🕐' },
  { label: 'WhatsApp', icon: '💬' },
  { label: 'Confirmação', icon: '✅' },
]

const WEEKDAYS = [
  { key: 'seg', label: 'Segunda-feira' },
  { key: 'ter', label: 'Terça-feira' },
  { key: 'qua', label: 'Quarta-feira' },
  { key: 'qui', label: 'Quinta-feira' },
  { key: 'sex', label: 'Sexta-feira' },
  { key: 'sab', label: 'Sábado' },
  { key: 'dom', label: 'Domingo' },
]

interface ClinicData { telefone: string; cnpj: string; endereco: string }
interface MyProfile { especialidade: string; registro: string }
interface Professional { nome: string; especialidade: string; registro: string }
interface DaySchedule { aberto: boolean; inicio: string; fim: string }
interface WhatsAppData { instancia: string; numero: string }

export function OnboardingFlow({
  userName,
  clinicName,
  initialClinic,
}: {
  userName: string
  clinicName: string
  initialClinic: ClinicData
}) {
  const [step, setStep] = useState(0)
  const [clinic, setClinic] = useState<ClinicData>(initialClinic)
  const [myProfile, setMyProfile] = useState<MyProfile>({ especialidade: '', registro: '' })
  const [extras, setExtras] = useState<Professional[]>([])
  const [schedule, setSchedule] = useState<Record<string, DaySchedule>>(() => {
    const initial: Record<string, DaySchedule> = {}
    WEEKDAYS.forEach(d => {
      initial[d.key] = { aberto: d.key !== 'dom', inicio: '08:00', fim: '18:00' }
    })
    return initial
  })
  const [whatsapp, setWhatsApp] = useState<WhatsAppData>({ instancia: '', numero: '' })
  const [qrStep, setQrStep] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1)
  }

  function back() {
    if (qrStep) { setQrStep(false); return }
    if (step > 0) setStep(step - 1)
  }

  function addExtra() {
    setExtras([...extras, { nome: '', especialidade: '', registro: '' }])
  }

  function updateExtra(index: number, field: keyof Professional, value: string) {
    const updated = [...extras]
    updated[index] = { ...updated[index], [field]: value }
    setExtras(updated)
  }

  function removeExtra(index: number) {
    setExtras(extras.filter((_, i) => i !== index))
  }

  function updateSchedule(key: string, field: keyof DaySchedule, value: string | boolean) {
    setSchedule(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  function handleWhatsAppConnect() {
    if (whatsapp.instancia.trim() && whatsapp.numero.trim()) {
      setQrStep(true)
    }
  }

  async function handleFinish() {
    setSaving(true)
    setSaveError(null)
    const result = await completeOnboarding({
      clinic,
      myProfile,
      additionalProfessionals: extras,
      schedule,
      whatsapp,
    })
    if (!result.ok) {
      setSaving(false)
      setSaveError(result.error)
      return
    }
    window.location.href = '/'
  }

  return (
    <div className="w-full max-w-[640px]">
      <div className="flex items-center justify-center gap-3 mb-8">
        <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
          <circle cx="20" cy="20" r="18" stroke="#d4c5a9" strokeWidth="1.5" />
          <path d="M20 8 C16 12, 12 14, 12 20 C12 24, 14 28, 20 32 C26 28, 28 24, 28 20 C28 14, 24 12, 20 8Z" stroke="#d4c5a9" strokeWidth="1.2" fill="none" />
          <path d="M14 16 Q17 20, 20 16 Q23 20, 26 16" stroke="#d4c5a9" strokeWidth="1" fill="none" />
          <path d="M15 22 Q17.5 26, 20 22 Q22.5 26, 25 22" stroke="#d4c5a9" strokeWidth="1" fill="none" />
        </svg>
        <div>
          <span className="font-playfair text-xl font-extrabold tracking-tight">Rosan</span>
          <span className="text-[9px] font-semibold text-muted tracking-[2px] uppercase block -mt-0.5">Clínica Integrativa</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[18px] p-8 shadow-sm">
        <div className="flex gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                i < step ? 'bg-green' : i === step ? 'bg-[#d4c5a9]' : 'bg-border'
              }`}
            />
          ))}
        </div>

        <div className="text-center mb-7">
          <div className="text-2xl mb-1">{STEPS[step].icon}</div>
          <h2 className="font-playfair text-xl font-extrabold tracking-tight">
            {step === 0 && 'Dados da Clínica'}
            {step === 1 && 'Seu perfil profissional'}
            {step === 2 && 'Horários de Funcionamento'}
            {step === 3 && (qrStep ? 'Conectar WhatsApp' : 'WhatsApp Business')}
            {step === 4 && 'Tudo pronto!'}
          </h2>
          <p className="text-sm text-muted mt-1">
            {step === 0 && `Complete o cadastro de ${clinicName}`}
            {step === 1 && 'Seus dados profissionais e outros membros da equipe'}
            {step === 2 && 'Defina os dias e horários de atendimento'}
            {step === 3 && (qrStep ? 'Escaneie o QR Code com o WhatsApp' : 'Conecte o WhatsApp para atendimentos')}
            {step === 4 && 'Confira as informações e comece a usar'}
          </p>
        </div>

        <div className="min-h-[280px]">
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <div className="bg-bg rounded-[13px] px-4 py-3">
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Clínica</div>
                <div className="text-sm font-semibold">{clinicName}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefone" placeholder="(11) 99999-9999" value={clinic.telefone} onChange={v => setClinic({ ...clinic, telefone: v })} />
                <Field label="CNPJ (opcional)" placeholder="00.000.000/0001-00" value={clinic.cnpj} onChange={v => setClinic({ ...clinic, cnpj: v })} />
              </div>
              <Field label="Endereço" placeholder="Rua, número, bairro, cidade" value={clinic.endereco} onChange={v => setClinic({ ...clinic, endereco: v })} />
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="bg-bg rounded-[12px] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-[13px] bg-card flex items-center justify-center text-sm font-bold">
                    {userName.split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{userName}</div>
                    <div className="text-[11px] text-muted">Você · administrador</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Sua especialidade" placeholder="Ex: Dermatologia" value={myProfile.especialidade} onChange={v => setMyProfile({ ...myProfile, especialidade: v })} bg="bg-card" />
                  <Field label="Seu registro (CRM/CRO)" placeholder="CRM 123456" value={myProfile.registro} onChange={v => setMyProfile({ ...myProfile, registro: v })} bg="bg-card" />
                </div>
              </div>

              {extras.map((prof, i) => (
                <div key={i} className="bg-bg rounded-[12px] p-4 relative">
                  <button
                    onClick={() => removeExtra(i)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red hover:bg-red-light transition-colors cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                  <div className="flex flex-col gap-3">
                    <Field label="Nome completo" placeholder="Ex: Dr. João Silva" value={prof.nome} onChange={v => updateExtra(i, 'nome', v)} bg="bg-card" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Especialidade" placeholder="Ex: Ortopedia" value={prof.especialidade} onChange={v => updateExtra(i, 'especialidade', v)} bg="bg-card" />
                      <Field label="Registro" placeholder="CRM 789012" value={prof.registro} onChange={v => updateExtra(i, 'registro', v)} bg="bg-card" />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addExtra}
                className="w-full py-3 rounded-[13px] border-2 border-dashed border-border text-sm font-semibold text-muted hover:border-text hover:text-text transition-colors cursor-pointer"
              >
                + Adicionar outro profissional
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2.5">
              {WEEKDAYS.map(day => {
                const s = schedule[day.key]
                return (
                  <div key={day.key} className="flex items-center gap-4 py-2.5 px-4 rounded-[13px] bg-bg">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-[160px]">
                      <input
                        type="checkbox"
                        checked={s.aberto}
                        onChange={e => updateSchedule(day.key, 'aberto', e.target.checked)}
                        className="w-4 h-4 rounded accent-green cursor-pointer"
                      />
                      <span className={`text-sm font-medium ${s.aberto ? 'text-text' : 'text-muted line-through'}`}>
                        {day.label}
                      </span>
                    </label>
                    {s.aberto ? (
                      <div className="flex items-center gap-2">
                        <input type="time" value={s.inicio} onChange={e => updateSchedule(day.key, 'inicio', e.target.value)} className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors" />
                        <span className="text-xs text-muted">às</span>
                        <input type="time" value={s.fim} onChange={e => updateSchedule(day.key, 'fim', e.target.value)} className="px-3 py-1.5 rounded-lg border border-border text-sm bg-card outline-none focus:border-[#5b4bd4] transition-colors" />
                      </div>
                    ) : (
                      <span className="text-xs text-muted font-medium">Fechado</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {step === 3 && !qrStep && (
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-[14px] bg-green/10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-green">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
              </div>
              <Field label="Nome da instância" placeholder="ex: rosan-clinica" value={whatsapp.instancia} onChange={v => setWhatsApp({ ...whatsapp, instancia: v })} />
              <Field label="Número (com DDD e país)" placeholder="5564999999999" value={whatsapp.numero} onChange={v => setWhatsApp({ ...whatsapp, numero: v })} />
              <button onClick={handleWhatsAppConnect} disabled={!whatsapp.instancia.trim() || !whatsapp.numero.trim()} className="w-full py-3.5 rounded-[13px] bg-green text-white text-sm font-semibold hover:bg-green/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">Conectar</button>
              <button onClick={next} className="text-xs text-muted hover:text-text font-medium text-center cursor-pointer transition-colors">Pular esta etapa</button>
            </div>
          )}

          {step === 3 && qrStep && (
            <div className="flex flex-col items-center gap-5">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-light">
                <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                <span className="text-xs font-semibold text-orange">Aguardando scan...</span>
              </div>
              <div className="bg-white rounded-[14px] p-5 w-[220px] h-[220px] flex items-center justify-center border border-border">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect x="0" y="0" width="200" height="200" fill="white" />
                  <rect x="10" y="10" width="50" height="50" rx="4" fill="none" stroke="#15803d" strokeWidth="6" />
                  <rect x="22" y="22" width="26" height="26" rx="2" fill="#15803d" />
                  <rect x="140" y="10" width="50" height="50" rx="4" fill="none" stroke="#15803d" strokeWidth="6" />
                  <rect x="152" y="22" width="26" height="26" rx="2" fill="#15803d" />
                  <rect x="10" y="140" width="50" height="50" rx="4" fill="none" stroke="#15803d" strokeWidth="6" />
                  <rect x="22" y="152" width="26" height="26" rx="2" fill="#15803d" />
                  {Array.from({ length: 15 }, (_, row) =>
                    Array.from({ length: 15 }, (_, col) => {
                      const inCorner = (row < 5 && col < 5) || (row < 5 && col > 10) || (row > 10 && col < 5)
                      if (inCorner) return null
                      const show = (row * 7 + col * 13 + row * col) % 3 !== 0
                      if (!show) return null
                      return <rect key={`${row}-${col}`} x={12 + col * 12} y={12 + row * 12} width="8" height="8" rx="1.5" fill="#15803d" opacity={0.85} />
                    })
                  )}
                </svg>
              </div>
              <p className="text-sm text-muted text-center">Escaneie o QR Code com o WhatsApp</p>
              <p className="text-[11px] text-muted/60 text-center">Instância: <span className="font-semibold text-muted">{whatsapp.instancia}</span></p>
              <button onClick={next} className="text-sm text-green font-semibold hover:text-green/80 transition-colors cursor-pointer">Simular conexão e continuar →</button>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <SummarySection title="Clínica">
                <SummaryItem label="Nome" value={clinicName} />
                <SummaryItem label="Telefone" value={clinic.telefone || '—'} />
                {clinic.cnpj && <SummaryItem label="CNPJ" value={clinic.cnpj} />}
                <SummaryItem label="Endereço" value={clinic.endereco || '—'} />
              </SummarySection>

              <SummarySection title="Profissionais">
                <SummaryItem label={userName} value={`${myProfile.especialidade || '—'}${myProfile.registro ? ' · ' + myProfile.registro : ''}`} />
                {extras.filter(p => p.nome).map((p, i) => (
                  <SummaryItem key={i} label={p.nome} value={`${p.especialidade || '—'}${p.registro ? ' · ' + p.registro : ''}`} />
                ))}
              </SummarySection>

              <SummarySection title="Horários">
                {WEEKDAYS.map(day => {
                  const s = schedule[day.key]
                  return (
                    <SummaryItem
                      key={day.key}
                      label={day.label}
                      value={s.aberto ? `${s.inicio} – ${s.fim}` : 'Fechado'}
                      muted={!s.aberto}
                    />
                  )
                })}
              </SummarySection>

              <SummarySection title="WhatsApp">
                {whatsapp.instancia ? (
                  <>
                    <SummaryItem label="Instância" value={whatsapp.instancia} />
                    <SummaryItem label="Número" value={whatsapp.numero} />
                  </>
                ) : (
                  <p className="text-xs text-muted">Não configurado</p>
                )}
              </SummarySection>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 0 ? (
            <button onClick={back} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] border border-border bg-card text-sm font-semibold hover:bg-bg transition-colors cursor-pointer">← Voltar</button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={step === 3 ? (qrStep ? next : handleWhatsAppConnect) : next} className="inline-flex items-center gap-2 px-6 py-3 bg-text text-white rounded-[13px] text-sm font-semibold hover:bg-[#333] transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer">
              {step === 3 ? (qrStep ? 'Continuar' : 'Conectar') : 'Próximo'} →
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {saveError && <span className="text-xs text-red font-medium">Erro: {saveError}</span>}
              <button onClick={handleFinish} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-green text-white rounded-[13px] text-sm font-semibold hover:bg-green/90 transition-all hover:-translate-y-px hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? 'Salvando...' : 'Começar a usar ✓'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Field({ label, placeholder, value, onChange, bg }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; bg?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block">{label}</label>
      <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} className={`w-full px-4 py-3 rounded-[13px] border border-border text-sm outline-none focus:border-[#5b4bd4] transition-colors ${bg || 'bg-bg'}`} />
    </div>
  )
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg rounded-[12px] p-4">
      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">{title}</h4>
      <div className="flex flex-col gap-1.5">{children}</div>
    </div>
  )
}

function SummaryItem({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>
      <span className={`text-sm ${muted ? 'text-muted' : 'font-semibold'}`}>{value}</span>
    </div>
  )
}
