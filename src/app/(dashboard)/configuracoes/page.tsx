import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ConfiguracoesView,
  type HorarioRow,
  type Notificacoes,
} from '@/components/configuracoes-view'

const DEFAULT_HORARIO: Omit<HorarioRow, 'dia_semana'> = {
  aberto: true,
  hora_inicio: '08:00',
  hora_fim: '18:00',
}

const NOTIF_DEFAULTS: Notificacoes = {
  lembrete_consulta: true,
  confirmacao_whatsapp: true,
}

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: prof } = await supabase
    .from('profissionais')
    .select('id, nome, especialidade, registro, email, telefone, role, clinica_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prof?.clinica_id) {
    return (
      <div className="px-10 pt-7 pb-10 max-w-[920px]">
        <div className="bg-card border border-border rounded-[14px] p-8 text-sm text-muted">
          Sua conta ainda não está vinculada a uma clínica.
        </div>
      </div>
    )
  }

  const [{ data: clinica }, { data: horarios }, { data: whatsapp }, { data: notificacoes }] = await Promise.all([
    supabase
      .from('clinica')
      .select('id, nome, subtitulo, cnpj, telefone, email, endereco, logo_url, maps_url, plano_slug, plano_status, plano_periodo_fim, plano_cancelando, trial_ends_at')
      .eq('id', prof.clinica_id)
      .maybeSingle(),
    supabase
      .from('horarios_funcionamento')
      .select('dia_semana, aberto, hora_inicio, hora_fim')
      .eq('clinica_id', prof.clinica_id),
    supabase
      .from('whatsapp_instancias')
      .select('id, nome_instancia, numero, status, api_key')
      .eq('clinica_id', prof.clinica_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('notificacao_config')
      .select('tipo, ativo')
      .eq('clinica_id', prof.clinica_id),
  ])

  if (!clinica) {
    return (
      <div className="px-10 pt-7 pb-10 max-w-[920px]">
        <div className="bg-card border border-border rounded-[14px] p-8 text-sm text-muted">
          Clínica não encontrada.
        </div>
      </div>
    )
  }

  const horariosByDay = new Map((horarios ?? []).map((h) => [h.dia_semana, h]))
  const horariosRows: HorarioRow[] = [0, 1, 2, 3, 4, 5, 6].map((d) => {
    const h = horariosByDay.get(d)
    return {
      dia_semana: d,
      aberto: h?.aberto ?? (d !== 0),
      hora_inicio: h?.hora_inicio?.slice(0, 5) ?? DEFAULT_HORARIO.hora_inicio,
      hora_fim: h?.hora_fim?.slice(0, 5) ?? DEFAULT_HORARIO.hora_fim,
    }
  })

  const notif: Notificacoes = { ...NOTIF_DEFAULTS }
  for (const row of notificacoes ?? []) {
    if (row.tipo === 'lembrete_consulta' || row.tipo === 'confirmacao_whatsapp') {
      notif[row.tipo] = row.ativo ?? false
    }
  }

  return (
    <>
      <div className="px-10 pt-7 pb-2">
        <h1 className="font-newsreader text-[28px] font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted mt-0.5">Dados da clínica, agenda, integrações e perfil</p>
      </div>
      <ConfiguracoesView
        clinica={clinica}
      horarios={horariosRows}
      whatsapp={whatsapp ?? null}
      profissional={{
        id: prof.id,
        nome: prof.nome,
        especialidade: prof.especialidade,
        registro: prof.registro,
        email: prof.email,
        telefone: prof.telefone,
        role: prof.role,
      }}
      notificacoes={notif}
    />
    </>
  )
}
