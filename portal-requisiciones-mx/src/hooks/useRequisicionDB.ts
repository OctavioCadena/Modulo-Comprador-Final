// ============================================
// HOOK: useRequisicionDB
// Conexión con Supabase para detalle de requisición
// ============================================

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// ============================================
// TIPOS
// ============================================

/** Tipo de item de requisición desde la base de datos */
export interface ItemDB {
  partida: number;
  cucop: string;
  cantidad: number;
  unidad_medida: string;
  precio_unitario: number;
  importe: number;
  descripcion: string;
}

/** Tipo completo de requisición desde la BD */
export type RequisicionDB = Tables<'requisiciones'>;

/** Datos formateados para la UI */
export interface RequisicionUI {
  id: string;
  
  // Sección 1: Datos Generales
  datosGenerales: {
    unidadAdministrativa: string;
    noRequisicion: string;
    fechaRecepcion: string;
    pagina: string;
    fechaMaximaEntrega: string;
    fechaElaboracion: string;
    lugarEntrega: string;
  };
  
  // Sección 2: Items
  items: {
    partida: number;
    cucop: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
    importe: number;
    descripcion: string;
  }[];
  
  // Sección 3: Resumen Financiero
  resumenFinanciero: {
    subtotal: number;
    ivaPorcentaje: number;
    ivaImporte: number;
    total: number;
  };
  
  // Sección 4: Condiciones y Anexos
  condicionesAnexos: {
    autorizacionPresupuesto: string;
    numeroAutorizacion: string;
    tiempoFabricacion: string;
    plurianualidad: string;
    anexos: string;
    condicionesEntrega: string;
    registroSanitario: string;
    normas: string;
    capacitacion: string;
  };
  
  // Sección 5: Garantías y Observaciones
  garantiasObservaciones: {
    aplicaAnticipo: boolean;
    penasConvencionales: boolean;
    garantiaAnticipo: string;
    garantiaViciosOcultos: string;
    garantiaCumplimiento: string;
    observaciones: string;
  };
  
  // Sección 6: Aprobaciones
  aprobacionesFirmas: {
    areaSolicitante: string;
    estadoAprobacion: string;
  };
  
  // Estatus y dictamen
  estatus: string;
  dictamenSecciones: Record<string, unknown>;
}

/**
 * Formatea una fecha ISO a formato legible
 */
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Transforma los datos de la BD al formato esperado por la UI
 */
const transformarRequisicion = (data: RequisicionDB): RequisicionUI => {
  // Parsear items del JSONB
  const itemsRaw = Array.isArray(data.items) ? data.items : [];
  const items = itemsRaw.map((item: unknown, index: number) => {
    const i = item as ItemDB;
    return {
      partida: i.partida || index + 1,
      cucop: i.cucop || '',
      cantidad: i.cantidad || 0,
      unidadMedida: i.unidad_medida || '',
      precioUnitario: i.precio_unitario || 0,
      importe: i.importe || 0,
      descripcion: i.descripcion || '',
    };
  });

  return {
    id: data.id,
    
    datosGenerales: {
      unidadAdministrativa: data.unidad_administrativa || '',
      noRequisicion: data.folio || '',
      fechaRecepcion: formatearFecha(data.fecha_recepcion),
      pagina: data.pagina || '1/1',
      fechaMaximaEntrega: formatearFecha(data.fecha_maxima_entrega),
      fechaElaboracion: formatearFecha(data.fecha_elaboracion),
      lugarEntrega: data.lugar_entrega || '',
    },
    
    items,
    
    resumenFinanciero: {
      subtotal: Number(data.subtotal) || 0,
      ivaPorcentaje: Number(data.iva_porcentaje) || 16,
      ivaImporte: Number(data.iva_importe) || 0,
      total: Number(data.total) || 0,
    },
    
    condicionesAnexos: {
      autorizacionPresupuesto: data.autorizacion_presupuesto || 'N/A',
      numeroAutorizacion: data.numero_autorizacion || 'N/A',
      tiempoFabricacion: data.tiempo_fabricacion || 'N/A',
      plurianualidad: data.plurianualidad || 'N/A',
      anexos: data.anexos || 'Sin anexos',
      condicionesEntrega: data.condiciones_entrega || 'Sin condiciones especiales',
      registroSanitario: data.registro_sanitario || 'N/A',
      normas: data.normas || 'N/A',
      capacitacion: data.capacitacion || 'N/A',
    },
    
    garantiasObservaciones: {
      aplicaAnticipo: data.aplica_anticipo || false,
      penasConvencionales: data.penas_convencionales ?? true,
      garantiaAnticipo: data.garantia_anticipo || '10%',
      garantiaViciosOcultos: data.garantia_vicios_ocultos || '10%',
      garantiaCumplimiento: data.garantia_cumplimiento || '10%',
      observaciones: data.observaciones_generales || '',
    },
    
    aprobacionesFirmas: {
      areaSolicitante: data.area_solicitante || 'Área Requirente',
      estadoAprobacion: data.estado_aprobacion || 'pendiente',
    },
    
    estatus: data.estatus,
    dictamenSecciones: (data.dictamen_secciones as Record<string, unknown>) || {},
  };
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useRequisicionDB = (requisicionId?: string) => {
  const [requisicion, setRequisicion] = useState<RequisicionUI | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga una requisición por ID desde la base de datos
   */
  const fetchRequisicion = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await supabase
        .from('requisiciones')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      if (!data) {
        throw new Error('Requisición no encontrada');
      }
      
      const requisicionUI = transformarRequisicion(data);
      setRequisicion(requisicionUI);
      
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar la requisición';
      setError(mensaje);
      console.error('Error fetching requisicion:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualiza el estatus y dictamen de la requisición
   */
  const actualizarRequisicion = useCallback(async (
    id: string, 
    estatus: string, 
    dictamenSecciones?: Record<string, unknown>
  ) => {
    try {
      const updateData: Record<string, unknown> = {
        estatus,
        updated_at: new Date().toISOString(),
      };
      
      if (dictamenSecciones) {
        updateData.dictamen_secciones = dictamenSecciones;
      }
      
      const { error: dbError } = await supabase
        .from('requisiciones')
        .update(updateData)
        .eq('id', id);
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      return { exito: true };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar';
      console.error('Error actualizando requisicion:', err);
      return { exito: false, mensaje };
    }
  }, []);

  /**
   * Guarda las garantías y observaciones (Sección 5)
   */
  const guardarGarantias = useCallback(async (
    id: string,
    garantias: {
      aplicaAnticipo: boolean;
      penasConvencionales: boolean;
      garantiaAnticipo: string;
      garantiaViciosOcultos: string;
      garantiaCumplimiento: string;
      observaciones: string;
    }
  ) => {
    try {
      const { error: dbError } = await supabase
        .from('requisiciones')
        .update({
          aplica_anticipo: garantias.aplicaAnticipo,
          penas_convencionales: garantias.penasConvencionales,
          garantia_anticipo: garantias.garantiaAnticipo,
          garantia_vicios_ocultos: garantias.garantiaViciosOcultos,
          garantia_cumplimiento: garantias.garantiaCumplimiento,
          observaciones_generales: garantias.observaciones,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      return { exito: true };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al guardar';
      console.error('Error guardando garantias:', err);
      return { exito: false, mensaje };
    }
  }, []);

  // Cargar requisición automáticamente si se proporciona ID
  useEffect(() => {
    if (requisicionId) {
      fetchRequisicion(requisicionId);
    }
  }, [requisicionId, fetchRequisicion]);

  return {
    requisicion,
    isLoading,
    error,
    fetchRequisicion,
    actualizarRequisicion,
    guardarGarantias,
    clearError: () => setError(null),
  };
};

export default useRequisicionDB;
