// ============================================
// HOOK: useRequisicion
// Interfaz Compradora 3.0
// ============================================
// Este hook maneja la lógica de negocio para requisiciones.
// Contiene funciones para:
// - Obtener datos de una requisición (GET)
// - Guardar borrador (POST/PUT)
// - Enviar para aprobación (PUT)
// ============================================

import { useState, useCallback } from 'react';
import type { 
  Requisicion, 
  RequisicionFormData,
  GarantiasObservaciones 
} from '@/types/requisition';

// ============================================
// Datos de ejemplo (mock) para desarrollo
// Estos datos serán reemplazados por llamadas al backend
// ============================================
const MOCK_REQUISICION: Requisicion = {
  id: 'req-001',
  
  // Sección 1: Datos Generales
  datosGenerales: {
    unidadAdministrativa: "Subdirección de Recursos Materiales",
    noRequisicion: "001",
    fechaRecepcion: "5 de octubre de 2025",
    pagina: "1",
    fechaMaximaEntrega: "20 de octubre de 2025",
    fechaElaboracion: "5 de octubre de 2025",
    lugarEntrega: "Almacén Central",
  },
  
  // Sección 2: Items de la requisición
  items: [
    {
      id: 'item-001',
      partida: 1,
      cucop: "14111506 - Papel bond",
      cantidad: 50,
      unidadMedida: "Cajas",
      precioUnitario: 350.00,
      importe: 17500.00,
      descripcion: "Papel bond blanco, tamaño carta, 75g"
    },
    {
      id: 'item-002',
      partida: 2,
      cucop: "21101501 - Papel bond",
      cantidad: 2,
      unidadMedida: "Unidad",
      precioUnitario: 800.00,
      importe: 1600.00,
      descripcion: "Tóner negro compatible para modelo XYZ"
    }
  ],
  
  // Sección 3: Resumen Financiero
  resumenFinanciero: {
    subtotal: 19100.00,
    ivaPorcentaje: 16,
    ivaImporte: 3056.00,
    total: 22156.00,
  },
  
  // Sección 4: Condiciones y Anexos
  condicionesAnexos: {
    autorizacionPresupuesto: "AUT-2025-45",
    numeroAutorizacion: "AUT-2025-45",
    tiempoFabricacion: "15 días",
    plurianualidad: "12",
    anexos: "Contrato_2025_001.pdf",
    condicionesEntrega: "Entrega en días hábiles de 9:00 a 14:00 hrs. El proveedor deberá notificar con 48 horas de anticipación.",
    registroSanitario: "REG-SAN-2024-001",
    normas: "NOM-001-SSA1-2010",
    capacitacion: "Capacitación básica incluida",
  },
  
  // Sección 5: Garantías y Observaciones (EDITABLE)
  garantiasObservaciones: {
    aplicaAnticipo: false,
    penasConvencionales: true,
    garantiaAnticipo: "10%",
    garantiaViciosOcultos: "10%",
    garantiaCumplimiento: "10%",
    observaciones: "",
  },
  
  // Sección 6: Aprobaciones y Firmas
  aprobacionesFirmas: {
    areaSolicitante: "Nombre y cargo del solicitante",
    estadoAprobacion: 'pendiente',
  },
};

/**
 * Hook para manejar operaciones de requisición
 * @param requisicionId - ID de la requisición a cargar (opcional)
 */
export function useRequisicion(requisicionId?: string) {
  // ============================================
  // Estados del hook
  // ============================================
  
  /** Datos completos de la requisición */
  const [requisicion, setRequisicion] = useState<Requisicion | null>(null);
  
  /** Estado de carga */
  const [isLoading, setIsLoading] = useState(false);
  
  /** Estado de guardado */
  const [isSaving, setIsSaving] = useState(false);
  
  /** Mensajes de error */
  const [error, setError] = useState<string | null>(null);
  
  /** Mensaje de éxito */
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================
  // FUNCIÓN: fetchRequisicion
  // Obtiene los datos de una requisición del backend
  // ============================================
  const fetchRequisicion = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Reemplazar con llamada real al backend
      // Ejemplo de endpoint: GET /api/requisiciones/:id
      // const response = await fetch(`/api/requisiciones/${id}`);
      // const data = await response.json();
      // setRequisicion(data);
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Usar datos mock por ahora
      setRequisicion(MOCK_REQUISICION);
      
    } catch (err) {
      setError('Error al cargar la requisición. Por favor intente de nuevo.');
      console.error('Error fetching requisicion:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // FUNCIÓN: guardarBorrador
  // Guarda los datos editables como borrador
  // ============================================
  const guardarBorrador = useCallback(async (formData: RequisicionFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // TODO: Reemplazar con llamada real al backend
      // Ejemplo de endpoint: PUT /api/requisiciones/:id/borrador
      // const response = await fetch(`/api/requisiciones/${requisicionId}/borrador`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     garantias_observaciones: {
      //       aplica_anticipo: formData.aplicaAnticipo,
      //       penas_convencionales: formData.penasConvencionales,
      //       garantia_anticipo: formData.garantiaAnticipo,
      //       garantia_vicios_ocultos: formData.garantiaViciosOcultos,
      //       garantia_cumplimiento: formData.garantiaCumplimiento,
      //       observaciones: formData.observaciones,
      //     }
      //   }),
      // });
      // if (!response.ok) throw new Error('Error al guardar');
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Actualizar estado local
      if (requisicion) {
        setRequisicion({
          ...requisicion,
          garantiasObservaciones: {
            aplicaAnticipo: formData.aplicaAnticipo,
            penasConvencionales: formData.penasConvencionales,
            garantiaAnticipo: formData.garantiaAnticipo,
            garantiaViciosOcultos: formData.garantiaViciosOcultos,
            garantiaCumplimiento: formData.garantiaCumplimiento,
            observaciones: formData.observaciones,
          },
        });
      }
      
      setSuccessMessage('Borrador guardado exitosamente');
      
    } catch (err) {
      setError('Error al guardar el borrador. Por favor intente de nuevo.');
      console.error('Error saving draft:', err);
    } finally {
      setIsSaving(false);
    }
  }, [requisicion]);

  // ============================================
  // FUNCIÓN: enviarParaAprobacion
  // Envía la requisición para el flujo de aprobación
  // ============================================
  const enviarParaAprobacion = useCallback(async (formData: RequisicionFormData) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // TODO: Reemplazar con llamada real al backend
      // Ejemplo de endpoint: POST /api/requisiciones/:id/enviar-aprobacion
      // const response = await fetch(`/api/requisiciones/${requisicionId}/enviar-aprobacion`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     garantias_observaciones: {
      //       aplica_anticipo: formData.aplicaAnticipo,
      //       penas_convencionales: formData.penasConvencionales,
      //       garantia_anticipo: formData.garantiaAnticipo,
      //       garantia_vicios_ocultos: formData.garantiaViciosOcultos,
      //       garantia_cumplimiento: formData.garantiaCumplimiento,
      //       observaciones: formData.observaciones,
      //     }
      //   }),
      // });
      // if (!response.ok) throw new Error('Error al enviar');
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Actualizar estado local
      if (requisicion) {
        setRequisicion({
          ...requisicion,
          garantiasObservaciones: {
            aplicaAnticipo: formData.aplicaAnticipo,
            penasConvencionales: formData.penasConvencionales,
            garantiaAnticipo: formData.garantiaAnticipo,
            garantiaViciosOcultos: formData.garantiaViciosOcultos,
            garantiaCumplimiento: formData.garantiaCumplimiento,
            observaciones: formData.observaciones,
          },
          aprobacionesFirmas: {
            ...requisicion.aprobacionesFirmas,
            estadoAprobacion: 'pendiente',
          },
        });
      }
      
      setSuccessMessage('Requisición enviada para aprobación');
      
    } catch (err) {
      setError('Error al enviar la requisición. Por favor intente de nuevo.');
      console.error('Error sending for approval:', err);
    } finally {
      setIsSaving(false);
    }
  }, [requisicion]);

  // ============================================
  // FUNCIÓN: actualizarGarantias
  // Actualiza campos de la sección 5 localmente
  // ============================================
  const actualizarGarantias = useCallback((
    campo: keyof GarantiasObservaciones, 
    valor: string | boolean
  ) => {
    if (requisicion) {
      setRequisicion({
        ...requisicion,
        garantiasObservaciones: {
          ...requisicion.garantiasObservaciones,
          [campo]: valor,
        },
      });
    }
  }, [requisicion]);

  // ============================================
  // Retorno del hook
  // ============================================
  return {
    // Datos
    requisicion,
    
    // Estados
    isLoading,
    isSaving,
    error,
    successMessage,
    
    // Funciones
    fetchRequisicion,
    guardarBorrador,
    enviarParaAprobacion,
    actualizarGarantias,
    
    // Helpers
    clearError: () => setError(null),
    clearSuccessMessage: () => setSuccessMessage(null),
  };
}

export default useRequisicion;
