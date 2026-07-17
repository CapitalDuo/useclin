'use client'

import { useEffect, useRef, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { SearchIcon, CalendarIcon, ChatIcon, SendIcon, PaperclipIcon, SmileIcon, ChevronLeftIcon } from '@/components/icons'
import { Avatar } from '@/components/avatar'
import { corParaNome } from '@/lib/avatar'
import {
  criarConexaoWhatsappAction,
  verificarStatusWhatsappAction,
  buscarChatsAction,
  buscarMensagensAction,
  enviarMensagemAction,
  desconectarWhatsappAction,
  marcarChatLidoAction,
  type WaChat,
  type WaMessage,
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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function ChatAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'lg' }) {
  // Iniciais do chat = 1ª letra das duas primeiras palavras (convenção própria
  // do WhatsApp, diferente de iniciais() de pacientes).
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'
  return <Avatar initials={initials} cor={corParaNome(name)} size={size === 'lg' ? 'xl' : 'md'} />
}

function formatTs(ts: number | null | undefined): string {
  if (!ts) return ''
  const d = new Date(ts * 1000)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatPhone(jid: string): string {
  const num = jid.split('@')[0]
  if (num.startsWith('55') && num.length >= 12) {
    const ddd = num.slice(2, 4)
    const rest = num.slice(4)
    return rest.length === 9
      ? `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`
      : `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  }
  return num
}

function msgText(msg: WaMessage): string {
  if (msg.text) return msg.text
  if (msg.caption) return msg.caption
  if (msg.imageUrl) return '📷 Imagem'
  if (msg.videoUrl) return '🎥 Vídeo'
  if (msg.audioUrl) return '🎙️ Áudio'
  if (msg.fileUrl) return `📎 ${msg.fileName ?? 'Arquivo'}`
  return '[mídia]'
}

// ── Connection form ──────────────────────────────────────────────────────────

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
    if (!result.ok) { setError(result.error); return }
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
            <input name="nome_instancia" type="text" placeholder="ex: useclin-clinica" required
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors" />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block">Número (com DDD e país)</label>
            <input name="numero" type="text" placeholder="5564999999999" required
              className="w-full px-4 py-3 rounded-[13px] border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors" />
          </div>
          {error && <div className="text-xs text-red bg-red-light rounded-lg px-3 py-2 font-medium">{error}</div>}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-[13px] bg-green text-white text-sm font-semibold hover:bg-green/90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-1">
            {loading ? 'Criando instância…' : 'Conectar'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── QR code view ─────────────────────────────────────────────────────────────

function QrCodeView({
  instanceName, qrcode, token, onBack, onConnected,
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
      if (res.connected) { clearInterval(id); onConnected() }
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
            <img src={qrcode.startsWith('data:') ? qrcode : `data:image/png;base64,${qrcode}`}
              alt="QR Code WhatsApp" className="w-full h-full object-contain" />
          ) : (
            <p className="text-xs text-muted text-center">Gerando QR code...</p>
          )}
        </div>
        <p className="text-sm text-muted text-center mt-5">Escaneie o QR Code com o WhatsApp para conectar</p>
        <p className="text-[11px] text-muted/60 text-center mt-1">
          Instância: <span className="font-semibold text-muted">{instanceName}</span>
        </p>
        <div className="flex items-center justify-center mt-5">
          <button onClick={onBack} className="text-sm text-muted font-medium hover:text-text transition-colors cursor-pointer">Voltar</button>
        </div>
      </div>
    </div>
  )
}

// ── Main view ────────────────────────────────────────────────────────────────

export function PacientesView({ whatsapp }: { whatsapp?: WhatsappInfo }) {
  const router = useRouter()

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  ), [])

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

  // Chat state
  const [search, setSearch] = useState('')
  const [chats, setChats] = useState<WaChat[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<WaMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  // Refs para evitar closures stale e auto-scroll
  const selectedChatIdRef = useRef<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  useEffect(() => { selectedChatIdRef.current = selectedChatId }, [selectedChatId])

  // Fetch chats when connected
  useEffect(() => {
    if (connectionStatus !== 'connected' || !instToken) return
    setLoadingChats(true)
    buscarChatsAction(instToken).then(({ chats }) => {
      setChats(chats)
      setLoadingChats(false)
    })
  }, [connectionStatus, instToken])

  // Polling de chats a cada 30s (fallback para quando Realtime não alcança lista)
  useEffect(() => {
    if (connectionStatus !== 'connected' || !instToken) return
    const id = setInterval(() => {
      buscarChatsAction(instToken).then(({ chats }) => setChats(chats))
    }, 30_000)
    return () => clearInterval(id)
  }, [connectionStatus, instToken])

  // Supabase Realtime: nova mensagem via n8n → atualiza lista e chat aberto
  useEffect(() => {
    if (connectionStatus !== 'connected' || !instanceName) return

    const canal = supabase
      .channel(`wa-msgs-${instanceName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'whatsapp_mensagens',
          filter: `instance_name=eq.${instanceName}`,
        },
        (payload) => {
          const nova = payload.new as {
            id: string
            message_id: string | null
            instance_name: string
            remote_jid: string
            from_me: boolean
            push_name: string | null
            message_type: string | null
            text: string | null
            file_url: string | null
            message_timestamp: number | null
          }

          // Atualiza lista de chats: move para o topo
          setChats((prev) => {
            const existente = prev.find((c) => c.id === nova.remote_jid)
            const atualizado = {
              id: nova.remote_jid,
              name: existente?.name || nova.push_name || nova.remote_jid,
              profilePicUrl: existente?.profilePicUrl ?? null,
              lastMessageText: nova.text ?? '[mídia]',
              lastMessageTimestamp: nova.message_timestamp,
              fromMe: nova.from_me,
              unread: nova.from_me ? (existente?.unread ?? 0) : (existente?.unread ?? 0) + 1,
            }
            return [atualizado, ...prev.filter((c) => c.id !== nova.remote_jid)]
          })

          // Se o chat aberto é esse, adiciona a mensagem
          if (selectedChatIdRef.current === nova.remote_jid) {
            setMessages((prev) => {
              const dedupeId = nova.message_id ?? nova.id
              if (prev.some((m) => (m.id ?? '') === dedupeId)) return prev
              return [
                ...prev,
                {
                  id: dedupeId,
                  fromMe: nova.from_me,
                  remoteJid: nova.remote_jid,
                  pushName: nova.push_name ?? '',
                  messageType: nova.message_type ?? 'textMessage',
                  messageTimestamp: nova.message_timestamp,
                  status: null,
                  text: nova.text,
                  fileUrl: nova.file_url ?? undefined,
                },
              ]
            })
          }
        },
      )
      .subscribe()

    return () => { supabase.removeChannel(canal) }
  }, [connectionStatus, instanceName, supabase])

  // Auto-scroll ao final quando chegam novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Fetch messages when chat selected
  useEffect(() => {
    if (!selectedChatId || !instToken) return
    setLoadingMessages(true)
    buscarMensagensAction(instToken, selectedChatId).then(({ messages }) => {
      setMessages(messages)
      setLoadingMessages(false)
    })
  }, [selectedChatId, instToken])

  // Ao abrir um chat: zera o badge local na hora e marca lido na UAZAPI (senão
  // o polling de 30s traz o contador de volta).
  useEffect(() => {
    if (!selectedChatId || !instToken) return
    setChats((prev) => prev.map((c) => (c.id === selectedChatId ? { ...c, unread: 0 } : c)))
    marcarChatLidoAction(instToken, selectedChatId)
  }, [selectedChatId, instToken])

  function handleConnecting(name: string, qr: string, token: string) {
    setInstanceName(name); setQrcode(qr); setInstToken(token); setConnectionStatus('scanning')
  }

  function handleConnected() {
    setConnectionStatus('connected'); router.refresh()
  }

  function handleDisconnect() {
    setConnectionStatus('disconnected')
    setInstanceName(''); setQrcode(null); setInstToken(null)
    setChats([]); setSelectedChatId(null); setMessages([])
  }

  // Desconecta de verdade: logout na UAZAPI (via n8n) + status no banco.
  // 2-step confirm: primeiro clique arma, segundo executa.
  async function disconnectReal() {
    if (!confirmDisconnect) {
      setConfirmDisconnect(true)
      setTimeout(() => setConfirmDisconnect(false), 4000)
      return
    }
    if (!instToken || disconnecting) return
    setDisconnecting(true)
    const res = await desconectarWhatsappAction(instToken)
    setDisconnecting(false)
    setConfirmDisconnect(false)
    if (res.ok) {
      handleDisconnect()
      router.refresh()
    }
  }

  async function refreshAll() {
    if (!instToken || loadingChats) return
    setLoadingChats(true)
    const { chats: updated } = await buscarChatsAction(instToken)
    setChats(updated)
    setLoadingChats(false)
    if (selectedChatId) {
      setLoadingMessages(true)
      const { messages: updatedMsgs } = await buscarMensagensAction(instToken, selectedChatId)
      setMessages(updatedMsgs)
      setLoadingMessages(false)
    }
  }

  async function sendMessage() {
    if (!input.trim() || !selectedChatId || !instToken || sending) return
    const text = input.trim()
    setInput('')
    setSending(true)
    await enviarMensagemAction(instToken, selectedChatId, text)
    const { messages: updated } = await buscarMensagensAction(instToken, selectedChatId)
    setMessages(updated)
    setSending(false)
  }

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.includes(search)
  )

  const selectedChat = chats.find((c) => c.id === selectedChatId) ?? null
  // No mobile/tablet só um painel aparece por vez: durante a conexão (form/QR)
  // o painel direito toma a tela; depois de conectado, alterna lista ↔ conversa.
  const showRightOnMobile = connectionStatus !== 'connected' || !!selectedChatId

  return (
    <div className="flex h-[calc(100vh-180px)] lg:h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-10 pb-10 gap-0">
      {/* ── Left panel — no mobile/tablet vira tela cheia; some quando um chat é aberto */}
      <div className={`w-full lg:w-80 flex-shrink-0 bg-card border border-border rounded-[14px] lg:rounded-l-[14px] lg:rounded-r-none flex-col overflow-hidden ${
        showRightOnMobile ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" placeholder="Buscar conversa..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-[38px] pr-3.5 py-2.5 rounded-[13px] border border-border text-[13px] bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors" />
          </div>
        </div>

        {/* Connection status */}
        <div className="px-4 py-3 border-b border-border">
          <div className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[13px] bg-bg">
            <WhatsAppIcon className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-green' : 'text-muted'}`} />
            <span className={`text-xs font-semibold flex-1 text-left ${connectionStatus === 'connected' ? 'text-green' : 'text-muted'}`}>
              {connectionStatus === 'connected' ? 'WhatsApp conectado' : connectionStatus === 'scanning' ? 'Aguardando scan...' : 'WhatsApp desconectado'}
            </span>
            {connectionStatus === 'connected' && (
              <button
                onClick={disconnectReal}
                disabled={disconnecting}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer disabled:opacity-50 ${
                  confirmDisconnect
                    ? 'border-red text-red bg-red-light'
                    : 'border-border text-muted hover:text-red hover:border-red'
                }`}
              >
                {disconnecting ? 'Saindo…' : confirmDisconnect ? 'Confirmar?' : 'Desconectar'}
              </button>
            )}
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${connectionStatus === 'connected' ? 'bg-green' : connectionStatus === 'scanning' ? 'bg-orange animate-pulse' : 'bg-border'}`} />
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {connectionStatus !== 'connected' ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <WhatsAppIcon className="w-8 h-8 text-border mb-3" />
              <p className="text-xs text-muted leading-relaxed">Conecte seu WhatsApp para visualizar as conversas com seus pacientes.</p>
            </div>
          ) : loadingChats ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-xs text-muted">Carregando conversas...</p>
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="flex items-center justify-center h-32 px-6 text-center">
              <p className="text-xs text-muted">Nenhuma conversa encontrada.</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div key={chat.id} onClick={() => setSelectedChatId(chat.id)}
                className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer border-l-[3px] transition-all ${
                  selectedChatId === chat.id ? 'bg-bg border-l-text' : 'border-l-transparent hover:bg-bg'
                }`}>
                <ChatAvatar name={chat.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{chat.name}</div>
                    <div className="text-[10px] text-muted flex-shrink-0">{formatTs(chat.lastMessageTimestamp)}</div>
                  </div>
                  <div className="text-xs text-muted truncate mt-0.5">
                    {chat.fromMe && <span className="mr-1">✓</span>}
                    {chat.lastMessageText}
                  </div>
                </div>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 rounded-full bg-green text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {connectionStatus === 'connected' && (
          <div className="px-4 py-3 border-t border-border">
            <button
              onClick={refreshAll}
              disabled={loadingChats}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[13px] text-xs font-semibold text-muted hover:text-text hover:bg-bg border border-border transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                <path d="M8 16H3v5" />
              </svg>
              {loadingChats ? 'Atualizando...' : 'Atualizar conversas'}
            </button>
          </div>
        )}
      </div>

      {/* ── Right panel — no mobile/tablet só aparece durante a conexão ou com um chat selecionado */}
      <div className={`flex-1 bg-card border border-border lg:border-l-0 rounded-[14px] lg:rounded-r-[14px] lg:rounded-l-none flex-col overflow-hidden ${
        showRightOnMobile ? 'flex' : 'hidden lg:flex'
      }`}>
        {connectionStatus === 'disconnected' ? (
          <EvolutionConnectForm onConnecting={handleConnecting} />
        ) : connectionStatus === 'scanning' ? (
          <QrCodeView instanceName={instanceName} qrcode={qrcode} token={instToken}
            onBack={() => setConnectionStatus('disconnected')} onConnected={handleConnected} />
        ) : !selectedChat ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-10">
            <ChatIcon className="w-10 h-10 text-border mb-4" />
            <p className="text-sm font-semibold text-muted">Selecione uma conversa</p>
            <p className="text-xs text-muted/70 mt-1">Clique em um contato à esquerda para visualizar as mensagens.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-7 py-4 sm:py-5 border-b border-border flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedChatId(null)}
                aria-label="Voltar para conversas"
                className="lg:hidden w-8 h-8 -mr-1 rounded-full flex items-center justify-center text-muted hover:text-text hover:bg-bg transition-colors cursor-pointer flex-shrink-0"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <ChatAvatar name={selectedChat.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-playfair text-[20px] font-extrabold tracking-tight truncate">{selectedChat.name}</div>
                <div className="text-[12px] text-muted mt-0.5">{formatPhone(selectedChat.id)}</div>
              </div>
              <div className="flex gap-2.5">
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-[13px] border border-border bg-card text-[13px] font-semibold hover:bg-bg hover:border-text transition-all cursor-pointer">
                  <CalendarIcon className="w-4 h-4" />Agendar
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-7 py-5 flex flex-col gap-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted">Carregando mensagens...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-xs text-muted">Nenhuma mensagem encontrada.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={msg.id ?? i}
                      className={`flex gap-3 max-w-[75%] ${msg.fromMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      {!msg.fromMe && <ChatAvatar name={msg.pushName || selectedChat.name} />}
                      <div className={`px-4 py-3 rounded-[14px] text-[13px] leading-relaxed ${
                        msg.fromMe ? 'bg-[#f0f7f0] rounded-br-[4px]' : 'bg-bg rounded-bl-[4px]'
                      }`}>
                        {!msg.fromMe && (
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-bold">{msg.pushName || selectedChat.name}</span>
                            <span className="text-[11px] text-muted">{formatTs(msg.messageTimestamp)}</span>
                          </div>
                        )}
                        {msg.fromMe && (
                          <div className="text-[11px] text-muted mb-1.5 text-right">{formatTs(msg.messageTimestamp)}</div>
                        )}
                        <span>{msgText(msg)}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="px-4 sm:px-7 py-4 border-t border-border flex items-center gap-2.5">
              <input type="text" placeholder="Escreva sua mensagem..." value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                className="flex-1 px-[18px] py-3 rounded-xl border border-border text-sm bg-bg outline-none focus:border-[#5b4bd4] focus:bg-card transition-colors" />
              <button className="w-10 h-10 rounded-[13px] flex items-center justify-center text-muted hover:bg-bg hover:text-text transition-all cursor-pointer">
                <PaperclipIcon className="w-5 h-5" />
              </button>
              <button className="w-10 h-10 rounded-[13px] flex items-center justify-center text-muted hover:bg-bg hover:text-text transition-all cursor-pointer">
                <SmileIcon className="w-5 h-5" />
              </button>
              <button onClick={sendMessage} disabled={!input.trim() || sending}
                className="w-10 h-10 rounded-[13px] bg-text flex items-center justify-center text-white hover:bg-[#333] transition-all cursor-pointer hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
                <SendIcon className="w-[18px] h-[18px]" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
