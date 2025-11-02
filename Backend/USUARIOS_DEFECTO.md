# 👥 Usuarios Por Defecto del Sistema

Al iniciar la aplicación, se crean automáticamente los siguientes usuarios si no existen:

## 🔑 Credenciales de Acceso

### ⭐ Admin General (Super Administrador)
- **Email:** `superadmin@hospital.com`
- **Contraseña:** `superadmin123`
- **Cargo:** Admin General
- **Cédula:** 1111111111
- **Permisos:** ⭐ **ACCESO TOTAL** - Gestión completa del sistema, usuarios, configuración y todos los módulos

### ‍💼 Administrador (Recepcionista)
- **Email:** `admin@hospital.com`
- **Contraseña:** `admin123`
- **Cargo:** Administrador
- **Cédula:** 1234567890
- **Permisos:** 
  * ✅ Dashboard (visualización general)
  * ✅ Asistencia (control de entrada/salida)
  * ✅ Registro y gestión de pacientes
  * ✅ Agendamiento de citas (RF-001)
  * ✅ Visualización de calendario de citas
  * ❌ NO tiene acceso a: Consultas médicas, Recetas, Farmacia, Signos Vitales, Gestión de Médicos

### 👨‍⚕️ Médico
- **Email:** `medico@hospital.com`
- **Contraseña:** `medico123`
- **Cargo:** Medico
- **Cédula:** 9876543210

### 👩‍⚕️ Enfermera
- **Email:** `enfermera@hospital.com`
- **Contraseña:** `enfer123`
- **Cargo:** Enfermera
- **Cédula:** 5555555555
- **Permisos:**
  * ✅ Dashboard (visualización de estadísticas)
  * ✅ Asistencia (registro de entrada/salida personal)
  * ✅ Pacientes (solo lectura - no puede crear, editar o eliminar)
  * ✅ **Citas del Día** (solo lectura - para saber qué pacientes atender)
  * ✅ **Signos Vitales** (su función principal - registro desde la lista de citas)
  * ✅ Perfil personal
  * ❌ NO tiene acceso a: Crear/Editar/Cancelar Citas, Calendario de Citas, Médicos (gestión), Consultas Médicas, Recetas, Farmacia

### 💊 Farmacéutico
- **Email:** `farmacia@hospital.com`
- **Contraseña:** `farma123`
- **Cargo:** Farmaceutico
- **Cédula:** 7777777777

---

## 📝 Notas Importantes

1. Estos usuarios se crean automáticamente al iniciar la aplicación
2. Solo se crean si no existen previamente en la base de datos
3. **⚠️ CAMBIAR ESTAS CONTRASEÑAS EN PRODUCCIÓN**
4. Los usuarios se crean en la tabla `empleados`
5. El médico también se registra en la tabla `medicos`

## 🚀 Acceso a la API

Una vez iniciado el servidor, puedes acceder a:
- **Documentación Swagger:** http://127.0.0.1:8000/docs
- **Documentación ReDoc:** http://127.0.0.1:8000/redoc
- **Endpoint raíz:** http://127.0.0.1:8000/

## 🔐 Autenticación

Para autenticarte, usa el endpoint:
```
POST /auth/login
```

Con el body:
```json
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Recibirás un token JWT que debes incluir en los headers de tus peticiones:
```
Authorization: Bearer <tu_token>
```
