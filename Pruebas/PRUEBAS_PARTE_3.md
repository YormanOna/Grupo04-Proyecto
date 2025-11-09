# 🧪 PRUEBAS UNITARIAS - PARTE 3
## Sistema de Gestión Médica - Backend API

**Base URL:** `http://localhost:8000`

---

## 📋 ÍNDICE - PARTE 3
11. [Lotes](#11-lotes)
12. [Notificaciones](#12-notificaciones)
13. [Farmacia](#13-farmacia)
14. [Asistencias](#14-asistencias)
15. [Auditoría](#15-auditoría)
16. [WebSocket](#16-websocket)

---

## 11. LOTES

**⚠️ Requisito previo:** 
- Token Bearer (Farmacéutico/Admin)
- Tener medicamentos creados

### 🔹 11.1. Crear Lote
- **Endpoint:** `POST /lotes/`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Crea un nuevo lote de medicamento

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicamento_id": 1,
  "numero_lote": "LOTE-2025-001",
  "fecha_fabricacion": "2025-01-15",
  "fecha_vencimiento": "2027-01-15",
  "cantidad_inicial": 500,
  "precio_compra": 0.25,
  "precio_venta": 0.50,
  "proveedor": "Distribuidora Farmacéutica del Ecuador",
  "ubicacion_fisica": "Estante A, Nivel 2, Posición 3",
  "observaciones": "Lote importado directamente del fabricante"
}
```

**Campos obligatorios:** `medicamento_id`, `numero_lote`, `fecha_vencimiento`, `cantidad_inicial`

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "medicamento_id": 1,
  "medicamento_nombre": "Enalapril",
  "numero_lote": "LOTE-2025-001",
  "fecha_fabricacion": "2025-01-15",
  "fecha_vencimiento": "2027-01-15",
  "cantidad_inicial": 500,
  "cantidad_actual": 500,
  "precio_compra": 0.25,
  "precio_venta": 0.50,
  "proveedor": "Distribuidora Farmacéutica del Ecuador",
  "ubicacion_fisica": "Estante A, Nivel 2, Posición 3",
  "estado": "disponible",
  "observaciones": "Lote importado directamente del fabricante",
  "fecha_ingreso": "2025-11-09T18:00:00"
}
```

**Estados de lote:**
- `"disponible"` - Lote con stock y sin vencer
- `"proximo_a_vencer"` - Vence en menos de 90 días
- `"vencido"` - Fecha de vencimiento superada
- `"agotado"` - Sin stock disponible

---

### 🔹 11.2. Listar Lotes
- **Endpoint:** `GET /lotes/`
- **Autenticación:** Bearer Token (Farmacéutico/Médico/Admin)
- **Descripción:** Lista lotes con filtros opcionales

**Ejemplos:**
```
GET /lotes/
GET /lotes/?medicamento_id=1
GET /lotes/?estado=disponible
GET /lotes/?medicamento_id=1&estado=disponible
GET /lotes/?skip=0&limit=50
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "medicamento_id": 1,
    "medicamento_nombre": "Enalapril",
    "numero_lote": "LOTE-2025-001",
    "fecha_vencimiento": "2027-01-15",
    "cantidad_actual": 500,
    "estado": "disponible",
    "dias_para_vencer": 797
  }
]
```

---

### 🔹 11.3. Obtener Lote por ID
- **Endpoint:** `GET /lotes/{lote_id}`
- **Autenticación:** Bearer Token (Farmacéutico/Médico/Admin)
- **Descripción:** Obtiene detalles completos de un lote

**Ejemplo:** `GET /lotes/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "medicamento_id": 1,
  "medicamento_nombre": "Enalapril",
  "numero_lote": "LOTE-2025-001",
  "fecha_fabricacion": "2025-01-15",
  "fecha_vencimiento": "2027-01-15",
  "cantidad_inicial": 500,
  "cantidad_actual": 500,
  "precio_compra": 0.25,
  "precio_venta": 0.50,
  "proveedor": "Distribuidora Farmacéutica del Ecuador",
  "ubicacion_fisica": "Estante A, Nivel 2, Posición 3",
  "estado": "disponible",
  "observaciones": "Lote importado directamente del fabricante",
  "fecha_ingreso": "2025-11-09T18:00:00"
}
```

---

### 🔹 11.4. Lotes Disponibles de un Medicamento (FEFO)
- **Endpoint:** `GET /lotes/medicamento/{medicamento_id}/disponibles`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Obtiene lotes disponibles ordenados por fecha de vencimiento (FEFO)

**Ejemplo:** `GET /lotes/medicamento/1/disponibles`

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "numero_lote": "LOTE-2025-001",
    "fecha_vencimiento": "2027-01-15",
    "cantidad_disponible": 500,
    "estado": "disponible",
    "dias_para_vencer": 797,
    "prioridad": 1
  },
  {
    "id": 2,
    "numero_lote": "LOTE-2025-002",
    "fecha_vencimiento": "2027-06-20",
    "cantidad_disponible": 300,
    "estado": "disponible",
    "dias_para_vencer": 953,
    "prioridad": 2
  }
]
```

**Nota:** Los lotes se ordenan por fecha de vencimiento ascendente (FEFO - First Expire, First Out)

---

### 🔹 11.5. Lotes Próximos a Vencer
- **Endpoint:** `GET /lotes/proximos-vencer?dias={cantidad}`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Obtiene lotes que vencen en X días (default: 30)

**Ejemplos:**
```
GET /lotes/proximos-vencer
GET /lotes/proximos-vencer?dias=60
GET /lotes/proximos-vencer?dias=90
```

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 3,
    "medicamento_id": 2,
    "medicamento_nombre": "Ibuprofeno",
    "numero_lote": "LOTE-2024-150",
    "fecha_vencimiento": "2025-12-15",
    "cantidad_actual": 80,
    "estado": "proximo_a_vencer",
    "dias_para_vencer": 36
  }
]
```

---

### 🔹 11.6. Lotes Vencidos
- **Endpoint:** `GET /lotes/vencidos`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Obtiene todos los lotes vencidos con stock

**Ejemplo:** `GET /lotes/vencidos`

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 4,
    "medicamento_id": 3,
    "medicamento_nombre": "Amoxicilina",
    "numero_lote": "LOTE-2023-088",
    "fecha_vencimiento": "2025-08-20",
    "cantidad_actual": 25,
    "estado": "vencido",
    "dias_vencido": 81
  }
]
```

---

### 🔹 11.7. Actualizar Lote
- **Endpoint:** `PUT /lotes/{lote_id}`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** Actualiza información de un lote

**Ejemplo:** `PUT /lotes/1`

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
Content-Type: application/json
```

**Request Body (campos opcionales):**
```json
{
  "ubicacion_fisica": "Estante B, Nivel 1, Posición 5",
  "precio_venta": 0.55,
  "observaciones": "Lote reubicado por reorganización de farmacia"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "medicamento_nombre": "Enalapril",
  "numero_lote": "LOTE-2025-001",
  "ubicacion_fisica": "Estante B, Nivel 1, Posición 5",
  "precio_venta": 0.55,
  "observaciones": "Lote reubicado por reorganización de farmacia"
}
```

---

### 🔹 11.8. Eliminar Lote
- **Endpoint:** `DELETE /lotes/{lote_id}`
- **Autenticación:** Bearer Token (Admin)
- **Descripción:** Elimina un lote del sistema

**Ejemplo:** `DELETE /lotes/4`

**Headers:**
```
Authorization: Bearer {token_admin}
```

**Respuesta Exitosa (204):**
```
No Content
```

---

### 🔹 11.9. Actualizar Estados de Lotes
- **Endpoint:** `POST /lotes/actualizar-estados`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Actualiza el estado de todos los lotes (vencido, próximo a vencer, etc.)

**Ejemplo:** `POST /lotes/actualizar-estados`

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
```

**Respuesta Exitosa (200):**
```json
{
  "message": "Estados de lotes actualizados correctamente",
  "lotes_actualizados": 15,
  "lotes_vencidos": 3,
  "lotes_proximos_vencer": 5
}
```

---

## 12. NOTIFICACIONES

**⚠️ Requisito:** Token Bearer (Farmacéutico/Médico/Admin)

### 🔹 12.1. Obtener Alertas de Stock (Dashboard)
- **Endpoint:** `GET /notificaciones/stock/alertas`
- **Autenticación:** Bearer Token (Farmacéutico/Médico/Admin)
- **Descripción:** RF-004 - Obtiene todas las alertas para el dashboard

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "stock_critico": [
    {
      "medicamento_id": 5,
      "medicamento": "Paracetamol 500mg",
      "stock_actual": 15,
      "stock_minimo": 50,
      "nivel": "critico",
      "mensaje": "Stock crítico: Solo quedan 15 unidades (mínimo: 50)"
    }
  ],
  "stock_agotado": [
    {
      "medicamento_id": 8,
      "medicamento": "Omeprazol 20mg",
      "stock_actual": 0,
      "nivel": "urgente",
      "mensaje": "Medicamento agotado. Requiere abastecimiento inmediato"
    }
  ],
  "proximos_vencer": [
    {
      "lote_id": 3,
      "medicamento": "Ibuprofeno 400mg",
      "numero_lote": "LOTE-2024-150",
      "fecha_vencimiento": "2025-12-15",
      "dias_restantes": 36,
      "cantidad": 80,
      "nivel": "advertencia",
      "mensaje": "Lote vence en 36 días"
    }
  ],
  "vencidos": [
    {
      "lote_id": 4,
      "medicamento": "Amoxicilina 500mg",
      "numero_lote": "LOTE-2023-088",
      "fecha_vencimiento": "2025-08-20",
      "dias_vencido": 81,
      "cantidad": 25,
      "nivel": "critico",
      "mensaje": "Lote vencido hace 81 días. Debe ser retirado"
    }
  ],
  "resumen": {
    "total_alertas": 4,
    "alertas_criticas": 2,
    "advertencias": 1,
    "urgentes": 1
  }
}
```

---

### 🔹 12.2. Obtener Resumen de Alertas
- **Endpoint:** `GET /notificaciones/stock/resumen`
- **Autenticación:** Bearer Token (Farmacéutico/Médico/Admin)
- **Descripción:** RF-004 - Resumen numérico para badges en UI

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "total_alertas": 4,
  "stock_critico": 1,
  "stock_agotado": 1,
  "proximos_vencer": 1,
  "vencidos": 1,
  "requiere_atencion_inmediata": 2
}
```

---

### 🔹 12.3. Verificar Disponibilidad para Prescripción
- **Endpoint:** `POST /notificaciones/stock/verificar-disponibilidad`
- **Autenticación:** Bearer Token (Médico/Admin)
- **Descripción:** RF-004 - Verifica disponibilidad antes de prescribir

**Headers:**
```
Authorization: Bearer {token_medico}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicamento_id": 1,
  "cantidad": 60
}
```

**Respuesta - Disponible (200):**
```json
{
  "disponible": true,
  "medicamento": "Enalapril 10mg",
  "stock_actual": 500,
  "cantidad_solicitada": 60,
  "stock_despues": 440,
  "mensaje": "Stock suficiente disponible",
  "alertas": []
}
```

**Respuesta - Stock Bajo (200):**
```json
{
  "disponible": true,
  "medicamento": "Paracetamol 500mg",
  "stock_actual": 80,
  "cantidad_solicitada": 60,
  "stock_despues": 20,
  "mensaje": "Stock disponible pero quedará en nivel bajo",
  "alertas": [
    {
      "tipo": "advertencia",
      "mensaje": "Después de esta prescripción, el stock quedará en 20 unidades (mínimo recomendado: 50)"
    }
  ]
}
```

**Respuesta - No Disponible (200):**
```json
{
  "disponible": false,
  "medicamento": "Omeprazol 20mg",
  "stock_actual": 10,
  "cantidad_solicitada": 60,
  "mensaje": "Stock insuficiente",
  "alertas": [
    {
      "tipo": "critico",
      "mensaje": "No hay suficiente stock. Disponible: 10 unidades, Solicitado: 60"
    }
  ]
}
```

---

## 13. FARMACIA

### 🔹 13.1. Crear Farmacia
- **Endpoint:** `POST /farmacia/`
- **Autenticación:** No requerida
- **Descripción:** Registra una nueva farmacia

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Farmacia Central",
  "ubicacion": "Planta Baja, Ala Este",
  "telefono": "023456789",
  "extension": "201",
  "responsable": "Dra. Ana Martínez",
  "horario_atencion": "Lunes a Viernes: 07:00-19:00, Sábados: 08:00-14:00",
  "email": "farmacia.central@hospital.com"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Farmacia Central",
  "ubicacion": "Planta Baja, Ala Este",
  "telefono": "023456789",
  "extension": "201",
  "responsable": "Dra. Ana Martínez",
  "horario_atencion": "Lunes a Viernes: 07:00-19:00, Sábados: 08:00-14:00",
  "email": "farmacia.central@hospital.com",
  "activo": true,
  "fecha_creacion": "2025-11-09T19:00:00"
}
```

---

### 🔹 13.2. Listar Farmacias
- **Endpoint:** `GET /farmacia/`
- **Autenticación:** No requerida
- **Descripción:** Lista todas las farmacias

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Farmacia Central",
    "ubicacion": "Planta Baja, Ala Este",
    "telefono": "023456789",
    "responsable": "Dra. Ana Martínez",
    "activo": true
  }
]
```

---

### 🔹 13.3. Obtener Farmacia por ID
- **Endpoint:** `GET /farmacia/{farmacia_id}`
- **Autenticación:** No requerida
- **Descripción:** Obtiene una farmacia específica

**Ejemplo:** `GET /farmacia/1`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Farmacia Central",
  "ubicacion": "Planta Baja, Ala Este",
  "telefono": "023456789",
  "extension": "201",
  "responsable": "Dra. Ana Martínez",
  "horario_atencion": "Lunes a Viernes: 07:00-19:00",
  "email": "farmacia.central@hospital.com",
  "activo": true
}
```

---

## 14. ASISTENCIAS

**⚠️ Requisito:** Token Bearer (cualquier empleado autenticado)

### 🔹 14.1. Marcar Entrada
- **Endpoint:** `POST /asistencias/entrada`
- **Autenticación:** Bearer Token
- **Descripción:** Registra la hora de entrada del empleado autenticado

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (opcional):**
```json
{
  "observaciones": "Entrada puntual"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "empleado_id": 3,
  "fecha": "2025-11-09",
  "hora_entrada": "08:00:15",
  "hora_salida": null,
  "horas_trabajadas": null,
  "observaciones": "Entrada puntual",
  "empleado": {
    "nombre": "Juan",
    "apellido": "Médico",
    "cargo": "Medico"
  }
}
```

**Nota:** Si ya existe un registro de entrada para el día actual, retorna error.

---

### 🔹 14.2. Marcar Salida
- **Endpoint:** `POST /asistencias/salida`
- **Autenticación:** Bearer Token
- **Descripción:** Registra la hora de salida del empleado autenticado

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "observaciones": "Jornada completa"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "empleado_id": 3,
  "fecha": "2025-11-09",
  "hora_entrada": "08:00:15",
  "hora_salida": "17:05:30",
  "horas_trabajadas": 9.09,
  "observaciones": "Jornada completa",
  "empleado": {
    "nombre": "Juan",
    "apellido": "Médico",
    "cargo": "Medico"
  }
}
```

**Nota:** Requiere que exista un registro de entrada previo.

---

### 🔹 14.3. Listar Asistencias
- **Endpoint:** `GET /asistencias/`
- **Autenticación:** Bearer Token
- **Descripción:** Lista asistencias (empleados ven solo las suyas, admins ven todas)

**Ejemplos:**
```
GET /asistencias/
GET /asistencias/?empleado_id=3
GET /asistencias/?fecha=2025-11-09
GET /asistencias/?empleado_id=3&fecha=2025-11-09
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "empleado_id": 3,
    "fecha": "2025-11-09",
    "hora_entrada": "08:00:15",
    "hora_salida": "17:05:30",
    "horas_trabajadas": 9.09,
    "observaciones": "Jornada completa",
    "empleado": {
      "nombre": "Juan",
      "apellido": "Médico",
      "cargo": "Medico"
    }
  }
]
```

**Nota:** Los empleados regulares solo pueden ver sus propias asistencias, sin importar el parámetro `empleado_id`.

---

### 🔹 14.4. Obtener Asistencia por ID
- **Endpoint:** `GET /asistencias/{asistencia_id}`
- **Autenticación:** Bearer Token
- **Descripción:** Obtiene una asistencia específica

**Ejemplo:** `GET /asistencias/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "empleado_id": 3,
  "fecha": "2025-11-09",
  "hora_entrada": "08:00:15",
  "hora_salida": "17:05:30",
  "horas_trabajadas": 9.09,
  "observaciones": "Jornada completa",
  "empleado": {
    "nombre": "Juan",
    "apellido": "Médico",
    "cargo": "Medico"
  }
}
```

**Respuesta Error (403):**
```json
{
  "detail": "No tienes permiso para ver esta asistencia"
}
```

---

## 15. AUDITORÍA

**⚠️ Requisito:** Token Bearer de **Admin General (Super Admin)**

### 🔹 15.1. Listar Registros de Auditoría
- **Endpoint:** `GET /auditoria/`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Lista todos los registros de auditoría con filtros

**Ejemplos:**
```
GET /auditoria/
GET /auditoria/?usuario_id=1
GET /auditoria/?accion=CREATE
GET /auditoria/?modulo=Empleados
GET /auditoria/?estado=exitoso
GET /auditoria/?fecha_desde=2025-11-01
GET /auditoria/?fecha_hasta=2025-11-30
GET /auditoria/?skip=0&limit=50
```

**Valores válidos para `accion`:** `CREATE`, `UPDATE`, `DELETE`, `CONSULTA`

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "usuario_nombre": "Admin General",
    "usuario_cargo": "Admin General",
    "accion": "CREATE",
    "modulo": "Empleados",
    "descripcion": "Creó nuevo empleado: María González (Enfermera)",
    "tabla_afectada": "empleados",
    "registro_id": 11,
    "datos_anteriores": null,
    "datos_nuevos": {
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@hospital.com",
      "cargo": "Enfermera",
      "cedula": "1234567890"
    },
    "ip_address": "127.0.0.1",
    "estado": "exitoso",
    "fecha_creacion": "2025-11-09T11:00:00"
  },
  {
    "id": 2,
    "usuario_id": 1,
    "usuario_nombre": "Admin General",
    "usuario_cargo": "Admin General",
    "accion": "UPDATE",
    "modulo": "Empleados",
    "descripcion": "Actualizó empleado: María González",
    "tabla_afectada": "empleados",
    "registro_id": 11,
    "datos_anteriores": {
      "telefono": "0987654321"
    },
    "datos_nuevos": {
      "telefono": "0999999999"
    },
    "ip_address": "127.0.0.1",
    "estado": "exitoso",
    "fecha_creacion": "2025-11-09T12:00:00"
  }
]
```

---

### 🔹 15.2. Obtener Estadísticas de Auditoría
- **Endpoint:** `GET /auditoria/estadisticas`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Obtiene estadísticas generales de auditoría

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
{
  "total_registros": 150,
  "por_accion": {
    "CREATE": 45,
    "UPDATE": 60,
    "DELETE": 10,
    "CONSULTA": 35
  },
  "por_modulo": {
    "Empleados": 30,
    "Pacientes": 25,
    "Citas": 40,
    "Expediente Clínico": 35,
    "Recetas": 20
  },
  "por_usuario": {
    "Admin General": 50,
    "Administrador": 30,
    "Médicos": 45,
    "Enfermeras": 15,
    "Farmacéuticos": 10
  },
  "ultimos_7_dias": 45,
  "ultimo_mes": 150
}
```

---

### 🔹 15.3. Contar Registros de Auditoría
- **Endpoint:** `GET /auditoria/count`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Cuenta registros con filtros opcionales

**Ejemplos:**
```
GET /auditoria/count
GET /auditoria/count?usuario_id=1
GET /auditoria/count?accion=CREATE&modulo=Empleados
```

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
{
  "total": 150
}
```

---

### 🔹 15.4. Auditoría por Usuario
- **Endpoint:** `GET /auditoria/usuario/{usuario_id}`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Obtiene el historial de un usuario específico

**Ejemplo:** `GET /auditoria/usuario/1?limit=50`

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "usuario_id": 1,
    "usuario_nombre": "Admin General",
    "accion": "CREATE",
    "modulo": "Empleados",
    "descripcion": "Creó nuevo empleado: María González",
    "fecha_creacion": "2025-11-09T11:00:00"
  }
]
```

---

### 🔹 15.5. Auditoría por Módulo
- **Endpoint:** `GET /auditoria/modulo/{modulo}`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Obtiene el historial de un módulo específico

**Ejemplo:** `GET /auditoria/modulo/Empleados?limit=50`

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "usuario_nombre": "Admin General",
    "accion": "CREATE",
    "modulo": "Empleados",
    "descripcion": "Creó nuevo empleado: María González",
    "fecha_creacion": "2025-11-09T11:00:00"
  }
]
```

---

### 🔹 15.6. Obtener Registro de Auditoría por ID
- **Endpoint:** `GET /auditoria/{auditoria_id}`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Obtiene un registro específico con todos los detalles

**Ejemplo:** `GET /auditoria/1`

**Headers:**
```
Authorization: Bearer {token_super_admin}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "usuario_id": 1,
  "usuario_nombre": "Admin General",
  "usuario_cargo": "Admin General",
  "accion": "CREATE",
  "modulo": "Empleados",
  "descripcion": "Creó nuevo empleado: María González (Enfermera)",
  "tabla_afectada": "empleados",
  "registro_id": 11,
  "datos_anteriores": null,
  "datos_nuevos": {
    "nombre": "María",
    "apellido": "González",
    "email": "maria.gonzalez@hospital.com",
    "cargo": "Enfermera",
    "cedula": "1234567890"
  },
  "ip_address": "127.0.0.1",
  "estado": "exitoso",
  "fecha_creacion": "2025-11-09T11:00:00"
}
```

---

### 🔹 15.7. Crear Registro Manual de Auditoría
- **Endpoint:** `POST /auditoria/`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Crea un registro de auditoría manualmente (normalmente automático)

**Headers:**
```
Authorization: Bearer {token_super_admin}
Content-Type: application/json
```

**Request Body:**
```json
{
  "usuario_id": 1,
  "usuario_nombre": "Admin General",
  "usuario_cargo": "Admin General",
  "accion": "CONSULTA",
  "modulo": "Sistema",
  "descripcion": "Acceso manual al sistema",
  "tabla_afectada": "sistema",
  "estado": "exitoso",
  "ip_address": "127.0.0.1"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 151,
  "usuario_id": 1,
  "usuario_nombre": "Admin General",
  "accion": "CONSULTA",
  "modulo": "Sistema",
  "descripcion": "Acceso manual al sistema",
  "fecha_creacion": "2025-11-09T20:00:00"
}
```

---

## 16. WEBSOCKET

### 🔹 16.1. Conectar a WebSocket
- **Endpoint:** `ws://localhost:8000/ws?token={jwt_token}`
- **Protocolo:** WebSocket
- **Autenticación:** JWT Token como query parameter
- **Descripción:** Establece conexión WebSocket para notificaciones en tiempo real

**Ejemplo de conexión (JavaScript):**
```javascript
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

ws.onopen = () => {
  console.log('Conectado a WebSocket');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Mensaje recibido:', data);
  
  // Manejar diferentes tipos de mensajes
  switch(data.type) {
    case 'connection_established':
      console.log('Conexión establecida:', data.message);
      break;
    case 'llamada_paciente':
      console.log('Paciente llamado a consulta:', data);
      break;
    case 'cita_actualizada':
      console.log('Cita actualizada:', data);
      break;
    case 'receta_lista':
      console.log('Receta disponible en farmacia:', data);
      break;
  }
};

ws.onerror = (error) => {
  console.error('Error WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexión cerrada');
};
```

**Mensaje de Bienvenida:**
```json
{
  "type": "connection_established",
  "message": "Conectado exitosamente como Medico",
  "user_id": 3
}
```

**Tipos de Mensajes que se Reciben:**

1. **Llamada a Paciente:**
```json
{
  "type": "llamada_paciente",
  "paciente": {
    "nombre": "Carlos Ramírez",
    "cedula": "1750123456"
  },
  "consultorio": "Consultorio 3",
  "medico": "Dr. Doctor Principal"
}
```

2. **Cita Actualizada:**
```json
{
  "type": "cita_actualizada",
  "cita_id": 1,
  "estado": "confirmada",
  "mensaje": "La cita ha sido confirmada"
}
```

3. **Receta Lista:**
```json
{
  "type": "receta_lista",
  "receta_id": 1,
  "paciente": "Carlos Ramírez",
  "medicamentos": ["Enalapril 10mg"],
  "mensaje": "Receta disponible para retiro en farmacia"
}
```

---

### 🔹 16.2. Estadísticas de WebSocket
- **Endpoint:** `GET /ws/stats`
- **Autenticación:** No requerida
- **Descripción:** Obtiene estadísticas de conexiones activas

**Respuesta Exitosa (200):**
```json
{
  "total_connections": 12,
  "users_online": [3, 5, 7, 11, 13],
  "connections_by_role": {
    "Medico": 4,
    "Enfermera": 3,
    "Farmaceutico": 2,
    "Administrador": 2,
    "Admin General": 1
  }
}
```

---

## 📊 RESUMEN GENERAL DE PRUEBAS

### ✅ Checklist de Requisitos Previos

1. **Base de Datos:**
   - [ ] MySQL corriendo en `localhost:3306`
   - [ ] Base de datos `GestionMedicaDB` creada
   - [ ] Variables de entorno configuradas en `.env`

2. **Backend:**
   - [ ] Servidor FastAPI corriendo en `localhost:8000`
   - [ ] Datos por defecto inicializados
   - [ ] Usuarios de prueba disponibles

3. **Datos de Prueba:**
   - [ ] Al menos 1 paciente creado
   - [ ] Al menos 1 médico creado
   - [ ] Al menos 1 medicamento creado
   - [ ] Tokens de autenticación obtenidos

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

### Postman Collection
Importar las siguientes variables de entorno:
```json
{
  "base_url": "http://localhost:8000",
  "token_admin": "",
  "token_medico": "",
  "token_farmaceutico": "",
  "token_enfermera": "",
  "paciente_id": "1",
  "medico_id": "1",
  "cita_id": "1"
}
```

### cURL Ejemplos

**Login:**
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hospital.com","password":"admin123"}'
```

**Crear Paciente (con token):**
```bash
curl -X POST http://localhost:8000/pacientes/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "cedula": "1750123456",
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "fecha_nacimiento": "1985-05-15",
    "sexo": "M"
  }'
```

---

## 📝 NOTAS FINALES

1. **Tokens JWT:** Los tokens tienen una duración de 60 minutos (configurable en `.env`)
2. **Auditoría:** Todas las operaciones críticas se registran automáticamente
3. **WebSocket:** Mantener conexiones abiertas para notificaciones en tiempo real
4. **FEFO:** Los lotes se dispensan por fecha de vencimiento (First Expire, First Out)
5. **Permisos:** Cada endpoint tiene permisos específicos según el rol del usuario

---

**✅ Archivos Completados:**
- [PRUEBAS_PARTE_1.md](./PRUEBAS_PARTE_1.md) - Autenticación, Empleados, Pacientes, Médicos, Citas
- [PRUEBAS_PARTE_2.md](./PRUEBAS_PARTE_2.md) - Consultas, Historias, Diagnósticos, Medicamentos, Recetas
- **PRUEBAS_PARTE_3.md** - Lotes, Notificaciones, Farmacia, Asistencias, Auditoría, WebSocket

**🎯 Total de Endpoints Documentados:** 80+
