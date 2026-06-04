export type UserRole = 'super_admin' | 'dentist' | 'nurse' | 'receptionist'

export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type TreatmentStatus =
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type InvoiceStatus =
  | 'draft'
  | 'partially_paid'
  | 'paid'
  | 'cancelled'

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'insurance'

export type ImageCategory =
  | 'before_treatment'
  | 'after_treatment'
  | 'clinical_photo'
  | 'xray'
  | 'panoramic'

export type SubscriptionStatus = 'active' | 'frozen' | 'expired' | 'cancelled'

export type ToothCondition =
  | 'healthy'
  | 'planned'
  | 'in_progress'
  | 'completed'
  | 'diseased'
  | 'missing'
  | 'implant_planned'
  | 'denture_planned'

export type GenderType = 'male' | 'female' | 'other'

export type TimelineEventType =
  | 'patient_created'
  | 'appointment_created'
  | 'appointment_updated'
  | 'visit_completed'
  | 'treatment_added'
  | 'treatment_updated'
  | 'invoice_created'
  | 'payment_received'
  | 'image_uploaded'
  | 'odontogram_updated'
  | 'consent_signed'

export type ToothSurface =
  | 'mesial'
  | 'distal'
  | 'buccal'
  | 'lingual'
  | 'occlusal'
  | 'incisal'

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          name_ar: string | null
          email: string | null
          phone: string | null
          address: string | null
          address_ar: string | null
          logo_url: string | null
          license_number: string | null
          subscription_status: SubscriptionStatus
          subscription_expires_at: string | null
          max_users: number
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          name_ar?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          address_ar?: string | null
          logo_url?: string | null
          license_number?: string | null
          subscription_status?: SubscriptionStatus
          subscription_expires_at?: string | null
          max_users?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          name_ar?: string | null
          email?: string | null
          phone?: string | null
          address?: string | null
          address_ar?: string | null
          logo_url?: string | null
          license_number?: string | null
          subscription_status?: SubscriptionStatus
          subscription_expires_at?: string | null
          max_users?: number
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      profiles: {
        Row: {
          id: string
          clinic_id: string | null
          full_name: string
          full_name_ar: string | null
          email: string
          phone: string | null
          role: UserRole
          avatar_url: string | null
          is_active: boolean
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id: string
          clinic_id?: string | null
          full_name: string
          full_name_ar?: string | null
          email: string
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string | null
          full_name?: string
          full_name_ar?: string | null
          email?: string
          phone?: string | null
          role?: UserRole
          avatar_url?: string | null
          is_active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      patients: {
        Row: {
          id: string
          clinic_id: string
          created_by: string
          full_name: string
          full_name_ar: string | null
          gender: GenderType | null
          date_of_birth: string | null
          height_cm: number | null
          weight_kg: number | null
          occupation: string | null
          address: string | null
          mobile: string | null
          email: string | null
          companion_name: string | null
          companion_mobile: string | null
          drug_allergies: string | null
          current_medications: string | null
          is_smoker: boolean | null
          alcohol_consumption: boolean | null
          has_heart_disease: boolean | null
          has_diabetes: boolean | null
          blood_pressure_notes: string | null
          medical_notes: string | null
          file_number: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          created_by: string
          full_name: string
          full_name_ar?: string | null
          gender?: GenderType | null
          date_of_birth?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          occupation?: string | null
          address?: string | null
          mobile?: string | null
          email?: string | null
          companion_name?: string | null
          companion_mobile?: string | null
          drug_allergies?: string | null
          current_medications?: string | null
          is_smoker?: boolean | null
          alcohol_consumption?: boolean | null
          has_heart_disease?: boolean | null
          has_diabetes?: boolean | null
          blood_pressure_notes?: string | null
          medical_notes?: string | null
          file_number?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          created_by?: string
          full_name?: string
          full_name_ar?: string | null
          gender?: GenderType | null
          date_of_birth?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          occupation?: string | null
          address?: string | null
          mobile?: string | null
          email?: string | null
          companion_name?: string | null
          companion_mobile?: string | null
          drug_allergies?: string | null
          current_medications?: string | null
          is_smoker?: boolean | null
          alcohol_consumption?: boolean | null
          has_heart_disease?: boolean | null
          has_diabetes?: boolean | null
          blood_pressure_notes?: string | null
          medical_notes?: string | null
          file_number?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      appointments: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          created_by: string
          appointment_date: string
          start_time: string
          end_time: string | null
          status: AppointmentStatus
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          created_by: string
          appointment_date: string
          start_time: string
          end_time?: string | null
          status?: AppointmentStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          dentist_id?: string
          created_by?: string
          appointment_date?: string
          start_time?: string
          end_time?: string | null
          status?: AppointmentStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      visits: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          appointment_id: string | null
          visit_date: string
          chief_complaint: string | null
          diagnosis: string | null
          treatment_performed: string | null
          prescription: string | null
          next_visit_date: string | null
          clinical_notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          appointment_id?: string | null
          visit_date?: string
          chief_complaint?: string | null
          diagnosis?: string | null
          treatment_performed?: string | null
          prescription?: string | null
          next_visit_date?: string | null
          clinical_notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          dentist_id?: string
          appointment_id?: string | null
          visit_date?: string
          chief_complaint?: string | null
          diagnosis?: string | null
          treatment_performed?: string | null
          prescription?: string | null
          next_visit_date?: string | null
          clinical_notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      dental_charts: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
      }

      tooth_records: {
        Row: {
          id: string
          chart_id: string
          clinic_id: string
          tooth_number: number
          tooth_name: string | null
          quadrant: number
          position: number
          condition: ToothCondition
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chart_id: string
          clinic_id: string
          tooth_number: number
          tooth_name?: string | null
          quadrant: number
          position: number
          condition?: ToothCondition
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chart_id?: string
          clinic_id?: string
          tooth_number?: number
          tooth_name?: string | null
          quadrant?: number
          position?: number
          condition?: ToothCondition
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      surface_records: {
        Row: {
          id: string
          tooth_record_id: string
          clinic_id: string
          surface: ToothSurface
          condition: ToothCondition
          treatment_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tooth_record_id: string
          clinic_id: string
          surface: ToothSurface
          condition?: ToothCondition
          treatment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tooth_record_id?: string
          clinic_id?: string
          surface?: ToothSurface
          condition?: ToothCondition
          treatment_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }

      treatment_plans: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          tooth_number: number | null
          surface: string | null
          diagnosis: string | null
          treatment_type: string
          description: string | null
          cost: number
          discount: number
          tax: number
          final_cost: number
          status: TreatmentStatus
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          dentist_id: string
          tooth_number?: number | null
          surface?: string | null
          diagnosis?: string | null
          treatment_type: string
          description?: string | null
          cost?: number
          discount?: number
          tax?: number
          status?: TreatmentStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          dentist_id?: string
          tooth_number?: number | null
          surface?: string | null
          diagnosis?: string | null
          treatment_type?: string
          description?: string | null
          cost?: number
          discount?: number
          tax?: number
          status?: TreatmentStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      invoices: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          created_by: string
          invoice_number: string
          invoice_date: string
          subtotal: number
          discount: number
          tax: number
          total: number
          paid_amount: number
          remaining_amount: number
          status: InvoiceStatus
          notes: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          created_by: string
          invoice_number: string
          invoice_date?: string
          subtotal?: number
          discount?: number
          tax?: number
          total?: number
          paid_amount?: number
          status?: InvoiceStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          created_by?: string
          invoice_number?: string
          invoice_date?: string
          subtotal?: number
          discount?: number
          tax?: number
          total?: number
          paid_amount?: number
          status?: InvoiceStatus
          notes?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }

      invoice_items: {
        Row: {
          id: string
          invoice_id: string
          clinic_id: string
          treatment_plan_id: string | null
          description: string
          quantity: number
          unit_price: number
          discount: number
          tax: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          clinic_id: string
          treatment_plan_id?: string | null
          description: string
          quantity?: number
          unit_price?: number
          discount?: number
          tax?: number
          total?: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          clinic_id?: string
          treatment_plan_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          discount?: number
          tax?: number
          total?: number
          created_at?: string
        }
      }

      payments: {
        Row: {
          id: string
          clinic_id: string
          invoice_id: string
          patient_id: string
          received_by: string
          amount: number
          payment_date: string
          payment_method: PaymentMethod
          notes: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          invoice_id: string
          patient_id: string
          received_by: string
          amount: number
          payment_date?: string
          payment_method?: PaymentMethod
          notes?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          invoice_id?: string
          patient_id?: string
          received_by?: string
          amount?: number
          payment_date?: string
          payment_method?: PaymentMethod
          notes?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }

      patient_images: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          visit_id: string | null
          tooth_number: number | null
          treatment_plan_id: string | null
          uploaded_by: string
          file_url: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          category: ImageCategory
          description: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          visit_id?: string | null
          tooth_number?: number | null
          treatment_plan_id?: string | null
          uploaded_by: string
          file_url: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          category: ImageCategory
          description?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          visit_id?: string | null
          tooth_number?: number | null
          treatment_plan_id?: string | null
          uploaded_by?: string
          file_url?: string
          file_name?: string
          file_size?: number | null
          mime_type?: string | null
          category?: ImageCategory
          description?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }

      consent_forms: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          treatment_plan_id: string | null
          document_url: string | null
          signature_url: string | null
          signed_at: string | null
          notes: string | null
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          treatment_plan_id?: string | null
          document_url?: string | null
          signature_url?: string | null
          signed_at?: string | null
          notes?: string | null
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          treatment_plan_id?: string | null
          document_url?: string | null
          signature_url?: string | null
          signed_at?: string | null
          notes?: string | null
          created_at?: string
          deleted_at?: string | null
        }
      }

      patient_timeline: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          user_id: string | null
          event_type: TimelineEventType
          title: string
          title_ar: string | null
          description: string | null
          description_ar: string | null
          metadata: Json
          reference_id: string | null
          reference_table: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          user_id?: string | null
          event_type: TimelineEventType
          title: string
          title_ar?: string | null
          description?: string | null
          description_ar?: string | null
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          user_id?: string | null
          event_type?: TimelineEventType
          title?: string
          title_ar?: string | null
          description?: string | null
          description_ar?: string | null
          metadata?: Json
          reference_id?: string | null
          reference_table?: string | null
          created_at?: string
        }
      }

      audit_logs: {
        Row: {
          id: string
          clinic_id: string | null
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id?: string | null
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string | null
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }

      treatment_catalog: {
        Row: {
          id: string
          clinic_id: string
          name: string
          name_ar: string | null
          category: string | null
          default_cost: number
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          name_ar?: string | null
          category?: string | null
          default_cost?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          name_ar?: string | null
          category?: string | null
          default_cost?: number
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
    }

    Views: {
      [_ in never]: never
    }

    Functions: {
      get_user_clinic_id: {
        Args: Record<string, never>
        Returns: string
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      generate_invoice_number: {
        Args: { p_clinic_id: string }
        Returns: string
      }
    }

    Enums: {
      user_role: UserRole
      appointment_status: AppointmentStatus
      treatment_status: TreatmentStatus
      invoice_status: InvoiceStatus
      payment_method: PaymentMethod
      image_category: ImageCategory
      subscription_status: SubscriptionStatus
      tooth_condition: ToothCondition
      gender_type: GenderType
      timeline_event_type: TimelineEventType
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
