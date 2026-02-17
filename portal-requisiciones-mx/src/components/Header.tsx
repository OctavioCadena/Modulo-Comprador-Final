// ============================================
// COMPONENTE HEADER - Encabezado Principal
// Sistema Integral de Adquisiciones Gubernamentales
// ============================================
// Este componente muestra el encabezado de la aplicación
// incluyendo: logo, menú, notificaciones y perfil de usuario.
// 
// PARA CONECTAR CON BACKEND:
// 1. Las props userName y userRole vendrán del endpoint /api/usuarios/me
// 2. El contador de notificaciones vendrá de /api/notificaciones/count
// 3. El menú hamburguesa puede expandirse para mostrar navegación
// ============================================

// Importaciones de iconos de Lucide
import { Bell, HelpCircle, Menu, Database } from "lucide-react";
// Componentes UI de shadcn
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// Componente de Schema de BD
import DatabaseSchemaViewer from "@/components/DatabaseSchemaViewer";
import { useState } from "react";

// ============================================
// TIPOS E INTERFACES
// ============================================

/**
 * HeaderProps - Propiedades del componente Header
 * Estas propiedades vendrán del backend una vez conectado
 */
interface HeaderProps {
  /** 
   * Nombre completo del usuario logueado
   * Endpoint: GET /api/usuarios/me -> nombreCompleto
   */
  userName: string;
  
  /** 
   * Cargo o rol del usuario
   * Endpoint: GET /api/usuarios/me -> cargo
   */
  userRole: string;
  
  /**
   * URL del avatar del usuario (opcional)
   * TODO: Agregar cuando se conecte el backend
   * Endpoint: GET /api/usuarios/me -> avatarUrl
   */
  // avatarUrl?: string;
  
  /**
   * Número de notificaciones pendientes (opcional)
   * TODO: Agregar cuando se conecte el backend
   * Endpoint: GET /api/notificaciones/count
   */
  // notificacionesPendientes?: number;
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Genera las iniciales del usuario a partir de su nombre completo
 * @param nombreCompleto - Nombre completo del usuario
 * @returns Las primeras 2 iniciales en mayúsculas
 * @example getIniciales("Juan Pérez García") => "JP"
 */
const getIniciales = (nombreCompleto: string): string => {
  return nombreCompleto
    .split(' ')
    .map(palabra => palabra[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

const Header = ({ userName, userRole }: HeaderProps) => {
  const [schemaOpen, setSchemaOpen] = useState(false);
  
  // ============================================
  // RENDER
  // ============================================
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* ============================================
              SECCIÓN IZQUIERDA: Menú, Logo y Título
              ============================================ */}
          <div className="flex items-center gap-4">
            
            {/* Botón de menú hamburguesa
                TODO: Implementar navegación lateral al hacer clic */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary/80"
              // onClick={() => setMenuAbierto(true)} // TODO: Implementar
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo oficial del Gobierno de México
                Imagen ubicada en /public/gobierno-mexico-logo.jpg
                NOTA: Se aplica mix-blend-mode: multiply para eliminar
                el fondo blanco y que se integre con el header guinda */}
            <div className="flex items-center">
              <img 
                src="/gobierno-mexico-logo.png" 
                alt="Gobierno de México" 
                className="h-12 w-auto"
              />
            </div>
            
            {/* Título del sistema (solo visible en pantallas grandes >= lg) */}
            <div className="hidden lg:block border-l border-primary-foreground/30 pl-4 ml-2">
              <span className="text-sm font-medium">
                Sistema Integral de Adquisiciones Gubernamentales
              </span>
            </div>
          </div>

          {/* ============================================
              SECCIÓN DERECHA: Notificaciones y Perfil
              ============================================ */}
          <div className="flex items-center gap-3">
            
            {/* Botón de notificaciones
                TODO: Mostrar badge con número de notificaciones pendientes
                Endpoint: GET /api/notificaciones/count */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary/80"
              // onClick={() => abrirPanelNotificaciones()} // TODO: Implementar
            >
              <Bell className="h-5 w-5" />
              {/* TODO: Agregar badge de notificaciones
              {notificacionesPendientes > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notificacionesPendientes}
                </span>
              )}
              */}
            </Button>
            
            {/* Menú de ayuda con dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary/80"
                >
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setSchemaOpen(true)} className="gap-2 cursor-pointer">
                  <Database className="h-4 w-4" />
                  Ver Schema de BD
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Dialog de Schema de BD */}
            <Dialog open={schemaOpen} onOpenChange={setSchemaOpen}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" />
                    Schema de Base de Datos
                  </DialogTitle>
                  <DialogDescription>
                    Estructura SQL para PostgreSQL/Supabase. Tabla plana sin Foreign Keys para facilitar la demostración.
                  </DialogDescription>
                </DialogHeader>
                <DatabaseSchemaViewer />
              </DialogContent>
            </Dialog>
            
            {/* ============================================
                PERFIL DE USUARIO
                Visible solo en pantallas >= sm (oculto en móvil)
                Muestra: Avatar, Nombre y Cargo
                Datos del endpoint: GET /api/usuarios/me
                ============================================ */}
            <div className="hidden sm:flex items-center gap-3 border-l border-primary-foreground/30 pl-3 ml-2">
              
              {/* Avatar del usuario
                  Muestra iniciales como fallback si no hay imagen */}
              <Avatar className="h-9 w-9">
                {/* TODO: Agregar imagen cuando se conecte backend
                <AvatarImage src={avatarUrl} alt={userName} />
                */}
                <AvatarFallback className="bg-primary-foreground text-primary text-sm font-semibold">
                  {getIniciales(userName)}
                </AvatarFallback>
              </Avatar>
              
              {/* Información del usuario */}
              <div className="text-right">
                {/* Nombre completo del usuario */}
                <div className="text-sm font-semibold leading-tight">
                  {userName}
                </div>
                {/* Cargo del usuario */}
                <div className="text-xs opacity-90 leading-tight">
                  {userRole}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
