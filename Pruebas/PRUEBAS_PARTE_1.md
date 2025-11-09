# 🧪 PRUEBAS UNITARIAS - PARTE 1
## Sistema de Gestión Médica - Backend API

**Base URL:** `http://localhost:8000`

---

## 📋 ÍNDICE - PARTE 1
1. [Autenticación](#1-autenticación)
2. [Empleados](#2-empleados)
3. [Pacientes](#3-pacientes)
4. [Médicos](#4-médicos)
5. [Citas](#5-citas)

---

## ⚙️ CONFIGURACIÓN INICIAL

### ⭐ CREDENCIALES CORRECTAS - RESUMEN RÁPIDO

| Rol | Email | Password |
|-----|-------|----------|
| **Super Admin** | `superadmin@hospital.com` | `superadmin123` |
| **Administrador** | `admin@hospital.com` | `admin123` |
| **Médico** | `medico@hospital.com` | `medico123` |
| **Enfermera** | `enfermera@hospital.com` | `enfer123` |
| **Farmacéutico** | `farmacia@hospital.com` | `farma123` |

**⚠️ IMPORTANTE:** Estas son las contraseñas reales del sistema. NO uses variaciones como `Admin123!`, `Medico123!`, etc.

---

### Usuarios de Prueba Disponibles

```json
// Super Admin (Admin General)
{
  "email": "superadmin@hospital.com",
  "password": "superadmin123"
}

// Administrador
{
  "email": "admin@hospital.com",
  "password": "admin123"
}

// Médico
{
  "email": "medico@hospital.com",
  "password": "medico123"
}

// Enfermera
{
  "email": "enfermera@hospital.com",
  "password": "enfer123"
}

// Farmacéutico
{
  "email": "farmacia@hospital.com",
  "password": "farma123"
}
```

### Cómo Obtener el Token Bearer

**1. Hacer login:**
```bash
POST http://localhost:8000/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**2. Guardar el token de la respuesta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { ... }
}
```

**3. Usar en las peticiones:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 1. AUTENTICACIÓN

### 🔹 1.1. Registrar Nuevo Empleado
- **Endpoint:** `POST /auth/register`
- **Autenticación:** No requerida
- **Descripción:** Crea un nuevo empleado en el sistema

**Request Body:**
```json
{
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@hospital.com",
  "password": "medico123",
  "cedula": "0987654321",
  "cargo": "Medico",
  "telefono": "0991234567",
  "direccion": "Av. Principal 123"
}
```

**Cargos válidos:**
- `"Admin General"`
- `"Administrador"`
- `"Medico"`
- `"Enfermera"`
- `"Farmaceutico"`

**Respuesta Exitosa (201):**
```json
{
  "id": 10,
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan.perez@hospital.com",
  "cedula": "0987654321",
  "cargo": "Medico",
  "telefono": "0991234567",
  "direccion": "Av. Principal 123",
  "activo": true,
  "fecha_creacion": "2025-11-09T10:30:00"
}
```

---

### 🔹 1.2. Login
- **Endpoint:** `POST /auth/login`
- **Autenticación:** No requerida
- **Descripción:** Autenticación de empleado

**Request Body:**
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiY2FyZ28iOiJBZG1pbmlzdHJhZG9yIn0...",
  "token_type": "bearer",
  "user": {
    "id": 2,
    "nombre": "Admin",
    "apellido": "Sistema",
    "email": "admin@hospital.com",
    "cargo": "Administrador",
    "cedula": "1234567890",
    "activo": true
  }
}
```

**Respuesta Error (401):**
```json
{
  "detail": "Credenciales no válidas"
}
```

---

## 2. EMPLEADOS

**⚠️ Requisito:** Token Bearer de **Admin General**

### 🔹 2.1. Crear Empleado
- **Endpoint:** `POST /empleados/`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Crea un nuevo empleado (solo Admin General)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "María",
  "apellido": "González",
  "email": "maria.gonzalez.test@hospital.com",
  "password": "enfer123",
  "cedula": "1234567899",
  "cargo": "Enfermera",
  "telefono": "0987654321",
  "direccion": "Calle Secundaria 456"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 11,
  "nombre": "María",
  "apellido": "González",
  "email": "maria.gonzalez.test@hospital.com",
  "cedula": "1234567899",
  "cargo": "Enfermera",
  "telefono": "0987654321",
  "direccion": "Calle Secundaria 456",
  "activo": true,
  "fecha_creacion": "2025-11-09T11:00:00"
}
```

---

### 🔹 2.2. Listar Todos los Empleados
- **Endpoint:** `GET /empleados/`
- **Autenticación:** Bearer Token (Admin o Admin General)
- **Descripción:** Lista todos los empleados del sistema

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Super",
    "apellido": "Admin",
    "email": "superadmin@hospital.com",
    "cedula": "1111111111",
    "cargo": "Admin General",
    "telefono": "0991234567",
    "activo": true,
    "fecha_creacion": "2025-01-01T00:00:00"
  },
  {
    "id": 2,
    "nombre": "Admin",
    "apellido": "Sistema",
    "email": "admin@hospital.com",
    "cedula": "1234567890",
    "cargo": "Administrador",
    "activo": true
  },
  {
    "id": 3,
    "nombre": "Doctor",
    "apellido": "Principal",
    "email": "medico@hospital.com",
    "cedula": "9876543210",
    "cargo": "Medico",
    "activo": true
  }
]
```

---

### 🔹 2.3. Obtener Empleado por ID
- **Endpoint:** `GET /empleados/{empleado_id}`
- **Autenticación:** Bearer Token (Admin o Admin General)
- **Descripción:** Obtiene un empleado específico

**Ejemplo:** `GET /empleados/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Super",
  "apellido": "Admin",
  "email": "superadmin@hospital.com",
  "cedula": "1111111111",
  "cargo": "Admin General",
  "telefono": "0991234567",
  "direccion": "Av. Principal 123",
  "activo": true,
  "fecha_creacion": "2025-01-01T00:00:00"
}
```

---

### 🔹 2.4. Actualizar Empleado
- **Endpoint:** `PUT /empleados/{empleado_id}`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Actualiza datos de un empleado

**Ejemplo:** `PUT /empleados/11`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (todos los campos son opcionales):**
```json
{
  "nombre": "María Fernanda",
  "apellido": "González López",
  "telefono": "0999999999",
  "direccion": "Nueva Dirección 789",
  "cargo": "Enfermera"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 11,
  "nombre": "María Fernanda",
  "apellido": "González López",
  "email": "maria.gonzalez.test@hospital.com",
  "cedula": "1234567899",
  "cargo": "Enfermera",
  "telefono": "0999999999",
  "direccion": "Nueva Dirección 789",
  "activo": true
}
```

---

### 🔹 2.5. Eliminar Empleado
- **Endpoint:** `DELETE /empleados/{empleado_id}`
- **Autenticación:** Bearer Token (Super Admin)
- **Descripción:** Elimina un empleado del sistema

**Ejemplo:** `DELETE /empleados/11`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "detail": "Empleado eliminado exitosamente"
}
```

---

## 3. PACIENTES

**⚠️ Requisito:** Token Bearer (cualquier usuario autenticado)

### 🔹 3.1. Crear Paciente
- **Endpoint:** `POST /pacientes/`
- **Autenticación:** Bearer Token
- **Descripción:** Registra un nuevo paciente

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "cedula": "1750123456",
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "fecha_nacimiento": "1985-05-15",
  "sexo": "M",
  "estado_civil": "Casado",
  "direccion": "Quito, Av. América N45-123",
  "telefono": "0987654321",
  "email": "carlos.ramirez@gmail.com",
  "contacto_emergencia_nombre": "Ana Ramírez",
  "contacto_emergencia_telefono": "0991234567",
  "contacto_emergencia_relacion": "Esposa",
  "tipo_seguro": "IESS",
  "aseguradora": "Instituto Ecuatoriano de Seguridad Social",
  "numero_poliza": "1750123456001",
  "fecha_vigencia_poliza": "2026-12-31"
}
```

**Campos opcionales:**
- `estado_civil`, `direccion`, `telefono`, `email`
- `contacto_emergencia_*` (nombre, teléfono, relación)
- Datos de seguro: `tipo_seguro`, `aseguradora`, `numero_poliza`, `fecha_vigencia_poliza`

**Valores válidos para `sexo`:** `"M"`, `"F"`

**Valores válidos para `tipo_seguro`:**
- `"IESS"`
- `"Privado"`
- `"Ninguno"`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "cedula": "1750123456",
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "fecha_nacimiento": "1985-05-15",
  "sexo": "M",
  "edad": 40,
  "estado_civil": "Casado",
  "direccion": "Quito, Av. América N45-123",
  "telefono": "0987654321",
  "email": "carlos.ramirez@gmail.com",
  "contacto_emergencia_nombre": "Ana Ramírez",
  "contacto_emergencia_telefono": "0991234567",
  "contacto_emergencia_relacion": "Esposa",
  "tipo_seguro": "IESS",
  "aseguradora": "Instituto Ecuatoriano de Seguridad Social",
  "numero_poliza": "1750123456001",
  "fecha_vigencia_poliza": "2026-12-31",
  "fecha_registro": "2025-11-09T12:00:00"
}
```

---

### 🔹 3.2. Listar Pacientes
- **Endpoint:** `GET /pacientes/`
- **Autenticación:** Bearer Token
- **Descripción:** Lista todos los pacientes (médicos ven solo sus pacientes, admins ven todos)

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "cedula": "1750123456",
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "fecha_nacimiento": "1985-05-15",
    "sexo": "M",
    "edad": 40,
    "telefono": "0987654321",
    "email": "carlos.ramirez@gmail.com",
    "tipo_seguro": "IESS",
    "aseguradora": "Instituto Ecuatoriano de Seguridad Social"
  }
]
```

---

### 🔹 3.3. Obtener Paciente por ID
- **Endpoint:** `GET /pacientes/{paciente_id}`
- **Autenticación:** Bearer Token
- **Descripción:** Obtiene un paciente específico

**Ejemplo:** `GET /pacientes/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "cedula": "1750123456",
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "fecha_nacimiento": "1985-05-15",
  "sexo": "M",
  "edad": 40,
  "estado_civil": "Casado",
  "direccion": "Quito, Av. América N45-123",
  "telefono": "0987654321",
  "email": "carlos.ramirez@gmail.com",
  "contacto_emergencia_nombre": "Ana Ramírez",
  "contacto_emergencia_telefono": "0991234567",
  "tipo_seguro": "IESS",
  "aseguradora": "Instituto Ecuatoriano de Seguridad Social",
  "fecha_vigencia_poliza": "2026-12-31"
}
```

---

### 🔹 3.4. Actualizar Paciente
- **Endpoint:** `PUT /pacientes/{paciente_id}`
- **Autenticación:** Bearer Token
- **Descripción:** Actualiza datos de un paciente

**Ejemplo:** `PUT /pacientes/1`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (todos los campos opcionales):**
```json
{
  "telefono": "0999888777",
  "email": "carlos.ramirez.nuevo@gmail.com",
  "direccion": "Nueva dirección actualizada",
  "tipo_seguro": "Privado",
  "aseguradora": "Seguros del Pacífico",
  "numero_poliza": "POL-2025-001",
  "fecha_vigencia_poliza": "2027-12-31"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "cedula": "1750123456",
  "nombre": "Carlos",
  "apellido": "Ramírez",
  "telefono": "0999888777",
  "email": "carlos.ramirez.nuevo@gmail.com",
  "direccion": "Nueva dirección actualizada",
  "tipo_seguro": "Privado",
  "aseguradora": "Seguros del Pacífico",
  "numero_poliza": "POL-2025-001",
  "fecha_vigencia_poliza": "2027-12-31"
}
```

---

### 🔹 3.5. Eliminar Paciente
- **Endpoint:** `DELETE /pacientes/{paciente_id}`
- **Autenticación:** Bearer Token (Solo Admin)
- **Descripción:** Elimina un paciente del sistema

**Ejemplo:** `DELETE /pacientes/1`

**Headers:**
```
Authorization: Bearer {token_admin}
```

**Respuesta Exitosa (200):**
```json
{
  "detail": "Paciente eliminado exitosamente"
}
```

---

### 🔹 3.6. Buscar Pacientes (Tiempo Real)
- **Endpoint:** `GET /pacientes/buscar/search?q={termino}`
- **Autenticación:** Bearer Token
- **Descripción:** RF-001 - Búsqueda por cédula o nombre (mínimo 2 caracteres)

**Ejemplo:** `GET /pacientes/buscar/search?q=Carlos`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "cedula": "1750123456",
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "edad": 40,
    "sexo": "M",
    "telefono": "0987654321",
    "tipo_seguro": "IESS"
  }
]
```

**Búsqueda por cédula:**
```
GET /pacientes/buscar/search?q=1750123456
```

---

### 🔹 3.7. Validar Póliza de Seguro
- **Endpoint:** `GET /pacientes/{paciente_id}/validar-poliza`
- **Autenticación:** Bearer Token
- **Descripción:** RF-001 - Valida el estado de vigencia de la póliza

**Ejemplo:** `GET /pacientes/1/validar-poliza`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta - Póliza Vigente (200):**
```json
{
  "paciente_id": 1,
  "estado": "vigente",
  "mensaje": "La póliza está vigente hasta 2026-12-31",
  "fecha_vigencia": "2026-12-31",
  "aseguradora": "Instituto Ecuatoriano de Seguridad Social",
  "tipo_seguro": "IESS",
  "requiere_actualizacion": false
}
```

**Respuesta - Póliza Próxima a Vencer:**
```json
{
  "paciente_id": 1,
  "estado": "proxima_a_vencer",
  "mensaje": "La póliza vence en menos de 30 días",
  "fecha_vigencia": "2025-12-05",
  "requiere_actualizacion": true
}
```

**Respuesta - Póliza Vencida:**
```json
{
  "paciente_id": 1,
  "estado": "vencida",
  "mensaje": "La póliza está vencida desde 2025-01-15",
  "fecha_vigencia": "2025-01-15",
  "requiere_actualizacion": true
}
```

---

## 4. MÉDICOS

### 🔹 4.1. Crear Médico
- **Endpoint:** `POST /medicos/`
- **Autenticación:** No requerida (público)
- **Descripción:** Crea un nuevo médico vinculado a un empleado

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "empleado_id": 3,
  "especialidad": "Cardiología",
  "codigo_medico": "MED-CARDIO-001",
  "registro_profesional": "MSP-12345",
  "years_experiencia": 10,
  "horario_atencion": "Lunes a Viernes: 08:00-16:00"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": 1,
  "empleado_id": 3,
  "especialidad": "Cardiología",
  "codigo_medico": "MED-CARDIO-001",
  "registro_profesional": "MSP-12345",
  "years_experiencia": 10,
  "horario_atencion": "Lunes a Viernes: 08:00-16:00",
  "activo": true,
  "empleado": {
    "id": 3,
    "nombre": "Doctor",
    "apellido": "Principal",
    "email": "medico@hospital.com",
    "cargo": "Medico"
  }
}
```

---

### 🔹 4.2. Listar Médicos
- **Endpoint:** `GET /medicos/`
- **Autenticación:** No requerida
- **Descripción:** Lista todos los médicos disponibles

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "especialidad": "Cardiología",
    "codigo_medico": "MED-CARDIO-001",
    "registro_profesional": "MSP-12345",
    "years_experiencia": 10,
    "activo": true,
    "empleado": {
      "nombre": "Doctor",
      "apellido": "Principal",
      "email": "medico@hospital.com"
    }
  }
]
```

---

### 🔹 4.3. Obtener Médico por ID
- **Endpoint:** `GET /medicos/{medico_id}`
- **Autenticación:** No requerida
- **Descripción:** Obtiene un médico específico

**Ejemplo:** `GET /medicos/1`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "empleado_id": 3,
  "especialidad": "Cardiología",
  "codigo_medico": "MED-CARDIO-001",
  "registro_profesional": "MSP-12345",
  "years_experiencia": 10,
  "horario_atencion": "Lunes a Viernes: 08:00-16:00",
  "activo": true,
  "empleado": {
    "id": 3,
    "nombre": "Juan",
    "apellido": "Médico",
    "email": "medico@hospital.com"
  }
}
```

---

### 🔹 4.4. Actualizar Médico
- **Endpoint:** `PUT /medicos/{medico_id}`
- **Autenticación:** No requerida
- **Descripción:** Actualiza datos de un médico

**Ejemplo:** `PUT /medicos/1`

**Request Body:**
```json
{
  "especialidad": "Cardiología Intervencionista",
  "years_experiencia": 12,
  "horario_atencion": "Lunes a Viernes: 07:00-15:00"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "especialidad": "Cardiología Intervencionista",
  "years_experiencia": 12,
  "horario_atencion": "Lunes a Viernes: 07:00-15:00"
}
```

---

### 🔹 4.5. Eliminar Médico
- **Endpoint:** `DELETE /medicos/{medico_id}`
- **Autenticación:** No requerida
- **Descripción:** Elimina un médico del sistema

**Ejemplo:** `DELETE /medicos/1`

**Respuesta Exitosa (204):**
```
No Content
```

---

## 5. CITAS

**⚠️ Requisito:** Token Bearer (Personal médico para crear/modificar)

### 🔹 5.1. Crear Cita
- **Endpoint:** `POST /citas/`
- **Autenticación:** Bearer Token (Personal médico)
- **Descripción:** RF-001 - Crea una nueva cita médica con validaciones

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-11-15T10:00:00",
  "hora_inicio": "10:00",
  "hora_fin": "10:30",
  "motivo": "Control de presión arterial",
  "tipo_cita": "consulta_general",
  "estado": "pendiente",
  "sala_asignada": "Consultorio 3",
  "observaciones": "Paciente presenta antecedentes de hipertensión"
}
```

**Valores válidos para `tipo_cita`:**
- `"consulta_general"`
- `"control"`
- `"emergencia"`
- `"cirugia"`

**Valores válidos para `estado`:**
- `"pendiente"`
- `"confirmada"`
- `"en_curso"`
- `"completada"`
- `"cancelada"`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-11-15T10:00:00",
  "hora_inicio": "10:00",
  "hora_fin": "10:30",
  "motivo": "Control de presión arterial",
  "tipo_cita": "consulta_general",
  "estado": "pendiente",
  "sala_asignada": "Consultorio 3",
  "observaciones": "Paciente presenta antecedentes de hipertensión",
  "fecha_creacion": "2025-11-09T14:00:00",
  "paciente": {
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "cedula": "1750123456"
  },
  "medico": {
    "nombre": "Juan",
    "apellido": "Médico",
    "especialidad": "Cardiología"
  }
}
```

---

### 🔹 5.2. Listar Citas
- **Endpoint:** `GET /citas/`
- **Autenticación:** Bearer Token
- **Descripción:** Lista citas (médicos ven solo sus citas, admins ven todas)

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "paciente_id": 1,
    "medico_id": 1,
    "fecha": "2025-11-15T10:00:00",
    "hora_inicio": "10:00",
    "hora_fin": "10:30",
    "motivo": "Control de presión arterial",
    "estado": "pendiente",
    "tipo_cita": "consulta_general",
    "paciente": {
      "nombre": "Carlos",
      "apellido": "Ramírez"
    },
    "medico": {
      "nombre": "Juan",
      "apellido": "Médico"
    }
  }
]
```

---

### 🔹 5.3. Obtener Cita por ID
- **Endpoint:** `GET /citas/{cita_id}`
- **Autenticación:** Bearer Token
- **Descripción:** Obtiene una cita específica

**Ejemplo:** `GET /citas/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-11-15T10:00:00",
  "hora_inicio": "10:00",
  "hora_fin": "10:30",
  "motivo": "Control de presión arterial",
  "tipo_cita": "consulta_general",
  "estado": "pendiente",
  "sala_asignada": "Consultorio 3",
  "observaciones": "Paciente presenta antecedentes de hipertensión"
}
```

---

### 🔹 5.4. Citas por Fecha
- **Endpoint:** `GET /citas/fecha/{fecha}`
- **Autenticación:** Bearer Token
- **Descripción:** RF-001 - Filtra citas por fecha específica

**Ejemplo:** `GET /citas/fecha/2025-11-15`

**Con filtro de médico:** `GET /citas/fecha/2025-11-15?medico_id=1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "fecha": "2025-11-15T10:00:00",
    "hora_inicio": "10:00",
    "paciente": {
      "nombre": "Carlos",
      "apellido": "Ramírez"
    },
    "medico": {
      "nombre": "Juan",
      "apellido": "Médico"
    },
    "estado": "pendiente"
  }
]
```

---

### 🔹 5.5. Disponibilidad de Médicos
- **Endpoint:** `GET /citas/disponibilidad/medicos`
- **Autenticación:** Bearer Token
- **Descripción:** RF-001 - Obtiene disponibilidad de médicos por especialidad

**Ejemplos:**
```
GET /citas/disponibilidad/medicos
GET /citas/disponibilidad/medicos?especialidad=Cardiología
GET /citas/disponibilidad/medicos?fecha=2025-11-15
GET /citas/disponibilidad/medicos?especialidad=Cardiología&fecha=2025-11-15
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "medico_id": 1,
    "nombre": "Doctor Principal",
    "especialidad": "Cardiología",
    "citas_del_dia": 3,
    "disponible": true,
    "horario_atencion": "Lunes a Viernes: 08:00-16:00"
  }
]
```

---

### 🔹 5.6. Generar Código QR de Cita
- **Endpoint:** `GET /citas/{cita_id}/qr`
- **Autenticación:** No requerida (público)
- **Descripción:** Genera código QR con datos de la cita

**Ejemplo:** `GET /citas/1/qr`

**Respuesta Exitosa (200):**
```
Content-Type: image/png
[Imagen PNG del código QR]
```

**Datos codificados en el QR:**
```json
{
  "tipo": "cita_medica",
  "id": 1,
  "codigo": "CITA-000001",
  "paciente": "Carlos Ramírez",
  "cedula": "1750123456",
  "fecha": "15/11/2025",
  "hora": "10:00",
  "medico": "Doctor Principal",
  "especialidad": "Cardiología",
  "motivo": "Control de presión arterial",
  "estado": "pendiente",
  "url": "http://localhost:5173/citas/1"
}
```

---

### 🔹 5.7. Descargar Comprobante PDF
- **Endpoint:** `GET /citas/{cita_id}/comprobante/pdf`
- **Autenticación:** Bearer Token
- **Descripción:** RF-001 - Genera comprobante de cita en PDF con QR

**Ejemplo:** `GET /citas/1/comprobante/pdf`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=comprobante_cita_1.pdf
[PDF del comprobante]
```

---

### 🔹 5.8. Actualizar Cita
- **Endpoint:** `PUT /citas/{cita_id}`
- **Autenticación:** Bearer Token (Personal médico)
- **Descripción:** RF-001 - Actualiza una cita con notificaciones

**Ejemplo:** `PUT /citas/1`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (campos opcionales):**
```json
{
  "fecha": "2025-11-16T14:00:00",
  "hora_inicio": "14:00",
  "hora_fin": "14:30",
  "estado": "confirmada",
  "sala_asignada": "Consultorio 5",
  "observaciones": "Cita reprogramada por solicitud del paciente"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "fecha": "2025-11-16T14:00:00",
  "hora_inicio": "14:00",
  "hora_fin": "14:30",
  "estado": "confirmada",
  "sala_asignada": "Consultorio 5"
}
```

---

### 🔹 5.9. Cancelar Cita
- **Endpoint:** `POST /citas/{cita_id}/cancelar`
- **Autenticación:** Bearer Token (Personal médico)
- **Descripción:** RF-001 - Cancela una cita (motivo obligatorio, mínimo 10 caracteres)

**Ejemplo:** `POST /citas/1/cancelar`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "motivo": "Paciente solicita cancelación por viaje imprevisto"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "estado": "cancelada",
  "observaciones": "CANCELADA: Paciente solicita cancelación por viaje imprevisto",
  "mensaje": "Cita cancelada exitosamente"
}
```

---

### 🔹 5.10. Reprogramar Cita
- **Endpoint:** `POST /citas/{cita_id}/reprogramar`
- **Autenticación:** Bearer Token (Personal médico)
- **Descripción:** RF-001 - Reprograma una cita a nueva fecha/hora

**Ejemplo:** `POST /citas/1/reprogramar`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "nueva_fecha": "2025-11-20T15:00:00",
  "nueva_hora_inicio": "15:00",
  "nueva_hora_fin": "15:30"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "fecha": "2025-11-20T15:00:00",
  "hora_inicio": "15:00",
  "hora_fin": "15:30",
  "estado": "pendiente",
  "mensaje": "Cita reprogramada exitosamente"
}
```

---

### 🔹 5.11. Validar Cita del Día
- **Endpoint:** `POST /citas/{cita_id}/validar`
- **Autenticación:** Bearer Token (Personal médico)
- **Descripción:** RF-001 - Valida cita del día y notifica a enfermería

**Ejemplo:** `POST /citas/1/validar`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "estado": "confirmada",
  "validada": true,
  "mensaje": "Cita validada. Notificación enviada a enfermería"
}
```

---

### 🔹 5.12. Eliminar Cita
- **Endpoint:** `DELETE /citas/{cita_id}`
- **Autenticación:** Bearer Token (Solo Admin)
- **Descripción:** Elimina permanentemente una cita

**Ejemplo:** `DELETE /citas/1`

**Headers:**
```
Authorization: Bearer {token_admin}
```

**Respuesta Exitosa (200):**
```json
{
  "detail": "Cita eliminada exitosamente"
}
```

---

## 📝 NOTAS IMPORTANTES

### Variables de Entorno Necesarias
Verificar que el archivo `.env` contenga:
```env
DB_USER=root
DB_PASSWORD=yoma
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=GestionMedicaDB
JWT_SECRET=supersecretjwtkey_cambiar_en_produccion
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### Orden Recomendado para Pruebas
1. ✅ Login para obtener token
2. ✅ Crear paciente
3. ✅ Crear médico (si no existe)
4. ✅ Crear cita
5. ✅ Probar funcionalidades de citas

### Herramientas Recomendadas
- **Postman** - Para pruebas manuales
- **Thunder Client** (VS Code) - Extension para VS Code
- **curl** - Desde terminal
- **pytest** - Para pruebas automatizadas

---

**🔗 Continúa en:** [PRUEBAS_PARTE_2.md](./PRUEBAS_PARTE_2.md)
