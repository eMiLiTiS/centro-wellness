export type UserRole = "admin" | "recepcion"

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
      profesionales: {
        Row: {
          id: string
          nombre: string
          activo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          activo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          activo?: boolean
          created_at?: string
        }
        Relationships: []
      }
      servicios_catalogo: {
        Row: {
          id: string
          nombre: string
          duracion_default: number | null
          activo: boolean
        }
        Insert: {
          id?: string
          nombre: string
          duracion_default?: number | null
          activo?: boolean
        }
        Update: {
          id?: string
          nombre?: string
          duracion_default?: number | null
          activo?: boolean
        }
        Relationships: []
      }
      registros: {
        Row: {
          id: string
          fecha: string
          cliente: string
          servicio_id: string | null
          servicio_nombre: string
          duracion: number
          tarifa: string
          importe: number
          pago: string
          profesional_id: string | null
          profesional_nombre: string
          mes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          fecha?: string
          cliente: string
          servicio_id?: string | null
          servicio_nombre: string
          duracion: number
          tarifa: string
          importe: number
          pago: string
          profesional_id?: string | null
          profesional_nombre: string
          mes: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          cliente?: string
          servicio_id?: string | null
          servicio_nombre?: string
          duracion?: number
          tarifa?: string
          importe?: number
          pago?: string
          profesional_id?: string | null
          profesional_nombre?: string
          mes?: string
          updated_at?: string
        }
        Relationships: []
      }
      ventas: {
        Row: {
          id: string
          fecha: string
          producto: string
          cantidad: number
          importe_unitario: number
          pago: string
          profesional_id: string | null
          profesional_nombre: string
          mes: string
          created_at: string
        }
        Insert: {
          id?: string
          fecha?: string
          producto: string
          cantidad?: number
          importe_unitario: number
          pago: string
          profesional_id?: string | null
          profesional_nombre: string
          mes: string
          created_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          producto?: string
          cantidad?: number
          importe_unitario?: number
          pago?: string
          profesional_id?: string | null
          profesional_nombre?: string
          mes?: string
        }
        Relationships: []
      }
      tarjetas_regalo: {
        Row: {
          id: string
          fecha: string
          descripcion: string
          cantidad: number
          importe_unitario: number
          pago: string
          profesional_id: string | null
          profesional_nombre: string
          mes: string
          created_at: string
        }
        Insert: {
          id?: string
          fecha?: string
          descripcion: string
          cantidad?: number
          importe_unitario: number
          pago: string
          profesional_id?: string | null
          profesional_nombre: string
          mes: string
          created_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          descripcion?: string
          cantidad?: number
          importe_unitario?: number
          pago?: string
          profesional_id?: string | null
          profesional_nombre?: string
          mes?: string
        }
        Relationships: []
      }
      horas_disponibles: {
        Row: {
          id: string
          profesional_id: string
          mes: string
          horas: number
        }
        Insert: {
          id?: string
          profesional_id: string
          mes: string
          horas: number
        }
        Update: {
          id?: string
          profesional_id?: string
          mes?: string
          horas?: number
        }
        Relationships: []
      }
      analisis_guardados: {
        Row: {
          id: string
          mes: string
          contenido: string
          autor_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mes: string
          contenido: string
          autor_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mes?: string
          contenido?: string
          autor_id?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
