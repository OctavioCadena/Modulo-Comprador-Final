-- CREAR TABLA REQUISICIONES

CREATE TABLE requisiciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by VARCHAR(100) DEFAULT 'Sistema Requirente',
  estatus VARCHAR(30) NOT NULL DEFAULT 'en_captura',
  
  -- SECCIÓN 1
  unidad_administrativa VARCHAR(200) NOT NULL,
  fecha_recepcion DATE NOT NULL,
  fecha_elaboracion DATE NOT NULL,
  fecha_maxima_entrega DATE NOT NULL,
  lugar_entrega VARCHAR(200) NOT NULL,
  pagina VARCHAR(10) DEFAULT '1/1',
  
  -- SECCIÓN 2
  items JSONB NOT NULL DEFAULT '[]',
  
  -- SECCIÓN 3
  subtotal DECIMAL(15,2) NOT NULL DEFAULT 0,
  iva_porcentaje DECIMAL(5,2) DEFAULT 16.00,
  iva_importe DECIMAL(15,2) NOT NULL DEFAULT 0,
  total DECIMAL(15,2) NOT NULL DEFAULT 0,
  
  -- SECCIÓN 4
  autorizacion_presupuesto VARCHAR(100),
  numero_autorizacion VARCHAR(50),
  tiempo_fabricacion VARCHAR(50),
  plurianualidad VARCHAR(20) DEFAULT 'N/A',
  anexos VARCHAR(200),
  condiciones_entrega TEXT,
  registro_sanitario VARCHAR(50) DEFAULT 'N/A',
  normas VARCHAR(200) DEFAULT 'N/A',
  capacitacion VARCHAR(200) DEFAULT 'N/A',
  
  -- SECCIÓN 5
  aplica_anticipo BOOLEAN DEFAULT FALSE,
  penas_convencionales BOOLEAN DEFAULT TRUE,
  garantia_anticipo VARCHAR(10) DEFAULT '10%',
  garantia_vicios_ocultos VARCHAR(10) DEFAULT '10%',
  garantia_cumplimiento VARCHAR(10) DEFAULT '10%',
  observaciones_generales TEXT,
  
  -- SECCIÓN 6
  area_solicitante VARCHAR(200),
  firma_solicitante TEXT,
  firma_presupuesto TEXT,
  estado_aprobacion VARCHAR(20) DEFAULT 'pendiente',
  
  -- DICTAMINACIÓN
  dictamen_secciones JSONB DEFAULT '{}',
  historial_devoluciones JSONB DEFAULT '[]',
  
  -- OTROS
  justificacion TEXT,
  tipo_contratacion VARCHAR(50),
  partida_presupuestal VARCHAR(100),
  clave_partida VARCHAR(20),
  proveedores_sugeridos JSONB DEFAULT '[]'
);

-- HABILITAR RLS CON ACCESO PÚBLICO (DEMO)
ALTER TABLE requisiciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso público lectura" ON requisiciones FOR SELECT USING (true);
CREATE POLICY "Acceso público inserción" ON requisiciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Acceso público actualización" ON requisiciones FOR UPDATE USING (true);
CREATE POLICY "Acceso público eliminación" ON requisiciones FOR DELETE USING (true);

-- ÍNDICES PARA OPTIMIZACIÓN
CREATE INDEX idx_requisiciones_estatus ON requisiciones(estatus);
CREATE INDEX idx_requisiciones_folio ON requisiciones(folio);
CREATE INDEX idx_requisiciones_fecha_recepcion ON requisiciones(fecha_recepcion);