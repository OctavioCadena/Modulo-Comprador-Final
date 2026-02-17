// ============================================
// PÁGINA PRINCIPAL - Dashboard de Requisiciones
// Sistema Integral de Adquisiciones Gubernamentales
// ============================================
// Esta página muestra el resumen de requisiciones del usuario,
// incluyendo tarjetas de estatus y tabla de requisiciones.
// 
// PERSISTENCIA:
// Usa useRequisicionesStore para persistir datos en localStorage.
// Los cambios realizados desde el detalle se reflejan automáticamente.
// 
// PARA CONECTAR CON BACKEND:
// 1. Descomentar el useEffect que llama a fetchDashboardData
// 2. Usar los datos del hook useDashboard en lugar de los mock
// 3. Los contadores de las tarjetas vendrán de resumenEstatus
// 4. La información del usuario vendrá del endpoint /api/usuarios/me
// ============================================

// Importaciones de iconos para las tarjetas de estatus
import { FileText, Clock, AlertCircle, CheckCircle, Eye } from "lucide-react";
// Hook de React para manejar estado local y callback
import { useCallback, useState } from "react";
// Componentes del Dashboard
import Header from "@/components/Header";
import StatusCard from "@/components/StatusCard";
import RequisitionsTable from "@/components/RequisitionsTable";
// Hook de conexión a base de datos
import { useRequisicionesDB } from "@/hooks/useRequisicionesDB";
// Tipos del dashboard
import { EstatusRequisicion } from "@/types/dashboard";

// ============================================
// TIPOS
// ============================================

/**
 * StatusFilter - Define los posibles filtros de estatus
 * "all" muestra todas las requisiciones
 * Los demás valores filtran por estatus específico
 * Incluye el nuevo estatus "Pendiente de Revisión"
 */
export type StatusFilter = "all" | "En Captura" | "Pendiente de Revisión" | "En Autorización" | "Devuelta para Corrección" | "Autorizada";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Index = () => {
  // ============================================
  // HOOKS Y ESTADOS
  // ============================================
  
  /**
   * Estado para el filtro de estatus activo
   * Controla qué requisiciones se muestran en la tabla
   */
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  
  /**
   * Hook de conexión a base de datos
   * Los datos se cargan desde Lovable Cloud (Supabase)
   */
  const { 
    requisiciones,
    isLoading,
    error,
    actualizarEstatus,
  } = useRequisicionesDB();

  // ============================================
  // CÁLCULO DINÁMICO DE CONTADORES
  // ============================================
  // IMPORTANTE PARA BACKEND:
  // Estos contadores se calculan automáticamente del array `requisiciones`.
  // Cuando se conecte el backend, se puede:
  // 1. Seguir calculando desde el array de requisiciones
  // 2. Usar `resumenEstatus` del hook si el backend lo proporciona directamente
  // El cálculo dinámico garantiza consistencia entre tabla y tarjetas.
  // ============================================

  /**
   * Contador: Requisiciones en estado "En Captura"
   * Cálculo: Filtra el array y cuenta los elementos
   */
  const contadorEnCaptura = requisiciones.filter(
    (req) => req.estatus === "En Captura"
  ).length;

  /**
   * Contador: Requisiciones en estado "Pendiente de Revisión"
   * Cálculo: Filtra el array y cuenta los elementos
   */
  const contadorPendienteRevision = requisiciones.filter(
    (req) => req.estatus === "Pendiente de Revisión"
  ).length;

  /**
   * Contador: Requisiciones en estado "En Autorización"
   * Cálculo: Filtra el array y cuenta los elementos
   */
  const contadorEnAutorizacion = requisiciones.filter(
    (req) => req.estatus === "En Autorización"
  ).length;

  /**
   * Contador: Requisiciones en estado "Devuelta para Corrección"
   * Cálculo: Filtra el array y cuenta los elementos
   */
  const contadorDevueltasCorreccion = requisiciones.filter(
    (req) => req.estatus === "Devuelta para Corrección"
  ).length;

  /**
   * Contador: Requisiciones en estado "Autorizada"
   * Cálculo: Filtra el array y cuenta los elementos
   */
  const contadorAutorizadas = requisiciones.filter(
    (req) => req.estatus === "Autorizada"
  ).length;

  // ============================================
  // CALLBACKS
  // ============================================

  /**
   * handleRequisicionUpdate - Actualiza el estado de una requisición
   * Esta función se pasa a RequisitionsTable para sincronizar
   * los cambios de estado y que los contadores se actualicen
   * 
   * @param id - ID de la requisición
   * @param nuevoEstatus - Nuevo estatus a aplicar
   * 
   * Los cambios se persisten automáticamente en localStorage
   * gracias al hook useRequisicionesStore
   */
  const handleRequisicionUpdate = useCallback(async (id: string, nuevoEstatus: EstatusRequisicion) => {
    await actualizarEstatus(id, nuevoEstatus);
  }, [actualizarEstatus]);

  // ============================================
  // DATOS MOCK DE USUARIO (Eliminar cuando se conecte el backend)
  // ============================================
  
  /**
   * Datos del usuario actual
   * TODO: Reemplazar con datos de `usuario` del hook
   * Endpoint esperado: GET /api/usuarios/me
   */
  const usuarioMock = {
    nombreCompleto: "Juan Pérez García",
    cargo: "Jefe de Departamento",
    area: "Dirección de Adquisiciones"
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-background relative">
      {/* ============================================
          TEXTURA DE FONDO
          Imagen oficial del Gobierno de México en escala de grises
          Configuración: opacity 5%, tamaño 600px, repetición
          ============================================ */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'url(/texture-bg-gray.jpg)',
          backgroundSize: '600px 600px',
          backgroundRepeat: 'repeat'
        }}
      />
      
      <div className="relative z-10">
        {/* ============================================
            ENCABEZADO (Header)
            Muestra: Logo, menú, notificaciones y perfil
            Props:
            - userName: Nombre del usuario (viene de backend)
            - userRole: Cargo del usuario (viene de backend)
            ============================================ */}
        <Header 
          userName={usuarioMock.nombreCompleto}  // TODO: Usar usuario?.nombreCompleto
          userRole={usuarioMock.cargo}            // TODO: Usar usuario?.cargo
        />
        
        <main className="container mx-auto px-4 py-8">
          {/* ============================================
              SECCIÓN DE BIENVENIDA
              Muestra saludo personalizado con nombre y cargo
              Datos: Vienen del endpoint /api/usuarios/me
              ============================================ */}
          <div className="mb-8">
            {/* Título de bienvenida con nombre del usuario */}
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Bienvenido, {usuarioMock.nombreCompleto}  {/* TODO: Usar usuario?.nombreCompleto */}
            </h1>
            {/* Subtítulo con cargo y área del usuario */}
            <p className="text-muted-foreground">
              {usuarioMock.cargo} · {usuarioMock.area}  {/* TODO: Usar datos del usuario */}
            </p>
          </div>

          {/* ============================================
              TARJETAS DE RESUMEN DE ESTATUS
              Grid responsivo: 1 col (móvil), 2-3 cols (tablet), 5 cols (desktop)
              Cada tarjeta es clickeable para filtrar la tabla
              Incluye 5 estados: En Captura, Pendiente de Revisión, En Autorización,
              Devuelta para Corrección, Autorizada
              Datos: Vienen del endpoint GET /api/dashboard/resumen-estatus
              ============================================ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            
            {/* Tarjeta 1: Requisiciones En Captura
                Icono: Documento (FileText)
                Color: Azul (status-capture)
                CÁLCULO DINÁMICO: count usa contadorEnCaptura calculado arriba */}
            <StatusCard
              title="En Captura"
              count={contadorEnCaptura}
              icon={FileText}
              iconColor="bg-status-capture/10 text-status-capture"
              isActive={statusFilter === "En Captura"}
              onClick={() => setStatusFilter(statusFilter === "En Captura" ? "all" : "En Captura")}
            />
            
            {/* Tarjeta 2: Requisiciones Pendientes de Revisión
                Icono: Ojo (Eye)
                Color: Azul grisáceo (status-pending-review)
                CÁLCULO DINÁMICO: count usa contadorPendienteRevision calculado arriba */}
            <StatusCard
              title="Pendiente de Revisión"
              count={contadorPendienteRevision}
              icon={Eye}
              iconColor="bg-status-pending-review/10 text-status-pending-review"
              isActive={statusFilter === "Pendiente de Revisión"}
              onClick={() => setStatusFilter(statusFilter === "Pendiente de Revisión" ? "all" : "Pendiente de Revisión")}
            />
            
            {/* Tarjeta 3: Requisiciones En Autorización
                Icono: Reloj (Clock)
                Color: Amarillo (status-authorization)
                CÁLCULO DINÁMICO: count usa contadorEnAutorizacion calculado arriba */}
            <StatusCard
              title="En Autorización"
              count={contadorEnAutorizacion}
              icon={Clock}
              iconColor="bg-status-authorization/10 text-status-authorization"
              isActive={statusFilter === "En Autorización"}
              onClick={() => setStatusFilter(statusFilter === "En Autorización" ? "all" : "En Autorización")}
            />
            
            {/* Tarjeta 4: Requisiciones Devueltas para Corrección
                Icono: Alerta (AlertCircle)
                Color: Rojo (status-returned)
                CÁLCULO DINÁMICO: count usa contadorDevueltasCorreccion calculado arriba */}
            <StatusCard
              title="Devueltas"
              count={contadorDevueltasCorreccion}
              icon={AlertCircle}
              iconColor="bg-status-returned/10 text-status-returned"
              isActive={statusFilter === "Devuelta para Corrección"}
              onClick={() => setStatusFilter(statusFilter === "Devuelta para Corrección" ? "all" : "Devuelta para Corrección")}
            />
            
            {/* Tarjeta 5: Requisiciones Autorizadas
                Icono: Check (CheckCircle)
                Color: Verde (status-authorized)
                CÁLCULO DINÁMICO: count usa contadorAutorizadas calculado arriba */}
            <StatusCard
              title="Autorizadas"
              count={contadorAutorizadas}
              icon={CheckCircle}
              iconColor="bg-status-authorized/10 text-status-authorized"
              isActive={statusFilter === "Autorizada"}
              onClick={() => setStatusFilter(statusFilter === "Autorizada" ? "all" : "Autorizada")}
            />
          </div>

          {/* ============================================
              TABLA DE REQUISICIONES
              Muestra lista filtrada de requisiciones
              Props:
              - statusFilter: Filtro activo (all, En Captura, etc.)
              - requisiciones: Lista de requisiciones (del store persistente)
              - onRequisicionUpdate: Callback para sincronizar cambios de estado
              
              IMPORTANTE: Los datos vienen del hook useRequisicionesStore
              que persiste en localStorage, asegurando consistencia
              entre Dashboard y RequisitionDetail
              ============================================ */}
          <RequisitionsTable 
            statusFilter={statusFilter}
            requisiciones={requisiciones}
            onRequisicionUpdate={handleRequisicionUpdate}
          />
        </main>
      </div>
    </div>
  );
};

export default Index;
