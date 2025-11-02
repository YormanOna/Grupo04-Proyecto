# 🔐 Matriz de Permisos por Rol

## 📊 Resumen de Roles

### ⭐ Admin General (Super Administrador)
**Acceso Total** - Puede hacer todo en el sistema

### 💼 Administrador (Recepcionista)
**Gestión de Recepción** - Registro de pacientes y agendamiento de citas

### 👨‍⚕️ Médico
**Atención Médica** - Consultas, diagnósticos, recetas

### 👩‍⚕️ Enfermera
**Enfermería** - Signos vitales y apoyo en atención

### 💊 Farmacéutico
**Farmacia** - Gestión de medicamentos y despacho de recetas

---

## 🗂️ Matriz Completa de Permisos

| Módulo / Funcionalidad | Admin General | Administrador | Médico | Enfermera | Farmacéutico |
|------------------------|:-------------:|:-------------:|:------:|:---------:|:------------:|
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Asistencia (Propia)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Asistencia (Gestión)** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Pacientes - Ver** | ✅ | ✅ | ✅ | ✅ (solo lectura) | ❌ |
| **Pacientes - Crear** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Pacientes - Editar** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Pacientes - Eliminar** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Citas - Ver** | ✅ | ✅ | ✅ | ✅ (solo lectura) | ❌ |
| **Citas - Agendar** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Citas - Editar** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Citas - Cancelar** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Calendario de Citas** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Médicos - Ver** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Médicos - Gestionar** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Consulta Médica** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Signos Vitales** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Recetas - Ver** | ✅ | ❌ | ✅ | ❌ | ✅ |
| **Recetas - Crear** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Recetas - Despachar** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Farmacia - Inventario** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Farmacia - Medicamentos** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Perfil Personal** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gestión de Usuarios** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 📋 Detalle por Rol

### ⭐ Admin General
**Descripción**: Super administrador del sistema con acceso total

**Puede hacer**:
- ✅ Todo lo del sistema
- ✅ Gestionar usuarios
- ✅ Configuración del sistema
- ✅ Reportes completos
- ✅ Auditoría

**No puede hacer**:
- ❌ Nada está restringido

---

### 💼 Administrador (Recepcionista)
**Descripción**: Personal de recepción que gestiona pacientes y citas

**Puede hacer**:
- ✅ Registrar nuevos pacientes
- ✅ Editar información de pacientes
- ✅ Eliminar pacientes (con precaución)
- ✅ Agendar citas médicas
- ✅ Editar/Cancelar citas
- ✅ Ver calendario de citas
- ✅ Ver listado de médicos
- ✅ Gestionar asistencia del personal
- ✅ Ver dashboard con estadísticas

**No puede hacer**:
- ❌ Realizar consultas médicas
- ❌ Registrar signos vitales
- ❌ Crear recetas
- ❌ Gestionar farmacia
- ❌ Gestionar usuarios del sistema

---

### 👨‍⚕️ Médico
**Descripción**: Profesional médico que atiende pacientes

**Puede hacer**:
- ✅ Ver lista de pacientes
- ✅ Registrar/editar información de pacientes
- ✅ Ver su agenda de citas
- ✅ Agendar/editar sus propias citas
- ✅ Realizar consultas médicas
- ✅ Crear recetas médicas
- ✅ Ver historial médico
- ✅ Ver dashboard médico

**No puede hacer**:
- ❌ Ver listado completo de médicos (gestión administrativa)
- ❌ Registrar signos vitales (es función de enfermería)
- ❌ Gestionar farmacia
- ❌ Despachar medicamentos
- ❌ Eliminar pacientes
- ❌ Gestionar usuarios

---

### 👩‍⚕️ Enfermera
**Descripción**: Personal de enfermería para apoyo en atención

**Puede hacer**:
- ✅ **Ver** lista de pacientes (solo lectura)
- ✅ **Ver** detalles de pacientes
- ✅ **Ver lista de citas del día** (para saber qué pacientes atender)
- ✅ **Acceso directo a signos vitales** desde cada cita
- ✅ **Registrar signos vitales** (presión, temperatura, peso, etc.)
- ✅ **Consultar signos vitales** registrados
- ✅ Ver dashboard de enfermería
- ✅ Registrar su asistencia personal

**No puede hacer**:
- ❌ **Crear, editar o eliminar pacientes**
- ❌ **Agendar, editar o cancelar citas**
- ❌ **Ver calendario de citas** (solo ve lista del día)
- ❌ **Ver listado de médicos** (no es gestión administrativa)
- ❌ Realizar consultas médicas
- ❌ Crear recetas
- ❌ Gestionar farmacia
- ❌ Gestionar usuarios

**Justificación**:
- Necesita **ver las citas del día** para saber qué pacientes tienen cita
- Su función es **tomar signos vitales** de los pacientes antes de la consulta médica
- Las citas son agendadas por **recepción** o el **médico**, no por enfermería
- Solo necesita **ver información**, no modificarla
- Tiene acceso directo desde la lista de citas a registrar signos vitales

---

### 💊 Farmacéutico
**Descripción**: Personal de farmacia que gestiona medicamentos

**Puede hacer**:
- ✅ Ver inventario de medicamentos
- ✅ Crear/editar medicamentos
- ✅ Ver recetas médicas
- ✅ Despachar medicamentos de recetas
- ✅ Gestionar stock de farmacia
- ✅ Ver dashboard de farmacia

**No puede hacer**:
- ❌ Ver pacientes
- ❌ Agendar citas
- ❌ Realizar consultas
- ❌ Crear recetas (solo médicos)
- ❌ Registrar signos vitales
- ❌ Gestionar usuarios

---

## 🔄 Flujo de Trabajo Típico

### Caso 1: Paciente Nueva Consulta
1. **Recepcionista** (Administrador):
   - Registra al paciente
   - Agenda cita con médico

2. **Enfermera**:
   - Ve al paciente en la lista
   - Registra signos vitales

3. **Médico**:
   - Ve la cita en su agenda
   - Realiza consulta
   - Crea receta si es necesario

4. **Farmacéutico**:
   - Ve la receta
   - Despacha medicamentos

### Caso 2: Control Regular
1. **Recepcionista**:
   - Agenda cita de control

2. **Enfermera**:
   - Registra signos vitales actualizados

3. **Médico**:
   - Revisa evolución
   - Actualiza tratamiento

---

## 🎯 Principios de Seguridad

1. **Principio de Mínimo Privilegio**: Cada rol tiene solo los permisos necesarios para su función

2. **Separación de Funciones**:
   - Recepción → Gestión administrativa
   - Médico → Atención clínica
   - Enfermera → Apoyo técnico
   - Farmacia → Medicamentos

3. **Datos Sensibles**:
   - Solo personal médico ve historias clínicas completas
   - Recepción ve datos administrativos
   - Farmacia ve solo recetas

4. **Auditoría**:
   - Admin General supervisa todo
   - Todas las acciones se registran

---

## ⚙️ Implementación Técnica

### Frontend
- **Sidebar.jsx**: Filtra opciones de menú por rol
- **Componentes**: Ocultan botones según permisos
- **Guards**: PrivateRoute para protección básica

### Backend
- **permissions.py**: Decoradores de permisos
- **Routes**: Cada endpoint verifica rol requerido
- **Database**: Logs de auditoría

### Ejemplo de Restricción

```javascript
// Frontend - Sidebar.jsx
const menuItems = allMenuItems.filter(item => 
  item.roles.includes(user?.cargo)
)

// Backend - cita_routes.py
@router.post("/", dependencies=[Depends(admin_only)])
def create_cita(...):
    # Solo Admin General y Administrador pueden crear citas
```

---

## 📝 Notas Importantes

1. **Admin General** es diferente de **Administrador**:
   - Admin General = Super admin (acceso total)
   - Administrador = Recepcionista (acceso limitado)

2. **Enfermera** tiene permisos muy específicos:
   - Solo lectura en pacientes
   - Sin acceso a gestión de citas
   - Enfoque en signos vitales

3. **Médico** no ve gestión administrativa:
   - No ve lista completa de médicos
   - Solo su agenda personal
   - Enfoque en atención médica

4. **Cambios de Permisos**:
   - Requieren modificar: `Sidebar.jsx` y `permissions.py`
   - Documentar en este archivo

---

✅ **Matriz actualizada** - 1 de noviembre de 2025
