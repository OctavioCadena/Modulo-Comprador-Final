// ============================================
// COMPONENTE REQUISITIONS TABLE - Tabla de Requisiciones
// Sistema Integral de Adquisiciones Gubernamentales
// ============================================
// Este componente muestra la tabla de requisiciones con
// filtrado por estatus, manejo de estado local y acciones
// interactivas (ver, aprobar, devolver) con confirmaciones.
// 
// PARA CONECTAR CON BACKEND:
// 1. Recibir `requisiciones` como prop en lugar de usar datos mock
// 2. Las acciones (aprobar, devolver) llamarán a endpoints específicos
// 3. Implementar paginación cuando haya muchos registros
// 
// ENDPOINTS RELACIONADOS:
// - GET  /api/requisiciones               - Obtener lista
// - POST /api/requisiciones/:id/aprobar   - Aprobar requisición
// - POST /api/requisiciones/:id/devolver  - Devolver requisición
// ============================================

// Importaciones de iconos de Lucide
import { Search, Check, CornerUpLeft } from "lucide-react";
// Componentes UI de shadcn
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// Hooks de React
import { useMemo, useState } from "react";
// Hook de navegación de React Router
import { useNavigate } from "react-router-dom";
// Tipo de filtro importado desde la página Index
import { StatusFilter } from "@/pages/Index";
// Tipos del dashboard
import { RequisicionListItem, EstatusRequisicion } from "@/types/dashboard";
// Toast para notificaciones
import { useToast } from "@/hooks/use-toast";

// ============================================
// TIPOS E INTERFACES
// ============================================

/**
 * Requisition - Estructura de una requisición para la tabla
 * Esta es la estructura interna con id para manejo de estado
 */
interface Requisition {
  /** Identificador único interno */
  id: string;
  /** Identificador/folio de la requisición (ej: REQ-2024-001) */
  folio: string;
  /** Nombre del departamento solicitante */
  unidadAdministrativa: string;
  /** Fecha en que se recibió (formato: YYYY-MM-DD) */
  fechaRecepcion: string;
  /** Fecha límite de entrega (formato: YYYY-MM-DD) */
  fechaMaxEntrega: string;
  /** Ubicación de entrega */
  lugarEntrega: string;
  /** Estado actual de la requisición */
  estatus: EstatusRequisicion;
  /** Monto total formateado (ej: $125,450.00) */
  total: string;
}

/**
 * RequisitionsTableProps - Propiedades del componente
 */
interface RequisitionsTableProps {
  /** Filtro de estatus activo (viene del componente padre Index) */
  statusFilter: StatusFilter;
  
  /**
   * Lista de requisiciones (opcional, usa mock si no se proporciona)
   * TODO: Hacer requerido cuando se conecte el backend
   * Endpoint: GET /api/requisiciones
   */
  requisiciones?: RequisicionListItem[];
  
  /**
   * Callback cuando cambia el estado de una requisición
   * TODO: Implementar cuando se conecte el backend
   */
  onRequisicionUpdate?: (id: string, nuevoEstatus: EstatusRequisicion) => void;
}

// ============================================
// DATOS MOCK INICIALES
// Estos datos se usan mientras no hay conexión con backend
// Varias filas inician con estatus "Pendiente de Revisión"
// TODO: Eliminar cuando se conecte el backend
// ============================================

const requisitionsMockInicial: Requisition[] = [
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
// FUNCIONES AUXILIARES
// ============================================

/**
 * getStatusBadgeVariant - Obtiene las clases CSS para el badge de estatus
 * Usa los tokens de color del design system definidos en tailwind.config.ts
 * 
 * @param status - Estado de la requisición
 * @returns Clases de Tailwind para el fondo y texto del badge
 */
const getStatusBadgeVariant = (status: EstatusRequisicion): string => {
  switch (status) {
    case "En Captura":
      // Azul - Estado neutral, requisición en proceso de captura
      return "bg-status-capture text-status-capture-foreground";
    case "Pendiente de Revisión":
      // Azul grisáceo - Esperando revisión técnica
      return "bg-status-pending-review text-status-pending-review-foreground";
    case "En Autorización":
      // Amarillo - Pendiente de aprobación
      return "bg-status-authorization text-status-authorization-foreground";
    case "Autorizada":
      // Verde - Aprobada y lista para procesamiento
      return "bg-status-authorized text-status-authorized-foreground";
    case "Devuelta para Corrección":
      // Rojo - Requiere correcciones del solicitante
      return "bg-status-returned text-status-returned-foreground";
    default:
      // Gris - Estado desconocido (no debería ocurrir)
      return "bg-secondary text-secondary-foreground";
  }
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const RequisitionsTable = ({ statusFilter, requisiciones, onRequisicionUpdate }: RequisitionsTableProps) => {
  // ============================================
  // HOOKS
  // ============================================
  
  /** Hook de navegación para ir a la vista de detalle */
  const navigate = useNavigate();
  
  /** Hook de toast para notificaciones */
  const { toast } = useToast();
  
  // ============================================
  // ESTADOS LOCALES
  // ============================================
  
  /**
   * Estado mutable de requisiciones
   * Permite cambios instantáneos sin recargar la página
   * TODO: Sincronizar con backend cuando esté conectado
   */
  const [requisicionesState, setRequisicionesState] = useState<Requisition[]>(requisitionsMockInicial);
  
  /**
   * Estado del diálogo de confirmación de autorización
   */
  const [dialogAutorizar, setDialogAutorizar] = useState<{
    open: boolean;
    requisicion: Requisition | null;
  }>({ open: false, requisicion: null });
  
  /**
   * Estado del diálogo de confirmación de devolución
   */
  const [dialogDevolver, setDialogDevolver] = useState<{
    open: boolean;
    requisicion: Requisition | null;
  }>({ open: false, requisicion: null });
  
  // ============================================
  // MEMOIZACIÓN Y FILTRADO
  // ============================================
  
  /**
   * filteredRequisitions - Lista filtrada según el estatus seleccionado
   * useMemo evita recalcular en cada render si no hay cambios
   */
  const filteredRequisitions = useMemo(() => {
    // Usar datos del prop si están disponibles, sino usar estado local
    const datos = requisiciones || requisicionesState;
    
    if (statusFilter === "all") {
      // Sin filtro: mostrar todas las requisiciones
      return datos;
    }
    // Filtrar por el estatus seleccionado
    return datos.filter(req => req.estatus === statusFilter);
  }, [statusFilter, requisiciones, requisicionesState]);

  // ============================================
  // MANEJADORES DE EVENTOS
  // ============================================

  /**
   * handleViewDetail - Navega a la vista de detalle de una requisición
   * Navega a la interfaz "Compradora 4.0" para revisión técnica
   * @param id - UUID de la requisición
   */
  const handleViewDetail = (id: string) => {
    navigate(`/requisicion/${id}`);
  };

  /**
   * handleOpenDialogAutorizar - Abre el diálogo de confirmación para autorizar
   * @param requisicion - Requisición a autorizar
   */
  const handleOpenDialogAutorizar = (requisicion: Requisition) => {
    setDialogAutorizar({ open: true, requisicion });
  };

  /**
   * handleConfirmAutorizar - Confirma la autorización de una requisición
   * Notifica al componente padre para actualizar el estado global
   * Esto permite que los contadores del dashboard se actualicen automáticamente
   * TODO: Conectar con endpoint POST /api/requisiciones/:id/aprobar
   */
  const handleConfirmAutorizar = () => {
    if (!dialogAutorizar.requisicion) return;
    
    const requisicionId = dialogAutorizar.requisicion.id;
    const folio = dialogAutorizar.requisicion.folio;
    
    // CORRECCIÓN: Notificar al componente padre para actualizar estado global
    // Esto asegura que los contadores del dashboard se sincronicen
    if (onRequisicionUpdate) {
      onRequisicionUpdate(requisicionId, "Autorizada");
    } else {
      // Fallback: actualizar estado local si no hay callback del padre
      setRequisicionesState(prev => 
        prev.map(req => 
          req.id === requisicionId 
            ? { ...req, estatus: "Autorizada" as EstatusRequisicion }
            : req
        )
      );
    }
    
    // Cerrar diálogo
    setDialogAutorizar({ open: false, requisicion: null });
    
    // Mostrar toast de confirmación con colores institucionales
    toast({
      title: "Requisición autorizada",
      description: `Requisición ${folio} autorizada con éxito`,
      className: "bg-primary text-primary-foreground border-primary",
    });
    
    // TODO: Llamar al backend
    /*
    try {
      const response = await fetch(`/api/requisiciones/${requisicionId}/aprobar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('Error al autorizar');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo autorizar la requisición",
        variant: "destructive"
      });
    }
    */
  };

  /**
   * handleOpenDialogDevolver - Abre el diálogo de confirmación para devolver
   * @param requisicion - Requisición a devolver
   */
  const handleOpenDialogDevolver = (requisicion: Requisition) => {
    setDialogDevolver({ open: true, requisicion });
  };

  /**
   * handleConfirmDevolver - Confirma la devolución de una requisición
   * Notifica al componente padre para actualizar el estado global
   * Esto permite que los contadores del dashboard se actualicen automáticamente
   * TODO: Conectar con endpoint POST /api/requisiciones/:id/devolver
   */
  const handleConfirmDevolver = () => {
    if (!dialogDevolver.requisicion) return;
    
    const requisicionId = dialogDevolver.requisicion.id;
    const folio = dialogDevolver.requisicion.folio;
    
    // CORRECCIÓN: Notificar al componente padre para actualizar estado global
    // Esto asegura que los contadores del dashboard se sincronicen
    if (onRequisicionUpdate) {
      onRequisicionUpdate(requisicionId, "Devuelta para Corrección");
    } else {
      // Fallback: actualizar estado local si no hay callback del padre
      setRequisicionesState(prev => 
        prev.map(req => 
          req.id === requisicionId 
            ? { ...req, estatus: "Devuelta para Corrección" as EstatusRequisicion }
            : req
        )
      );
    }
    
    // Cerrar diálogo
    setDialogDevolver({ open: false, requisicion: null });
    
    // Mostrar toast de confirmación con colores institucionales
    toast({
      title: "Requisición devuelta",
      description: `Requisición ${folio} devuelta para corrección`,
      className: "bg-status-returned text-status-returned-foreground border-status-returned",
    });
    
    // TODO: Llamar al backend con el motivo de devolución
    /*
    try {
      const response = await fetch(`/api/requisiciones/${requisicionId}/devolver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ motivo: 'Motivo capturado en el modal...' })
      });
      
      if (!response.ok) throw new Error('Error al devolver');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo devolver la requisición",
        variant: "destructive"
      });
    }
    */
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* ============================================
          TABLA DE REQUISICIONES
          ============================================ */}
      <div className="bg-card rounded-lg shadow">
        
        {/* ============================================
            ENCABEZADO DE LA TABLA
            Muestra título y el filtro activo (si aplica)
            ============================================ */}
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Requisiciones Recientes
            {/* Indicador de filtro activo */}
            {statusFilter !== "all" && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (Filtrado por: {statusFilter})
              </span>
            )}
          </h2>
        </div>
        
        {/* ============================================
            CONTENEDOR DE LA TABLA
            overflow-x-auto permite scroll horizontal en móviles
            ============================================ */}
        <div className="overflow-x-auto">
          <Table>
            
            {/* ============================================
                ENCABEZADOS DE COLUMNA
                Anchos optimizados para cada tipo de dato
                ============================================ */}
            <TableHeader>
              <TableRow>
                {/* Columna: Folio - Identificador único */}
                <TableHead className="w-[130px]">Folio</TableHead>
                
                {/* Columna: Unidad Administrativa - Departamento solicitante */}
                <TableHead className="min-w-[200px]">Unidad Administrativa</TableHead>
                
                {/* Columna: Fecha de Recepción - Cuándo se recibió */}
                <TableHead className="w-[130px]">Fecha de Recepción</TableHead>
                
                {/* Columna: Fecha Máx. Entrega - Deadline */}
                <TableHead className="w-[140px]">Fecha Máx. Entrega</TableHead>
                
                {/* Columna: Lugar de Entrega - Dónde se entregan los bienes */}
                <TableHead className="w-[160px]">Lugar de Entrega</TableHead>
                
                {/* Columna: Estatus - Estado actual con badge de color */}
                <TableHead className="w-[180px]">Estatus</TableHead>
                
                {/* Columna: Total - Monto total de la requisición */}
                <TableHead className="w-[120px] text-right">Total</TableHead>
                
                {/* Columna: Acción - Botones de acciones */}
                <TableHead className="w-[140px] text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            
            {/* ============================================
                CUERPO DE LA TABLA
                Renderiza una fila por cada requisición filtrada
                ============================================ */}
            <TableBody>
              {filteredRequisitions.map((req) => (
                <TableRow 
                  key={req.folio} 
                  className="hover:bg-muted/50"
                >
                  {/* Celda: Folio - Campo: folio */}
                  <TableCell className="font-medium">
                    {req.folio}
                  </TableCell>
                  
                  {/* Celda: Unidad Administrativa - Campo: unidadAdministrativa */}
                  <TableCell>
                    {req.unidadAdministrativa}
                  </TableCell>
                  
                  {/* Celda: Fecha de Recepción - Campo: fechaRecepcion */}
                  <TableCell>
                    {req.fechaRecepcion}
                  </TableCell>
                  
                  {/* Celda: Fecha Máxima de Entrega - Campo: fechaMaxEntrega */}
                  <TableCell>
                    {req.fechaMaxEntrega}
                  </TableCell>
                  
                  {/* Celda: Lugar de Entrega - Campo: lugarEntrega */}
                  <TableCell>
                    {req.lugarEntrega}
                  </TableCell>
                  
                  {/* Celda: Estatus - Badge con color según estado */}
                  <TableCell>
                    <Badge 
                      className={getStatusBadgeVariant(req.estatus)} 
                      variant="secondary"
                    >
                      {req.estatus}
                    </Badge>
                  </TableCell>
                  
                  {/* Celda: Total - Monto formateado */}
                  <TableCell className="text-right font-semibold">
                    {req.total}
                  </TableCell>
                  
                  {/* ============================================
                      CELDA: ACCIONES
                      1. Lupa (Search) - Navega a Compradora 4.0
                      2. Check (Check) - Abre modal para autorizar
                      3. Flecha (CornerUpLeft) - Abre modal para devolver
                      ============================================ */}
                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      
                      {/* Botón Ver Detalles / Revisar */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Consultar / Revisar"
                        onClick={() => handleViewDetail(req.id)}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      
                      {/* Botón Autorizar - Abre diálogo de confirmación */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-status-authorized hover:text-status-authorized hover:bg-status-authorized/10"
                        title="Autorizar"
                        onClick={() => handleOpenDialogAutorizar(req as Requisition)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      
                      {/* Botón Devolver - Abre diálogo de confirmación */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-status-returned hover:text-status-returned hover:bg-status-returned/10"
                        title="Devolver para Corrección"
                        onClick={() => handleOpenDialogDevolver(req as Requisition)}
                      >
                        <CornerUpLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ============================================
          DIÁLOGO DE CONFIRMACIÓN: AUTORIZAR
          Pregunta al usuario si desea autorizar la requisición
          ============================================ */}
      <Dialog 
        open={dialogAutorizar.open} 
        onOpenChange={(open) => setDialogAutorizar({ open, requisicion: dialogAutorizar.requisicion })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Confirmar Autorización
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Desea validar y autorizar esta requisición?
            </DialogDescription>
          </DialogHeader>
          
          {/* Información de la requisición a autorizar */}
          {dialogAutorizar.requisicion && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Folio:</span>{" "}
                {dialogAutorizar.requisicion.folio}
              </p>
              <p className="text-sm">
                <span className="font-medium">Unidad:</span>{" "}
                {dialogAutorizar.requisicion.unidadAdministrativa}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total:</span>{" "}
                {dialogAutorizar.requisicion.total}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogAutorizar({ open: false, requisicion: null })}
            >
              Cancelar
            </Button>
            {/* Botón de confirmación con color institucional guinda */}
            <Button
              onClick={handleConfirmAutorizar}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Autorizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================
          DIÁLOGO DE CONFIRMACIÓN: DEVOLVER
          Pregunta al usuario si desea devolver la requisición
          ============================================ */}
      <Dialog 
        open={dialogDevolver.open} 
        onOpenChange={(open) => setDialogDevolver({ open, requisicion: dialogDevolver.requisicion })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Confirmar Devolución
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              ¿Desea devolver esta requisición para correcciones?
            </DialogDescription>
          </DialogHeader>
          
          {/* Información de la requisición a devolver */}
          {dialogDevolver.requisicion && (
            <div className="py-4 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Folio:</span>{" "}
                {dialogDevolver.requisicion.folio}
              </p>
              <p className="text-sm">
                <span className="font-medium">Unidad:</span>{" "}
                {dialogDevolver.requisicion.unidadAdministrativa}
              </p>
              <p className="text-sm">
                <span className="font-medium">Total:</span>{" "}
                {dialogDevolver.requisicion.total}
              </p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDialogDevolver({ open: false, requisicion: null })}
            >
              Cancelar
            </Button>
            {/* Botón de confirmación con color rojo para devolución */}
            <Button
              onClick={handleConfirmDevolver}
              className="bg-status-returned hover:bg-status-returned/90 text-status-returned-foreground"
            >
              Devolver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RequisitionsTable;
