export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: {
          criado_em: string
          id: string
          senha: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          senha: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          senha?: string
          user_id?: string | null
        }
        Relationships: []
      }
      discord_bot_tokens: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          token: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          token: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          token?: string
        }
        Relationships: []
      }
      discord_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "discord_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "discord_user_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      discord_user_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          leader_id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          leader_id?: string
          name?: string
        }
        Relationships: []
      }
      discord_user_lists: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      discord_users: {
        Row: {
          created_at: string
          discord_id: string
          id: string
          is_online: boolean | null
          last_active: string | null
          list_id: string
          role: string | null
          role_id: string | null
          username: string
        }
        Insert: {
          created_at?: string
          discord_id: string
          id?: string
          is_online?: boolean | null
          last_active?: string | null
          list_id: string
          role?: string | null
          role_id?: string | null
          username: string
        }
        Update: {
          created_at?: string
          discord_id?: string
          id?: string
          is_online?: boolean | null
          last_active?: string | null
          list_id?: string
          role?: string | null
          role_id?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "discord_users_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "discord_user_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      super_users: {
        Row: {
          criado_em: string
          id: string
          senha: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          senha: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          senha?: string
          user_id?: string | null
        }
        Relationships: []
      }
      temporary_passwords: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string
          id: string
          password: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at: string
          id?: string
          password: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string
          id?: string
          password?: string
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          criado_em: string
          id: string
          senha: string
          user_id: string | null
        }
        Insert: {
          criado_em?: string
          id?: string
          senha: string
          user_id?: string | null
        }
        Update: {
          criado_em?: string
          id?: string
          senha?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
