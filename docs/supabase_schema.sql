-- ═══════════════════════════════════════════════════════════════════════════
-- SCHEMA CUENTAS COMPARTIDAS
-- Ejecutar en el SQL Editor de Supabase (https://supabase.com/dashboard)
-- ═══════════════════════════════════════════════════════════════════════════

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabla: users ─────────────────────────────────────────────────────────────
-- Almacena los miembros del grupo (no usa auth de Supabase, acceso por contraseña compartida)
CREATE TABLE IF NOT EXISTS users (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre       TEXT        NOT NULL,
  color        TEXT        NOT NULL DEFAULT '#2563eb',   -- Color de acento del perfil
  avatar_tipo  INTEGER     NOT NULL DEFAULT 0,            -- 0-11: índice del avatar SVG
  activo       BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: categorias ────────────────────────────────────────────────────────
-- Tipos de gasto personalizables con monto sugerido
CREATE TABLE IF NOT EXISTS categorias (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre           TEXT        NOT NULL UNIQUE,
  icono            TEXT        NOT NULL DEFAULT '💰',
  monto_sugerido   DECIMAL(10,2),          -- NULL = sin sugerencia
  color            TEXT        NOT NULL DEFAULT '#64748b',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: transactions ───────────────────────────────────────────────────────
-- Historial completo de ingresos y gastos
CREATE TABLE IF NOT EXISTS transactions (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo             TEXT        NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  monto            DECIMAL(10,2) NOT NULL CHECK (monto > 0),
  descripcion      TEXT,
  categoria_id     UUID        REFERENCES categorias(id) ON DELETE SET NULL,
  categoria_nombre TEXT,                   -- Desnormalizado para histórico
  pagado_por       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dividido_entre   UUID[]      NOT NULL DEFAULT '{}',   -- IDs de participantes
  fecha            DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_transactions_fecha       ON transactions(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_tipo        ON transactions(tipo);
CREATE INDEX IF NOT EXISTS idx_transactions_pagado_por  ON transactions(pagado_por);
CREATE INDEX IF NOT EXISTS idx_transactions_categoria   ON transactions(categoria_id);

-- ── Tabla: audit_log ──────────────────────────────────────────────────────────
-- Registro de quién modificó/eliminó qué transacción
CREATE TABLE IF NOT EXISTS audit_log (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla           TEXT        NOT NULL,
  accion          TEXT        NOT NULL CHECK (accion IN ('INSERT', 'UPDATE', 'DELETE')),
  registro_id     UUID        NOT NULL,
  usuario_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  datos_anteriores JSONB,
  datos_nuevos     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Tabla: messages ───────────────────────────────────────────────────────────
-- Chat interno del grupo
CREATE TABLE IF NOT EXISTS messages (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contenido     TEXT        NOT NULL,
  tipo          TEXT        NOT NULL DEFAULT 'mensaje' CHECK (tipo IN ('mensaje', 'recordatorio', 'pago', 'sistema')),
  leido_por     UUID[]      NOT NULL DEFAULT '{}',      -- IDs de usuarios que lo leyeron
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

-- ── Tabla: payment_confirmations ─────────────────────────────────────────────
-- Registro de pagos entre usuarios pendientes de confirmación
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  de_usuario    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  a_usuario     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  monto         DECIMAL(10,2) NOT NULL,
  confirmado    BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmado_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCIONES Y TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════

-- Trigger: actualiza updated_at automáticamente en transactions
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS (Row Level Security) — Seguridad básica
-- La contraseña de acceso se valida en el frontend
-- Aquí solo aseguramos que la anon key solo lea/escriba en tablas correctas
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE users                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias             ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log              ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_confirmations  ENABLE ROW LEVEL SECURITY;

-- Permite todas las operaciones con la anon key (acceso ya protegido por contraseña en frontend)
CREATE POLICY "allow_all" ON users                 FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON categorias            FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON transactions          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON audit_log             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON messages              FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all" ON payment_confirmations FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- Habilitar Realtime para las tablas que necesitan actualizaciones en vivo
-- ═══════════════════════════════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_confirmations;

-- ═══════════════════════════════════════════════════════════════════════════
-- Categorías por defecto
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO categorias (nombre, icono, monto_sugerido, color) VALUES
  ('Alquiler',       '🏠', 300.00, '#2563eb'),
  ('Electricidad',   '⚡', 50.00,  '#f59e0b'),
  ('Internet',       '📡', 35.00,  '#8b5cf6'),
  ('Supermercado',   '🛒', NULL,   '#10b981'),
  ('Restaurante',    '🍽️', NULL,   '#f97316'),
  ('Transporte',     '🚌', NULL,   '#06b6d4'),
  ('Ocio',           '🎮', NULL,   '#ec4899'),
  ('Suscripciones',  '📺', NULL,   '#6366f1'),
  ('Limpieza',       '🧹', 20.00,  '#14b8a6'),
  ('Otros',          '📦', NULL,   '#64748b')
ON CONFLICT (nombre) DO NOTHING;
