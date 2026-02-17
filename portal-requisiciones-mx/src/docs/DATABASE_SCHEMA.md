# ============================================
# SCHEMA DE BASE DE DATOS - Sistema de Adquisiciones
# Sistema Integral de Adquisiciones Gubernamentales
# ============================================
#
# Este documento define la estructura de tabla plana (sin FK)
# para facilitar la demostración y posterior migración a SQL.
#
# NOTAS:
# - Todos los campos relacionales usan texto directo (strings)
# - Las validaciones de secciones usan JSON o columnas específicas
# - Diseñado para PostgreSQL / Supabase
# ============================================

## TABLA PRINCIPAL: requisiciones

```sql
CREATE TABLE requisiciones (
  -- ========================================
  -- IDENTIFICADORES Y METADATOS
  -- ========================================
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio                     VARCHAR(20) NOT NULL UNIQUE,      -- Ej: "REQ-2024-001"
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  updated_at                TIMESTAMPTZ DEFAULT NOW(),
  created_by                VARCHAR(100),                      -- Nombre del usuario que creó
  
  -- ========================================
  -- ESTATUS DEL FLUJO DE TRABAJO
  -- ========================================
  -- Valores posibles:
  --   'en_captura'                 - Requisición en proceso de llenado
  --   'pendiente_revision'         - Enviada para revisión técnica
  --   'en_autorizacion'            - Pendiente de autorización
  --   'devuelta_correccion'        - Devuelta con observaciones
  --   'autorizada'                 - Aprobada completamente
  estatus                   VARCHAR(30) NOT NULL DEFAULT 'en_captura',
  
  -- ========================================
  -- SECCIÓN 1: DATOS GENERALES
  -- ========================================
  unidad_administrativa     VARCHAR(200) NOT NULL,             -- Nombre completo de la unidad
  fecha_recepcion           DATE NOT NULL,                     -- Cuándo se recibió
  fecha_elaboracion         DATE NOT NULL,                     -- Cuándo se creó
  fecha_maxima_entrega      DATE NOT NULL,                     -- Deadline
  lugar_entrega             VARCHAR(200) NOT NULL,             -- Ubicación física
  pagina                    VARCHAR(10) DEFAULT '1/1',         -- Paginación del documento
  
  -- ========================================
  -- SECCIÓN 2: DETALLE DE BIENES O SERVICIOS
  -- Se almacena como JSON array para simplicidad
  -- ========================================
  -- Estructura de cada item:
  -- {
  --   "partida": 1,
  --   "cucop": "C860200000",
  --   "cantidad": 100,
  --   "unidad_medida": "Piezas",
  --   "precio_unitario": 1250.00,
  --   "importe": 125000.00,
  --   "descripcion": "Descripción detallada del bien..."
  -- }
  items                     JSONB NOT NULL DEFAULT '[]',
  
  -- ========================================
  -- SECCIÓN 3: RESUMEN FINANCIERO
  -- Calculado automáticamente de items
  -- ========================================
  subtotal                  DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_porcentaje            DECIMAL(5,2) DEFAULT 16.00,
  iva_importe               DECIMAL(15,2) NOT NULL DEFAULT 0,
  total                     DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- ========================================
  -- SECCIÓN 4: CONDICIONES Y ANEXOS
  -- ========================================
  autorizacion_presupuesto  VARCHAR(100),                      -- Clave de autorización
  numero_autorizacion       VARCHAR(50),                       -- Número asignado
  tiempo_fabricacion        VARCHAR(50),                       -- Ej: "15 días hábiles"
  plurianualidad            VARCHAR(20) DEFAULT 'N/A',         -- Meses si aplica
  anexos                    VARCHAR(200),                      -- Nombre del archivo
  condiciones_entrega       TEXT,                              -- Texto libre
  registro_sanitario        VARCHAR(50) DEFAULT 'N/A',
  normas                    VARCHAR(200) DEFAULT 'N/A',
  capacitacion              VARCHAR(200) DEFAULT 'N/A',
  
  -- ========================================
  -- SECCIÓN 5: GARANTÍAS Y OBSERVACIONES
  -- Campos editables por el revisor
  -- ========================================
  aplica_anticipo           BOOLEAN DEFAULT FALSE,
  penas_convencionales      BOOLEAN DEFAULT TRUE,
  garantia_anticipo         VARCHAR(10) DEFAULT '10%',
  garantia_vicios_ocultos   VARCHAR(10) DEFAULT '10%',
  garantia_cumplimiento     VARCHAR(10) DEFAULT '10%',
  observaciones_generales   TEXT,                              -- Notas del revisor
  
  -- ========================================
  -- SECCIÓN 6: APROBACIONES Y FIRMAS
  -- ========================================
  area_solicitante          VARCHAR(200),                      -- Nombre y cargo
  firma_solicitante         TEXT,                              -- Base64 o URL de firma
  firma_presupuesto         TEXT,                              -- Base64 o URL de firma
  estado_aprobacion         VARCHAR(20) DEFAULT 'pendiente',   -- pendiente, aprobado, rechazado
  
  -- ========================================
  -- VALIDACIONES DE DICTAMINACIÓN TÉCNICA
  -- Almacena el estado de revisión de cada sección
  -- ========================================
  -- OPCIÓN A: Una columna JSON consolidada
  -- Estructura:
  -- {
  --   "seccion_1": { "estado": "aprobado", "observaciones": "" },
  --   "seccion_2": { "estado": "rechazado", "observaciones": "Falta descripción..." },
  --   ...
  -- }
  dictamen_secciones        JSONB DEFAULT '{}',
  
  -- OPCIÓN B: Columnas individuales (alternativa más explícita)
  -- Descomenta si prefieres columnas separadas:
  --
  -- seccion_1_estado          VARCHAR(20),    -- 'aprobado' | 'rechazado' | null
  -- seccion_1_observaciones   TEXT,
  -- seccion_2_estado          VARCHAR(20),
  -- seccion_2_observaciones   TEXT,
  -- seccion_3_estado          VARCHAR(20),
  -- seccion_3_observaciones   TEXT,
  -- seccion_4_estado          VARCHAR(20),
  -- seccion_4_observaciones   TEXT,
  -- seccion_5_estado          VARCHAR(20),
  -- seccion_5_observaciones   TEXT,
  -- seccion_6_estado          VARCHAR(20),
  -- seccion_6_observaciones   TEXT,
  
  -- ========================================
  -- HISTORIAL DE DEVOLUCIONES
  -- Guarda cada devolución con fecha y motivo
  -- ========================================
  historial_devoluciones    JSONB DEFAULT '[]',
  -- Estructura:
  -- [
  --   {
  --     "fecha": "2024-10-15T10:30:00Z",
  --     "revisor": "Juan Pérez",
  --     "resumen": "Texto consolidado de observaciones...",
  --     "secciones_rechazadas": [1, 3, 5]
  --   }
  -- ]
  
  -- ========================================
  -- JUSTIFICACIÓN Y DATOS ADICIONALES
  -- ========================================
  justificacion             TEXT,                              -- Por qué se necesita
  tipo_contratacion         VARCHAR(50),                       -- Directa, Licitación, etc.
  partida_presupuestal      VARCHAR(100),                      -- Nombre de la partida
  clave_partida             VARCHAR(20),                       -- Clave numérica
  
  -- Proveedores sugeridos (opcional, para investigación de mercado)
  proveedores_sugeridos     JSONB DEFAULT '[]'
  -- Estructura:
  -- [
  --   { "nombre": "Proveedor SA", "rfc": "XXX", "contacto": "..." },
  --   ...
  -- ]
);

-- ========================================
-- ÍNDICES PARA CONSULTAS FRECUENTES
-- ========================================
CREATE INDEX idx_requisiciones_estatus ON requisiciones(estatus);
CREATE INDEX idx_requisiciones_folio ON requisiciones(folio);
CREATE INDEX idx_requisiciones_fecha ON requisiciones(fecha_recepcion);
CREATE INDEX idx_requisiciones_unidad ON requisiciones(unidad_administrativa);

-- ========================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requisiciones_updated_at
  BEFORE UPDATE ON requisiciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

---

## TABLA AUXILIAR (Opcional): usuarios

```sql
CREATE TABLE usuarios (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE NOT NULL,
  nombre_completo   VARCHAR(200) NOT NULL,
  cargo             VARCHAR(100),
  area              VARCHAR(150),
  rol               VARCHAR(30) DEFAULT 'capturista',  -- capturista, revisor, autorizador, admin
  activo            BOOLEAN DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);
```

---

## MAPEO DE ESTATUS (Frontend ↔ Backend)

| Frontend (UI)               | Backend (DB)           |
|-----------------------------|------------------------|
| "En Captura"                | `en_captura`           |
| "Pendiente de Revisión"     | `pendiente_revision`   |
| "En Autorización"           | `en_autorizacion`      |
| "Devuelta para Corrección"  | `devuelta_correccion`  |
| "Autorizada"                | `autorizada`           |

---

## FLUJO DE ESTADOS

```
┌─────────────────┐
│   en_captura    │ ← Usuario crea requisición
└────────┬────────┘
         │ Enviar
         ▼
┌─────────────────┐
│pendiente_revision│ ← Revisor técnico evalúa
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────────────────┐
│Aprobar│ │Rechazar (parcial)│
└───┬───┘ └────────┬─────────┘
    │              │
    ▼              ▼
┌─────────────┐ ┌──────────────────┐
│en_autorizacion│ │devuelta_correccion│
└──────┬──────┘ └─────────┬────────┘
       │                  │
       │        Usuario corrige
       │                  │
       │                  ▼
       │         ┌─────────────────┐
       │         │   en_captura    │ (ciclo)
       │         └─────────────────┘
       │
       ▼
┌─────────────────┐
│   autorizada    │ ← Autorizador aprueba
└─────────────────┘
```

---

## ENDPOINTS API SUGERIDOS

| Método | Endpoint                           | Descripción                          |
|--------|------------------------------------|--------------------------------------|
| GET    | `/api/requisiciones`               | Lista paginada de requisiciones      |
| GET    | `/api/requisiciones/:id`           | Detalle de una requisición           |
| POST   | `/api/requisiciones`               | Crear nueva requisición              |
| PUT    | `/api/requisiciones/:id`           | Actualizar requisición               |
| POST   | `/api/requisiciones/:id/enviar`    | Cambiar a `pendiente_revision`       |
| POST   | `/api/requisiciones/:id/autorizar` | Cambiar a `autorizada`               |
| POST   | `/api/requisiciones/:id/devolver`  | Cambiar a `devuelta_correccion`      |
| GET    | `/api/dashboard/resumen`           | Contadores por estatus               |
| GET    | `/api/usuarios/me`                 | Datos del usuario actual             |

---

## NOTAS DE IMPLEMENTACIÓN

1. **Sin Foreign Keys**: Esta estructura usa strings directos para evitar JOINs complejos en la demo.

2. **JSON vs Columnas**: 
   - Usar `dictamen_secciones` (JSONB) es más flexible
   - Usar columnas individuales es más explícito para queries SQL simples

3. **Cálculos Automáticos**: El `subtotal`, `iva_importe` y `total` deben calcularse:
   - En el frontend antes de guardar
   - O con un trigger en PostgreSQL

4. **Historial de Auditoría**: El campo `historial_devoluciones` permite rastrear cada devolución.

---

*Generado automáticamente por el Sistema de Adquisiciones v1.0*
