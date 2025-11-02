-- RF-002: Migraciones para Expediente Clínico Electrónico
-- Ejecutar estas alteraciones en la base de datos MySQL

-- 1. Agregar campo diagnostico_codigo (CIE-10) a la tabla consultas
ALTER TABLE consultas 
ADD COLUMN diagnostico_codigo VARCHAR(10) NULL COMMENT 'Código CIE-10 del diagnóstico' 
AFTER diagnostico;

-- 2. Agregar campos de dispensación detallada a la tabla recetas
ALTER TABLE recetas 
ADD COLUMN lote VARCHAR(50) NULL COMMENT 'Número de lote del medicamento dispensado',
ADD COLUMN fecha_vencimiento DATE NULL COMMENT 'Fecha de vencimiento del medicamento';

-- Verificar las alteraciones
DESCRIBE consultas;
DESCRIBE recetas;

-- Nota: Los modelos SQLAlchemy crearán automáticamente las tablas con estos campos
-- en la próxima ejecución si se utiliza create_all() o si la tabla no existe.
-- Este script es para actualizar bases de datos existentes.
