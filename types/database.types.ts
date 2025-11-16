// types/database.types.ts (simplified, UTF-8 clean)
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      trips: {
        Row: { id: string; title: string | null; start_date: string | null; end_date: string | null; updated_at?: string | null }
        Insert: { id?: string; title?: string | null; start_date?: string | null; end_date?: string | null }
        Update: { id?: string; title?: string | null; start_date?: string | null; end_date?: string | null }
        Relationships: []
      }
      trip_days: {
        Row: { id: string; trip_id: string | null; date: string; title: string | null; note: string | null; created_at?: string | null }
        Insert: { id?: string; trip_id?: string | null; date: string; title?: string | null; note?: string | null }
        Update: { id?: string; trip_id?: string | null; date?: string; title?: string | null; note?: string | null }
        Relationships: []
      }
      activities: {
        Row: { id: string; trip_id: string | null; day_id: string | null; title: string; start_time: string | null; end_time: string | null; location: string | null; note: string | null; order_no: number | null; created_at?: string | null }
        Insert: { id?: string; trip_id?: string | null; day_id?: string | null; title: string; start_time?: string | null; end_time?: string | null; location?: string | null; note?: string | null; order_no?: number | null }
        Update: { id?: string; trip_id?: string | null; day_id?: string | null; title?: string; start_time?: string | null; end_time?: string | null; location?: string | null; note?: string | null; order_no?: number | null }
        Relationships: []
      }
      expenses: {
        Row: { id: string; trip_id: string | null; date: string | null; title: string; category: string | null; amount: number; paid_by: string | null; paid_by_name: string | null; split_with: string[] | null; created_at?: string | null }
        Insert: { id?: string; trip_id?: string | null; date?: string | null; title: string; category?: string | null; amount: number; paid_by?: string | null; paid_by_name?: string | null; split_with?: string[] | null }
        Update: { id?: string; trip_id?: string | null; date?: string | null; title?: string; category?: string | null; amount?: number; paid_by?: string | null; paid_by_name?: string | null; split_with?: string[] | null }
        Relationships: []
      }
      trip_members: {
        Row: { trip_id: string | null; user_id: string; role: 'viewer' | 'editor' | 'owner' | null }
        Insert: { trip_id?: string | null; user_id: string; role?: 'viewer' | 'editor' | 'owner' | null }
        Update: { trip_id?: string | null; user_id?: string; role?: 'viewer' | 'editor' | 'owner' | null }
        Relationships: []
      }
      share_links: {
        Row: { id: string; trip_id: string | null; is_enabled: boolean; expires_at: string | null; created_at?: string | null }
        Insert: { id?: string; trip_id?: string | null; is_enabled?: boolean; expires_at?: string | null }
        Update: { id?: string; trip_id?: string | null; is_enabled?: boolean; expires_at?: string | null }
        Relationships: []
      }
      budgets: {
        Row: { trip_id: string; amount: number; currency: string }
        Insert: { trip_id: string; amount: number; currency: string }
        Update: { trip_id?: string; amount?: number; currency?: string }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      member_role: ['owner','editor','viewer']
    }
    CompositeTypes: Record<string, never>
  }
}

// Helpers
export type DatabaseSchemas = keyof Database
export type PublicSchema = Database['public']

export type Tables<T extends keyof (PublicSchema['Tables'])> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof (PublicSchema['Tables'])> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof (PublicSchema['Tables'])> = PublicSchema['Tables'][T]['Update']
