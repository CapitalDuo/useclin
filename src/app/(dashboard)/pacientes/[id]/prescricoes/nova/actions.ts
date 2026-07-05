'use server'

import { revalidatePath } from 'next/cache'
import { createClient, getProfissional } from '@/lib/supabase/server'

type Med = { nome: string; dosagem: string; frequencia: string; duracao: string }

export async function criarPrescricaoAction(
  pacienteId: string,
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { user, prof } = await getProfissional(supabase)
  if (!user) return { ok: false, error: 'Não autenticado' }
  if (!prof?.clinica_id) return { ok: false, error: 'Profissional não encontrado' }

  const [{ data: paciente }, { data: clinica }] = await Promise.all([
    supabase
      .from('pacientes')
      .select('nome, cpf, data_nascimento')
      .eq('id', pacienteId)
      .maybeSingle(),
    supabase.from('clinica').select('nome').eq('id', prof.clinica_id).maybeSingle(),
  ])
  if (!paciente) return { ok: false, error: 'Paciente não encontrado' }

  const diagnostico = String(formData.get('diagnostico') ?? '').trim()
  const convenio = String(formData.get('convenio') ?? '').trim()
  const planoTratamento = String(formData.get('plano_tratamento') ?? '').trim()
  const orientacoes = String(formData.get('orientacoes') ?? '').trim()
  const dataConsulta = String(
    formData.get('data_consulta') ?? new Date().toISOString().slice(0, 10),
  )
  const agendamentoId = String(formData.get('agendamento_id') ?? '').trim() || null

  let medicamentos: Med[] = []
  try {
    medicamentos = JSON.parse(String(formData.get('medicamentos') ?? '[]'))
  } catch {
    medicamentos = []
  }

  // Calcula idade a partir de data_nascimento
  let idade = ''
  if (paciente.data_nascimento) {
    const nasc = new Date(paciente.data_nascimento + 'T00:00:00')
    const hoje = new Date()
    const anos =
      hoje.getFullYear() -
      nasc.getFullYear() -
      (hoje.getMonth() < nasc.getMonth() ||
      (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())
        ? 1
        : 0)
    idade = `${anos} anos`
  }

  const nascimentoFormatado = paciente.data_nascimento
    ? new Date(paciente.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR')
    : ''
  const dataFormatada = new Date(dataConsulta + 'T00:00:00').toLocaleDateString('pt-BR')

  // Chama n8n para gerar o PDF.
  // Usa N8N_PRESCRICAO_URL quando disponível; caso contrário deriva da
  // variável já existente no Vercel (N8N_WEBHOOK_URL = .../webhook/whatsapp).
  let pdfUrl: string | null = null
  const n8nUrl =
    process.env.N8N_PRESCRICAO_URL ??
    (process.env.N8N_WEBHOOK_URL
      ? process.env.N8N_WEBHOOK_URL.replace(/\/webhook\/[^/]+$/, '/webhook/prescricao')
      : null)

  if (n8nUrl) {
    try {
      const n8nRes = await fetch(n8nUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paciente_nome: paciente.nome,
          paciente_cpf: paciente.cpf ?? '',
          paciente_nascimento: nascimentoFormatado,
          paciente_idade: idade,
          medico_nome: prof.nome,
          medico_crm: prof.registro ?? '',
          medico_especialidade: prof.especialidade ?? '',
          clinica_nome: clinica?.nome ?? '',
          clinica_convenio: convenio,
          diagnostico,
          medicamentos,
          plano_tratamento: planoTratamento,
          orientacoes,
          data_consulta: dataFormatada,
        }),
      })

      if (n8nRes.ok) {
        const n8nData = await n8nRes.json()
        const pdfBase64: string | undefined = n8nData.pdf_base64

        if (pdfBase64) {
          const pdfBuffer = Buffer.from(pdfBase64, 'base64')
          const fileName = `${prof.clinica_id}/${pacienteId}/${Date.now()}.pdf`

          const { data: upload, error: uploadError } = await supabase.storage
            .from('prescricoes')
            .upload(fileName, pdfBuffer, {
              contentType: 'application/pdf',
              upsert: false,
            })

          if (upload && !uploadError) {
            // Bucket privado: guarda o path; a URL assinada é gerada na exibição
            pdfUrl = upload.path
          }
        }
      }
    } catch {
      // PDF falhou — salva o registro sem PDF
    }
  }

  const { error } = await supabase.from('prescricoes').insert({
    clinica_id: prof.clinica_id,
    paciente_id: pacienteId,
    agendamento_id: agendamentoId,
    profissional_id: prof.id,
    diagnostico: diagnostico || null,
    medicamentos: medicamentos as unknown as never,
    plano_tratamento: planoTratamento || null,
    orientacoes: orientacoes || null,
    convenio: convenio || null,
    data_consulta: dataConsulta,
    pdf_url: pdfUrl,
  })

  if (error) return { ok: false, error: error.message }

  revalidatePath(`/pacientes/${pacienteId}/fichas`)
  if (agendamentoId) revalidatePath(`/consultas/${agendamentoId}`)
  return { ok: true }
}
