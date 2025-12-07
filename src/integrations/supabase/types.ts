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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cognitive_metrics: {
        Row: {
          access_frequency: number | null
          block_id: string
          calculated_at: string
          decay_rate: number | null
          id: string
          importance_score: number | null
          recency_score: number | null
        }
        Insert: {
          access_frequency?: number | null
          block_id: string
          calculated_at?: string
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          recency_score?: number | null
        }
        Update: {
          access_frequency?: number | null
          block_id?: string
          calculated_at?: string
          decay_rate?: number | null
          id?: string
          importance_score?: number | null
          recency_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cognitive_metrics_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "memory_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_devices: {
        Row: {
          created_at: string | null
          device_name: string
          device_type: string
          id: string
          is_active: boolean | null
          last_toggled_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_name: string
          device_type: string
          id?: string
          is_active?: boolean | null
          last_toggled_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_name?: string
          device_type?: string
          id?: string
          is_active?: boolean | null
          last_toggled_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      memory_blocks: {
        Row: {
          block_index: number
          cognitive_weight: number | null
          created_at: string
          created_by: string | null
          data: Json
          hash: string
          id: string
          nonce: number
          previous_hash: string
          state: Database["public"]["Enums"]["memory_state"]
          timestamp: string
          validator_address: string | null
        }
        Insert: {
          block_index: number
          cognitive_weight?: number | null
          created_at?: string
          created_by?: string | null
          data: Json
          hash: string
          id?: string
          nonce: number
          previous_hash: string
          state?: Database["public"]["Enums"]["memory_state"]
          timestamp?: string
          validator_address?: string | null
        }
        Update: {
          block_index?: number
          cognitive_weight?: number | null
          created_at?: string
          created_by?: string | null
          data?: Json
          hash?: string
          id?: string
          nonce?: number
          previous_hash?: string
          state?: Database["public"]["Enums"]["memory_state"]
          timestamp?: string
          validator_address?: string | null
        }
        Relationships: []
      }
      memory_nodes: {
        Row: {
          access_count: number | null
          archived_at: string | null
          block_id: string
          cognitive_score: number | null
          created_at: string
          deleted_at: string | null
          id: string
          last_accessed: string | null
          metadata: Json | null
          node_address: string
          state: Database["public"]["Enums"]["memory_state"]
          updated_at: string
        }
        Insert: {
          access_count?: number | null
          archived_at?: string | null
          block_id: string
          cognitive_score?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          node_address: string
          state?: Database["public"]["Enums"]["memory_state"]
          updated_at?: string
        }
        Update: {
          access_count?: number | null
          archived_at?: string | null
          block_id?: string
          cognitive_score?: number | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          node_address?: string
          state?: Database["public"]["Enums"]["memory_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memory_nodes_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "memory_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          created_at: string | null
          humidity: number | null
          id: string
          light_level: number | null
          recorded_at: string | null
          soil_moisture: number | null
          temperature: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          humidity?: number | null
          id?: string
          light_level?: number | null
          recorded_at?: string | null
          soil_moisture?: number | null
          temperature?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          humidity?: number | null
          id?: string
          light_level?: number | null
          recorded_at?: string | null
          soil_moisture?: number | null
          temperature?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          block_id: string | null
          created_at: string
          from_address: string
          gas_used: number | null
          id: string
          status: string
          to_address: string
          transaction_hash: string
        }
        Insert: {
          amount: number
          block_id?: string | null
          created_at?: string
          from_address: string
          gas_used?: number | null
          id?: string
          status?: string
          to_address: string
          transaction_hash: string
        }
        Update: {
          amount?: number
          block_id?: string | null
          created_at?: string
          from_address?: string
          gas_used?: number | null
          id?: string
          status?: string
          to_address?: string
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "memory_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_memory_node: { Args: { node_id: string }; Returns: undefined }
      forget_memory_node: { Args: { node_id: string }; Returns: undefined }
      generate_sample_sensor_reading: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      initialize_default_iot_devices: {
        Args: { user_uuid: string }
        Returns: undefined
      }
      promote_memory_node: { Args: { node_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "user" | "validator"
      memory_state: "active" | "archived" | "dead"
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
      app_role: ["admin", "user", "validator"],
      memory_state: ["active", "archived", "dead"],
    },
  },
} as const
