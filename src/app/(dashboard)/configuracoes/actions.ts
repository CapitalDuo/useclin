'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'
import { WEEKDAY_KEYS } from '@/lib/weekdays'

export async function updateClinicaAction(formData: FormData) {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const nome = String(formData.get('nome') ?? '').trim()
  const subtitulo = String(formData.get('subtitulo') ?? '').trim()
  const cnpj = String(formData.get('cnpj') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const endereco = String(formData.get('endereco') ?? '').trim()
  const maps_url = String(formData.get('maps_url') ?? '').trim()

  if (!nome) return { ok: false as const, error: 'Nome da clínica é obrigatório' }

  // Upload logo if provided
  let logo_url: string | undefined
  const logoFile = formData.get('logo') as File | null
  if (logoFile && logoFile.size > 0) {
    if (logoFile.size > 2 * 1024 * 1024) {
      return { ok: false as const, error: 'Imagem muito grande (máx. 2 MB)' }
    }
    const ext = logoFile.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${prof.clinica_id}/logo.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('logos')
      .upload(path, logoFile, { upsert: true, contentType: logoFile.type })
    if (uploadError) return { ok: false as const, error: `Erro no upload: ${uploadError.message}` }
    const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path)
    logo_url = publicUrl
  }

  const { error } = await supabase
    .from('clinica')
    .update({
      nome,
      subtitulo: subtitulo || null,
      cnpj: cnpj || null,
      telefone: telefone || null,
      email: email || null,
      endereco: endereco || null,
      maps_url: maps_url || null,
      ...(logo_url !== undefined && { logo_url }),
    })
    .eq('id', prof.clinica_id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  revalidatePath('/admin/clinicas')
  return { ok: true as const }
}

export async function updateHorariosAction(formData: FormData) {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const rows = WEEKDAY_KEYS.map((key, dia) => {
    const aberto = formData.get(`${key}_aberto`) === 'on'
    const intAtivo = formData.get(`${key}_int_ativo`) === 'on'
    return {
      clinica_id: prof.clinica_id!,
      dia_semana: dia,
      aberto,
      hora_inicio: aberto ? (formData.get(`${key}_inicio`) as string) || null : null,
      hora_fim: aberto ? (formData.get(`${key}_fim`) as string) || null : null,
      intervalo_inicio: aberto && intAtivo ? (formData.get(`${key}_int_inicio`) as string) || null : null,
      intervalo_fim: aberto && intAtivo ? (formData.get(`${key}_int_fim`) as string) || null : null,
    }
  })

  const { error } = await supabase
    .from('horarios_funcionamento')
    .upsert(rows, { onConflict: 'clinica_id,dia_semana' })

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}

export async function criarConexaoWhatsappAction(formData: FormData): Promise<
  | { ok: false; error: string }
  | { ok: true; qrcode: string | null; token: string | null; instancia_id: string | null }
> {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false, error: 'Conta sem clínica vinculada' }

  const nome_instancia = String(formData.get('nome_instancia') ?? '').trim()
  const numero = String(formData.get('numero') ?? '').trim()

  if (!nome_instancia || !numero) {
    return { ok: false, error: 'Nome e número são obrigatórios' }
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return { ok: false, error: 'N8N_WEBHOOK_URL não configurado no servidor' }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        acao: 'criar',
        instanceName: nome_instancia,
        numero,
        clinica_id: prof.clinica_id,
      }),
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { ok: false, error: `Erro UAZAPI (${res.status}): ${text.slice(0, 200)}` }
    }

    const data = await res.json()
    revalidatePath('/configuracoes')
    return {
      ok: true,
      qrcode: data.qrcode ?? null,
      token: data.token ?? null,
      instancia_id: data.instancia_id ?? null,
    }
  } catch {
    return { ok: false, error: 'Falha ao conectar com o servidor de automação' }
  }
}

export async function verificarStatusWhatsappAction(token: string): Promise<{
  connected: boolean
  state: string
}> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return { connected: false, state: 'erro' }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'status', token }),
    })
    if (!res.ok) return { connected: false, state: 'erro' }
    const data = await res.json()
    return { connected: !!data.connected, state: data.state ?? 'close' }
  } catch {
    return { connected: false, state: 'erro' }
  }
}

export type WaChat = {
  id: string
  name: string
  profilePicUrl: string | null
  lastMessageText: string
  lastMessageTimestamp: number | null
  fromMe: boolean
  unread: number
}

export type WaMessage = {
  id: string
  fromMe: boolean
  remoteJid: string
  pushName: string
  messageType: string
  messageTimestamp: number | null
  text?: string | null
  imageUrl?: string | null
  caption?: string | null
  audioUrl?: string | null
  fileName?: string | null
  fileUrl?: string | null
  videoUrl?: string | null
}

export async function buscarChatsAction(token: string): Promise<{ chats: WaChat[] }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return { chats: [] }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'chats', token }),
    })
    if (!res.ok) return { chats: [] }
    const data = await res.json()
    return { chats: data.chats ?? [] }
  } catch {
    return { chats: [] }
  }
}

export async function buscarMensagensAction(
  token: string,
  remoteJid: string,
): Promise<{ messages: WaMessage[] }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return { messages: [] }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'mensagens', token, remoteJid }),
    })
    if (!res.ok) return { messages: [] }
    const data = await res.json()
    return { messages: data.messages ?? [] }
  } catch {
    return { messages: [] }
  }
}

export async function enviarMensagemAction(
  token: string,
  remoteJid: string,
  text: string,
): Promise<{ ok: boolean }> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return { ok: false }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'enviar', token, remoteJid, text }),
    })
    return { ok: res.ok }
  } catch {
    return { ok: false }
  }
}

export async function updateMeuPerfilAction(formData: FormData) {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }
  if (!prof) return { ok: false as const, error: 'Profissional não encontrado' }

  const nome = String(formData.get('nome') ?? '').trim()
  const especialidade = String(formData.get('especialidade') ?? '').trim()
  const registro = String(formData.get('registro') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()

  if (!nome) return { ok: false as const, error: 'Nome é obrigatório' }

  const { error } = await supabase
    .from('profissionais')
    .update({
      nome,
      especialidade: especialidade || null,
      registro: registro || null,
      telefone: telefone || null,
    })
    .eq('id', prof.id)

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}

const NOTIF_TIPOS = ['lembrete_consulta', 'confirmacao_whatsapp'] as const
export type NotificacaoTipo = (typeof NOTIF_TIPOS)[number]

export async function toggleNotificacaoAction(tipo: NotificacaoTipo, ativo: boolean) {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false as const, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  if (!NOTIF_TIPOS.includes(tipo)) return { ok: false as const, error: 'Tipo inválido' }

  const { error } = await supabase
    .from('notificacao_config')
    .upsert(
      { clinica_id: prof.clinica_id, tipo, ativo },
      { onConflict: 'clinica_id,tipo' },
    )

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/configuracoes')
  return { ok: true as const }
}
