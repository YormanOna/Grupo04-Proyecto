# 📅 README - Pruebas de Registro de Citas Médicas

## 📋 Información General

**Módulo:** Registro de Citas Médicas  
**Endpoint:** `POST /citas/`  
**Tipo de Pruebas:** Integración HTTP  
**Autenticación:** Bearer Token (Personal Médico)  
**Fecha de Creación:** 12/11/2025

---

## 🎯 Objetivo

Validar el correcto funcionamiento del registro de citas médicas, asegurando que:

1. ✅ Se creen correctamente citas para fechas futuras
2. ✅ Se rechacen citas con fechas pasadas
3. ✅ Se valide la existencia del paciente
4. ✅ Se detecten solapamientos de horarios del mismo médico
5. ✅ Se valide que hora_inicio < hora_fin

---

## 📊 Casos de Prueba Implementados

| # | Caso de Prueba | Endpoint | Status Esperado | Descripción |
|---|----------------|----------|-----------------|-------------|
| 1 | Cita Futura Exitosa | `POST /citas/` | 200 OK | Fecha: 2025-12-01 09:00, médico y paciente válidos |
| 2 | Rechazo Fecha Pasada | `POST /citas/` | 400/422 | Fecha: 2024-10-01 (año pasado) |
| 3 | Paciente Inexistente | `POST /citas/` | 404 | paciente_id: 98765 (no existe) |
| 4 | Solapamiento de Cita | `POST /citas/` | 400 | Mismo médico, misma fecha/hora que cita existente |
| 5 | Hora Inicio > Hora Fin | `POST /citas/` | 400/422 | hora_inicio: "10:00", hora_fin: "09:30" |

---

## 🔧 Configuración del Entorno

### 1. **Activar el entorno virtual**

```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Pruebas/PruebasUnitarias
source venv/bin/activate
```

### 2. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

### 3. **Iniciar el backend**

```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Backend
uvicorn app.main:app --reload
```

**⚠️ IMPORTANTE:** El backend debe estar corriendo en `http://localhost:8000`

---

## 🚀 Ejecución de las Pruebas

### Ejecutar todas las pruebas del módulo

```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Pruebas/PruebasUnitarias
pytest RegistroCitas/test_registro_citas_http.py -v
```

### Ejecutar un caso específico

```bash
# CASO 1: Creación exitosa de cita futura
pytest RegistroCitas/test_registro_citas_http.py::TestCaso1CreacionExitosaCitaFutura -v

# CASO 2: Rechazo por fecha pasada
pytest RegistroCitas/test_registro_citas_http.py::TestCaso2RechazoFechaPasada -v

# CASO 3: Paciente inexistente
pytest RegistroCitas/test_registro_citas_http.py::TestCaso3RechazoPacienteInexistente -v

# CASO 4: Solapamiento de cita
pytest RegistroCitas/test_registro_citas_http.py::TestCaso4RechazoSolapamientoCita -v

# CASO 5: Hora inicio mayor a fin
pytest RegistroCitas/test_registro_citas_http.py::TestCaso5RechazoHoraInicioMayorFin -v
```

### Ejecutar con salida detallada

```bash
pytest RegistroCitas/test_registro_citas_http.py -v -s
```

---

## 📝 Estructura del Payload

### Request Body Completo

```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-12-01T09:00:00",
  "hora_inicio": "09:00",
  "hora_fin": "09:30",
  "motivo": "Control mensual",
  "estado": "programada",
  "tipo_cita": "consulta",
  "sala_asignada": "Consultorio 101"
}
```

### Campos Obligatorios y Opcionales

| Campo | Tipo | Obligatorio | Descripción | Ejemplo |
|-------|------|-------------|-------------|---------|
| `paciente_id` | int | ✅ Sí | ID del paciente | 1 |
| `medico_id` | int | ⚠️ Opcional | ID del médico | 1 |
| `fecha` | datetime | ✅ Sí | Fecha y hora de la cita | "2025-12-01T09:00:00" |
| `hora_inicio` | string | ⚠️ Opcional | Hora de inicio (HH:MM) | "09:00" |
| `hora_fin` | string | ⚠️ Opcional | Hora de fin (HH:MM) | "09:30" |
| `motivo` | string | ⚠️ Opcional | Motivo de la consulta | "Control mensual" |
| `estado` | enum | ⚠️ Opcional | Estado de la cita | "programada" |
| `tipo_cita` | enum | ⚠️ Opcional | Tipo de cita | "consulta" |

### Valores de Enums

**EstadoCitaEnum:**
- `programada` (default)
- `confirmada`
- `en_consulta`
- `completada`
- `cancelada`
- `no_asistio`

**TipoCitaEnum:**
- `consulta` (default)
- `seguimiento`
- `emergencia`

---

## 🔍 Resultados Esperados

### ✅ Caso 1: Creación Exitosa de Cita Futura

**Request:**
```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-12-01T09:00:00",
  "hora_inicio": "09:00",
  "hora_fin": "09:30",
  "motivo": "Control mensual",
  "estado": "programada"
}
```

**Response (200 OK):**
```json
{
  "id": 15,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha": "2025-12-01T09:00:00",
  "hora_inicio": "09:00",
  "hora_fin": "09:30",
  "motivo": "Control mensual",
  "estado": "programada",
  "tipo_cita": "consulta"
}
```

---

### ❌ Caso 2: Rechazo por Fecha Pasada

**Request:**
```json
{
  "fecha": "2024-10-01T09:00:00"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": [
    {
      "loc": ["body", "fecha"],
      "msg": "No se pueden crear citas en el pasado. Fecha proporcionada: 01/10/2024 09:00, Fecha actual: 12/11/2025 14:30",
      "type": "value_error"
    }
  ]
}
```

---

### ❌ Caso 3: Paciente Inexistente

**Request:**
```json
{
  "paciente_id": 98765
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Paciente no encontrado"
}
```

---

### ❌ Caso 4: Solapamiento de Cita

**Escenario:** Ya existe una cita del médico X el 2025-12-05 de 14:00 a 14:30

**Request:**
```json
{
  "medico_id": 1,
  "fecha": "2025-12-05T14:00:00",
  "hora_inicio": "14:00",
  "hora_fin": "14:30"
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "El bloque horario no está disponible. Conflicto con cita #12"
}
```

---

### ❌ Caso 5: Hora Inicio Mayor a Hora Fin

**Request:**
```json
{
  "hora_inicio": "10:00",
  "hora_fin": "09:30"
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["body", "hora_fin"],
      "msg": "La hora de fin (09:30) debe ser mayor que la hora de inicio (10:00)",
      "type": "value_error"
    }
  ]
}
```

---

## 📈 Interpretación de Resultados

### Salida de Consola Esperada

```
🔐 Obteniendo token de autenticación (MÉDICO)...
   ✅ Token obtenido correctamente
   🆔 Empleado ID: 3
   👨‍⚕️ Médico ID: 1

📋 Buscando o creando paciente de prueba...
   ✅ Paciente creado: ID 5, Cédula 1712416245

================================================================================
📅 CASO 1: Creación Exitosa de Cita Médica Futura (HTTP)
================================================================================
📤 Datos enviados:
   - Paciente ID: 5
   - Médico ID: 1
   - Fecha: 01/12/2025 09:00
   - Hora inicio: 09:00
   - Hora fin: 09:30
   - Motivo: Control mensual

📥 Respuesta del servidor:
   ⏱️  Tiempo de respuesta: 0.156 segundos
   📊 Status Code: 200
   ✅ Cita creada exitosamente
   🆔 ID asignado: 15

================================================================================
✅ CASO 1 PASADO: Cita futura creada correctamente
================================================================================
```

---

## 🧪 Validaciones Implementadas

### 1. **Validaciones en Schema (cita_schema.py)**
- ✅ Fecha debe ser futura (con margen de 1 hora)
- ✅ hora_fin debe ser mayor que hora_inicio
- ✅ Formatos de fecha y hora correctos

### 2. **Validaciones en Service (cita_service.py)**
- ✅ Paciente existe en base de datos (404 si no existe)
- ✅ Médico existe si se proporciona
- ✅ No hay solapamiento de horarios del mismo médico
- ✅ Estado de cita válido

### 3. **Validaciones de Respuesta (pytest)**
- ✅ Status code correcto (200, 400, 404, 422)
- ✅ Cita creada con ID asignado
- ✅ Todos los campos guardados correctamente
- ✅ Tiempo de respuesta < 2 segundos
- ✅ Mensajes de error descriptivos

---

## 🐛 Troubleshooting

### Error: "Connection refused"
**Solución:**
```bash
cd Backend
uvicorn app.main:app --reload
```

### Error: "401 Unauthorized"
**Solución:** Verificar que exista `medico@hospital.com` con password `medico123`

### Error: "No se pudo crear paciente de prueba"
**Solución:** Limpiar base de datos:
```sql
DELETE FROM pacientes WHERE apellido = 'Prueba';
```

### Error: "El bloque horario no está disponible" (sin crear cita previa)
**Solución:** Limpiar citas de pruebas anteriores:
```sql
DELETE FROM citas WHERE fecha = '2025-12-05' AND hora_inicio = '14:00';
```

---

## 📚 Referencias

- **Modelo Backend:** `Backend/app/models/cita.py`
- **Schema Backend:** `Backend/app/schemas/cita_schema.py`
- **Rutas:** `Backend/app/routes/cita_routes.py`
- **Servicio:** `Backend/app/services/cita_service.py`
- **Frontend:** `Frontend/src/pages/Citas/CitaForm.jsx`

---

## 🔄 Flujo de Validación

```
POST /citas/
    ↓
1. Validar Schema (Pydantic)
   - Fecha futura
   - hora_fin > hora_inicio
   - Formatos correctos
    ↓
2. Validar Existencia (Service)
   - Paciente existe (404)
   - Médico existe (404)
    ↓
3. Validar Disponibilidad (Service)
   - Sin solapamiento de horarios (400)
    ↓
4. Crear Cita en BD
   - Asignar ID
   - Enviar notificaciones
    ↓
5. Retornar 200 OK + Cita creada
```

---

## 👥 Autores

- Sistema de Gestión Médica - Grupo 04
- Fecha: 12 de noviembre de 2025

---

## 📄 Licencia

Uso exclusivo para propósitos educativos y de pruebas.
