// ============================================
// COMPONENTE: SectionValidation
// Controles de validación para dictaminación técnica
// ============================================
// Provee los toggles de Aprobado (check verde) y
// Rechazado (X roja) para cada sección del formulario,
// junto con el textarea condicional para observaciones.
//
// INTEGRACIÓN CON BACKEND:
// El estado de validación se consolida en el objeto padre
// y se envía junto con la requisición:
//   POST /api/requisiciones/:id/dictaminar
//   Body: { secciones: [...], observaciones: {...} }
// ============================================

import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ============================================
// TIPOS
// ============================================

/**
 * Estado de validación de una sección
 * - null: Sin dictaminar
 * - 'aprobado': Sección validada correctamente
 * - 'rechazado': Sección con errores que requiere corrección
 */
export type EstadoValidacion = 'aprobado' | 'rechazado' | null;

/**
 * Props para el componente de controles de validación
 */
interface SectionValidationProps {
  /** Estado actual de la validación */
  estado: EstadoValidacion;
  /** Callback cuando cambia el estado de validación */
  onEstadoChange: (estado: EstadoValidacion) => void;
  /** Observaciones de rechazo (requerido si estado === 'rechazado') */
  observaciones: string;
  /** Callback cuando cambian las observaciones */
  onObservacionesChange: (observaciones: string) => void;
  /** Mostrar el textarea de observaciones (cuando está rechazado) */
  mostrarObservaciones?: boolean;
}

/**
 * Controles de validación tipo Toggle Group
 * Muestra dos botones: Check (verde) y X (rojo)
 * Al rechazar, despliega un textarea animado
 */
export const SectionValidationControls = ({
  estado,
  onEstadoChange,
  observaciones,
  onObservacionesChange,
  mostrarObservaciones = false,
}: SectionValidationProps) => {
  /**
   * Maneja el cambio de estado al hacer clic en un botón
   * Si ya está seleccionado, lo deselecciona (vuelve a null)
   */
  const handleToggle = (nuevoEstado: 'aprobado' | 'rechazado') => {
    if (estado === nuevoEstado) {
      // Deseleccionar si ya está activo
      onEstadoChange(null);
    } else {
      onEstadoChange(nuevoEstado);
      // Limpiar observaciones si se aprueba
      if (nuevoEstado === 'aprobado') {
        onObservacionesChange('');
      }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Contenedor de los botones de validación */}
      <div className="flex items-center gap-1">
        {/* Botón Aprobar (Check Verde) */}
        <button
          type="button"
          onClick={() => handleToggle('aprobado')}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200 border-2",
            estado === 'aprobado'
              ? "bg-green-100 border-green-500 text-green-700 shadow-sm"
              : "border-transparent text-muted-foreground hover:bg-green-50 hover:text-green-600"
          )}
          title="Aprobar sección"
          aria-label="Aprobar sección"
        >
          <Check className="h-4 w-4" />
        </button>

        {/* Botón Rechazar (X Roja) */}
        <button
          type="button"
          onClick={() => handleToggle('rechazado')}
          className={cn(
            "p-1.5 rounded-md transition-all duration-200 border-2",
            estado === 'rechazado'
              ? "bg-red-100 border-red-500 text-red-700 shadow-sm"
              : "border-transparent text-muted-foreground hover:bg-red-50 hover:text-red-600"
          )}
          title="Rechazar sección"
          aria-label="Rechazar sección"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Textarea de observaciones (animado) */}
      {mostrarObservaciones && estado === 'rechazado' && (
        <div 
          className="mt-3 animate-fade-in"
          style={{ animationDuration: '0.3s' }}
        >
          <Textarea
            value={observaciones}
            onChange={(e) => onObservacionesChange(e.target.value)}
            placeholder="Describa el motivo del rechazo o corrección necesaria..."
            className="bg-red-50/50 border-red-200 focus:border-red-400 resize-none text-sm"
            rows={3}
            required
          />
          {observaciones.trim() === '' && (
            <p className="text-xs text-red-500 mt-1">
              * Debe indicar el motivo del rechazo
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// TIPOS PARA CONSOLIDACIÓN DE DICTAMEN
// ============================================

/**
 * Representa la validación de una sección individual
 */
export interface ValidacionSeccion {
  /** Número de sección (1-6) */
  seccion: number;
  /** Nombre de la sección */
  nombre: string;
  /** Estado de validación */
  estado: EstadoValidacion;
  /** Observaciones de rechazo (si aplica) */
  observaciones: string;
}

/**
 * Estado completo del dictamen técnico
 */
export interface DictamenTecnico {
  /** Validaciones por sección */
  secciones: ValidacionSeccion[];
  /** Indica si todas las secciones están aprobadas */
  todasAprobadas: boolean;
  /** Indica si al menos una sección está rechazada */
  tieneRechazos: boolean;
  /** Indica si el dictamen está completo (todas las secciones dictaminadas) */
  completo: boolean;
  /** Resumen de observaciones para secciones rechazadas */
  resumenObservaciones: string;
}

/**
 * Función helper para calcular el estado consolidado del dictamen
 * @param secciones Array de validaciones por sección
 * @returns Objeto DictamenTecnico con el estado consolidado
 */
export const calcularDictamen = (secciones: ValidacionSeccion[]): DictamenTecnico => {
  const todasAprobadas = secciones.every(s => s.estado === 'aprobado');
  const tieneRechazos = secciones.some(s => s.estado === 'rechazado');
  const completo = secciones.every(s => s.estado !== null);
  
  // Generar resumen de observaciones
  const observacionesRechazadas = secciones
    .filter(s => s.estado === 'rechazado' && s.observaciones.trim() !== '')
    .map(s => `**${s.nombre}:** ${s.observaciones}`)
    .join('\n\n');

  return {
    secciones,
    todasAprobadas,
    tieneRechazos,
    completo,
    resumenObservaciones: observacionesRechazadas,
  };
};

/**
 * Valida que todas las secciones rechazadas tengan observaciones
 * @param secciones Array de validaciones por sección
 * @returns true si todas las secciones rechazadas tienen observaciones
 */
export const validarObservacionesCompletas = (secciones: ValidacionSeccion[]): boolean => {
  return secciones
    .filter(s => s.estado === 'rechazado')
    .every(s => s.observaciones.trim() !== '');
};
