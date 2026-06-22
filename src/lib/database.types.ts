export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          data: string
          hora_fim: string
          hora_inicio: string
          id: string
          lembrete_enviado: boolean
          notas: string | null
          paciente_id: string
          profissional_id: string
          status: string
          tipo_consulta_id: string | null
          updated_at: string
          valor: number | null
        }
        Insert: {
          created_at?: string
          data: string
          hora_fim: string
          hora_inicio: string
          id?: string
          lembrete_enviado?: boolean
          notas?: string | null
          paciente_id: string
          profissional_id: string
          status?: string
          tipo_consulta_id?: string | null
          updated_at?: string
          valor?: number | null
        }
        Update: {
          created_at?: string
          data?: string
          hora_fim?: string
          hora_inicio?: string
          id?: string
          lembrete_enviado?: boolean
          notas?: string | null
          paciente_id?: string
          profissional_id?: string
          status?: string
          tipo_consulta_id?: string | null
          updated_at?: string
          valor?: number | null
        }
        Relationships: []
      }
      clinica: {
        Row: {
          cnpj: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          logo_url: string | null
          nome: string
          onboarding_completo: boolean
          onboarding_step: number
          subtitulo: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          onboarding_completo?: boolean
          onboarding_step?: number
          subtitulo?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          onboarding_completo?: boolean
          onboarding_step?: number
          subtitulo?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conversas: {
        Row: {
          canal: string
          created_at: string
          id: string
          instancia_id: string | null
          mensagens_nao_lidas: number
          paciente_id: string
          status: string
          ultima_mensagem_at: string | null
          updated_at: string
        }
        Insert: {
          canal?: string
          created_at?: string
          id?: string
          instancia_id?: string | null
          mensagens_nao_lidas?: number
          paciente_id: string
          status?: string
          ultima_mensagem_at?: string | null
          updated_at?: string
        }
        Update: {
          canal?: string
          created_at?: string
          id?: string
          instancia_id?: string | null
          mensagens_nao_lidas?: number
          paciente_id?: string
          status?: string
          ultima_mensagem_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      horarios_funcionamento: {
        Row: {
          aberto: boolean
          clinica_id: string
          dia_semana: number
          hora_fim: string | null
          hora_inicio: string | null
          id: string
        }
        Insert: {
          aberto?: boolean
          clinica_id: string
          dia_semana: number
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Update: {
          aberto?: boolean
          clinica_id?: string
          dia_semana?: number
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
        }
        Relationships: []
      }
      mensagens: {
        Row: {
          conteudo: string
          conversa_id: string
          created_at: string
          entregue: boolean
          erro: string | null
          id: string
          lida: boolean
          midia_nome: string | null
          midia_url: string | null
          remetente_id: string | null
          remetente_tipo: string
          tipo_midia: string
          whatsapp_message_id: string | null
        }
        Insert: {
          conteudo: string
          conversa_id: string
          created_at?: string
          entregue?: boolean
          erro?: string | null
          id?: string
          lida?: boolean
          midia_nome?: string | null
          midia_url?: string | null
          remetente_id?: string | null
          remetente_tipo: string
          tipo_midia?: string
          whatsapp_message_id?: string | null
        }
        Update: {
          conteudo?: string
          conversa_id?: string
          created_at?: string
          entregue?: boolean
          erro?: string | null
          id?: string
          lida?: boolean
          midia_nome?: string | null
          midia_url?: string | null
          remetente_id?: string | null
          remetente_tipo?: string
          tipo_midia?: string
          whatsapp_message_id?: string | null
        }
        Relationships: []
      }
      notificacao_config: {
        Row: {
          ativo: boolean
          clinica_id: string
          id: string
          tipo: string
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          id?: string
          tipo: string
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          id?: string
          tipo?: string
        }
        Relationships: []
      }
      paciente_tags: {
        Row: {
          paciente_id: string
          tag_id: string
        }
        Insert: {
          paciente_id: string
          tag_id: string
        }
        Update: {
          paciente_id?: string
          tag_id?: string
        }
        Relationships: []
      }
      pacientes: {
        Row: {
          avatar_url: string | null
          cliente_desde: string | null
          clinica_id: string | null
          codigo: number
          cor: string | null
          cpf: string | null
          created_at: string
          data_nascimento: string | null
          documento: string | null
          email: string | null
          endereco: string | null
          id: string
          iniciais: string | null
          nome: string
          observacoes: string | null
          plano_id: string | null
          status: string
          telefone: string | null
          updated_at: string
          valor_plano: number | null
          whatsapp: string | null
        }
        Insert: {
          avatar_url?: string | null
          cliente_desde?: string | null
          clinica_id?: string | null
          codigo?: number
          cor?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          iniciais?: string | null
          nome: string
          observacoes?: string | null
          plano_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          valor_plano?: number | null
          whatsapp?: string | null
        }
        Update: {
          avatar_url?: string | null
          cliente_desde?: string | null
          clinica_id?: string | null
          codigo?: number
          cor?: string | null
          cpf?: string | null
          created_at?: string
          data_nascimento?: string | null
          documento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          iniciais?: string | null
          nome?: string
          observacoes?: string | null
          plano_id?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          valor_plano?: number | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      planos: {
        Row: {
          id: string
          nome: string
          tipo: string
        }
        Insert: {
          id?: string
          nome: string
          tipo?: string
        }
        Update: {
          id?: string
          nome?: string
          tipo?: string
        }
        Relationships: []
      }
      plataforma_admins: {
        Row: {
          created_at: string
          nome: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          nome?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          nome?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          clinica_id: string | null
          cor: string | null
          created_at: string
          email: string | null
          especialidade: string | null
          id: string
          iniciais: string | null
          nome: string
          registro: string | null
          role: string
          telefone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          clinica_id?: string | null
          cor?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          id?: string
          iniciais?: string | null
          nome: string
          registro?: string | null
          role?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          clinica_id?: string | null
          cor?: string | null
          created_at?: string
          email?: string | null
          especialidade?: string | null
          id?: string
          iniciais?: string | null
          nome?: string
          registro?: string | null
          role?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          agendamento_id: string | null
          anexos: Json | null
          created_at: string
          descricao: string
          diagnostico: string | null
          id: string
          paciente_id: string
          prescricao: string | null
          profissional_id: string
        }
        Insert: {
          agendamento_id?: string | null
          anexos?: Json | null
          created_at?: string
          descricao: string
          diagnostico?: string | null
          id?: string
          paciente_id: string
          prescricao?: string | null
          profissional_id: string
        }
        Update: {
          agendamento_id?: string | null
          anexos?: Json | null
          created_at?: string
          descricao?: string
          diagnostico?: string | null
          id?: string
          paciente_id?: string
          prescricao?: string | null
          profissional_id?: string
        }
        Relationships: []
      }
      suporte_mensagens: {
        Row: {
          autor_id: string
          autor_tipo: string
          conteudo: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          autor_id: string
          autor_tipo: string
          conteudo: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          autor_id?: string
          autor_tipo?: string
          conteudo?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: []
      }
      suporte_tickets: {
        Row: {
          assunto: string
          categoria: string
          clinica_id: string
          created_at: string
          criado_por: string
          id: string
          prioridade: string
          status: string
          updated_at: string
        }
        Insert: {
          assunto: string
          categoria?: string
          clinica_id: string
          created_at?: string
          criado_por: string
          id?: string
          prioridade?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assunto?: string
          categoria?: string
          clinica_id?: string
          created_at?: string
          criado_por?: string
          id?: string
          prioridade?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          cor: string | null
          id: string
          nome: string
        }
        Insert: {
          cor?: string | null
          id?: string
          nome: string
        }
        Update: {
          cor?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tipos_consulta: {
        Row: {
          cor: string
          duracao_padrao: string | null
          id: string
          nome: string
        }
        Insert: {
          cor: string
          duracao_padrao?: string | null
          id?: string
          nome: string
        }
        Update: {
          cor?: string
          duracao_padrao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      transacoes: {
        Row: {
          agendamento_id: string | null
          created_at: string
          data: string
          descricao: string | null
          forma_pagamento: string | null
          id: string
          paciente_id: string
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          paciente_id: string
          status?: string
          tipo: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          data?: string
          descricao?: string | null
          forma_pagamento?: string | null
          id?: string
          paciente_id?: string
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      whatsapp_eventos: {
        Row: {
          created_at: string
          id: string
          instancia_id: string
          payload: Json | null
          tipo: string
        }
        Insert: {
          created_at?: string
          id?: string
          instancia_id: string
          payload?: Json | null
          tipo: string
        }
        Update: {
          created_at?: string
          id?: string
          instancia_id?: string
          payload?: Json | null
          tipo?: string
        }
        Relationships: []
      }
      whatsapp_instancias: {
        Row: {
          api_key: string | null
          api_url: string | null
          clinica_id: string
          created_at: string
          id: string
          nome_instancia: string
          numero: string
          qrcode_base64: string | null
          qrcode_expires_at: string | null
          status: string
          ultimo_ping: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          api_url?: string | null
          clinica_id: string
          created_at?: string
          id?: string
          nome_instancia: string
          numero: string
          qrcode_base64?: string | null
          qrcode_expires_at?: string | null
          status?: string
          ultimo_ping?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          api_url?: string | null
          clinica_id?: string
          created_at?: string
          id?: string
          nome_instancia?: string
          numero?: string
          qrcode_base64?: string | null
          qrcode_expires_at?: string | null
          status?: string
          ultimo_ping?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_agenda: {
        Row: {
          clinica_id: string | null
          data: string | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string | null
          lembrete_enviado: boolean | null
          notas: string | null
          paciente_iniciais: string | null
          paciente_nome: string | null
          paciente_whatsapp: string | null
          profissional_nome: string | null
          status: string | null
          tipo_cor: string | null
          tipo_nome: string | null
        }
        Relationships: []
      }
      v_atendimento: {
        Row: {
          canal: string | null
          cliente_desde: string | null
          clinica_id: string | null
          conversa_id: string | null
          conversa_status: string | null
          data_nascimento: string | null
          mensagens_nao_lidas: number | null
          observacoes: string | null
          paciente_cor: string | null
          paciente_id: string | null
          paciente_iniciais: string | null
          paciente_nome: string | null
          paciente_telefone: string | null
          paciente_whatsapp: string | null
          proximo_agendamento: string | null
          total_atendimentos: number | null
          total_gasto: number | null
          ultima_mensagem_at: string | null
          ultima_mensagem_texto: string | null
          valor_plano: number | null
          whatsapp_status: string | null
        }
        Relationships: []
      }
      v_dashboard_kpis: {
        Row: {
          clinica_id: string | null
          consultas_hoje: number | null
          consultas_mes: number | null
          pacientes_ativos: number | null
          pacientes_novos_mes: number | null
          pacientes_total: number | null
          receita_mensal: number | null
        }
        Relationships: []
      }
      v_financeiro_entradas: {
        Row: {
          agendamento_hora: string | null
          agendamento_id: string | null
          clinica_id: string | null
          created_at: string | null
          data: string | null
          descricao: string | null
          forma_pagamento: string | null
          id: string | null
          paciente_cor: string | null
          paciente_id: string | null
          paciente_iniciais: string | null
          paciente_nome: string | null
          status: string | null
          tipo: string | null
          tipo_consulta_nome: string | null
          valor: number | null
        }
        Relationships: []
      }
      v_pacientes_tabela: {
        Row: {
          cliente_desde: string | null
          clinica_id: string | null
          codigo: number | null
          cor: string | null
          cpf: string | null
          data_nascimento: string | null
          email: string | null
          id: string | null
          iniciais: string | null
          nome: string | null
          observacoes: string | null
          plano_nome: string | null
          plano_tipo: string | null
          proxima_consulta: string | null
          status: string | null
          tags: string[] | null
          telefone: string | null
          total_atendimentos: number | null
          total_gasto: number | null
          ultima_consulta: string | null
          valor_plano: number | null
          whatsapp: string | null
        }
        Relationships: []
      }
      v_suporte_inbox: {
        Row: {
          assunto: string | null
          categoria: string | null
          clinica_id: string | null
          clinica_nome: string | null
          created_at: string | null
          criado_por: string | null
          id: string | null
          prioridade: string | null
          status: string | null
          total_mensagens: number | null
          ultima_mensagem: string | null
          ultima_mensagem_at: string | null
          updated_at: string | null
        }
        Relationships: []
      }
      v_whatsapp_status: {
        Row: {
          clinica_id: string | null
          created_at: string | null
          id: string | null
          nome_instancia: string | null
          numero: string | null
          online: boolean | null
          status: string | null
          ultimo_ping: string | null
        }
        Insert: {
          clinica_id?: string | null
          created_at?: string | null
          id?: string | null
          nome_instancia?: string | null
          numero?: string | null
          online?: never
          status?: string | null
          ultimo_ping?: string | null
        }
        Update: {
          clinica_id?: string | null
          created_at?: string | null
          id?: string | null
          nome_instancia?: string | null
          numero?: string | null
          online?: never
          status?: string | null
          ultimo_ping?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
