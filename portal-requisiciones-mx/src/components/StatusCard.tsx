// ============================================
// COMPONENTE STATUS CARD - Tarjeta de Estatus
// Sistema Integral de Adquisiciones Gubernamentales
// ============================================
// Este componente muestra una tarjeta con el resumen de
// requisiciones por estatus. Es clickeable para filtrar
// la tabla de requisiciones.
// 
// PARA CONECTAR CON BACKEND:
// 1. El prop `count` vendrá del endpoint /api/dashboard/resumen-estatus
// 2. Los contadores se actualizan en tiempo real o con polling
// ============================================

// Importación del tipo de icono de Lucide
import { LucideIcon } from "lucide-react";
// Componentes UI de shadcn
import { Card, CardContent } from "@/components/ui/card";

// ============================================
// TIPOS E INTERFACES
// ============================================

/**
 * StatusCardProps - Propiedades del componente StatusCard
 */
interface StatusCardProps {
  /** 
   * Título del estatus (ej: "En Captura", "Autorizada")
   * Este valor es estático, no cambia
   */
  title: string;
  
  /** 
   * Número de requisiciones con este estatus
   * Endpoint: GET /api/dashboard/resumen-estatus -> [campo correspondiente]
   * Ejemplo: { enCaptura: 5, enAutorizacion: 3, ... }
   */
  count: number;
  
  /** 
   * Icono representativo del estatus (componente de Lucide)
   * FileText = En Captura
   * Clock = En Autorización
   * AlertCircle = Devuelta para Corrección
   * CheckCircle = Autorizada
   */
  icon: LucideIcon;
  
  /** 
   * Clases de Tailwind para el color del icono
   * Usa los tokens de color del design system
   * Ejemplo: "bg-status-capture/10 text-status-capture"
   */
  iconColor: string;
  
  /** 
   * Indica si este filtro está actualmente activo
   * Cuando es true, la tarjeta muestra un borde resaltado
   */
  isActive: boolean;
  
  /** 
   * Función callback al hacer clic en la tarjeta
   * Usado para activar/desactivar el filtro en la tabla
   */
  onClick: () => void;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const StatusCard = ({ 
  title, 
  count, 
  icon: Icon, 
  iconColor, 
  isActive, 
  onClick 
}: StatusCardProps) => {
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    // Tarjeta clickeable con efectos hover y estado activo
    <Card 
      className={`
        hover:shadow-lg 
        transition-all 
        cursor-pointer 
        ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}
      `}
      onClick={onClick}
      // Accesibilidad: permite navegación con teclado
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-pressed={isActive}
      aria-label={`Filtrar por ${title}. ${count} requisiciones.`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          
          {/* ============================================
              SECCIÓN IZQUIERDA: Título y Contador
              ============================================ */}
          <div className="flex-1">
            {/* Título del estatus */}
            <p className="text-sm text-muted-foreground mb-2">
              {title}
            </p>
            
            {/* Contador de requisiciones
                Este número viene del backend:
                Endpoint: GET /api/dashboard/resumen-estatus
                Campo: Depende del título (enCaptura, enAutorizacion, etc.) */}
            <p className="text-4xl font-bold text-foreground">
              {count}
            </p>
          </div>
          
          {/* ============================================
              SECCIÓN DERECHA: Icono con Color
              El color indica visualmente el tipo de estatus:
              - Azul: En Captura (neutral, en proceso)
              - Amarillo: En Autorización (pendiente)
              - Rojo: Devuelta para Corrección (requiere acción)
              - Verde: Autorizada (completado)
              ============================================ */}
          <div className={`${iconColor} p-3 rounded-lg`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
