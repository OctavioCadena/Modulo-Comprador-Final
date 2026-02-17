// ============================================
// PÁGINA: Detalle de Requisición / Dictaminación Técnica
// Interfaz Compradora 3.0
// ============================================
// Esta página muestra el detalle completo de una requisición
// y permite realizar la dictaminación técnica de cada sección.
//
// FUNCIONALIDAD DE DICTAMINACIÓN:
// - Cada sección tiene controles de validación (Check/X)
// - Al rechazar una sección, se despliega un textarea obligatorio
// - El estado consolidado determina el botón de acción principal:
//   * Todas aprobadas -> "Autorizar Requisición" (guinda)
//   * Al menos una rechazada -> "Devolver para Corrección" (rojo)
//
// SECCIONES:
//   1. Datos Generales - Información básica (solo lectura)
//   2. Detalle de Bienes - Items de la requisición (solo lectura)
//   3. Resumen Financiero - Totales e IVA (solo lectura)
//   4. Condiciones y Anexos - Documentación (solo lectura)
//   5. Garantías y Observaciones - EDITABLE por el usuario
//   6. Aprobaciones y Firmas - Estado del flujo (solo lectura)
//
// INTEGRACIÓN CON BACKEND:
// Endpoints esperados:
//   GET  /api/requisiciones/:id - Obtener datos
//   POST /api/requisiciones/:id/autorizar - Autorizar requisición
//   POST /api/requisiciones/:id/devolver - Devolver con observaciones
//   Body para devolver: {
//     secciones: [{ seccion: 1, estado: 'rechazado', observaciones: '...' }, ...],
//     resumenObservaciones: 'Resumen completo...'
//   }
// ============================================

import { useEffect, useState, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useRequisicionDB } from "@/hooks/useRequisicionDB";
import { 
  Home, 
  HelpCircle, 
  User, 
  ChevronUp, 
  Search, 
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  SectionValidationControls, 
  type EstadoValidacion,
  type ValidacionSeccion,
  calcularDictamen,
  validarObservacionesCompletas
} from "@/components/SectionValidation";

// ============================================
// CONSTANTES: Nombres de las secciones
// ============================================
const SECCIONES_NOMBRES = [
  "Datos Generales de la Requisición",
  "Detalle de Bienes o Servicios",
  "Resumen Financiero",
  "Condiciones y Anexos",
  "Garantías y Observaciones",
  "Aprobaciones y Firmas"
];

// ============================================
// COMPONENTE: Section
// Sección colapsable con controles de validación
// ============================================
interface SectionProps {
  /** Título de la sección */
  title: string;
  /** Número de la sección (1-6) */
  number: number;
  /** Contenido de la sección */
  children: React.ReactNode;
  /** Estado inicial abierto/cerrado */
  defaultOpen?: boolean;
  /** Estado de validación de la sección */
  estadoValidacion: EstadoValidacion;
  /** Callback cuando cambia el estado de validación */
  onEstadoValidacionChange: (estado: EstadoValidacion) => void;
  /** Observaciones de rechazo */
  observaciones: string;
  /** Callback cuando cambian las observaciones */
  onObservacionesChange: (observaciones: string) => void;
}

/**
 * Componente de sección colapsable con controles de dictaminación
 * Incluye toggles de validación (check/X) en el encabezado
 */
const Section = ({ 
  title, 
  number, 
  children, 
  defaultOpen = true,
  estadoValidacion,
  onEstadoValidacionChange,
  observaciones,
  onObservacionesChange
}: SectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen} 
      className="bg-background rounded-lg border border-border shadow-sm mb-4"
    >
      {/* Encabezado con título y controles de validación */}
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg">
        {/* Área clickeable para expandir/colapsar */}
        <CollapsibleTrigger className="flex items-center gap-2 flex-1">
          <ChevronUp 
            className={`h-5 w-5 text-primary transition-transform ${isOpen ? "" : "rotate-180"}`} 
          />
          <h2 className="text-primary font-semibold text-lg">
            {number}. {title}
          </h2>
          
          {/* Indicador visual del estado de validación */}
          {estadoValidacion === 'aprobado' && (
            <span className="ml-2 flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" />
              Aprobada
            </span>
          )}
          {estadoValidacion === 'rechazado' && (
            <span className="ml-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
              <XCircle className="h-3 w-3" />
              Observaciones
            </span>
          )}
        </CollapsibleTrigger>
        
        {/* Controles de validación (Check/X) */}
        <div onClick={(e) => e.stopPropagation()}>
          <SectionValidationControls
            estado={estadoValidacion}
            onEstadoChange={onEstadoValidacionChange}
            observaciones={observaciones}
            onObservacionesChange={onObservacionesChange}
            mostrarObservaciones={false}
          />
        </div>
      </div>
      
      {/* Contenido colapsable */}
      <CollapsibleContent className="px-4 pb-4">
        {children}
        
        {/* Textarea de observaciones dentro del contenido */}
        {estadoValidacion === 'rechazado' && (
          <div 
            className="mt-4 pt-4 border-t border-border animate-fade-in"
            style={{ animationDuration: '0.3s' }}
          >
            <Label className="text-sm font-medium text-red-700 mb-2 block">
              Observaciones de Rechazo *
            </Label>
            <Textarea
              value={observaciones}
              onChange={(e) => onObservacionesChange(e.target.value)}
              placeholder="Describa el motivo del rechazo o corrección necesaria..."
              className="bg-red-50/50 border-red-200 focus:border-red-400 resize-none"
              rows={3}
              required
            />
            {observaciones.trim() === '' && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Debe indicar el motivo del rechazo para poder guardar
              </p>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

// ============================================
// COMPONENTE: ReadOnlyField
// Campo de texto de solo lectura
// ============================================
interface ReadOnlyFieldProps {
  /** Etiqueta del campo */
  label: string;
  /** Valor a mostrar */
  value: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Campo de solo lectura con estilo deshabilitado
 * Usado en secciones 1, 2, 3, 4 y 6
 */
const ReadOnlyField = ({ label, value, className = "" }: ReadOnlyFieldProps) => (
  <div className={className}>
    <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
    <Input 
      value={value} 
      readOnly 
      className="bg-muted/50 border-border cursor-default"
    />
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL: RequisitionDetail
// ============================================
const RequisitionDetail = () => {
  // ============================================
  // Obtener ID de la URL para cargar datos
  // ============================================
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ============================================
  // Hook de requisición conectado a Supabase
  // ============================================
  const {
    requisicion,
    isLoading,
    error,
    actualizarRequisicion,
    guardarGarantias,
    clearError,
  } = useRequisicionDB(id);
  
  // Estado para indicar cuando se está guardando
  const [isSaving, setIsSaving] = useState(false);

  // ============================================
  // Estados locales para campos editables (Sección 5)
  // ============================================
  const [aplicaAnticipo, setAplicaAnticipo] = useState(false);
  const [penasConvencionales, setPenasConvencionales] = useState(true);
  const [garantiaAnticipo, setGarantiaAnticipo] = useState("10%");
  const [garantiaViciosOcultos, setGarantiaViciosOcultos] = useState("10%");
  const [garantiaCumplimiento, setGarantiaCumplimiento] = useState("10%");
  const [observaciones, setObservaciones] = useState("");

  // ============================================
  // Estado de validación para dictaminación técnica
  // Un objeto por cada sección (1-6)
  // ============================================
  const [validaciones, setValidaciones] = useState<{
    estado: EstadoValidacion;
    observaciones: string;
  }[]>([
    { estado: null, observaciones: '' }, // Sección 1
    { estado: null, observaciones: '' }, // Sección 2
    { estado: null, observaciones: '' }, // Sección 3
    { estado: null, observaciones: '' }, // Sección 4
    { estado: null, observaciones: '' }, // Sección 5
    { estado: null, observaciones: '' }, // Sección 6
  ]);

  // ============================================
  // Cálculo consolidado del dictamen
  // Determina el estado general y el botón a mostrar
  // ============================================
  const dictamen = useMemo(() => {
    const secciones: ValidacionSeccion[] = validaciones.map((v, i) => ({
      seccion: i + 1,
      nombre: SECCIONES_NOMBRES[i],
      estado: v.estado,
      observaciones: v.observaciones,
    }));
    return calcularDictamen(secciones);
  }, [validaciones]);

  // ============================================
  // Validación: todas las observaciones requeridas están completas
  // ============================================
  const observacionesValidas = useMemo(() => {
    return validarObservacionesCompletas(
      validaciones.map((v, i) => ({
        seccion: i + 1,
        nombre: SECCIONES_NOMBRES[i],
        estado: v.estado,
        observaciones: v.observaciones,
      }))
    );
  }, [validaciones]);

  // ============================================
  // EFECTO: Sincronizar estados locales con datos cargados
  // ============================================
  useEffect(() => {
    if (requisicion) {
      const garantias = requisicion.garantiasObservaciones;
      setAplicaAnticipo(garantias.aplicaAnticipo);
      setPenasConvencionales(garantias.penasConvencionales);
      setGarantiaAnticipo(garantias.garantiaAnticipo);
      setGarantiaViciosOcultos(garantias.garantiaViciosOcultos);
      setGarantiaCumplimiento(garantias.garantiaCumplimiento);
      setObservaciones(garantias.observaciones);
    }
  }, [requisicion]);

  // ============================================
  // EFECTO: Mostrar mensajes de error
  // ============================================
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // ============================================
  // HANDLERS: Actualizar validación de una sección
  // ============================================
  const actualizarValidacionSeccion = (
    indice: number, 
    campo: 'estado' | 'observaciones', 
    valor: EstadoValidacion | string
  ) => {
    setValidaciones(prev => {
      const nuevas = [...prev];
      if (campo === 'estado') {
        nuevas[indice] = { 
          ...nuevas[indice], 
          estado: valor as EstadoValidacion,
          // Limpiar observaciones si se aprueba
          observaciones: valor === 'aprobado' ? '' : nuevas[indice].observaciones
        };
      } else {
        nuevas[indice] = { ...nuevas[indice], observaciones: valor as string };
      }
      return nuevas;
    });
  };

  // ============================================
  // HANDLERS: Acciones principales
  // ============================================

  /**
   * Autoriza la requisición (todas las secciones aprobadas)
   * Actualiza el estado en la BD y navega de vuelta al dashboard
   */
  const handleAutorizar = async () => {
    if (!dictamen.todasAprobadas) {
      toast({
        title: "Validación incompleta",
        description: "Debe aprobar todas las secciones para autorizar la requisición.",
        variant: "destructive",
      });
      return;
    }

    if (!requisicion) return;
    
    setIsSaving(true);
    
    // Preparar dictamen para guardar
    const dictamenData = validaciones.reduce((acc, v, i) => {
      acc[`seccion_${i + 1}`] = {
        estado: v.estado,
        observaciones: v.observaciones
      };
      return acc;
    }, {} as Record<string, unknown>);
    
    const resultado = await actualizarRequisicion(
      requisicion.id, 
      'autorizada',
      dictamenData
    );
    
    setIsSaving(false);
    
    if (resultado.exito) {
      toast({
        title: "Requisición Autorizada",
        description: "La requisición ha sido autorizada exitosamente.",
      });
      
      // Navegar de vuelta al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      toast({
        title: "Error",
        description: resultado.mensaje || "No se pudo autorizar la requisición.",
        variant: "destructive",
      });
    }
  };

  /**
   * Devuelve la requisición para corrección (hay secciones rechazadas)
   * Actualiza el estado en la BD y navega de vuelta al dashboard
   */
  const handleDevolver = async () => {
    if (!observacionesValidas) {
      toast({
        title: "Observaciones incompletas",
        description: "Debe indicar el motivo de rechazo en todas las secciones marcadas.",
        variant: "destructive",
      });
      return;
    }

    if (!requisicion) return;
    
    setIsSaving(true);
    
    // Preparar dictamen con observaciones para guardar
    const dictamenData = validaciones.reduce((acc, v, i) => {
      acc[`seccion_${i + 1}`] = {
        estado: v.estado,
        observaciones: v.observaciones
      };
      return acc;
    }, {} as Record<string, unknown>);
    
    console.log('Devolviendo requisición con observaciones:', dictamen.resumenObservaciones);
    
    const resultado = await actualizarRequisicion(
      requisicion.id, 
      'devuelta',
      dictamenData
    );
    
    setIsSaving(false);
    
    if (resultado.exito) {
      toast({
        title: "Requisición Devuelta",
        description: "La requisición ha sido devuelta para corrección.",
      });
      
      // Navegar de vuelta al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      toast({
        title: "Error",
        description: resultado.mensaje || "No se pudo devolver la requisición.",
        variant: "destructive",
      });
    }
  };

  // ============================================
  // RENDER: Estado de carga
  // ============================================
  if (isLoading || !requisicion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Cargando requisición...</span>
      </div>
    );
  }

  // ============================================
  // Datos desestructurados para facilitar acceso
  // ============================================
  const { datosGenerales, items, resumenFinanciero, condicionesAnexos, aprobacionesFirmas } = requisicion;

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="min-h-screen relative">
      {/* Fondo con textura en escala de grises */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url(/texture-detail-gray.png)",
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          filter: "grayscale(100%) opacity(0.08)",
          backgroundColor: "#f5f5f5"
        }}
      />
      <div className="absolute inset-0 -z-20 bg-[#f5f5f5]" />

      {/* HEADER: Navegación principal */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/gobierno-mexico-logo.jpg" 
              alt="Gobierno de México" 
              className="h-10 object-contain"
            />
            <h1 className="text-xl font-semibold">Sistema de Requisiciones</h1>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
            
            <button className="flex items-center gap-1 hover:text-primary-foreground/80 transition-colors">
              <HelpCircle className="h-4 w-4" />
              <span>Ayuda</span>
            </button>
            
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>Octavio, Área de requisiciones</span>
            </div>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-6 max-w-5xl">
        
        {/* Banner informativo de dictaminación */}
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6">
          <h2 className="text-primary font-semibold text-lg mb-2 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Dictaminación Técnica
          </h2>
          <p className="text-sm text-muted-foreground">
            Revise cada sección y marque con el check verde (✓) para aprobar o la X roja para rechazar.
            Las secciones rechazadas requieren observaciones obligatorias.
          </p>
          
          {/* Resumen del estado de validación */}
          <div className="mt-3 flex flex-wrap gap-2">
            {validaciones.map((v, i) => (
              <span 
                key={i}
                className={`text-xs px-2 py-1 rounded-full ${
                  v.estado === 'aprobado' 
                    ? 'bg-green-100 text-green-700' 
                    : v.estado === 'rechazado'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                Sec. {i + 1}: {v.estado === 'aprobado' ? '✓' : v.estado === 'rechazado' ? '✗' : '—'}
              </span>
            ))}
          </div>
        </div>

        {/* SECCIÓN 1: Datos Generales de la Requisición */}
        <Section 
          title="Datos Generales de la Requisición" 
          number={1}
          estadoValidacion={validaciones[0].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(0, 'estado', estado)}
          observaciones={validaciones[0].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(0, 'observaciones', obs)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField 
              label="Unidad Administrativa" 
              value={datosGenerales.unidadAdministrativa} 
            />
            <ReadOnlyField 
              label="No. de Requisición" 
              value={datosGenerales.noRequisicion} 
            />
            <ReadOnlyField 
              label="Fecha de Recepción" 
              value={datosGenerales.fechaRecepcion} 
            />
            <ReadOnlyField 
              label="Página" 
              value={datosGenerales.pagina} 
            />
            <ReadOnlyField 
              label="Fecha de Elaboración" 
              value={datosGenerales.fechaElaboracion} 
            />
            <ReadOnlyField 
              label="Fecha Máxima de Entrega" 
              value={datosGenerales.fechaMaximaEntrega} 
            />
            <ReadOnlyField 
              label="Lugar de Entrega" 
              value={datosGenerales.lugarEntrega} 
              className="md:col-span-2"
            />
          </div>
        </Section>

        {/* SECCIÓN 2: Detalle de Bienes o Servicios */}
        <Section 
          title="Detalle de Bienes o Servicios" 
          number={2}
          estadoValidacion={validaciones[1].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(1, 'estado', estado)}
          observaciones={validaciones[1].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(1, 'observaciones', obs)}
        >
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-medium">Part.</TableHead>
                  <TableHead className="text-xs font-medium">CUCOP</TableHead>
                  <TableHead className="text-xs font-medium">Cant.</TableHead>
                  <TableHead className="text-xs font-medium">Unidad de Medida</TableHead>
                  <TableHead className="text-xs font-medium">P. Unitario</TableHead>
                  <TableHead className="text-xs font-medium">Importe</TableHead>
                  <TableHead className="text-xs font-medium">Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.partida}>
                    <TableCell>
                      <Input 
                        value={item.partida.toString()} 
                        readOnly 
                        className="w-12 bg-muted/50 text-center" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.cucop} 
                        readOnly 
                        className="w-36 bg-muted/50" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.cantidad.toString()} 
                        readOnly 
                        className="w-14 bg-muted/50 text-center" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.unidadMedida} 
                        readOnly 
                        className="w-24 bg-muted/50" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={`$${item.precioUnitario.toFixed(2)}`} 
                        readOnly 
                        className="w-24 bg-muted/50" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={`$${item.importe.toFixed(2)}`} 
                        readOnly 
                        className="w-24 bg-muted/50" 
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        value={item.descripcion} 
                        readOnly 
                        className="min-w-48 bg-muted/50" 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Section>

        {/* SECCIÓN 3: Resumen Financiero */}
        <Section 
          title="Resumen Financiero" 
          number={3}
          estadoValidacion={validaciones[2].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(2, 'estado', estado)}
          observaciones={validaciones[2].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(2, 'observaciones', obs)}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-lg">
                ${resumenFinanciero.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">I.V.A. (%)</span>
              <div className="flex items-center gap-4">
                <Input 
                  value={resumenFinanciero.ivaPorcentaje.toString()} 
                  readOnly 
                  className="w-16 bg-muted/50 text-center"
                />
                <span className="font-medium">
                  ${resumenFinanciero.ivaImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <span className="text-primary font-semibold text-lg">Total</span>
              <span className="text-primary font-bold text-2xl">
                ${resumenFinanciero.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </Section>

        {/* SECCIÓN 4: Condiciones y Anexos */}
        <Section 
          title="Condiciones y Anexos" 
          number={4}
          estadoValidacion={validaciones[3].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(3, 'estado', estado)}
          observaciones={validaciones[3].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(3, 'observaciones', obs)}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ReadOnlyField 
                label="Autorización del presupuesto" 
                value={condicionesAnexos.autorizacionPresupuesto} 
              />
              <ReadOnlyField 
                label="Número de autorización" 
                value={condicionesAnexos.numeroAutorizacion} 
              />
              <ReadOnlyField 
                label="Tiempo de fabricación" 
                value={condicionesAnexos.tiempoFabricacion} 
              />
              <ReadOnlyField 
                label="Plurianualidad (meses)" 
                value={condicionesAnexos.plurianualidad} 
              />
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Anexos</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={condicionesAnexos.anexos} 
                  readOnly 
                  className="bg-muted/50 border-border cursor-default flex-1"
                />
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Search className="h-4 w-4 mr-1" />
                  Ver documento
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Condiciones de entrega</Label>
              <Textarea 
                value={condicionesAnexos.condicionesEntrega} 
                readOnly 
                className="bg-muted/50 border-border cursor-default resize-none"
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReadOnlyField 
                label="Registro sanitario" 
                value={condicionesAnexos.registroSanitario} 
              />
              <ReadOnlyField 
                label="Normas" 
                value={condicionesAnexos.normas} 
              />
              <ReadOnlyField 
                label="Capacitación" 
                value={condicionesAnexos.capacitacion} 
              />
            </div>
          </div>
        </Section>

        {/* SECCIÓN 5: Garantías y Observaciones (EDITABLE) */}
        <Section 
          title="Garantías y Observaciones" 
          number={5}
          estadoValidacion={validaciones[4].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(4, 'estado', estado)}
          observaciones={validaciones[4].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(4, 'observaciones', obs)}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={aplicaAnticipo} 
                  onCheckedChange={(checked) => {
                    setAplicaAnticipo(checked);
                  }}
                />
                <Label className="text-sm">Aplica anticipo</Label>
              </div>
              
              <div className="flex items-center gap-2">
                <Switch 
                  checked={penasConvencionales} 
                  onCheckedChange={(checked) => {
                    setPenasConvencionales(checked);
                  }}
                />
                <Label className="text-sm">Penas convencionales</Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Garantía de anticipo (%)
                </Label>
                <Input 
                  value={garantiaAnticipo} 
                  onChange={(e) => {
                    setGarantiaAnticipo(e.target.value);
                  }}
                  disabled={!aplicaAnticipo}
                  className={`${!aplicaAnticipo ? "bg-muted/30 text-muted-foreground" : "bg-background border-input"}`}
                  placeholder="Ej: 10%"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Garantía de vicios ocultos (%)
                </Label>
                <Input 
                  value={garantiaViciosOcultos} 
                  onChange={(e) => {
                    setGarantiaViciosOcultos(e.target.value);
                  }}
                  className="bg-background border-input"
                  placeholder="Ej: 10%"
                />
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Garantía de cumplimiento (%)
                </Label>
                <Input 
                  value={garantiaCumplimiento} 
                  onChange={(e) => {
                    setGarantiaCumplimiento(e.target.value);
                  }}
                  disabled={!penasConvencionales}
                  className={`${!penasConvencionales ? "bg-muted/30 text-muted-foreground" : "bg-background border-input"}`}
                  placeholder="Ej: 10%"
                />
              </div>
            </div>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Observaciones</Label>
              <Textarea 
                value={observaciones}
                onChange={(e) => {
                  setObservaciones(e.target.value);
                }}
                placeholder="Ingrese observaciones adicionales..."
                className="bg-background border-input resize-none"
                rows={3}
              />
            </div>
          </div>
        </Section>

        {/* SECCIÓN 6: Aprobaciones y Firmas */}
        <Section 
          title="Aprobaciones y Firmas" 
          number={6}
          estadoValidacion={validaciones[5].estado}
          onEstadoValidacionChange={(estado) => actualizarValidacionSeccion(5, 'estado', estado)}
          observaciones={validaciones[5].observaciones}
          onObservacionesChange={(obs) => actualizarValidacionSeccion(5, 'observaciones', obs)}
        >
          <div className="space-y-4">
            <ReadOnlyField 
              label="Área Solicitante (Nombre y cargo)" 
              value={aprobacionesFirmas.areaSolicitante} 
            />
            
            <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
              <p className="text-sm text-primary">
                Nota: Al enviar esta requisición para aprobación, la persona responsable 
                del presupuesto y el área requirente deberán firmar el documento.
              </p>
            </div>
          </div>
        </Section>

        {/* ============================================
            BOTONES DE ACCIÓN DINÁMICOS
            Cambian según el estado del dictamen:
            - Todas aprobadas -> "Autorizar Requisición" (guinda)
            - Hay rechazos -> "Devolver para Corrección" (rojo)
            ============================================ */}
        <div className="flex flex-col items-center gap-4 mt-6 pb-8">
          {/* Mensaje de estado del dictamen */}
          {!dictamen.completo && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Faltan {6 - validaciones.filter(v => v.estado !== null).length} secciones por dictaminar
            </p>
          )}
          
          {dictamen.tieneRechazos && !observacionesValidas && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Complete las observaciones de las secciones rechazadas
            </p>
          )}

          <div className="flex items-center gap-4">
            {/* Botón principal dinámico */}
            {dictamen.todasAprobadas ? (
              // Todas las secciones aprobadas -> Autorizar (guinda)
              <Button 
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={handleAutorizar}
                disabled={isSaving || !dictamen.completo}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Autorizar Requisición
              </Button>
            ) : dictamen.tieneRechazos ? (
              // Hay secciones rechazadas -> Devolver (rojo)
              <Button 
                className="gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                onClick={handleDevolver}
                disabled={isSaving || !observacionesValidas}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Devolver para Corrección
              </Button>
            ) : (
              // Estado intermedio (sin dictamen completo)
              <Button 
                className="gap-2"
                disabled
              >
                <AlertCircle className="h-4 w-4" />
                Dictamine todas las secciones
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequisitionDetail;
