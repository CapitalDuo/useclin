export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
        Relationships: [
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_tipo_consulta_id_fkey"
            columns: ["tipo_consulta_id"]
            isOneToOne: false
            referencedRelation: "tipos_consulta"
            referencedColumns: ["id"]
          },
        ]
      }
      clinica: {
        Row: {
          agenda_intervalo_minutos: number
          cnpj: string | null
          created_at: string
          descricao: string | null
          email: string | null
          endereco: string | null
          features: Json
          id: string
          logo_url: string | null
          maps_url: string | null
          nome: string
          onboarding_completo: boolean
          onboarding_step: number
          plano_cancelando: boolean
          plano_periodo_fim: string | null
          plano_slug: string
          plano_status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subtitulo: string | null
          telefone: string | null
          tipo_clinica: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          agenda_intervalo_minutos?: number
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          maps_url?: string | null
          nome: string
          onboarding_completo?: boolean
          onboarding_step?: number
          plano_cancelando?: boolean
          plano_periodo_fim?: string | null
          plano_slug?: string
          plano_status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subtitulo?: string | null
          telefone?: string | null
          tipo_clinica?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          agenda_intervalo_minutos?: number
          cnpj?: string | null
          created_at?: string
          descricao?: string | null
          email?: string | null
          endereco?: string | null
          features?: Json
          id?: string
          logo_url?: string | null
          maps_url?: string | null
          nome?: string
          onboarding_completo?: boolean
          onboarding_step?: number
          plano_cancelando?: boolean
          plano_periodo_fim?: string | null
          plano_slug?: string
          plano_status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subtitulo?: string | null
          telefone?: string | null
          tipo_clinica?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clinica_convenios: {
        Row: {
          ativo: boolean
          clinica_id: string
          created_at: string
          id: string
          nome: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          created_at?: string
          id?: string
          nome: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          created_at?: string
          id?: string
          nome?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinica_convenios_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinica_convenios_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      clinica_servicos: {
        Row: {
          ativo: boolean
          clinica_id: string
          created_at: string
          id: string
          nome: string
          valor: number | null
        }
        Insert: {
          ativo?: boolean
          clinica_id: string
          created_at?: string
          id?: string
          nome: string
          valor?: number | null
        }
        Update: {
          ativo?: boolean
          clinica_id?: string
          created_at?: string
          id?: string
          nome?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "clinica_servicos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinica_servicos_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "conversas_instancia_id_fkey"
            columns: ["instancia_id"]
            isOneToOne: false
            referencedRelation: "v_whatsapp_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_instancia_id_fkey"
            columns: ["instancia_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instancias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "conversas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas_fixas: {
        Row: {
          ativo: boolean
          categoria: string
          clinica_id: string
          created_at: string
          dia_vencimento: number
          id: string
          nome: string
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          clinica_id: string
          created_at?: string
          dia_vencimento: number
          id?: string
          nome: string
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          clinica_id?: string
          created_at?: string
          dia_vencimento?: number
          id?: string
          nome?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_fixas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "despesas_fixas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      horarios_funcionamento: {
        Row: {
          aberto: boolean
          clinica_id: string
          dia_semana: number
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          intervalo_fim: string | null
          intervalo_inicio: string | null
        }
        Insert: {
          aberto?: boolean
          clinica_id: string
          dia_semana: number
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          intervalo_fim?: string | null
          intervalo_inicio?: string | null
        }
        Update: {
          aberto?: boolean
          clinica_id?: string
          dia_semana?: number
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          intervalo_fim?: string | null
          intervalo_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_funcionamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_funcionamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      medicoes_pediatricas: {
        Row: {
          altura_cm: number | null
          clinica_id: string
          created_at: string
          data: string
          id: string
          paciente_id: string
          perimetro_cefalico_cm: number | null
          peso_kg: number | null
          registrado_por: string | null
        }
        Insert: {
          altura_cm?: number | null
          clinica_id: string
          created_at?: string
          data: string
          id?: string
          paciente_id: string
          perimetro_cefalico_cm?: number | null
          peso_kg?: number | null
          registrado_por?: string | null
        }
        Update: {
          altura_cm?: number | null
          clinica_id?: string
          created_at?: string
          data?: string
          id?: string
          paciente_id?: string
          perimetro_cefalico_cm?: number | null
          peso_kg?: number | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medicoes_pediatricas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_pediatricas_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "medicoes_pediatricas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_pediatricas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "medicoes_pediatricas_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicoes_pediatricas_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["conversa_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "notificacao_config_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacao_config_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "paciente_tags_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_tags_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "paciente_tags_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "paciente_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
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
          protegido: boolean
          sexo: string | null
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
          protegido?: boolean
          sexo?: string | null
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
          protegido?: boolean
          sexo?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
          valor_plano?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "pacientes_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
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
      prescricoes: {
        Row: {
          agendamento_id: string | null
          clinica_id: string
          convenio: string | null
          created_at: string
          data_consulta: string
          diagnostico: string | null
          id: string
          medicamentos: Json
          orientacoes: string | null
          paciente_id: string
          pdf_url: string | null
          plano_tratamento: string | null
          profissional_id: string
        }
        Insert: {
          agendamento_id?: string | null
          clinica_id: string
          convenio?: string | null
          created_at?: string
          data_consulta?: string
          diagnostico?: string | null
          id?: string
          medicamentos?: Json
          orientacoes?: string | null
          paciente_id: string
          pdf_url?: string | null
          plano_tratamento?: string | null
          profissional_id: string
        }
        Update: {
          agendamento_id?: string | null
          clinica_id?: string
          convenio?: string | null
          created_at?: string
          data_consulta?: string
          diagnostico?: string | null
          id?: string
          medicamentos?: Json
          orientacoes?: string | null
          paciente_id?: string
          pdf_url?: string | null
          plano_tratamento?: string | null
          profissional_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "profissionais_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profissionais_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      registros_consulta: {
        Row: {
          agendamento_id: string
          anamnese: string | null
          clinica_id: string
          conclusao: string | null
          created_at: string
          exame_fisico: string | null
          id: string
          paciente_id: string
          updated_at: string
        }
        Insert: {
          agendamento_id: string
          anamnese?: string | null
          clinica_id: string
          conclusao?: string | null
          created_at?: string
          exame_fisico?: string | null
          id?: string
          paciente_id: string
          updated_at?: string
        }
        Update: {
          agendamento_id?: string
          anamnese?: string | null
          clinica_id?: string
          conclusao?: string | null
          created_at?: string
          exame_fisico?: string | null
          id?: string
          paciente_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "registros_consulta_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: true
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_consulta_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: true
            referencedRelation: "v_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_consulta_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_consulta_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "registros_consulta_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_consulta_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "registros_consulta_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "suporte_mensagens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "suporte_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suporte_mensagens_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "v_suporte_inbox"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "suporte_tickets_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suporte_tickets_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
          clinica_id: string
          created_at: string
          data: string
          descricao: string | null
          despesa_fixa_id: string | null
          forma_pagamento: string | null
          id: string
          mes_referencia: string | null
          paciente_id: string | null
          status: string
          tipo: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          clinica_id: string
          created_at?: string
          data?: string
          descricao?: string | null
          despesa_fixa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          mes_referencia?: string | null
          paciente_id?: string | null
          status?: string
          tipo: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          clinica_id?: string
          created_at?: string
          data?: string
          descricao?: string | null
          despesa_fixa_id?: string | null
          forma_pagamento?: string | null
          id?: string
          mes_referencia?: string | null
          paciente_id?: string | null
          status?: string
          tipo?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "transacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "transacoes_despesa_fixa_id_fkey"
            columns: ["despesa_fixa_id"]
            isOneToOne: false
            referencedRelation: "despesas_fixas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "whatsapp_eventos_instancia_id_fkey"
            columns: ["instancia_id"]
            isOneToOne: false
            referencedRelation: "v_whatsapp_status"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_eventos_instancia_id_fkey"
            columns: ["instancia_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instancias"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "whatsapp_instancias_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_instancias_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      whatsapp_mensagens: {
        Row: {
          created_at: string
          file_url: string | null
          from_me: boolean
          id: string
          instance_name: string
          message_id: string | null
          message_timestamp: number | null
          message_type: string | null
          push_name: string | null
          remote_jid: string
          text: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          from_me?: boolean
          id?: string
          instance_name: string
          message_id?: string | null
          message_timestamp?: number | null
          message_type?: string | null
          push_name?: string | null
          remote_jid: string
          text?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          from_me?: boolean
          id?: string
          instance_name?: string
          message_id?: string | null
          message_timestamp?: number | null
          message_type?: string | null
          push_name?: string | null
          remote_jid?: string
          text?: string | null
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
          paciente_id: string | null
          paciente_iniciais: string | null
          paciente_nome: string | null
          paciente_whatsapp: string | null
          profissional_id: string | null
          profissional_nome: string | null
          status: string | null
          tipo_cor: string | null
          tipo_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "agendamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
      v_clinica_planos: {
        Row: {
          acesso_ate: string | null
          cancelando: boolean | null
          clinica: string | null
          clinica_id: string | null
          email_contato: string | null
          plano: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          acesso_ate?: string | null
          cancelando?: boolean | null
          clinica?: string | null
          clinica_id?: string | null
          email_contato?: string | null
          plano?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          acesso_ate?: string | null
          cancelando?: boolean | null
          clinica?: string | null
          clinica_id?: string | null
          email_contato?: string | null
          plano?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "transacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "v_agenda"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_atendimento"
            referencedColumns: ["paciente_id"]
          },
          {
            foreignKeyName: "transacoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "v_pacientes_tabela"
            referencedColumns: ["id"]
          },
        ]
      }
      v_horarios_clinica: {
        Row: {
          aberto: boolean | null
          clinica_id: string | null
          dia_nome: string | null
          dia_semana: number | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string | null
          intervalo_fim: string | null
          intervalo_inicio: string | null
        }
        Insert: {
          aberto?: boolean | null
          clinica_id?: string | null
          dia_nome?: never
          dia_semana?: number | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string | null
          intervalo_fim?: string | null
          intervalo_inicio?: string | null
        }
        Update: {
          aberto?: boolean | null
          clinica_id?: string | null
          dia_nome?: never
          dia_semana?: number | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string | null
          intervalo_fim?: string | null
          intervalo_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "horarios_funcionamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "horarios_funcionamento_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
          ultima_mensagem_autor_tipo: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suporte_tickets_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suporte_tickets_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "whatsapp_instancias_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "clinica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_instancias_clinica_id_fkey"
            columns: ["clinica_id"]
            isOneToOne: false
            referencedRelation: "v_clinica_planos"
            referencedColumns: ["clinica_id"]
          },
        ]
      }
    }
    Functions: {
      get_slots_disponiveis: {
        Args: {
          p_clinica_id: string
          p_data: string
          p_duracao_minutos?: number
          p_intervalo_grade?: number
          p_profissional_id?: string
        }
        Returns: {
          data: string
          especialidade: string
          hora_fim: string
          hora_inicio: string
          profissional_id: string
          profissional_nome: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

