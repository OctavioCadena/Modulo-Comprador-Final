// ============================================
// HOOK: useRequisicionesDB
// Conexión con base de datos Lovable Cloud
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EstatusRequisicion, RequisicionListItem } from '@/types/dashboard';

// ============================================
// TIPOS
// ============================================

/**
 * Mapeo de estatus de BD a UI
 * BD usa snake_case, UI usa nombres en español
 */
const ESTATUS_MAP: Record<string, EstatusRequisicion> = {
  'en_captura': 'En Captura',
  'pendiente_revision': 'Pendiente de Revisión',
  'en_autorizacion': 'En Autorización',
  'autorizada': 'Autorizada',
  'devuelta': 'Devuelta para Corrección',
};

/**
 * Mapeo inverso: UI a BD
 */
const ESTATUS_MAP_INVERSO: Record<EstatusRequisicion, string> = {
  'En Captura': 'en_captura',
  'Pendiente de Revisión': 'pendiente_revision',
  'En Autorización': 'en_autorizacion',
  'Autorizada': 'autorizada',
  'Devuelta para Corrección': 'devuelta',
};

/**
 * Formatea un número como moneda MXN
 */
const formatearMoneda = (valor: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(valor);
};

/**
 * Formatea una fecha ISO a formato legible
 */
const formatearFecha = (fecha: string | null): string => {
  if (!fecha) return '';
  const date = new Date(fecha);
  return date.toISOString().split('T')[0];
};

// ============================================
// HOOK PRINCIPAL
// ============================================

export const useRequisicionesDB = () => {
  const [requisiciones, setRequisiciones] = useState<RequisicionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga las requisiciones desde la base de datos
   */
  const cargarRequisiciones = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: dbError } = await supabase
        .from('requisiciones')
        .select('id, folio, unidad_administrativa, fecha_recepcion, fecha_maxima_entrega, lugar_entrega, estatus, total')
        .order('created_at', { ascending: false });
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      // Transformar datos de BD a formato UI
      const requisicionesUI: RequisicionListItem[] = (data || []).map((row) => ({
        id: row.id,
        folio: row.folio,
        unidadAdministrativa: row.unidad_administrativa,
        fechaRecepcion: formatearFecha(row.fecha_recepcion),
        fechaMaxEntrega: formatearFecha(row.fecha_maxima_entrega),
        lugarEntrega: row.lugar_entrega,
        estatus: ESTATUS_MAP[row.estatus] || 'En Captura',
        total: formatearMoneda(Number(row.total) || 0),
        totalNumerico: Number(row.total) || 0,
      }));
      
      setRequisiciones(requisicionesUI);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al cargar requisiciones';
      setError(mensaje);
      console.error('Error cargando requisiciones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualiza el estatus de una requisición en la BD
   */
  const actualizarEstatus = useCallback(async (id: string, nuevoEstatus: EstatusRequisicion) => {
    try {
      const estatusBD = ESTATUS_MAP_INVERSO[nuevoEstatus];
      
      const { error: dbError } = await supabase
        .from('requisiciones')
        .update({ 
          estatus: estatusBD,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      
      if (dbError) {
        throw new Error(dbError.message);
      }
      
      // Actualizar estado local inmediatamente (optimistic update)
      setRequisiciones(prev => 
        prev.map(req => 
          req.id === id ? { ...req, estatus: nuevoEstatus } : req
        )
      );
      
      return { exito: true };
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al actualizar estatus';
      console.error('Error actualizando estatus:', err);
      return { exito: false, mensaje };
    }
  }, []);

  /**
   * Obtiene una requisición por ID
   */
  const obtenerPorId = useCallback((id: string): RequisicionListItem | undefined => {
    return requisiciones.find(req => req.id === id);
  }, [requisiciones]);

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarRequisiciones();
  }, [cargarRequisiciones]);

  return {
    requisiciones,
    isLoading,
    error,
    cargarRequisiciones,
    actualizarEstatus,
    obtenerPorId,
  };
};

export default useRequisicionesDB;
