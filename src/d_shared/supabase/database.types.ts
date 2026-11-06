
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "place_likes": {
                  Row: {
                    "created_at": string,"place_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"place_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"place_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "place_likes_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"place_tags": {
                  Row: {
                    "created_at": string,"label": string,"place_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"label": string,"place_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"label"?: string,"place_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "place_tags_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                },"places": {
                  Row: {
                    "address": string,"bundle_count": number | null,"bundle_price": number | null,"category": Database["public"]['Enums']["place_category"],"created_at": string,"created_by": string,"id": string,"kakao_category": string | null,"kakao_place_id": string | null,"kind": Database["public"]['Enums']["place_kind"],"lat": number,"lng": number,"name": string | null,"open_days": (Database["public"]['Enums']["weekday"])[],"phone": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address": string,"bundle_count"?: number | null,"bundle_price"?: number | null,"category": Database["public"]['Enums']["place_category"],"created_at"?: string,"created_by": string,"id"?: string,"kakao_category"?: string | null,"kakao_place_id"?: string | null,"kind": Database["public"]['Enums']["place_kind"],"lat": number,"lng": number,"name"?: string | null,"open_days"?: (Database["public"]['Enums']["weekday"])[],"phone"?: string | null
                  }
                  Update: {
                    "address"?: string,"bundle_count"?: number | null,"bundle_price"?: number | null,"category"?: Database["public"]['Enums']["place_category"],"created_at"?: string,"created_by"?: string,"id"?: string,"kakao_category"?: string | null,"kakao_place_id"?: string | null,"kind"?: Database["public"]['Enums']["place_kind"],"lat"?: number,"lng"?: number,"name"?: string | null,"open_days"?: (Database["public"]['Enums']["weekday"])[],"phone"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"stall_checks": {
                  Row: {
                    "checked_at": string,"checked_on": string,"is_still_there": boolean,"place_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "checked_at"?: string,"checked_on": string,"is_still_there": boolean,"place_id": string,"user_id": string
                  }
                  Update: {
                    "checked_at"?: string,"checked_on"?: string,"is_still_there"?: boolean,"place_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "stall_checks_place_id_fkey"
      columns: ["place_id"]
isOneToOne: false
      referencedRelation: "places"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "check_stall":
{ Args: { "p_is_still_there": boolean,"p_place_id": string }; Returns: undefined
                           },
"places_in_area":
{ Args: { "p_category": Database["public"]['Enums']["place_category"],"p_east": number,"p_north": number,"p_south": number,"p_west": number }; Returns: {
              "address": string,"bundle_count": number,"bundle_price": number,"category": Database["public"]['Enums']["place_category"],"gone_count": number,"id": string,"is_liked": boolean,"kakao_category": string,"kakao_place_id": string,"kind": Database["public"]['Enums']["place_kind"],"last_confirmed_at": string,"lat": number,"like_count": number,"lng": number,"name": string,"open_days": (Database["public"]['Enums']["weekday"])[],"phone": string,"tags": Json
            }[]
                           },
"report_stall":
{ Args: { "p_address": string,"p_bundle_count": number,"p_bundle_price": number,"p_category": Database["public"]['Enums']["place_category"],"p_lat": number,"p_lng": number,"p_open_days": (Database["public"]['Enums']["weekday"])[] }; Returns: string
                           },
"save_shop":
{ Args: { "p_address": string,"p_category": Database["public"]['Enums']["place_category"],"p_kakao_category": string,"p_kakao_place_id": string,"p_lat": number,"p_lng": number,"p_name": string,"p_phone": string }; Returns: string
                           },
"set_like":
{ Args: { "p_liked": boolean,"p_place_id": string }; Returns: undefined
                           },
"set_tag":
{ Args: { "p_label": string,"p_place_id": string,"p_tagged": boolean }; Returns: undefined
                           }
          }
          Enums: {
            "place_category": "bungeoppang"|"bangeo","place_kind": "stall"|"shop","weekday": "mon"|"tue"|"wed"|"thu"|"fri"|"sat"|"sun"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "place_category": ["bungeoppang", "bangeo"],"place_kind": ["stall", "shop"],"weekday": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
          }
        }
} as const
