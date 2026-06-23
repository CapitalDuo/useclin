'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SearchIcon, CalendarIcon, ChatIcon, SendIcon, PaperclipIcon, SmileIcon } from '@/components/icons'
import {
  criarConexaoWhatsappAction,
  verificarStatusWhatsappAction,
} from '@/app/(dashboard)/configuracoes/actions'

export type WhatsappInfo = {
  id: string
  nome_instancia: string
  numero: string
  status: string
  qrcode_base64: string | null
  api_key: string | null
} | null

type ConnectionStatus = 'disconnected' | 'scanning' | 'connected'

interface Patient {
  initials: string
  name: string
  color: string
  lastVisit: string
  age: string
  visits: string
  since: string
  tel: string
  nasc: string
  gasto: string
  prox: string
  obs: string
}

const patients: Patient[] = [
  { initials: 'MC', name: 'Mariana Costa', color: 'bg-[#b8a88a]', lastVisit: 'Último: 18/05 · Limpeza', age: '32 anos', visits: '12 atendimentos', since: 'Cliente desde Mar/2024', tel: '(11) 98234-5678', nasc: '15/03/1994', gasto: 'R$ 2.340', prox: '24/05/2026 · 09:00', obs: 'Alergia a níquel. Pele sensível. Prefere horários matutinos.' },
  { initials: 'FL', name: 'Fernanda Lima', color: 'bg-[#8ab89b]', lastVisit: 'Último: 18/05 · Harmonização', age: '28 anos', visits: '8 atendimentos', since: 'Cliente desde Jun/2024', tel: '(11) 97654-3210', nasc: '22/07/1997', gasto: 'R$ 1.890', prox: '26/05/2026 · 14:00', obs: 'Procedimentos de harmonização facial em andamento. Sem alergias conhecidas.' },
  { initials: 'JR', name: 'Juliana Rocha', color: 'bg-[#a88ab8]', lastVisit: 'Último: 15/05 · Massagem', age: '35 anos', visits: '5 atendimentos', since: 'Cliente desde Jan/2025', tel: '(11) 96543-8765', nasc: '10/11/1990', gasto: 'R$ 980', prox: '28/05/2026 · 10:00', obs: 'Prefere massagens relaxantes. Tensão muscular crônica na região cervical.' },
  { initials: 'AO', name: 'Ana Oliveira', color: 'bg-[#b88a8a]', lastVisit: 'Último: 10/05 · Nutricional', age: '41 anos', visits: '15 atendimentos', since: 'Cliente desde Set/2023', tel: '(11) 95432-1098', nasc: '03/05/1985', gasto: 'R$ 4.120', prox: '30/05/2026 · 11:00', obs: 'Acompanhamento nutricional. Intolerância a lactose. Dieta vegetariana.' },
  { initials: 'BT', name: 'Bianca Torres', color: 'bg-[#8ab8b8]', lastVisit: 'Último: 18/05 · Peeling', age: '26 anos', visits: '3 atendimentos', since: 'Cliente desde Abr/2026', tel: '(11) 94321-6789', nasc: '18/09/1999', gasto: 'R$ 650', prox: '01/06/2026 · 09:00', obs: 'Tratamento de peeling para manchas solares. Pele oleosa.' },
  { initials: 'RM', name: 'Roberta Mendes', color: 'bg-[#b8b88a]', lastVisit: 'Último: 16/05 · Drenagem', age: '38 anos', visits: '9 atendimentos', since: 'Cliente desde Nov/2024', tel: '(11) 93210-5432', nasc: '25/01/1988', gasto: 'R$ 2.100', prox: '27/05/2026 · 16:00', obs: 'Drenagem linfática semanal. Retenção hídrica. Prefere horários à tarde.' },
]

interface Message {
  sender: 'doctor' | 'patient'
  text: string
  time: string
}

const initialMessages: Message[] = [
  { sender: 'doctor', text: 'Olá Mariana! Tudo bem?\nSó lembrando do seu agendamento de limpeza facial amanhã às 09:00.', time: '20/05/2026 · 10:32' },
  { sender: 'patient', text: 'Oi! Tudo bem sim, obrigada por lembrar 😊\nConfirmo minha presença.', time: '20/05/2026 · 10:45' },
  { sender: 'doctor', text: 'Perfeito! Qualquer dúvida, estou à disposição.', time: '20/05/2026 · 10:46' },
  { sender: 'patient', text: 'Obrigada! Até amanhã 🙌', time: '20/05/2026 · 10:47' },
]

const historyItems = [
  { title: 'Limpeza de pele', doctor: 'Dr. Rodrigo Alves', date: '18/05/2026', dot: 'bg-blue' },
  { title: 'Avaliação facial', doctor: 'Dr. Rodrigo Alves', date: '02/05/2026', dot: 'bg-green' },
  { title: 'Consulta de retorno', doctor: 'Dr. Rodrigo Alves', date: '15/04/2026', dot: 'bg-blue' },
  { title: 'Peeling químico', doctor: 'Dra. Amanda Costa', date: '20/03/2026', dot: 'bg-orange' },
  { title: 'Avaliação inicial', doctor: 'Dr. Rodrigo Alves', date: '10/03/2024', dot: 'bg-green' },
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function EvolutionConnectForm({
  onConnecting,
}: {
  onConnecting: (name: string, qrcode: string, token: string) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await criarConexaoWhatsappAction(formData)
    setLoading(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    if (result.qrcode && result.token) {
      onConnecting(String(formData.get('nome_instancia') ?? ''), result.qrcode, result.token)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[18px] p-8">
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-[14px] bg-green/10 flex items-center justify-center mb-4">
            <WhatsAppIcon className="w-7 h-7 text-green" />
          </div>
          <h2 className="font-playfair text-xl font-extrabold tracking-tight">WhatsApp</h2>
          <p className="text-sm text-muted mt-1">Conecte seu WhatsApp ao sistema</p>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold mb-2 block">Nome da instância</label>
            <input
              name="nome_instancia"
              type="text"
              placeholder="ex: useclin-clinica"
              required
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block">Número (com DDD e país)</label>
            <input
              name="numero"
              type="text"
              placeholder="5564999999999"
              required
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors"
            />
          </div>

          {error && (
            <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-[13px] bg-green text-white text-sm font-semibold hover:bg-green/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            {loading ? 'Criando instância…' : 'Conectar'}
          </button>
        </form>
      </div>
    </div>
  )
}

function QrCodeView({
  instanceName,
  qrcode,
  token,
  onBack,
  onConnected,
}: {
  instanceName: string
  qrcode: string | null
  token: string | null
  onBack: () => void
  onConnected: () => void
}) {
  useEffect(() => {
    if (!token) return
    const id = setInterval(async () => {
      const res = await verificarStatusWhatsappAction(token)
      if (res.connected) {
        clearInterval(id)
        onConnected()
      }
    }, 4000)
    return () => clearInterval(id)
  }, [token, onConnected])

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-[420px] bg-card border border-border rounded-[18px] p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-[14px] bg-green/10 flex items-center justify-center mb-4">
            <WhatsAppIcon className="w-7 h-7 text-green" />
          </div>
          <h2 className="font-playfair text-xl font-extrabold tracking-tight">WhatsApp</h2>
          <p className="text-sm text-muted mt-1">Conecte seu WhatsApp ao sistema</p>

          <div className="flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full bg-orange-light">
            <div className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span className="text-xs font-semibold text-orange">Aguardando scan...</span>
          </div>
        </div>

        <div className="bg-white rounded-[14px] p-5 mx-auto w-[280px] h-[280px] flex items-center justify-center border border-border">
          {qrcode ? (
            <img
              src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
              alt="QR Code WhatsApp"
              className="w-full h-full object-contain"
            />
          ) : (
            <p className="text-xs text-muted text-center">Gerando QR code...</p>
          )}
        </div>

        <p className="text-sm text-muted text-center mt-5">
          Escaneie o QR Code com o WhatsApp para conectar
        </p>
        <p className="text-[11px] text-muted/60 text-center mt-1">
          Instância: <span className="font-semibold text-muted">{instanceName}</span>
        </p>

        <div className="flex items-center justify-center mt-5">
          <button
            onClick={onBack}
            className="text-sm text-muted font-medium hover:text-text transition-colors cursor-pointer"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  )
}

export function PacientesView({ whatsapp }: { whatsapp?: WhatsappInfo }) {
  const router = useRouter()
  const [selected, setSelected] = useState(0)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<'conversas' | 'historico'>('conversas')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')

  const initStatus = (): ConnectionStatus => {
    if (!whatsapp) return 'disconnected'
    if (whatsapp.status === 'conectado') return 'connected'
    if (whatsapp.status === 'aguardando_scan') return 'scanning'
    return 'disconnected'
  }

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(initStatus)
  const [instanceName, setInstanceName] = useState(whatsapp?.nome_instancia ?? '')
  const [qrcode, setQrcode] = useState<string | null>(whatsapp?.qrcode_base64 ?? null)
  const [instToken, setInstToken] = useState<string | null>(whatsapp?.api_key ?? null)

  const p = patients[selected]
  const filtered = patients.filter((pt) => pt.name.toLowerCase().includes(search.toLowerCase()))

  function sendMessage() {
    if (!input.trim()) return
    const now = new Date()
    const time = now.toLocaleDateString('pt-BR') + ' · ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    setMessages([...messages, { sender: 'doctor', text: input, time }])
    setInput('')
  }

  function handleConnecting(name: string, qr: string, token: string) {
    setInstanceName(name)
    setQrcode(qr)
    setInstToken(token)
    setConnectionStatus('scanning')
  }

  function handleConnected() {
    setConnectionStatus('connected')
    router.refresh()
  }

  function handleDisconnect() {
    setConnectionStatus('disconnected')
    setInstanceName('')
    setQrcode(null)
    setInstToken(null)
  }

  return (
    <div className="flex h-[calc(100vh-120px)] px-10 pb-10 gap-0">
      {/* Patient list */}
      <div className="w-80 flex-shrink-0 bg-card border border-border rounded-l-[14px] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3.5 py-2.5 rounded-[13px] border border-border text-[13px] bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors"
            />
          </div>
        </div>

        {/* Connection status indicator */}
        <div className="px-4 py-3 border-b border-border">
          <button
            onClick={handleDisconnect}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[13px] bg-bg hover:bg-border/50 transition-colors cursor-pointer"
          >
            <WhatsAppIcon className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-green' : 'text-muted'}`} />
            <span className={`text-xs font-semibold flex-1 text-left ${connectionStatus === 'connected' ? 'text-green' : 'text-muted'}`}>
              {connectionStatus === 'connected' ? 'WhatsApp conectado' : connectionStatus === 'scanning' ? 'Aguardando scan...' : 'WhatsApp desconectado'}
            </span>
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green' : connectionStatus === 'scanning' ? 'bg-orange animate-pulse' : 'bg-border'
            }`} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {connectionStatus !== 'connected' ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <WhatsAppIcon className="w-8 h-8 text-border mb-3" />
              <p className="text-xs text-muted leading-relaxed">
                Conecte seu WhatsApp para visualizar as conversas com seus pacientes.
              </p>
            </div>
          ) : (
            filtered.map((pt, i) => {
              const realIdx = patients.indexOf(pt)
              return (
                <div
                  key={realIdx}
                  onClick={() => setSelected(realIdx)}
                  className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-l-[3px] transition-all ${
                    selected === realIdx ? 'bg-bg border-l-text' : 'border-l-transparent hover:bg-bg'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white flex-shrink-0 ${pt.color}`}>
                    {pt.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{pt.name}</div>
                    <div className="text-xs text-muted truncate">{pt.lastVisit}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel — switches between connection flow and chat */}
      <div className="flex-1 bg-card border border-border border-l-0 rounded-r-[14px] flex flex-col overflow-hidden">
        {connectionStatus === 'disconnected' ? (
          <EvolutionConnectForm onConnecting={handleConnecting} />
        ) : connectionStatus === 'scanning' ? (
          <QrCodeView
            instanceName={instanceName}
            qrcode={qrcode}
            token={instToken}
            onBack={() => setConnectionStatus('disconnected')}
            onConnected={handleConnected}
          />
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-5 px-7 py-6 border-b border-border">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0 ${p.color}`}>
                {p.initials}
              </div>
              <div className="flex-1">
                <div className="font-playfair text-[22px] font-extrabold tracking-tight">{p.name}</div>
                <div className="text-[13px] text-muted mt-0.5">{p.age} · {p.visits} · {p.since}</div>
              </div>
              <div className="flex gap-2.5">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] border border-border bg-card text-[13px] font-semibold hover:bg-bg hover:border-text transition-all cursor-pointer">
                  <CalendarIcon className="w-4 h-4" />
                  Agendar
                </button>
                <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[13px] border border-border bg-card text-[13px] font-semibold hover:bg-bg hover:border-text transition-all cursor-pointer">
                  <ChatIcon className="w-4 h-4" />
                  Contato
                </button>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-4 mx-7 mt-5 border border-border rounded-[13px]">
              {[
                { label: 'Telefone', value: p.tel },
                { label: 'Nascimento', value: p.nasc },
                { label: 'Total gasto', value: p.gasto, green: true },
                { label: 'Próximo agendamento', value: p.prox },
              ].map((info, i) => (
                <div key={i} className={`px-[18px] py-3.5 ${i < 3 ? 'border-r border-border' : ''}`}>
                  <div className="text-[11px] text-muted font-medium mb-1">{info.label}</div>
                  <div className={`text-sm font-bold ${info.green ? 'text-green' : ''}`}>{info.value}</div>
                </div>
              ))}
            </div>

            {/* Observations */}
            <div className="mx-7 mt-4 px-[18px] py-3.5 bg-bg rounded-[13px]">
              <div className="text-[11px] text-muted font-medium mb-1">Observações / Alergias</div>
              <div className="text-[13px] leading-relaxed">{p.obs}</div>
            </div>

            {/* Tabs */}
            <div className="flex mx-7 mt-5 border-b border-border">
              {(['conversas', 'historico'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-2.5 text-sm font-semibold relative cursor-pointer transition-colors ${
                    tab === t ? 'text-text' : 'text-muted hover:text-text'
                  }`}
                >
                  {t === 'conversas' ? 'Conversas' : 'Histórico de atendimentos'}
                  {tab === t && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-text rounded-t" />
                  )}
                </button>
              ))}
            </div>

            {/* Chat */}
            {tab === 'conversas' ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 max-w-[75%] ${msg.sender === 'doctor' ? 'self-start' : 'self-end flex-row-reverse'}`}>
                      {msg.sender === 'doctor' && (
                        <div className="w-9 h-9 rounded-full bg-bg flex items-center justify-center text-[11px] font-bold text-text flex-shrink-0">DR</div>
                      )}
                      <div className={`px-4 py-3 rounded-[14px] text-[13px] leading-relaxed ${
                        msg.sender === 'doctor'
                          ? 'bg-bg rounded-bl-[4px]'
                          : 'bg-[#f0f7f0] rounded-br-[4px]'
                      }`}>
                        {msg.sender === 'doctor' ? (
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold">Dr. Rodrigo Alves</span>
                            <span className="text-[11px] text-muted">{msg.time}</span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted mb-1.5 text-right">{msg.time}</div>
                        )}
                        {msg.text.split('\n').map((line, j) => (
                          <span key={j}>{line}{j < msg.text.split('\n').length - 1 && <br />}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="px-7 py-4 border-t border-border flex items-center gap-2.5">
                  <input
                    type="text"
                    placeholder="Escreva sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1 px-[18px] py-3 rounded-xl border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors"
                  />
                  <button className="w-10 h-10 rounded-[13px] flex items-center justify-center text-muted hover:bg-bg hover:text-text transition-all cursor-pointer">
                    <PaperclipIcon className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-[13px] flex items-center justify-center text-muted hover:bg-bg hover:text-text transition-all cursor-pointer">
                    <SmileIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={sendMessage}
                    className="w-10 h-10 rounded-[13px] bg-text flex items-center justify-center text-white hover:bg-[#333] transition-all cursor-pointer hover:scale-105"
                  >
                    <SendIcon className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-7 py-5">
                {historyItems.map((item, i) => (
                  <div key={i} className={`flex items-center gap-3.5 py-3.5 ${i < historyItems.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.dot}`} />
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{item.title}</div>
                      <div className="text-xs text-muted">{item.doctor}</div>
                    </div>
                    <div className="text-xs text-muted font-medium whitespace-nowrap">{item.date}</div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-green-light text-green">Concluída</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
