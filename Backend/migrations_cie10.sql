-- Crear tabla de diagnósticos CIE-10
CREATE TABLE IF NOT EXISTS diagnosticos_cie10 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    categoria VARCHAR(100),
    INDEX idx_codigo (codigo),
    INDEX idx_descripcion (descripcion(255)),
    INDEX idx_categoria (categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
