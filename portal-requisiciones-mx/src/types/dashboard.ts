// ============================================
// TIPOS E INTERFACES - Dashboard Principal
// Sistema Integral de Adquisiciones Gubernamentales
// ============================================
// Este archivo define los tipos de datos utilizados en el
// Dashboard principal. Estos tipos deben coincidir con el
// esquema de la base de datos del backend.
// ============================================

/**
 * ResumenEstatus - Contadores de requisiciones por estatus
 * Endpoint esperado: GET /api/dashboard/resumen-estatus
 */
export interface ResumenEstatus {
  /** Cantidad de requisiciones en proceso de captura */
  enCaptura: number;
  
  /** Cantidad de requisiciones pendientes de revisión técnica */
  pendienteRevision: number;
  
  /** Cantidad de requisiciones pendientes de autorización */
  enAutorizacion: number;
  
  /** Cantidad de requisiciones devueltas para corrección */
  devueltasCorreccion: number;
  
  /** Cantidad de requisiciones autorizadas */
  autorizadas: number;
}

/**
 * RequisicionListItem - Representa una requisición en la tabla del dashboard
 * Versión resumida para listados, no incluye todos los detalles
 * Tabla relacionada: requisiciones
 */
export interface RequisicionListItem {
  /** Identificador único de la requisición (UUID) */
  id: string;
  
  /** Número de folio formateado (ej: REQ-2024-001) */
  folio: string;
  
  /** Nombre de la unidad administrativa solicitante */
  unidadAdministrativa: string;
  
  /** Fecha en que se recibió la requisición (formato: YYYY-MM-DD) */
  fechaRecepcion: string;
  
  /** Fecha límite de entrega (formato: YYYY-MM-DD) */
  fechaMaxEntrega: string;
  
  /** Ubicación donde se entregarán los bienes/servicios */
  lugarEntrega: string;
  
  /** Estado actual de la requisición */
  estatus: EstatusRequisicion;
  
  /** Monto total formateado (ej: "$125,450.00") */
  total: string;
  
  /** Monto total numérico para cálculos */
  totalNumerico?: number;
}

/**
 * EstatusRequisicion - Estados posibles de una requisición
 * Usado para filtrado y visualización con colores específicos
 */
export type EstatusRequisicion = 
  | "En Captura"
  | "Pendiente de Revisión"
  | "En Autorización"
  | "Autorizada"
  | "Devuelta para Corrección";

/**
 * FiltroEstatus - Opciones de filtro para la tabla de requisiciones
 * Incluye "all" para mostrar todas las requisiciones
 */
export type FiltroEstatus = "all" | EstatusRequisicion;

/**
 * UsuarioDashboard - Información del usuario logueado
 * Endpoint esperado: GET /api/usuarios/me
 */
export interface UsuarioDashboard {
  /** ID único del usuario */
  id: string;
  
  /** Nombre completo del usuario */
  nombreCompleto: string;
  
  /** Cargo o puesto del usuario */
  cargo: string;
  
  /** Área o departamento al que pertenece */
  area: string;
  
  /** URL del avatar del usuario (opcional) */
  avatarUrl?: string;
  
  /** Iniciales del usuario para avatar fallback */
  iniciales: string;
}

/**
 * DashboardData - Datos completos del dashboard
 * Agrupa toda la información necesaria para renderizar el dashboard
 */
export interface DashboardData {
  /** Información del usuario actual */
  usuario: UsuarioDashboard;
  
  /** Contadores de estatus para las tarjetas */
  resumenEstatus: ResumenEstatus;
  
  /** Lista de requisiciones para la tabla */
  requisiciones: RequisicionListItem[];
}

/**
 * AccionRequisicion - Acciones que se pueden realizar sobre una requisición
 * Endpoint esperado: POST /api/requisiciones/:id/accion
 */
export type AccionRequisicion = 
  | "ver"           // Navegar a vista de detalle
  | "aprobar"       // Aprobar la requisición
  | "devolver"      // Devolver para corrección
  | "eliminar";     // Eliminar requisición (solo en captura)

/**
 * ResultadoAccion - Respuesta del backend al ejecutar una acción
 */
export interface ResultadoAccion {
  /** Indica si la acción fue exitosa */
  exito: boolean;
  
  /** Mensaje descriptivo del resultado */
  mensaje: string;
  
  /** Nuevo estatus de la requisición (si cambió) */
  nuevoEstatus?: EstatusRequisicion;
}
