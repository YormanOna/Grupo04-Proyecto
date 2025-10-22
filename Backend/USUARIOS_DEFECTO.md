# 👥 Usuarios Por Defecto del Sistema

Al iniciar la aplicación, se crean automáticamente los siguientes usuarios si no existen:

## 🔑 Credenciales de Acceso

### 👨‍💼 Administrador
- **Email:** `admin@hospital.com`
- **Contraseña:** `admin123`
- **Cargo:** Administrador
- **Cédula:** 1234567890

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
