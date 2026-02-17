// ============================================
// COMPONENTE: DatabaseSchemaViewer
// Visualizador y descargador del Schema de BD
// ============================================
// Este componente muestra el schema de la base de datos
// y permite descargarlo como archivo .sql o .md
// ============================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Copy, Check, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

// ============================================
// SCHEMA SQL
// ============================================
const SCHEMA_SQL = `-- ========================================
-- SCHEMA DE BASE DE DATOS
-- Sistema de Adquisiciones Gubernamentales
-- ========================================

CREATE TABLE requisiciones (
  -- IDENTIFICADORES
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio                     VARCHAR(20) NOT NULL UNIQUE,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  created_by                VARCHAR(100),
  
  -- ESTATUS
  estatus                   VARCHAR(30) NOT NULL DEFAULT 'en_captura',
  
  -- SECCIÓN 1: DATOS GENERALES
  unidad_administrativa     VARCHAR(200) NOT NULL,
  fecha_recepcion           DATE NOT NULL,
  fecha_elaboracion         DATE NOT NULL,
  fecha_maxima_entrega      DATE NOT NULL,
  lugar_entrega             VARCHAR(200) NOT NULL,
  pagina                    VARCHAR(10) DEFAULT '1/1',
  
  -- SECCIÓN 2: DETALLE DE BIENES (JSON Array)
  items                     JSONB NOT NULL DEFAULT '[]',
  
  -- SECCIÓN 3: RESUMEN FINANCIERO
  subtotal                  DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_porcentaje            DECIMAL(5,2) DEFAULT 16.00,
  iva_importe               DECIMAL(15,2) NOT NULL DEFAULT 0,
  total                     DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- SECCIÓN 4: CONDICIONES Y ANEXOS
  autorizacion_presupuesto  VARCHAR(100),
  numero_autorizacion       VARCHAR(50),
  tiempo_fabricacion        VARCHAR(50),
  plurianualidad            VARCHAR(20) DEFAULT 'N/A',
  anexos                    VARCHAR(200),
  condiciones_entrega       TEXT,
  registro_sanitario        VARCHAR(50) DEFAULT 'N/A',
  normas                    VARCHAR(200) DEFAULT 'N/A',
  capacitacion              VARCHAR(200) DEFAULT 'N/A',
  
  -- SECCIÓN 5: GARANTÍAS Y OBSERVACIONES
  aplica_anticipo           BOOLEAN DEFAULT FALSE,
  penas_convencionales      BOOLEAN DEFAULT TRUE,
  garantia_anticipo         VARCHAR(10) DEFAULT '10%',
  garantia_vicios_ocultos   VARCHAR(10) DEFAULT '10%',
  garantia_cumplimiento     VARCHAR(10) DEFAULT '10%',
  observaciones_generales   TEXT,
  
  -- SECCIÓN 6: APROBACIONES
  area_solicitante          VARCHAR(200),
  firma_solicitante         TEXT,
  firma_presupuesto         TEXT,
  estado_aprobacion         VARCHAR(20) DEFAULT 'pendiente',
  
  -- DICTAMINACIÓN TÉCNICA (JSON)
  dictamen_secciones        JSONB DEFAULT '{}',
  historial_devoluciones    JSONB DEFAULT '[]',
  
  -- DATOS ADICIONALES
  justificacion             TEXT,
  tipo_contratacion         VARCHAR(50),
  partida_presupuestal      VARCHAR(100),
  clave_partida             VARCHAR(20),
  proveedores_sugeridos     JSONB DEFAULT '[]'
);

-- ÍNDICES
CREATE INDEX idx_requisiciones_estatus ON requisiciones(estatus);
CREATE INDEX idx_requisiciones_folio ON requisiciones(folio);
CREATE INDEX idx_requisiciones_fecha ON requisiciones(fecha_recepcion);

-- TABLA USUARIOS (Opcional)
CREATE TABLE usuarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  nombre_completo   VARCHAR(200) NOT NULL,
  cargo             VARCHAR(100),
  area              VARCHAR(150),
  rol               VARCHAR(30) DEFAULT 'capturista',
  activo            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
`;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const DatabaseSchemaViewer = () => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  /**
   * Copia el schema al portapapeles
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SCHEMA_SQL);
      setCopied(true);
      toast({
        title: "Copiado",
        description: "Schema copiado al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar al portapapeles",
        variant: "destructive",
      });
    }
  };

  /**
   * Descarga el schema como archivo SQL
   */
  const handleDownloadSQL = () => {
    const blob = new Blob([SCHEMA_SQL], { type: "text/sql" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "database_schema.sql";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Descargado",
      description: "Archivo database_schema.sql descargado",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Database className="h-4 w-4" />
          Ver Schema de BD
        </Button>
      </DialogTrigger>
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
        
        <div className="flex gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadSQL} className="gap-2">
            <Download className="h-4 w-4" />
            Descargar .sql
          </Button>
        </div>
        
        <div className="flex-1 overflow-auto bg-muted rounded-lg p-4">
          <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
            {SCHEMA_SQL}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseSchemaViewer;
