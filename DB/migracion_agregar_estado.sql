-- ============================================================
-- MIGRACIÓN: Agregar campo 'estado' a tabla empleados
-- Fecha: 10 de noviembre de 2025
-- Descripción: Agrega columna estado con ENUM para control de acceso
-- ============================================================

USE GestionMedicaDB;

-- Agregar columna estado si no existe
ALTER TABLE empleados 
ADD COLUMN IF NOT EXISTS estado ENUM('Activo', 'Inactivo', 'Suspendido', 'Vacaciones', 'Licencia Médica') 
NOT NULL DEFAULT 'Activo'
AFTER activo;

-- Crear índice para mejorar consultas de autenticación
CREATE INDEX IF NOT EXISTS idx_empleados_estado ON empleados(estado);

-- Actualizar empleados existentes para que tengan estado 'Activo'
UPDATE empleados 
SET estado = 'Activo' 
WHERE estado IS NULL OR estado = '';

-- Verificar la migración
SELECT 
    COLUMN_NAME, 
    COLUMN_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'GestionMedicaDB' 
  AND TABLE_NAME = 'empleados' 
  AND COLUMN_NAME = 'estado';

-- Mostrar algunos registros actualizados
SELECT id, nombre, apellido, cargo, activo, estado 
FROM empleados 
LIMIT 10;
