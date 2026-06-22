import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FinanceiroView, type EntradaRow, type SeriePonto } from '@/components/financeiro-view'

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0)
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10)
}

function startOfWeek(d: Date) {
  const day = d.getDay() // 0=dom..6=sab
  const diff = day === 0 ? -6 : 1 - day // move pra segunda
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

type Entrada = {
  id: string | null
  data: string | null
  valor: number | null
  status: string | null
  paciente_nome: string | null
  paciente_iniciais: string | null
  paciente_cor: string | null
  tipo_consulta_nome: string | null
  agendamento_hora: string | null
  descricao: string | null
}

export default async function FinanceiroPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  // Carrega TODAS as entradas do mês (faturamento mensal) +
  // entradas pra montar gráfico (semana atual + semanas do mês)
  const [{ data: entradasMes }, { data: recentes }] = await Promise.all([
    supabase
      .from('v_financeiro_entradas')
      .select('id, data, valor, status, paciente_nome, paciente_iniciais, paciente_cor, tipo_consulta_nome, agendamento_hora, descricao')
      .eq('tipo', 'receita')
      .gte('data', iso(monthStart))
      .lte('data', iso(monthEnd))
      .order('data', { ascending: true }),
    supabase
      .from('v_financeiro_entradas')
      .select('id, data, valor, status, paciente_nome, paciente_iniciais, paciente_cor, tipo_consulta_nome, agendamento_hora, descricao')
      .eq('tipo', 'receita')
      .order('data', { ascending: false })
      .limit(8),
  ])

  const entradas: Entrada[] = (entradasMes ?? []) as Entrada[]

  // KPIs
  let faturamentoMensal = 0
  let recebidoPago = 0
  let aReceber = 0
  for (const e of entradas) {
    const v = Number(e.valor ?? 0)
    if (e.status === 'cancelado') continue
    faturamentoMensal += v
    if (e.status === 'pago') recebidoPago += v
    else if (e.status === 'pendente') aReceber += v
  }

  // Série semanal: agrega valor pago por dia da semana atual (seg-dom)
  const weekStart = startOfWeek(today)
  const weekSerie: SeriePonto[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    return { label: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i], valor: 0, data: iso(d) }
  })
  for (const e of entradas) {
    if (!e.data || e.status === 'cancelado') continue
    const idx = weekSerie.findIndex((s) => s.data === e.data)
    if (idx >= 0) weekSerie[idx].valor += Number(e.valor ?? 0)
  }

  // Série mensal: 4 semanas do mês atual (semana 1..4)
  const monthSerie: SeriePonto[] = [
    { label: 'Sem 1', valor: 0, data: '' },
    { label: 'Sem 2', valor: 0, data: '' },
    { label: 'Sem 3', valor: 0, data: '' },
    { label: 'Sem 4', valor: 0, data: '' },
  ]
  for (const e of entradas) {
    if (!e.data || e.status === 'cancelado') continue
    const day = new Date(e.data + 'T00:00:00').getDate()
    const week = Math.min(3, Math.floor((day - 1) / 7)) // 0..3
    monthSerie[week].valor += Number(e.valor ?? 0)
  }

  const ultimasEntradas: EntradaRow[] = ((recentes ?? []) as Entrada[]).map((e) => ({
    id: e.id ?? '',
    paciente_nome: e.paciente_nome ?? '—',
    paciente_iniciais: e.paciente_iniciais ?? '—',
    paciente_cor: e.paciente_cor ?? '#9a8aa6',
    data: e.data ?? '',
    hora: e.agendamento_hora?.slice(0, 5) ?? null,
    valor: Number(e.valor ?? 0),
    status: (e.status as 'pago' | 'pendente' | 'cancelado') ?? 'pendente',
    descricao: e.tipo_consulta_nome ?? e.descricao ?? '—',
  }))

  return (
    <FinanceiroView
      faturamentoMensal={faturamentoMensal}
      recebidoPago={recebidoPago}
      aReceber={aReceber}
      weekSerie={weekSerie}
      monthSerie={monthSerie}
      ultimasEntradas={ultimasEntradas}
    />
  )
}
