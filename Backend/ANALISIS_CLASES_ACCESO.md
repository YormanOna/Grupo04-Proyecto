# Análisis de Clases y Niveles de Acceso del Sistema

## 📋 Resumen Ejecutivo

Este documento detalla todas las clases/modelos del sistema backend, identificando cuáles deberían ser **públicas** (accesibles sin autenticación) y cuáles **privadas** (requieren autenticación y/o permisos específicos).

---

## 🏗️ Arquitectura del Sistema

El sistema utiliza:
- **FastAPI** para el desarrollo de API REST
- **SQLAlchemy** como ORM para manejo de base de datos
- **JWT** para autenticación y autorización
- **Sistema de roles**: Admin General, Administrador, Médico, Enfermera, Farmacéutico

---

## 📦 Modelos/Clases del Sistema

### 1. **Empleado** (`models/empleado.py`)

**Descripción**: Modelo base para todos los empleados del sistema médico.

**Atributos principales**:
- `id`, `nombre`, `apellido`, `cedula`
- `cargo`: Admin General, Administrador, Médico, Enfermera, Farmacéutico
- `email`, `telefono`
- `hashed_password`: contraseña encriptada

**Relaciones**:
- Consultas (como médico)
- Citas (como encargado administrativo)
- Recetas emitidas y dispensadas
- Asistencias
- Auditorías

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Solo Admin General
- ✅ Leer: Autenticado (Admin General ve todos, otros solo su perfil)
- ✅ Actualizar: Admin General o el mismo empleado
- ✅ Eliminar: Solo Admin General

---

### 2. **Paciente** (`models/paciente.py`)

**Descripción**: Información completa de pacientes del sistema.

**Atributos principales**:
- Datos personales: `nombre`, `apellido`, `cedula`, `email`, `telefono`
- Datos médicos: `fecha_nacimiento`, `genero`, `grupo_sanguineo`, `alergias`, `antecedentes_medicos`
- Contacto emergencia: `contacto_emergencia_nombre`, `contacto_emergencia_telefono`
- Seguro médico: `tipo_seguro`, `aseguradora`, `numero_poliza`, `fecha_vigencia_poliza`
- **Propiedad calculada**: `edad` (calculada desde fecha_nacimiento)

**Relaciones**:
- Historia clínica (1:1)
- Citas (1:N)
- Consultas (1:N)
- Recetas (1:N)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Administrador, Médico
- ✅ Leer: Autenticado (Médicos ven solo sus pacientes, Admin ve todos)
- ✅ Actualizar: Administrador, Médico
- ✅ Eliminar: Solo Admin General
- ✅ Buscar: Todos los autenticados

---

### 3. **Medico** (`models/medico.py`)

**Descripción**: Especialización de Empleado para médicos.

**Atributos principales**:
- `nombre`, `apellido`, `cedula`, `especialidad`
- `email`
- `empleado_id`: Relación con tabla empleados

**Relaciones**:
- Empleado (herencia)
- Citas (1:N)

**Nivel de Acceso**: **MIXTO**
- ✅ Listar médicos: **PÚBLICO** (para que pacientes puedan ver médicos disponibles)
- ✅ Ver detalle: **PÚBLICO** (nombre, especialidad)
- ✅ Crear: Solo Admin General
- ✅ Actualizar: Admin General
- ✅ Eliminar: Solo Admin General

---

### 4. **Cita** (`models/cita.py`)

**Descripción**: Gestión de citas médicas.

**Atributos principales**:
- `fecha`, `hora_inicio`, `hora_fin`
- `motivo`, `observaciones_cancelacion`
- `estado`: programada, confirmada, en_consulta, completada, cancelada, no_asistio
- `sala_asignada`, `tipo_cita`
- `paciente_id`, `medico_id`, `encargado_id`

**Relaciones**:
- Paciente (N:1)
- Médico (N:1)
- Empleado encargado (N:1)
- Consultas (1:N)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Administrador, Médico
- ✅ Leer: Autenticado (según rol)
- ✅ Actualizar: Administrador, Médico asignado
- ✅ Cancelar: Administrador, Médico asignado
- ✅ Eliminar: Solo Admin General

---

### 5. **Historia** (`models/historia.py`)

**Descripción**: Historia clínica del paciente.

**Atributos principales**:
- `identificador`: código único de historia
- `fecha_creacion`

**Relaciones**:
- Paciente (1:1)
- Consultas (1:N)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Automático al crear paciente
- ✅ Leer: Médico asignado, Administrador, Admin General
- ✅ Actualizar: Médico
- ✅ Eliminar: Solo Admin General

---

### 6. **Consulta** (`models/consulta.py`)

**Descripción**: Registro detallado de consultas médicas.

**Atributos principales**:
- `cita_id`, `historia_id`, `paciente_id`, `medico_id`
- `signos_vitales`: JSON con datos vitales
- `motivo_consulta`, `enfermedad_actual`
- `examen_fisico`, `diagnostico`, `diagnostico_codigo`
- `diagnosticos_secundarios`, `tratamiento`
- `indicaciones`, `examenes_solicitados`
- `pronostico`, `observaciones`
- `fecha_consulta`

**Relaciones**:
- Cita (N:1)
- Médico/Empleado (N:1)
- Historia (N:1)
- Paciente (N:1)
- Recetas (1:N)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Solo Médico
- ✅ Leer: Médico que la creó, Admin General
- ✅ Actualizar: Médico que la creó (dentro de plazo)
- ✅ Eliminar: Solo Admin General
- ⚠️ **Información sensible protegida por HIPAA/confidencialidad**

---

### 7. **Receta** (`models/receta.py`)

**Descripción**: Prescripciones médicas y dispensación.

**Atributos principales**:
- `consulta_id`, `medico_id`, `paciente_id`
- `fecha_emision`, `medicamentos` (JSON/texto)
- `indicaciones`
- `estado`: pendiente, dispensada, parcial, cancelada
- `dispensada_por`: ID del farmacéutico
- `fecha_dispensacion`
- `lote_id`, `fecha_vencimiento`

**Relaciones**:
- Consulta (N:1)
- Médico/Empleado (N:1)
- Paciente (N:1)
- Farmacéutico/Empleado (N:1)
- Lote (N:1)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Solo Médico (durante consulta)
- ✅ Leer: Médico creador, Farmacéutico, Paciente dueño
- ✅ Dispensar: Solo Farmacéutico
- ✅ Cancelar: Médico creador, Admin General
- ✅ Generar PDF: Médico, Farmacéutico, Paciente dueño

---

### 8. **Medicamento** (`models/medicamento.py`)

**Descripción**: Catálogo de medicamentos con información extendida.

**Atributos principales**:
- `nombre`, `stock`, `contenido`
- `codigo_interno`, `principio_activo`, `nombre_comercial`
- `concentracion`, `forma_farmaceutica`
- `categoria_terapeutica`
- `indicaciones`, `contraindicaciones`, `efectos_secundarios`
- `dosis_recomendada`
- `farmacia_id`

**Relaciones**:
- Farmacia (N:1)
- Lotes (1:N)

**Nivel de Acceso**: **MIXTO**
- ✅ Listar (básico): **PÚBLICO** (nombre, categoría, disponibilidad general)
- ✅ Ver detalle completo: Autenticado (Médico, Farmacéutico)
- ✅ Crear: Admin General, Farmacéutico
- ✅ Actualizar: Admin General, Farmacéutico
- ✅ Eliminar: Solo Admin General

---

### 9. **Lote** (`models/lote.py`)

**Descripción**: Gestión de lotes de medicamentos para trazabilidad.

**Atributos principales**:
- `medicamento_id`, `numero_lote`
- `fecha_ingreso`, `fecha_vencimiento`
- `cantidad_inicial`, `cantidad_disponible`
- `ubicacion_fisica`, `proveedor`
- `numero_factura`, `costo_unitario`
- `estado`: disponible, proximo_a_vencer, vencido, agotado

**Relaciones**:
- Medicamento (N:1)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Admin General, Farmacéutico
- ✅ Leer: Admin General, Farmacéutico, Médico (consulta)
- ✅ Actualizar: Admin General, Farmacéutico
- ✅ Eliminar: Solo Admin General

---

### 10. **Farmacia** (`models/farmacia.py`)

**Descripción**: Establecimientos farmacéuticos del sistema.

**Atributos principales**:
- `nombre_farmacia`, `direccion`, `telefono`
- `farmaceutico_id`

**Relaciones**:
- Empleado/Farmacéutico (N:1)
- Medicamentos (1:N)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Solo Admin General
- ✅ Leer: Todos los autenticados
- ✅ Actualizar: Admin General, Farmacéutico asignado
- ✅ Eliminar: Solo Admin General

---

### 11. **Asistencia** (`models/asistencia.py`)

**Descripción**: Registro de asistencia de empleados (entrada/salida).

**Atributos principales**:
- `empleado_id`
- `fecha_entrada`, `fecha_salida`
- `tipo_registro`: entrada, salida
- `observaciones`

**Relaciones**:
- Empleado (N:1)

**Nivel de Acceso**: **PRIVADO**
- ✅ Crear: Empleado autenticado (registra su propia asistencia)
- ✅ Leer: Admin General ve todos, empleados ven solo su historial
- ✅ Actualizar: Admin General
- ✅ Eliminar: Solo Admin General

---

### 12. **Auditoria** (`models/auditoria.py`)

**Descripción**: Registro de auditoría para trazabilidad de acciones.

**Atributos principales**:
- `usuario_id`, `usuario_nombre`, `usuario_cargo`
- `accion`: CREATE, UPDATE, DELETE, LOGIN, LOGOUT
- `modulo`, `descripcion`
- `tabla_afectada`, `registro_id`
- `datos_anteriores`, `datos_nuevos` (JSON)
- `ip_address`, `user_agent`
- `estado`: exitoso, fallido, advertencia
- `fecha_hora`

**Relaciones**:
- Empleado/Usuario (N:1)

**Nivel de Acceso**: **PRIVADO - SOLO LECTURA**
- ✅ Crear: **AUTOMÁTICO** (sistema)
- ✅ Leer: Solo Admin General
- ❌ Actualizar: NO permitido (integridad)
- ❌ Eliminar: NO permitido (trazabilidad legal)

---

### 13. **DiagnosticoCIE10** (`models/diagnostico_cie10.py`)

**Descripción**: Catálogo de diagnósticos según clasificación CIE-10.

**Atributos principales**:
- `codigo`: código CIE-10 (ej: A00, J06)
- `descripcion`
- `categoria`: clasificación general

**Nivel de Acceso**: **PÚBLICO (solo lectura)**
- ✅ Leer/Buscar: **PÚBLICO** (catálogo estándar internacional)
- ✅ Crear: Solo Admin General (carga inicial)
- ❌ Actualizar: Solo Admin General (muy ocasional)
- ❌ Eliminar: Solo Admin General

---

### 14. **SignosVitales** (`models/signos_vitales.py`)

**Descripción**: Modelo legacy de signos vitales (ahora se usa JSON en Consulta).

**Atributos principales**:
- `presion_arterial`, `frecuencia_cardiaca`
- `frecuencia_respiratoria`, `temperatura`
- `saturacion_oxigeno`, `peso`, `talla`, `imc`
- `observaciones`

**Nivel de Acceso**: **PRIVADO (deprecado)**
- ⚠️ Modelo mantenido por compatibilidad
- ℹ️ En versión actual, signos vitales se guardan en JSON en tabla `consultas`

---

## 🔐 Resumen de Acceso por Categoría

### **Clases PÚBLICAS** (acceso sin autenticación)
1. ✅ **DiagnosticoCIE10** - Catálogo de diagnósticos (solo lectura)
2. ✅ **Medico** - Lista de médicos y especialidades (solo lectura básica)
3. ✅ **Medicamento** - Información básica de medicamentos (solo lectura limitada)

### **Clases PRIVADAS - Autenticación Requerida**
1. 🔒 **Empleado** - Gestión de personal
2. 🔒 **Paciente** - Información de pacientes
3. 🔒 **Cita** - Agendamiento de citas
4. 🔒 **Historia** - Historias clínicas
5. 🔒 **Consulta** - Consultas médicas (MUY SENSIBLE)
6. 🔒 **Receta** - Prescripciones médicas
7. 🔒 **Lote** - Inventario de medicamentos
8. 🔒 **Farmacia** - Farmacias del sistema
9. 🔒 **Asistencia** - Control de asistencia

### **Clases PRIVADAS - Solo Admin General**
1. 👑 **Auditoria** - Logs del sistema (solo lectura, escritura automática)

---

## 🎯 Recomendaciones de Seguridad

### 1. **Endpoints de Autenticación**
```
✅ PÚBLICO:
- POST /auth/login - Login de usuarios
- POST /auth/register - Solo si se permite auto-registro (evaluar)

❌ PRIVADO:
- POST /auth/logout - Requiere token válido
- GET /auth/me - Información del usuario actual
```

### 2. **Protección de Datos Sensibles**
- 🔐 **Consultas médicas**: Cifrado en reposo recomendado
- 🔐 **Historias clínicas**: Acceso restringido por rol
- 🔐 **Datos de empleados**: Hash de passwords (bcrypt/argon2)
- 🔐 **Auditorías**: Inmutables, solo append

### 3. **Implementación de Permisos por Rol**

| Rol | Acceso |
|-----|--------|
| **Admin General** | ✅ Acceso total al sistema |
| **Administrador** | ✅ Pacientes, Citas, Reportes básicos |
| **Médico** | ✅ Sus pacientes, Consultas, Recetas |
| **Enfermera** | ✅ Signos vitales, Citas, Pacientes (lectura) |
| **Farmacéutico** | ✅ Medicamentos, Recetas, Inventario |

### 4. **Rate Limiting Recomendado**
```
- Endpoints públicos: 100 req/min
- Endpoints autenticados: 1000 req/min
- Login endpoint: 5 intentos/min (prevenir fuerza bruta)
```

### 5. **Validaciones Adicionales**
- ✅ Validar vigencia de pólizas de seguro
- ✅ Validar disponibilidad de medicamentos antes de dispensar
- ✅ Registrar todas las acciones en auditoría
- ✅ Notificaciones de stock bajo automáticas
- ✅ Alertas de medicamentos próximos a vencer

---

## 📊 Diagrama de Flujo de Acceso

```
┌─────────────────┐
│  Usuario/API    │
└────────┬────────┘
         │
         ├──→ ¿Endpoint público?
         │    ├─ Sí → Acceso directo (limitado)
         │    └─ No → Requiere autenticación
         │
         ├──→ Validar JWT Token
         │    ├─ Inválido → 401 Unauthorized
         │    └─ Válido → Extraer rol
         │
         ├──→ Verificar permisos por rol
         │    ├─ Sin permiso → 403 Forbidden
         │    └─ Con permiso → Continuar
         │
         ├──→ Validar reglas de negocio
         │    ├─ Violación → 400 Bad Request
         │    └─ OK → Ejecutar acción
         │
         └──→ Registrar en Auditoría
              └─ Retornar respuesta
```

---

## 🔍 Consideraciones Legales

### **Confidencialidad Médica (HIPAA/Local)**
- Consultas, historias y diagnósticos son **información sensible**
- Requiere consentimiento del paciente para compartir
- Debe cumplir con leyes de protección de datos

### **Trazabilidad**
- Auditoría completa de accesos a datos médicos
- Registro de quién accedió, cuándo y qué modificó
- Inmutabilidad de logs de auditoría

### **Retención de Datos**
- Historias clínicas: mínimo 10 años (según legislación local)
- Auditorías: mínimo 7 años
- Recetas: mínimo 5 años

---

## 📝 Conclusiones

El sistema implementa un modelo de seguridad robusto con:

1. **Separación clara de accesos** públicos y privados
2. **Sistema de roles** bien definido y granular
3. **Auditoría completa** de todas las operaciones
4. **Protección de datos sensibles** médicos
5. **Trazabilidad** de medicamentos por lotes

**Recomendación final**: Mantener solo 3 endpoints verdaderamente públicos (CIE10, lista médicos, catálogo medicamentos básico). Todo lo demás debe requerir autenticación y validación de permisos.

---

**Documento generado**: Noviembre 2025  
**Proyecto**: Sistema de Gestión Médica - Grupo 04  
**Versión**: 1.0
