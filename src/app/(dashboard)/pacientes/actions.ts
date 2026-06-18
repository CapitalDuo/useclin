'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const PALETTE = ['#b8a88a', '#8ab89b', '#a88ab8', '#8a8ab8', '#b88a8a', '#8ab8b8', '#b8b88a']

function iniciais(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function randomColor() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)]
}

export async function createPacienteAction(formData: FormData) {
  const nome = String(formData.get('nome') ?? '').trim()
  const cpf = String(formData.get('cpf') ?? '').trim()
  const data_nascimento = String(formData.get('data_nascimento') ?? '').trim()
  const telefone = String(formData.get('telefone') ?? '').trim()
  const whatsapp = String(formData.get('whatsapp') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const endereco = String(formData.get('endereco') ?? '').trim()
  const observacoes = String(formData.get('observacoes') ?? '').trim()
  const plano_id_raw = String(formData.get('plano_id') ?? '')
  const valor_plano_raw = String(formData.get('valor_plano') ?? '').trim()

  if (!nome) {
    return { ok: false as const, error: 'Nome é obrigatório' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'Não autenticado' }

  const { data: prof } = await supabase
    .from('profissionais')
    .select('clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!prof?.clinica_id) return { ok: false as const, error: 'Conta sem clínica vinculada' }

  const valor = valor_plano_raw ? Number(valor_plano_raw.replace(',', '.')) : null

  const { error } = await supabase.from('pacientes').insert({
    clinica_id: prof.clinica_id,
    nome,
    cpf: cpf || null,
    data_nascimento: data_nascimento || null,
    telefone: telefone || null,
    whatsapp: whatsapp || null,
    email: email || null,
    endereco: endereco || null,
    observacoes: observacoes || null,
    plano_id: plano_id_raw && plano_id_raw !== 'none' ? plano_id_raw : null,
    valor_plano: valor && !Number.isNaN(valor) ? valor : null,
    iniciais: iniciais(nome),
    cor: randomColor(),
    status: 'ativo',
  })

  if (error) return { ok: false as const, error: error.message }

  revalidatePath('/pacientes')
  redirect('/pacientes')
}
