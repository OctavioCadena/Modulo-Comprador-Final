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
      requisiciones: {
        Row: {
          anexos: string | null
          aplica_anticipo: boolean | null
          area_solicitante: string | null
          autorizacion_presupuesto: string | null
          capacitacion: string | null
          clave_partida: string | null
          condiciones_entrega: string | null
          created_at: string | null
          created_by: string | null
          dictamen_secciones: Json | null
          estado_aprobacion: string | null
          estatus: string
          fecha_elaboracion: string
          fecha_maxima_entrega: string
          fecha_recepcion: string
          firma_presupuesto: string | null
          firma_solicitante: string | null
          folio: string
          garantia_anticipo: string | null
          garantia_cumplimiento: string | null
          garantia_vicios_ocultos: string | null
          historial_devoluciones: Json | null
          id: string
          items: Json
          iva_importe: number
          iva_porcentaje: number | null
          justificacion: string | null
          lugar_entrega: string
          normas: string | null
          numero_autorizacion: string | null
          observaciones_generales: string | null
          pagina: string | null
          partida_presupuestal: string | null
          penas_convencionales: boolean | null
          plurianualidad: string | null
          proveedores_sugeridos: Json | null
          registro_sanitario: string | null
          subtotal: number
          tiempo_fabricacion: string | null
          tipo_contratacion: string | null
          total: number
          unidad_administrativa: string
          updated_at: string | null
        }
        Insert: {
          anexos?: string | null
          aplica_anticipo?: boolean | null
          area_solicitante?: string | null
          autorizacion_presupuesto?: string | null
          capacitacion?: string | null
          clave_partida?: string | null
          condiciones_entrega?: string | null
          created_at?: string | null
          created_by?: string | null
          dictamen_secciones?: Json | null
          estado_aprobacion?: string | null
          estatus?: string
          fecha_elaboracion: string
          fecha_maxima_entrega: string
          fecha_recepcion: string
          firma_presupuesto?: string | null
          firma_solicitante?: string | null
          folio: string
          garantia_anticipo?: string | null
          garantia_cumplimiento?: string | null
          garantia_vicios_ocultos?: string | null
          historial_devoluciones?: Json | null
          id?: string
          items?: Json
          iva_importe?: number
          iva_porcentaje?: number | null
          justificacion?: string | null
          lugar_entrega: string
          normas?: string | null
          numero_autorizacion?: string | null
          observaciones_generales?: string | null
          pagina?: string | null
          partida_presupuestal?: string | null
          penas_convencionales?: boolean | null
          plurianualidad?: string | null
          proveedores_sugeridos?: Json | null
          registro_sanitario?: string | null
          subtotal?: number
          tiempo_fabricacion?: string | null
          tipo_contratacion?: string | null
          total?: number
          unidad_administrativa: string
          updated_at?: string | null
        }
        Update: {
          anexos?: string | null
          aplica_anticipo?: boolean | null
          area_solicitante?: string | null
          autorizacion_presupuesto?: string | null
          capacitacion?: string | null
          clave_partida?: string | null
          condiciones_entrega?: string | null
          created_at?: string | null
          created_by?: string | null
          dictamen_secciones?: Json | null
          estado_aprobacion?: string | null
          estatus?: string
          fecha_elaboracion?: string
          fecha_maxima_entrega?: string
          fecha_recepcion?: string
          firma_presupuesto?: string | null
          firma_solicitante?: string | null
          folio?: string
          garantia_anticipo?: string | null
          garantia_cumplimiento?: string | null
          garantia_vicios_ocultos?: string | null
          historial_devoluciones?: Json | null
          id?: string
          items?: Json
          iva_importe?: number
          iva_porcentaje?: number | null
          justificacion?: string | null
          lugar_entrega?: string
          normas?: string | null
          numero_autorizacion?: string | null
          observaciones_generales?: string | null
          pagina?: string | null
          partida_presupuestal?: string | null
          penas_convencionales?: boolean | null
          plurianualidad?: string | null
          proveedores_sugeridos?: Json | null
          registro_sanitario?: string | null
          subtotal?: number
          tiempo_fabricacion?: string | null
          tipo_contratacion?: string | null
          total?: number
          unidad_administrativa?: string
          updated_at?: string | null
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
