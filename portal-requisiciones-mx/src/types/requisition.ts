// ============================================
// TIPOS E INTERFACES - Sistema de Requisiciones
// Interfaz Compradora 3.0
// ============================================
// Este archivo define los tipos de datos utilizados en el sistema
// de requisiciones. Estos tipos deben coincidir con el esquema
// de la base de datos del backend.
// ============================================

/**
 * ItemRequisicion - Representa un artículo/servicio dentro de una requisición
 * Tabla relacionada en backend: requisicion_items
 */
export interface ItemRequisicion {
  /** Identificador único del item (auto-generado por backend) */
  id?: string;
  
  /** Número de partida secuencial (1, 2, 3...) */
  partida: number;
  
  /** Código CUCOP del bien o servicio */
  cucop: string;
  
  /** Cantidad solicitada */
  cantidad: number;
  
  /** Unidad de medida (Cajas, Unidad, Piezas, etc.) */
  unidadMedida: string;
  
  /** Precio unitario sin IVA */
  precioUnitario: number;
  
  /** Importe total del item (cantidad * precioUnitario) */
  importe: number;
  
  /** Descripción detallada del bien o servicio */
  descripcion: string;
}

/**
 * DatosGenerales - Sección 1 de la requisición
 * Información básica y fechas de la requisición
 */
export interface DatosGenerales {
  /** Nombre de la unidad administrativa solicitante */
  unidadAdministrativa: string;
  
  /** Número único de requisición (formato: XXX) */
  noRequisicion: string;
  
  /** Fecha en que se recibió la requisición */
  fechaRecepcion: string;
  
  /** Número de página del documento */
  pagina: string;
  
  /** Fecha límite para entrega de bienes/servicios */
  fechaMaximaEntrega: string;
  
  /** Fecha de creación de la requisición */
  fechaElaboracion: string;
  
  /** Ubicación donde se deben entregar los bienes */
  lugarEntrega: string;
}

/**
 * ResumenFinanciero - Sección 3 de la requisición
 * Totales y cálculos de impuestos
 */
export interface ResumenFinanciero {
  /** Suma de importes de todos los items */
  subtotal: number;
  
  /** Porcentaje de IVA aplicable (normalmente 16%) */
  ivaPorcentaje: number;
  
  /** Monto del IVA calculado */
  ivaImporte: number;
  
  /** Total final (subtotal + IVA) */
  total: number;
}

/**
 * CondicionesAnexos - Sección 4 de la requisición
 * Información administrativa y documentación adjunta
 */
export interface CondicionesAnexos {
  /** Clave de autorización del presupuesto */
  autorizacionPresupuesto: string;
  
  /** Número de autorización asignado */
  numeroAutorizacion: string;
  
  /** Tiempo estimado de fabricación/entrega */
  tiempoFabricacion: string;
  
  /** Duración en meses si es plurianual */
  plurianualidad: string;
  
  /** Nombre del archivo de anexo */
  anexos: string;
  
  /** Condiciones especiales de entrega */
  condicionesEntrega: string;
  
  /** Número de registro sanitario (si aplica) */
  registroSanitario: string;
  
  /** Normas aplicables */
  normas: string;
  
  /** Información de capacitación requerida */
  capacitacion: string;
}

/**
 * GarantiasObservaciones - Sección 5 de la requisición
 * Campos EDITABLES por el usuario
 */
export interface GarantiasObservaciones {
  /** Indica si aplica anticipo al proveedor */
  aplicaAnticipo: boolean;
  
  /** Indica si aplican penas convencionales */
  penasConvencionales: boolean;
  
  /** Porcentaje de garantía por anticipo */
  garantiaAnticipo: string;
  
  /** Porcentaje de garantía por vicios ocultos */
  garantiaViciosOcultos: string;
  
  /** Porcentaje de garantía de cumplimiento */
  garantiaCumplimiento: string;
  
  /** Notas y observaciones adicionales */
  observaciones: string;
}

/**
 * AprobacionesFirmas - Sección 6 de la requisición
 * Información de firmantes y aprobadores
 */
export interface AprobacionesFirmas {
  /** Nombre y cargo del área solicitante */
  areaSolicitante: string;
  
  /** Firma digital del solicitante (opcional) */
  firmaSolicitante?: string;
  
  /** Firma digital del responsable de presupuesto (opcional) */
  firmaPresupuesto?: string;
  
  /** Estado de aprobación */
  estadoAprobacion?: 'pendiente' | 'aprobado' | 'rechazado';
}

/**
 * Requisicion - Tipo principal que agrupa todas las secciones
 * Este tipo representa el objeto completo de una requisición
 * tal como se almacena en la base de datos
 */
export interface Requisicion {
  /** ID único de la requisición (UUID generado por backend) */
  id?: string;
  
  /** Sección 1: Datos Generales */
  datosGenerales: DatosGenerales;
  
  /** Sección 2: Lista de items/partidas */
  items: ItemRequisicion[];
  
  /** Sección 3: Resumen Financiero (calculado) */
  resumenFinanciero: ResumenFinanciero;
  
  /** Sección 4: Condiciones y Anexos */
  condicionesAnexos: CondicionesAnexos;
  
  /** Sección 5: Garantías y Observaciones (EDITABLE) */
  garantiasObservaciones: GarantiasObservaciones;
  
  /** Sección 6: Aprobaciones y Firmas */
  aprobacionesFirmas: AprobacionesFirmas;
  
  /** Metadatos del sistema */
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

/**
 * RequisicionFormData - Datos del formulario para crear/actualizar requisición
 * Usado para enviar datos al backend
 */
export interface RequisicionFormData {
  /** Sección 5: Campos editables */
  aplicaAnticipo: boolean;
  penasConvencionales: boolean;
  garantiaAnticipo: string;
  garantiaViciosOcultos: string;
  garantiaCumplimiento: string;
  observaciones: string;
}

/**
 * EstadoRequisicion - Estados posibles de una requisición
 */
export type EstadoRequisicion = 
  | 'en_captura'
  | 'en_autorizacion'
  | 'devuelta_correccion'
  | 'autorizada';
