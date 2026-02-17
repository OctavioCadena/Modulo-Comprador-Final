// ============================================
// HOOK: useRequisicionesStore
// Sistema de persistencia local para requisiciones
// ============================================
// Este hook provee un estado global para las requisiciones
// usando localStorage para persistir cambios entre recargas.
//
// PARA MIGRAR A BACKEND:
// 1. Reemplazar localStorage por llamadas API
// 2. Agregar manejo de errores de red
// 3. Implementar optimistic updates
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { EstatusRequisicion } from '@/types/dashboard';

// ============================================
// TIPOS
// ============================================

/**
 * Requisición almacenada en el store
 * Estructura plana para fácil serialización
 */
export interface RequisicionStore {
  id: string;
  folio: string;
  unidadAdministrativa: string;
  fechaRecepcion: string;
  fechaMaxEntrega: string;
  lugarEntrega: string;
  estatus: EstatusRequisicion;
  total: string;
  
  // Datos del dictamen (opcional)
  dictamenSecciones?: {
    estado: 'aprobado' | 'rechazado' | null;
    observaciones: string;
  }[];
}

// ============================================
// CONSTANTES
// ============================================

const STORAGE_KEY = 'requisiciones_store';

/**
 * Datos iniciales mock para la demostración
 * Estos datos se cargan si no hay datos en localStorage
 */
const DATOS_INICIALES: RequisicionStore[] = [
  {
    id: "1",
    folio: "REQ-2024-001",
    unidadAdministrativa: "Dirección de Recursos Materiales",
    fechaRecepcion: "2024-10-01",
    fechaMaxEntrega: "2024-10-15",
    lugarEntrega: "Almacén Central",
    estatus: "Pendiente de Revisión",
    total: "$125,450.00",
  },
  {
    id: "2",
    folio: "REQ-2024-002",
    unidadAdministrativa: "Dirección de Tecnologías de la Información",
    fechaRecepcion: "2024-10-01",
    fechaMaxEntrega: "2024-10-20",
    lugarEntrega: "Oficinas Centrales",
    estatus: "Pendiente de Revisión",
    total: "$89,320.00",
  },
  {
    id: "3",
    folio: "REQ-2024-003",
    unidadAdministrativa: "Dirección de Recursos Humanos",
    fechaRecepcion: "2024-10-02",
    fechaMaxEntrega: "2024-10-18",
    lugarEntrega: "Departamento de RH",
    estatus: "Pendiente de Revisión",
    total: "$45,200.00",
  },
  {
    id: "4",
    folio: "REQ-2024-004",
    unidadAdministrativa: "Dirección de Servicios Generales",
    fechaRecepcion: "2024-10-02",
    fechaMaxEntrega: "2024-10-25",
    lugarEntrega: "Edificio Administrativo",
    estatus: "Devuelta para Corrección",
    total: "$32,100.00",
  },
  {
    id: "5",
    folio: "REQ-2024-005",
    unidadAdministrativa: "Dirección de Recursos Materiales",
    fechaRecepcion: "2024-10-03",
    fechaMaxEntrega: "2024-10-22",
    lugarEntrega: "Almacén Central",
    estatus: "Autorizada",
    total: "$78,500.00",
  },
  {
    id: "6",
    folio: "REQ-2024-006",
    unidadAdministrativa: "Dirección de Planeación",
    fechaRecepcion: "2024-10-04",
    fechaMaxEntrega: "2024-10-28",
    lugarEntrega: "Oficinas de Planeación",
    estatus: "Pendiente de Revisión",
    total: "$156,780.00",
  },
  {
    id: "7",
    folio: "REQ-2024-007",
    unidadAdministrativa: "Dirección de Finanzas",
    fechaRecepcion: "2024-10-05",
    fechaMaxEntrega: "2024-10-30",
    lugarEntrega: "Departamento Contable",
    estatus: "En Autorización",
    total: "$234,100.00",
  },
  {
    id: "8",
    folio: "REQ-2024-008",
    unidadAdministrativa: "Dirección de Comunicación Social",
    fechaRecepcion: "2024-10-05",
    fechaMaxEntrega: "2024-11-01",
    lugarEntrega: "Sala de Prensa",
    estatus: "En Captura",
    total: "$67,890.00",
  },
];

// ============================================
// FUNCIONES DE PERSISTENCIA
// ============================================

/**
 * Carga las requisiciones desde localStorage
 * Retorna datos iniciales si no hay datos guardados
 */
const cargarDesdeStorage = (): RequisicionStore[] => {
  try {
    const datos = localStorage.getItem(STORAGE_KEY);
    if (datos) {
      return JSON.parse(datos);
    }
  } catch (error) {
    console.error('Error al cargar requisiciones desde localStorage:', error);
  }
  return DATOS_INICIALES;
};

/**
 * Guarda las requisiciones en localStorage
 */
const guardarEnStorage = (requisiciones: RequisicionStore[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(requisiciones));
  } catch (error) {
    console.error('Error al guardar requisiciones en localStorage:', error);
  }
};

// ============================================
// HOOK PRINCIPAL
// ============================================

/**
 * Hook para manejar el estado global de requisiciones
 * Persiste automáticamente en localStorage
 */
export const useRequisicionesStore = () => {
  // ============================================
  // Estado
  // ============================================
  const [requisiciones, setRequisiciones] = useState<RequisicionStore[]>(() => 
    cargarDesdeStorage()
  );
  const [isLoading, setIsLoading] = useState(false);

  // ============================================
  // Efectos
  // ============================================
  
  /**
   * Guardar en localStorage cuando cambian las requisiciones
   */
  useEffect(() => {
    guardarEnStorage(requisiciones);
  }, [requisiciones]);

  // ============================================
  // Funciones
  // ============================================

  /**
   * Actualiza el estatus de una requisición
   * @param id - ID de la requisición
   * @param nuevoEstatus - Nuevo estatus a asignar
   */
  const actualizarEstatus = useCallback((id: string, nuevoEstatus: EstatusRequisicion) => {
    setRequisiciones(prev => 
      prev.map(req => 
        req.id === id ? { ...req, estatus: nuevoEstatus } : req
      )
    );
  }, []);

  /**
   * Actualiza una requisición completa
   * @param id - ID de la requisición
   * @param datos - Datos parciales a actualizar
   */
  const actualizarRequisicion = useCallback((id: string, datos: Partial<RequisicionStore>) => {
    setRequisiciones(prev => 
      prev.map(req => 
        req.id === id ? { ...req, ...datos } : req
      )
    );
  }, []);

  /**
   * Obtiene una requisición por su ID
   * @param id - ID de la requisición
   */
  const obtenerPorId = useCallback((id: string): RequisicionStore | undefined => {
    return requisiciones.find(req => req.id === id);
  }, [requisiciones]);

  /**
   * Obtiene una requisición por su folio
   * @param folio - Folio de la requisición (ej: REQ-2024-001)
   */
  const obtenerPorFolio = useCallback((folio: string): RequisicionStore | undefined => {
    return requisiciones.find(req => req.folio === folio);
  }, [requisiciones]);

  /**
   * Reinicia las requisiciones a los datos iniciales
   * Útil para pruebas o reset del sistema
   */
  const reiniciarDatos = useCallback(() => {
    setRequisiciones(DATOS_INICIALES);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * Guarda el dictamen de una requisición
   * @param id - ID de la requisición
   * @param dictamen - Array con el estado de cada sección
   */
  const guardarDictamen = useCallback((
    id: string, 
    dictamen: { estado: 'aprobado' | 'rechazado' | null; observaciones: string }[]
  ) => {
    setRequisiciones(prev => 
      prev.map(req => 
        req.id === id ? { ...req, dictamenSecciones: dictamen } : req
      )
    );
  }, []);

  // ============================================
  // Retorno del hook
  // ============================================
  return {
    requisiciones,
    isLoading,
    actualizarEstatus,
    actualizarRequisicion,
    obtenerPorId,
    obtenerPorFolio,
    reiniciarDatos,
    guardarDictamen,
  };
};

export default useRequisicionesStore;
