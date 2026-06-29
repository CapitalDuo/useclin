// Cores e rótulos dos status de agendamento. Fonte única — usada no calendário
// da agenda e na aba "Consultas" do perfil do paciente.

export const STATUS_COLORS: Record<string, string> = {
  agendado: '#6d5ae6',
  confirmado: '#6d5ae6',
  em_atendimento: '#f5a623',
  concluido: '#2fb98a',
  faltou: '#f06a6a',
  cancelado: '#f06a6a',
}

export const STATUS_LABEL: Record<string, string> = {
  agendado: 'Agendado',
  confirmado: 'Agendado',
  em_atendimento: 'Em andamento',
  concluido: 'Finalizado',
  cancelado: 'Cancelado',
  faltou: 'Faltou',
}
