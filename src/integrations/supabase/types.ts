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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      about_content: {
        Row: {
          created_at: string
          history_text: string | null
          history_title: string | null
          id: string
          image_url: string | null
          mission_text: string | null
          mission_title: string | null
          stats: Json | null
          subtitle: string | null
          title: string
          updated_at: string
          values_items: Json | null
          values_title: string | null
          vision_text: string | null
          vision_title: string | null
        }
        Insert: {
          created_at?: string
          history_text?: string | null
          history_title?: string | null
          id?: string
          image_url?: string | null
          mission_text?: string | null
          mission_title?: string | null
          stats?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          values_items?: Json | null
          values_title?: string | null
          vision_text?: string | null
          vision_title?: string | null
        }
        Update: {
          created_at?: string
          history_text?: string | null
          history_title?: string | null
          id?: string
          image_url?: string | null
          mission_text?: string | null
          mission_title?: string | null
          stats?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          values_items?: Json | null
          values_title?: string | null
          vision_text?: string | null
          vision_title?: string | null
        }
        Relationships: []
      }
      agent_leads: {
        Row: {
          agent_id: string
          commission_amount: number
          converted: boolean
          created_at: string
          id: string
          is_paid: boolean
          lead_id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_amount?: number
          converted?: boolean
          created_at?: string
          id?: string
          is_paid?: boolean
          lead_id: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_amount?: number
          converted?: boolean
          created_at?: string
          id?: string
          is_paid?: boolean
          lead_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_leads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          commission_rate: number
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_approved: boolean
          name: string
          pending_commission: number
          phone: string
          referral_link_code: string
          total_commission: number
          total_conversions: number
          total_leads: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          name: string
          pending_commission?: number
          phone: string
          referral_link_code: string
          total_commission?: number
          total_conversions?: number
          total_leads?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_approved?: boolean
          name?: string
          pending_commission?: number
          phone?: string
          referral_link_code?: string
          total_commission?: number
          total_conversions?: number
          total_leads?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      air_ticket_bookings: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          booking_id: string
          cabin_class: Database["public"]["Enums"]["cabin_class"] | null
          contact_email: string
          contact_phone: string
          country_code: string | null
          created_at: string
          from_city: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          is_round_trip: boolean | null
          passenger_count: number
          pnr_number: string | null
          price: number | null
          rejected_at: string | null
          rejected_by: string | null
          rejection_reason: string | null
          remarks: string | null
          return_date: string | null
          status: Database["public"]["Enums"]["air_ticket_status"]
          ticket_file_url: string | null
          ticket_number: string | null
          to_city: string
          travel_date: string
          trip_type: Database["public"]["Enums"]["trip_type"] | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          cabin_class?: Database["public"]["Enums"]["cabin_class"] | null
          contact_email: string
          contact_phone: string
          country_code?: string | null
          created_at?: string
          from_city: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_round_trip?: boolean | null
          passenger_count?: number
          pnr_number?: string | null
          price?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["air_ticket_status"]
          ticket_file_url?: string | null
          ticket_number?: string | null
          to_city: string
          travel_date: string
          trip_type?: Database["public"]["Enums"]["trip_type"] | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          booking_id?: string
          cabin_class?: Database["public"]["Enums"]["cabin_class"] | null
          contact_email?: string
          contact_phone?: string
          country_code?: string | null
          created_at?: string
          from_city?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          is_round_trip?: boolean | null
          passenger_count?: number
          pnr_number?: string | null
          price?: number | null
          rejected_at?: string | null
          rejected_by?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          return_date?: string | null
          status?: Database["public"]["Enums"]["air_ticket_status"]
          ticket_file_url?: string | null
          ticket_number?: string | null
          to_city?: string
          travel_date?: string
          trip_type?: Database["public"]["Enums"]["trip_type"] | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      air_ticket_passengers: {
        Row: {
          booking_id: string
          child_age: number | null
          created_at: string
          date_of_birth: string
          first_name: string
          frequent_flyer_number: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id: string
          is_child: boolean | null
          last_name: string
          nationality: string
          passport_expiry: string | null
          passport_number: string | null
          special_service_request: string | null
          updated_at: string
        }
        Insert: {
          booking_id: string
          child_age?: number | null
          created_at?: string
          date_of_birth: string
          first_name: string
          frequent_flyer_number?: string | null
          gender: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_child?: boolean | null
          last_name: string
          nationality?: string
          passport_expiry?: string | null
          passport_number?: string | null
          special_service_request?: string | null
          updated_at?: string
        }
        Update: {
          booking_id?: string
          child_age?: number | null
          created_at?: string
          date_of_birth?: string
          first_name?: string
          frequent_flyer_number?: string | null
          gender?: Database["public"]["Enums"]["gender_type"]
          id?: string
          is_child?: boolean | null
          last_name?: string
          nationality?: string
          passport_expiry?: string | null
          passport_number?: string | null
          special_service_request?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "air_ticket_passengers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "air_ticket_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      air_ticket_routes: {
        Row: {
          booking_id: string
          created_at: string | null
          from_city: string
          id: string
          route_order: number
          to_city: string
          travel_date: string
          updated_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          from_city: string
          id?: string
          route_order: number
          to_city: string
          travel_date: string
          updated_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          from_city?: string
          id?: string
          route_order?: number
          to_city?: string
          travel_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "air_ticket_routes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "air_ticket_bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      air_ticket_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audience_segments: {
        Row: {
          created_at: string
          criteria: Json
          id: string
          is_active: boolean
          lead_count: number
          lead_ids: string[]
          segment_name: string
          segment_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria?: Json
          id?: string
          is_active?: boolean
          lead_count?: number
          lead_ids?: string[]
          segment_name: string
          segment_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          id?: string
          is_active?: boolean
          lead_count?: number
          lead_ids?: string[]
          segment_name?: string
          segment_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      backup_history: {
        Row: {
          backup_name: string
          backup_type: string
          created_at: string
          created_by: string | null
          file_path: string
          file_size: number | null
          id: string
          notes: string | null
          record_counts: Json | null
          status: string
          tables_included: string[]
        }
        Insert: {
          backup_name: string
          backup_type?: string
          created_at?: string
          created_by?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          notes?: string | null
          record_counts?: Json | null
          status?: string
          tables_included?: string[]
        }
        Update: {
          backup_name?: string
          backup_type?: string
          created_at?: string
          created_by?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          notes?: string | null
          record_counts?: Json | null
          status?: string
          tables_included?: string[]
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          bank_name: string
          branch: string | null
          created_at: string
          current_balance: number
          id: string
          is_active: boolean
          opening_balance: number
          updated_at: string
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string
          bank_name: string
          branch?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          opening_balance?: number
          updated_at?: string
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          bank_name?: string
          branch?: string | null
          created_at?: string
          current_balance?: number
          id?: string
          is_active?: boolean
          opening_balance?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          published_at: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          published_at?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_documents: {
        Row: {
          booking_id: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          uploaded_at: string
          user_id: string
        }
        Insert: {
          booking_id: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          uploaded_at?: string
          user_id: string
        }
        Update: {
          booking_id?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          uploaded_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      booking_status_history: {
        Row: {
          booking_id: string
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["tracking_status"]
          notes: string | null
          previous_status: Database["public"]["Enums"]["tracking_status"] | null
        }
        Insert: {
          booking_id: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["tracking_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
        }
        Update: {
          booking_id?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["tracking_status"]
          notes?: string | null
          previous_status?:
            | Database["public"]["Enums"]["tracking_status"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          admin_notes: string | null
          bank_transaction_number: string | null
          bank_transfer_screenshot_url: string | null
          created_at: string
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          notes: string | null
          package_id: string
          passenger_count: number
          passenger_details: Json | null
          payment_method: string | null
          payment_status: string
          status: Database["public"]["Enums"]["booking_status"]
          total_price: number
          tracking_status: Database["public"]["Enums"]["tracking_status"]
          transaction_id: string | null
          travel_date: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bank_transaction_number?: string | null
          bank_transfer_screenshot_url?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          package_id: string
          passenger_count?: number
          passenger_details?: Json | null
          payment_method?: string | null
          payment_status?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price: number
          tracking_status?: Database["public"]["Enums"]["tracking_status"]
          transaction_id?: string | null
          travel_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bank_transaction_number?: string | null
          bank_transfer_screenshot_url?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          notes?: string | null
          package_id?: string
          passenger_count?: number
          passenger_details?: Json | null
          payment_method?: string | null
          payment_status?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_price?: number
          tracking_status?: Database["public"]["Enums"]["tracking_status"]
          transaction_id?: string | null
          travel_date?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      chart_of_accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          created_at: string
          current_balance: number
          description: string | null
          id: string
          is_active: boolean
          opening_balance: number
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          created_at?: string
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
          opening_balance?: number
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          created_at?: string
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
          opening_balance?: number
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chart_of_accounts_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_info: {
        Row: {
          created_at: string
          details: Json
          icon_name: string
          id: string
          is_active: boolean
          map_link: string | null
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json
          icon_name: string
          id?: string
          is_active?: boolean
          map_link?: string | null
          order_index?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json
          icon_name?: string
          id?: string
          is_active?: boolean
          map_link?: string | null
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      crm_lead_sequences: {
        Row: {
          created_at: string
          current_step: number
          id: string
          last_triggered_at: string | null
          lead_id: string
          next_trigger_at: string | null
          sequence_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          id?: string
          last_triggered_at?: string | null
          lead_id: string
          next_trigger_at?: string | null
          sequence_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_step?: number
          id?: string
          last_triggered_at?: string | null
          lead_id?: string
          next_trigger_at?: string | null
          sequence_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_sequences_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_sequences_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "crm_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sequence_steps: {
        Row: {
          created_at: string
          day_offset: number
          id: string
          is_active: boolean
          message_template: string
          sequence_id: string
          step_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_offset?: number
          id?: string
          is_active?: boolean
          message_template: string
          sequence_id: string
          step_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_offset?: number
          id?: string
          is_active?: boolean
          message_template?: string
          sequence_id?: string
          step_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "crm_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_sequences: {
        Row: {
          channel: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customer_documents: {
        Row: {
          customer_id: string
          document_type: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          notes: string | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          customer_id: string
          document_type: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          customer_id?: string
          document_type?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          notes?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          booking_id: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          gender: string | null
          id: string
          nationality: string | null
          notes: string | null
          passport_number: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          booking_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          gender?: string | null
          id?: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          booking_id?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      downloadable_resources: {
        Row: {
          created_at: string
          description: string | null
          download_count: number
          file_url: string
          id: string
          is_active: boolean
          resource_type: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_url: string
          id?: string
          is_active?: boolean
          resource_type: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          download_count?: number
          file_url?: string
          id?: string
          is_active?: boolean
          resource_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emi_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          emi_payment_id: string
          id: string
          installment_number: number
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date?: string | null
          emi_payment_id: string
          id?: string
          installment_number: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          emi_payment_id?: string
          id?: string
          installment_number?: number
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emi_installments_emi_payment_id_fkey"
            columns: ["emi_payment_id"]
            isOneToOne: false
            referencedRelation: "emi_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      emi_payments: {
        Row: {
          advance_amount: number
          booking_id: string
          created_at: string
          emi_amount: number
          id: string
          is_emi_plan: boolean
          number_of_emis: number
          paid_emis: number
          remaining_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          advance_amount?: number
          booking_id: string
          created_at?: string
          emi_amount: number
          id?: string
          is_emi_plan?: boolean
          number_of_emis: number
          paid_emis?: number
          remaining_amount: number
          total_amount: number
          updated_at?: string
        }
        Update: {
          advance_amount?: number
          booking_id?: string
          created_at?: string
          emi_amount?: number
          id?: string
          is_emi_plan?: boolean
          number_of_emis?: number
          paid_emis?: number
          remaining_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emi_payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_transactions: {
        Row: {
          account_id: string
          amount: number
          bank_account_id: string | null
          created_at: string
          created_by: string | null
          description: string
          expense_category: string
          id: string
          notes: string | null
          payment_method: string
          reference_number: string | null
          transaction_date: string
          updated_at: string
          vendor_supplier: string | null
        }
        Insert: {
          account_id: string
          amount: number
          bank_account_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          expense_category: string
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string
          vendor_supplier?: string | null
        }
        Update: {
          account_id?: string
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          expense_category?: string
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string
          vendor_supplier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expense_bank_fk"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          order_index: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          order_index?: number
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      footer_content: {
        Row: {
          address_label_1: string | null
          address_label_2: string | null
          company_description: string | null
          contact_address: string | null
          contact_address_2: string | null
          contact_email: string | null
          contact_email_2: string | null
          contact_phones: string[] | null
          copyright_text: string | null
          created_at: string
          id: string
          quick_links: Json | null
          services_links: Json | null
          social_links: Json | null
          updated_at: string
          video_blur: number | null
          video_enabled: boolean | null
          video_opacity: number | null
          video_overlay_color: string | null
          video_position: string | null
          video_scale: number | null
          video_speed: number | null
          video_url: string | null
        }
        Insert: {
          address_label_1?: string | null
          address_label_2?: string | null
          company_description?: string | null
          contact_address?: string | null
          contact_address_2?: string | null
          contact_email?: string | null
          contact_email_2?: string | null
          contact_phones?: string[] | null
          copyright_text?: string | null
          created_at?: string
          id?: string
          quick_links?: Json | null
          services_links?: Json | null
          social_links?: Json | null
          updated_at?: string
          video_blur?: number | null
          video_enabled?: boolean | null
          video_opacity?: number | null
          video_overlay_color?: string | null
          video_position?: string | null
          video_scale?: number | null
          video_speed?: number | null
          video_url?: string | null
        }
        Update: {
          address_label_1?: string | null
          address_label_2?: string | null
          company_description?: string | null
          contact_address?: string | null
          contact_address_2?: string | null
          contact_email?: string | null
          contact_email_2?: string | null
          contact_phones?: string[] | null
          copyright_text?: string | null
          created_at?: string
          id?: string
          quick_links?: Json | null
          services_links?: Json | null
          social_links?: Json | null
          updated_at?: string
          video_blur?: number | null
          video_enabled?: boolean | null
          video_opacity?: number | null
          video_overlay_color?: string | null
          video_position?: string | null
          video_scale?: number | null
          video_speed?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          caption: string | null
          category: string | null
          created_at: string
          id: string
          image_url: string
          is_active: boolean
          order_index: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          alt_text?: string
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url: string
          is_active?: boolean
          order_index?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          alt_text?: string
          caption?: string | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string
          is_active?: boolean
          order_index?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_settings: {
        Row: {
          autoplay_carousel: boolean | null
          autoplay_speed: number | null
          background_color: string | null
          columns_desktop: number | null
          columns_mobile: number | null
          columns_tablet: number | null
          created_at: string
          default_view: string | null
          hover_effect: string | null
          id: string
          image_aspect_ratio: string | null
          image_border_radius: string | null
          is_enabled: boolean
          lightbox_enabled: boolean | null
          overlay_color: string | null
          show_captions: boolean | null
          show_thumbnails: boolean | null
          subtitle: string | null
          subtitle_color: string | null
          title: string
          title_color: string | null
          updated_at: string
          video_blur: number | null
          video_enabled: boolean | null
          video_opacity: number | null
          video_speed: number | null
          video_url: string | null
        }
        Insert: {
          autoplay_carousel?: boolean | null
          autoplay_speed?: number | null
          background_color?: string | null
          columns_desktop?: number | null
          columns_mobile?: number | null
          columns_tablet?: number | null
          created_at?: string
          default_view?: string | null
          hover_effect?: string | null
          id?: string
          image_aspect_ratio?: string | null
          image_border_radius?: string | null
          is_enabled?: boolean
          lightbox_enabled?: boolean | null
          overlay_color?: string | null
          show_captions?: boolean | null
          show_thumbnails?: boolean | null
          subtitle?: string | null
          subtitle_color?: string | null
          title?: string
          title_color?: string | null
          updated_at?: string
          video_blur?: number | null
          video_enabled?: boolean | null
          video_opacity?: number | null
          video_speed?: number | null
          video_url?: string | null
        }
        Update: {
          autoplay_carousel?: boolean | null
          autoplay_speed?: number | null
          background_color?: string | null
          columns_desktop?: number | null
          columns_mobile?: number | null
          columns_tablet?: number | null
          created_at?: string
          default_view?: string | null
          hover_effect?: string | null
          id?: string
          image_aspect_ratio?: string | null
          image_border_radius?: string | null
          is_enabled?: boolean
          lightbox_enabled?: boolean | null
          overlay_color?: string | null
          show_captions?: boolean | null
          show_thumbnails?: boolean | null
          subtitle?: string | null
          subtitle_color?: string | null
          title?: string
          title_color?: string | null
          updated_at?: string
          video_blur?: number | null
          video_enabled?: boolean | null
          video_opacity?: number | null
          video_speed?: number | null
          video_url?: string | null
        }
        Relationships: []
      }
      gallery_videos: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      general_ledger: {
        Row: {
          account_id: string
          created_at: string
          created_by: string | null
          credit: number
          debit: number
          description: string
          id: string
          reference_id: string | null
          reference_type: string | null
          running_balance: number
          transaction_date: string
          transaction_type: string
        }
        Insert: {
          account_id: string
          created_at?: string
          created_by?: string | null
          credit?: number
          debit?: number
          description: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          running_balance?: number
          transaction_date?: string
          transaction_type: string
        }
        Update: {
          account_id?: string
          created_at?: string
          created_by?: string | null
          credit?: number
          debit?: number
          description?: string
          id?: string
          reference_id?: string | null
          reference_type?: string | null
          running_balance?: number
          transaction_date?: string
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "general_ledger_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      group_inquiries: {
        Row: {
          assigned_to: string | null
          budget: string | null
          contact_email: string | null
          contact_name: string
          contact_phone: string
          created_at: string
          group_discount: number | null
          group_name: string
          id: string
          lead_status: string
          notes: string | null
          preferred_package_id: string | null
          special_requirements: string | null
          travel_date: string | null
          traveler_count: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          budget?: string | null
          contact_email?: string | null
          contact_name: string
          contact_phone: string
          created_at?: string
          group_discount?: number | null
          group_name: string
          id?: string
          lead_status?: string
          notes?: string | null
          preferred_package_id?: string | null
          special_requirements?: string | null
          travel_date?: string | null
          traveler_count?: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          budget?: string | null
          contact_email?: string | null
          contact_name?: string
          contact_phone?: string
          created_at?: string
          group_discount?: number | null
          group_name?: string
          id?: string
          lead_status?: string
          notes?: string | null
          preferred_package_id?: string | null
          special_requirements?: string | null
          travel_date?: string | null
          traveler_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_inquiries_preferred_package_id_fkey"
            columns: ["preferred_package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_content: {
        Row: {
          background_image_url: string | null
          badge_text: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          order_index: number
          primary_button_link: string | null
          primary_button_text: string | null
          secondary_button_link: string | null
          secondary_button_text: string | null
          slide_type: string
          stats: Json | null
          subtitle: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          background_image_url?: string | null
          badge_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          primary_button_link?: string | null
          primary_button_text?: string | null
          secondary_button_link?: string | null
          secondary_button_text?: string | null
          slide_type?: string
          stats?: Json | null
          subtitle?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          background_image_url?: string | null
          badge_text?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          order_index?: number
          primary_button_link?: string | null
          primary_button_text?: string | null
          secondary_button_link?: string | null
          secondary_button_text?: string | null
          slide_type?: string
          stats?: Json | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      hero_service_tiles: {
        Row: {
          bg_class: string | null
          color_class: string | null
          created_at: string
          href: string
          icon: string
          id: string
          image_url: string | null
          is_active: boolean
          order_index: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bg_class?: string | null
          color_class?: string | null
          created_at?: string
          href?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bg_class?: string | null
          color_class?: string | null
          created_at?: string
          href?: string
          icon?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hotel_booking_requests: {
        Row: {
          admin_notes: string | null
          adult_count: number | null
          check_in_date: string
          check_out_date: string
          child_count: number | null
          country_code: string | null
          created_at: string
          guest_email: string | null
          guest_name: string
          guest_phone: string
          hotel_id: string | null
          id: string
          request_id: string
          room_category: string | null
          room_count: number | null
          special_requests: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          adult_count?: number | null
          check_in_date: string
          check_out_date: string
          child_count?: number | null
          country_code?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name: string
          guest_phone: string
          hotel_id?: string | null
          id?: string
          request_id: string
          room_category?: string | null
          room_count?: number | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          adult_count?: number | null
          check_in_date?: string
          check_out_date?: string
          child_count?: number | null
          country_code?: string | null
          created_at?: string
          guest_email?: string | null
          guest_name?: string
          guest_phone?: string
          hotel_id?: string | null
          id?: string
          request_id?: string
          room_category?: string | null
          room_count?: number | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotel_booking_requests_hotel_id_fkey"
            columns: ["hotel_id"]
            isOneToOne: false
            referencedRelation: "hotels"
            referencedColumns: ["id"]
          },
        ]
      }
      hotel_section_settings: {
        Row: {
          booking_enabled: boolean | null
          created_at: string
          hotels_per_page: number | null
          id: string
          is_enabled: boolean | null
          section_key: string
          show_details_button: boolean | null
          show_map_button: boolean | null
          sort_by: string | null
          sort_order: string | null
          star_label: string | null
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          booking_enabled?: boolean | null
          created_at?: string
          hotels_per_page?: number | null
          id?: string
          is_enabled?: boolean | null
          section_key: string
          show_details_button?: boolean | null
          show_map_button?: boolean | null
          sort_by?: string | null
          sort_order?: string | null
          star_label?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          booking_enabled?: boolean | null
          created_at?: string
          hotels_per_page?: number | null
          id?: string
          is_enabled?: boolean | null
          section_key?: string
          show_details_button?: boolean | null
          show_map_button?: boolean | null
          sort_by?: string | null
          sort_order?: string | null
          star_label?: string | null
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      hotels: {
        Row: {
          city: string
          contact_email: string | null
          contact_phone: string | null
          country: string | null
          created_at: string
          description: string | null
          details: string[] | null
          distance_from_haram: number
          facilities: string[] | null
          google_map_embed_url: string | null
          google_map_link: string | null
          id: string
          images: string[] | null
          is_active: boolean | null
          name: string
          order_index: number | null
          price_per_night: number | null
          star_rating: number
          updated_at: string
        }
        Insert: {
          city: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          details?: string[] | null
          distance_from_haram: number
          facilities?: string[] | null
          google_map_embed_url?: string | null
          google_map_link?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name: string
          order_index?: number | null
          price_per_night?: number | null
          star_rating: number
          updated_at?: string
        }
        Update: {
          city?: string
          contact_email?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string
          description?: string | null
          details?: string[] | null
          distance_from_haram?: number
          facilities?: string[] | null
          google_map_embed_url?: string | null
          google_map_link?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          price_per_night?: number | null
          star_rating?: number
          updated_at?: string
        }
        Relationships: []
      }
      income_transactions: {
        Row: {
          account_id: string
          amount: number
          bank_account_id: string | null
          booking_id: string | null
          created_at: string
          created_by: string | null
          customer_name: string | null
          description: string
          id: string
          notes: string | null
          payment_method: string
          reference_number: string | null
          transaction_date: string
          updated_at: string
        }
        Insert: {
          account_id: string
          amount: number
          bank_account_id?: string | null
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          description: string
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          amount?: number
          bank_account_id?: string | null
          booking_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string
          reference_number?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_bank_fk"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "chart_of_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          budget_range: string | null
          created_at: string
          device_type: string | null
          email: string | null
          fbclid: string | null
          group_size: number | null
          id: string
          ip_address: string | null
          lead_score: number | null
          lead_status: string | null
          message: string | null
          name: string
          original_event_id: string | null
          package_id: string | null
          passport_ready: boolean | null
          payment_value: number | null
          phone: string
          travel_month: string | null
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          budget_range?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          fbclid?: string | null
          group_size?: number | null
          id?: string
          ip_address?: string | null
          lead_score?: number | null
          lead_status?: string | null
          message?: string | null
          name: string
          original_event_id?: string | null
          package_id?: string | null
          passport_ready?: boolean | null
          payment_value?: number | null
          phone: string
          travel_month?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          budget_range?: string | null
          created_at?: string
          device_type?: string | null
          email?: string | null
          fbclid?: string | null
          group_size?: number | null
          id?: string
          ip_address?: string | null
          lead_score?: number | null
          lead_status?: string | null
          message?: string | null
          name?: string
          original_event_id?: string | null
          package_id?: string | null
          passport_ready?: boolean | null
          payment_value?: number | null
          phone?: string
          travel_month?: string | null
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_pages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          page_key: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_key: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          page_key?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_event_logs: {
        Row: {
          booking_id: string | null
          created_at: string
          error_message: string | null
          event_id: string
          event_type: string
          id: string
          lead_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          event_id: string
          event_type: string
          id?: string
          lead_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          event_id?: string
          event_type?: string
          id?: string
          lead_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_event_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "marketing_event_logs_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          href: string
          id: string
          is_active: boolean
          label: string
          order_index: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          label: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          label?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      notices: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          content: string | null
          created_at: string
          end_date: string | null
          external_link: string | null
          external_link_text: string | null
          id: string
          is_active: boolean
          is_pinned: boolean
          notice_type: string
          order_index: number
          priority: string
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          end_date?: string | null
          external_link?: string | null
          external_link_text?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          notice_type?: string
          order_index?: number
          priority?: string
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          content?: string | null
          created_at?: string
          end_date?: string | null
          external_link?: string | null
          external_link_text?: string | null
          id?: string
          is_active?: boolean
          is_pinned?: boolean
          notice_type?: string
          order_index?: number
          priority?: string
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          booking_id: string | null
          booking_type: string | null
          created_at: string
          error_message: string | null
          id: string
          last_retry_at: string | null
          message_content: string | null
          notification_type: string
          recipient: string
          retry_count: number | null
          status: string
        }
        Insert: {
          booking_id?: string | null
          booking_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          message_content?: string | null
          notification_type: string
          recipient: string
          retry_count?: number | null
          status: string
        }
        Update: {
          booking_id?: string | null
          booking_type?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          last_retry_at?: string | null
          message_content?: string | null
          notification_type?: string
          recipient?: string
          retry_count?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          config: Json
          created_at: string
          id: string
          is_enabled: boolean
          setting_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          created_at?: string
          id?: string
          is_enabled?: boolean
          setting_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          created_at: string
          email_subject: string | null
          email_template: string | null
          id: string
          is_active: boolean | null
          sms_template: string | null
          template_key: string
          template_name: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          created_at?: string
          email_subject?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          sms_template?: string | null
          template_key: string
          template_name: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          created_at?: string
          email_subject?: string | null
          email_template?: string | null
          id?: string
          is_active?: boolean | null
          sms_template?: string | null
          template_key?: string
          template_name?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      office_locations: {
        Row: {
          address: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          map_embed_url: string | null
          map_query: string | null
          name: string
          order_index: number
          phones: string[]
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          map_embed_url?: string | null
          map_query?: string | null
          name: string
          order_index?: number
          phones?: string[]
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          map_embed_url?: string | null
          map_query?: string | null
          name?: string
          order_index?: number
          phones?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      packages: {
        Row: {
          category: string | null
          countdown_end_date: string | null
          created_at: string
          description: string | null
          duration_days: number
          exclusions: string[] | null
          flight_type: string | null
          full_description: string | null
          hotel_image_url: string | null
          hotel_images: string[] | null
          hotel_map_link: string | null
          hotel_rating: number | null
          hotel_type: string | null
          id: string
          image_url: string | null
          includes: string[] | null
          installment_enabled: boolean | null
          is_active: boolean
          is_featured: boolean | null
          max_installment_months: number | null
          min_down_payment_percent: number | null
          order_index: number
          pdf_url: string | null
          price: number
          show_book_now: boolean | null
          show_view_details: boolean | null
          special_notes: string | null
          stock: number
          tenant_id: string | null
          title: string
          transport_type: string | null
          type: Database["public"]["Enums"]["package_type"]
          updated_at: string
          weekly_bookings: number | null
        }
        Insert: {
          category?: string | null
          countdown_end_date?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          exclusions?: string[] | null
          flight_type?: string | null
          full_description?: string | null
          hotel_image_url?: string | null
          hotel_images?: string[] | null
          hotel_map_link?: string | null
          hotel_rating?: number | null
          hotel_type?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          installment_enabled?: boolean | null
          is_active?: boolean
          is_featured?: boolean | null
          max_installment_months?: number | null
          min_down_payment_percent?: number | null
          order_index?: number
          pdf_url?: string | null
          price: number
          show_book_now?: boolean | null
          show_view_details?: boolean | null
          special_notes?: string | null
          stock?: number
          tenant_id?: string | null
          title: string
          transport_type?: string | null
          type: Database["public"]["Enums"]["package_type"]
          updated_at?: string
          weekly_bookings?: number | null
        }
        Update: {
          category?: string | null
          countdown_end_date?: string | null
          created_at?: string
          description?: string | null
          duration_days?: number
          exclusions?: string[] | null
          flight_type?: string | null
          full_description?: string | null
          hotel_image_url?: string | null
          hotel_images?: string[] | null
          hotel_map_link?: string | null
          hotel_rating?: number | null
          hotel_type?: string | null
          id?: string
          image_url?: string | null
          includes?: string[] | null
          installment_enabled?: boolean | null
          is_active?: boolean
          is_featured?: boolean | null
          max_installment_months?: number | null
          min_down_payment_percent?: number | null
          order_index?: number
          pdf_url?: string | null
          price?: number
          show_book_now?: boolean | null
          show_view_details?: boolean | null
          special_notes?: string | null
          stock?: number
          tenant_id?: string | null
          title?: string
          transport_type?: string | null
          type?: Database["public"]["Enums"]["package_type"]
          updated_at?: string
          weekly_bookings?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "packages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      page_visits: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          device_type: string | null
          duration_seconds: number | null
          id: string
          ip_address: string | null
          is_new_visitor: boolean | null
          language: string | null
          os: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          referrer_source: string | null
          region: string | null
          screen_resolution: string | null
          session_id: string | null
          timezone: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          viewport_size: string | null
          visitor_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          is_new_visitor?: boolean | null
          language?: string | null
          os?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          referrer_source?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_size?: string | null
          visitor_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          device_type?: string | null
          duration_seconds?: number | null
          id?: string
          ip_address?: string | null
          is_new_visitor?: boolean | null
          language?: string | null
          os?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          referrer_source?: string | null
          region?: string | null
          screen_resolution?: string | null
          session_id?: string | null
          timezone?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          viewport_size?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          action: string
          booking_id: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          gateway: string
          id: string
          request_data: Json | null
          response_data: Json | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          action: string
          booking_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          gateway: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          action?: string
          booking_id?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          gateway?: string
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          credentials: Json
          description: string | null
          icon_name: string
          id: string
          is_enabled: boolean
          is_live_mode: boolean
          name: string
          order_index: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credentials?: Json
          description?: string | null
          icon_name?: string
          id?: string
          is_enabled?: boolean
          is_live_mode?: boolean
          name: string
          order_index?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          description?: string | null
          icon_name?: string
          id?: string
          is_enabled?: boolean
          is_live_mode?: boolean
          name?: string
          order_index?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          is_paid: boolean
          lead_id: string | null
          reward_amount: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          is_paid?: boolean
          lead_id?: string | null
          reward_amount?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          is_paid?: boolean
          lead_id?: string | null
          reward_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_conversions: {
        Row: {
          conversion_value: number
          created_at: string
          id: string
          referral_code_id: string
          referred_booking_id: string | null
          status: string
        }
        Insert: {
          conversion_value?: number
          created_at?: string
          id?: string
          referral_code_id: string
          referred_booking_id?: string | null
          status?: string
        }
        Update: {
          conversion_value?: number
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_booking_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_conversions_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_conversions_referred_booking_id_fkey"
            columns: ["referred_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_downloads: {
        Row: {
          downloaded_at: string
          id: string
          lead_id: string | null
          resource_id: string
          source: string | null
        }
        Insert: {
          downloaded_at?: string
          id?: string
          lead_id?: string | null
          resource_id: string
          source?: string | null
        }
        Update: {
          downloaded_at?: string
          id?: string
          lead_id?: string | null
          resource_id?: string
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_downloads_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_downloads_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "downloadable_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      restore_history: {
        Row: {
          backup_id: string | null
          id: string
          notes: string | null
          restore_type: string
          restored_at: string
          restored_by: string | null
          status: string
          tables_restored: string[]
        }
        Insert: {
          backup_id?: string | null
          id?: string
          notes?: string | null
          restore_type?: string
          restored_at?: string
          restored_by?: string | null
          status?: string
          tables_restored?: string[]
        }
        Update: {
          backup_id?: string | null
          id?: string
          notes?: string | null
          restore_type?: string
          restored_at?: string
          restored_by?: string | null
          status?: string
          tables_restored?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "restore_history_backup_id_fkey"
            columns: ["backup_id"]
            isOneToOne: false
            referencedRelation: "backup_history"
            referencedColumns: ["id"]
          },
        ]
      }
      section_settings: {
        Row: {
          badge_text: string | null
          bg_color: string | null
          created_at: string
          custom_css: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          order_index: number | null
          section_key: string
          stats: Json | null
          subtitle: string | null
          success_rate: string | null
          text_color: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          bg_color?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number | null
          section_key: string
          stats?: Json | null
          subtitle?: string | null
          success_rate?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          bg_color?: string | null
          created_at?: string
          custom_css?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          order_index?: number | null
          section_key?: string
          stats?: Json | null
          subtitle?: string | null
          success_rate?: string | null
          text_color?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          icon_name: string
          id: string
          is_active: boolean
          link_url: string | null
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_name: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          link_url?: string | null
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          setting_key: string
          setting_value?: Json
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
        }
        Relationships: []
      }
      social_networks: {
        Row: {
          created_at: string
          icon_name: string
          id: string
          is_active: boolean
          order_index: number
          platform_name: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          order_index?: number
          platform_name: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon_name?: string
          id?: string
          is_active?: boolean
          order_index?: number
          platform_name?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      staff_activity_log: {
        Row: {
          action_description: string
          action_type: string
          booking_ref: string | null
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
          staff_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_description: string
          action_type: string
          booking_ref?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          staff_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_description?: string
          action_type?: string
          booking_ref?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
          staff_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_activity_log_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_members: {
        Row: {
          address: string | null
          created_at: string
          department: string | null
          employee_id: string | null
          hire_date: string | null
          id: string
          is_active: boolean
          mobile_number: string | null
          permissions: Json | null
          phone: string | null
          role: Database["public"]["Enums"]["staff_role"]
          staff_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          mobile_number?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          staff_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          department?: string | null
          employee_id?: string | null
          hire_date?: string | null
          id?: string
          is_active?: boolean
          mobile_number?: string | null
          permissions?: Json | null
          phone?: string | null
          role?: Database["public"]["Enums"]["staff_role"]
          staff_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_members_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          avatar_url: string | null
          board_type: string
          created_at: string
          id: string
          imo_number: string | null
          is_active: boolean
          name: string
          order_index: number
          qualifications: string | null
          role: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          avatar_url?: string | null
          board_type?: string
          created_at?: string
          id?: string
          imo_number?: string | null
          is_active?: boolean
          name: string
          order_index?: number
          qualifications?: string | null
          role: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          avatar_url?: string | null
          board_type?: string
          created_at?: string
          id?: string
          imo_number?: string | null
          is_active?: boolean
          name?: string
          order_index?: number
          qualifications?: string | null
          role?: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      tenants: {
        Row: {
          created_at: string
          domain: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      terminal_content: {
        Row: {
          bg_color: string | null
          created_at: string
          font_size: string | null
          id: string
          is_enabled: boolean | null
          order_index: number | null
          terminal_text: string | null
          text_color: string | null
          title: string | null
          typing_animation: boolean | null
          updated_at: string
        }
        Insert: {
          bg_color?: string | null
          created_at?: string
          font_size?: string | null
          id?: string
          is_enabled?: boolean | null
          order_index?: number | null
          terminal_text?: string | null
          text_color?: string | null
          title?: string | null
          typing_animation?: boolean | null
          updated_at?: string
        }
        Update: {
          bg_color?: string | null
          created_at?: string
          font_size?: string | null
          id?: string
          is_enabled?: boolean | null
          order_index?: number | null
          terminal_text?: string | null
          text_color?: string | null
          title?: string | null
          typing_animation?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_location: string | null
          id: string
          is_active: boolean
          is_featured: boolean | null
          is_video: boolean | null
          location: string | null
          name: string
          order_index: number
          package_name: string | null
          quote: string
          rating: number
          updated_at: string
          video_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_location?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          is_video?: boolean | null
          location?: string | null
          name: string
          order_index?: number
          package_name?: string | null
          quote: string
          rating?: number
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_location?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean | null
          is_video?: boolean | null
          location?: string | null
          name?: string
          order_index?: number
          package_name?: string | null
          quote?: string
          rating?: number
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      theme_settings: {
        Row: {
          accent_color: string | null
          background_color: string | null
          border_radius: string | null
          created_at: string
          dark_mode_enabled: boolean | null
          font_family: string | null
          heading_font: string | null
          id: string
          primary_color: string | null
          secondary_color: string | null
          text_color: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          background_color?: string | null
          border_radius?: string | null
          created_at?: string
          dark_mode_enabled?: boolean | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          background_color?: string | null
          border_radius?: string | null
          created_at?: string
          dark_mode_enabled?: boolean | null
          font_family?: string | null
          heading_font?: string | null
          id?: string
          primary_color?: string | null
          secondary_color?: string | null
          text_color?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          currency: string
          emi_installment_id: string | null
          error_message: string | null
          gateway_name: string
          gateway_transaction_id: string | null
          id: string
          ip_address: string | null
          is_live_mode: boolean
          payment_method: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_agent: string | null
          verified_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          emi_installment_id?: string | null
          error_message?: string | null
          gateway_name: string
          gateway_transaction_id?: string | null
          id?: string
          ip_address?: string | null
          is_live_mode?: boolean
          payment_method: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_agent?: string | null
          verified_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          currency?: string
          emi_installment_id?: string | null
          error_message?: string | null
          gateway_name?: string
          gateway_transaction_id?: string | null
          id?: string
          ip_address?: string | null
          is_live_mode?: boolean
          payment_method?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_agent?: string | null
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_emi_installment_id_fkey"
            columns: ["emi_installment_id"]
            isOneToOne: false
            referencedRelation: "emi_installments"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          key: string
          language_code: string
          section: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          language_code: string
          section: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          language_code?: string
          section?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      visa_applications: {
        Row: {
          admin_notes: string | null
          applicant_count: number
          applicant_email: string | null
          applicant_name: string
          applicant_phone: string
          bank_transaction_number: string | null
          bank_transfer_screenshot_url: string | null
          created_at: string
          date_of_birth: string | null
          id: string
          nationality: string | null
          notes: string | null
          passport_number: string | null
          payment_method: string | null
          payment_status: string
          status: string
          total_price: number
          transaction_id: string | null
          travel_date: string | null
          updated_at: string
          user_id: string | null
          visa_country_id: string
        }
        Insert: {
          admin_notes?: string | null
          applicant_count?: number
          applicant_email?: string | null
          applicant_name: string
          applicant_phone: string
          bank_transaction_number?: string | null
          bank_transfer_screenshot_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          total_price: number
          transaction_id?: string | null
          travel_date?: string | null
          updated_at?: string
          user_id?: string | null
          visa_country_id: string
        }
        Update: {
          admin_notes?: string | null
          applicant_count?: number
          applicant_email?: string | null
          applicant_name?: string
          applicant_phone?: string
          bank_transaction_number?: string | null
          bank_transfer_screenshot_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          id?: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          payment_method?: string | null
          payment_status?: string
          status?: string
          total_price?: number
          transaction_id?: string | null
          travel_date?: string | null
          updated_at?: string
          user_id?: string | null
          visa_country_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visa_applications_visa_country_id_fkey"
            columns: ["visa_country_id"]
            isOneToOne: false
            referencedRelation: "visa_countries"
            referencedColumns: ["id"]
          },
        ]
      }
      visa_countries: {
        Row: {
          country_name: string
          created_at: string
          description: string | null
          documents_needed: string[] | null
          flag_emoji: string
          id: string
          is_active: boolean
          is_featured: boolean
          order_index: number
          price: number
          processing_time: string
          requirements: string[] | null
          updated_at: string
          validity_period: string | null
        }
        Insert: {
          country_name: string
          created_at?: string
          description?: string | null
          documents_needed?: string[] | null
          flag_emoji: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          price: number
          processing_time: string
          requirements?: string[] | null
          updated_at?: string
          validity_period?: string | null
        }
        Update: {
          country_name?: string
          created_at?: string
          description?: string | null
          documents_needed?: string[] | null
          flag_emoji?: string
          id?: string
          is_active?: boolean
          is_featured?: boolean
          order_index?: number
          price?: number
          processing_time?: string
          requirements?: string[] | null
          updated_at?: string
          validity_period?: string | null
        }
        Relationships: []
      }
      webinar_registrations: {
        Row: {
          email: string | null
          id: string
          name: string
          phone: string
          preferred_session: string | null
          registered_at: string
          webinar_id: string
        }
        Insert: {
          email?: string | null
          id?: string
          name: string
          phone: string
          preferred_session?: string | null
          registered_at?: string
          webinar_id: string
        }
        Update: {
          email?: string | null
          id?: string
          name?: string
          phone?: string
          preferred_session?: string | null
          registered_at?: string
          webinar_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webinar_registrations_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_capacity: number
          registration_count: number
          session_date: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_capacity?: number
          registration_count?: number
          session_date: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_capacity?: number
          registration_count?: number
          session_date?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_financial_summary: { Args: never; Returns: Json }
      get_payment_asset_account: {
        Args: { p_payment_method: string }
        Returns: string
      }
      get_public_payment_methods: {
        Args: never
        Returns: {
          description: string
          icon_name: string
          id: string
          is_enabled: boolean
          name: string
          order_index: number
          slug: string
        }[]
      }
      get_staff_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["staff_role"]
      }
      has_staff_role: {
        Args: {
          _role: Database["public"]["Enums"]["staff_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_or_viewer: { Args: never; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      recalculate_account_balances: { Args: never; Returns: undefined }
    }
    Enums: {
      air_ticket_status: "pending" | "confirmed" | "rejected" | "cancelled"
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      cabin_class: "economy" | "premium_economy" | "business" | "first"
      gender_type: "male" | "female" | "other"
      package_type: "hajj" | "umrah"
      staff_role: "admin" | "manager" | "agent" | "support"
      tracking_status:
        | "order_submitted"
        | "documents_received"
        | "under_review"
        | "approved"
        | "processing"
        | "completed"
      trip_type: "one_way" | "round_trip" | "multi_city"
      user_role: "customer" | "admin" | "viewer"
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
    Enums: {
      air_ticket_status: ["pending", "confirmed", "rejected", "cancelled"],
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      cabin_class: ["economy", "premium_economy", "business", "first"],
      gender_type: ["male", "female", "other"],
      package_type: ["hajj", "umrah"],
      staff_role: ["admin", "manager", "agent", "support"],
      tracking_status: [
        "order_submitted",
        "documents_received",
        "under_review",
        "approved",
        "processing",
        "completed",
      ],
      trip_type: ["one_way", "round_trip", "multi_city"],
      user_role: ["customer", "admin", "viewer"],
    },
  },
} as const
