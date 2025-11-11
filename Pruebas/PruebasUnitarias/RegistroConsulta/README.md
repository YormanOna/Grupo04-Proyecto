# 📋 README - Pruebas de Registro de Consulta Médica

## 🎯 Objetivo

Validar la funcionalidad completa de **Registro de Consultas Médicas** mediante pruebas de integración HTTP que verifican:

- ✅ Creación exitosa de consultas con datos completos
- ✅ Creación con campos mínimos obligatorios
- ❌ Rechazo de consultas con datos inválidos
- ❌ Validación de relaciones (paciente-cita)
- ⚡ Tiempo de respuesta del endpoint

---

## 📊 Casos de Prueba Implementados

| # | Caso de Prueba | Endpoint | Status Esperado | Descripción |
|---|----------------|----------|-----------------|-------------|
| 1 | Consulta Completa | `POST /consultas/` | 200 OK | Todos los campos: motivo, diagnóstico (K29.1), tratamiento, signos vitales, exámenes |
| 2 | Consulta Mínima | `POST /consultas/` | 200 OK | Solo obligatorios: paciente, médico, motivo, diagnóstico |
| 3 | Paciente Inexistente | `POST /consultas/` | 404/400 | Intento con `paciente_id: 999999` |
| 4 | Diagnóstico Vacío | `POST /consultas/` | 422/400 | Validación de campo obligatorio |
| 5 | Motivo Largo | `POST /consultas/` | 200/400 | Motivo con 800+ caracteres |
| 6 | Cita No Asociada | `POST /consultas/` | 400/403 | Cita válida pero de otro paciente |

---

## 🗂️ Estructura de Archivos

```
RegistroConsulta/
├── __init__.py                      # Marca el paquete
├── test_consulta_http.py            # 🟢 Archivo principal de pruebas (6 casos)
├── GUIA_EJECUCION_CONSULTA.md       # 📖 Guía detallada de ejecución
└── README.md                         # 📄 Este archivo
```

---

## 🚀 Ejecución Rápida

### Requisitos
1. Backend corriendo: `uvicorn app.main:app --reload`
2. MySQL activo
3. Médico registrado: `dra.martinez@hospital.com`

### Comando
```bash
cd Pruebas/PruebasUnitarias
pytest RegistroConsulta/test_consulta_http.py -v -s
```

---

## 📝 Datos de Prueba

### Paciente de Prueba (creado automáticamente)
- Nombre: **María González**
- Cédula: **1712416245** (válida)
- Email: `maria.gonzalez.{timestamp}@test.com`

### Médico
- Email: **dra.martinez@hospital.com**
- Password: **medico123**
- Rol: **Médico**

### Diagnósticos
- **Caso 1**: Gastritis aguda (Código CIE-10: K29.1)
- **Caso 2**: Resfriado común (sin código)
- **Caso 5**: Dolor abdominal a estudio

---

## 🔍 Fixtures Utilizados

### `auth_token_medico` (scope=module)
- Obtiene token JWT del médico
- Se ejecuta UNA VEZ para todas las pruebas
- Retorna: `{"token": "...", "medico_id": 3}`

### `auth_token_admin` (scope=module)
- Token de administrador para operaciones auxiliares
- Usado para crear pacientes y citas de prueba

### `paciente_prueba` (scope=module)
- Crea un paciente válido antes de las pruebas
- Reutilizado en todos los casos
- Cédula única por timestamp

### `cita_prueba` (scope=module)
- Crea una cita asociada al paciente de prueba
- Opcional (algunos tests no la requieren)

---

## ✅ Validaciones Implementadas

### Validaciones de Datos
- ✔️ Paciente debe existir en BD
- ✔️ Médico debe existir en BD
- ✔️ Cédula debe ser válida (algoritmo ecuatoriano)
- ✔️ Diagnóstico no puede estar vacío (dependiendo de implementación)
- ✔️ Longitud de campos de texto

### Validaciones de Relaciones
- ✔️ Cita debe pertenecer al paciente indicado
- ✔️ Médico debe estar activo
- ✔️ Paciente debe estar activo

### Validaciones de Negocio
- ✔️ Signos vitales deben ser valores numéricos válidos
- ✔️ Códigos CIE-10 deben seguir formato correcto
- ✔️ Fecha de consulta no puede ser futura (si aplica)

---

## 📊 Resultados Esperados

### Escenario Ideal (6/6 pasadas)
```
✅ CASO 1 PASADO: Registro completo exitoso
✅ CASO 2 PASADO: Registro mínimo exitoso
✅ CASO 3 PASADO: Paciente inexistente rechazado
✅ CASO 4 PASADO: Diagnóstico vacío validado
✅ CASO 5 PASADO: Motivo largo procesado
✅ CASO 6 PASADO: Cita no asociada rechazada

======================== 6 passed in 3.45s ========================
```

### Con Fallos
- Revisar logs detallados en la salida con `-s`
- Verificar que el backend esté funcionando correctamente
- Comprobar que las validaciones estén implementadas

---

## 🐛 Problemas Comunes

### 1. "Connection refused"
**Causa**: Backend no está corriendo  
**Solución**: `uvicorn app.main:app --reload`

### 2. "Autenticación fallida"
**Causa**: Credenciales incorrectas o usuario no existe  
**Solución**: Verificar en BD o crear usuario médico

### 3. "Paciente de prueba no se pudo crear"
**Causa**: Cédula duplicada o permisos insuficientes  
**Solución**: Usar timestamp único, verificar permisos de admin

### 4. "Cita no se pudo crear"
**Causa**: Configuración de horarios o médico no disponible  
**Solución**: Verificar configuración de citas en el backend

---

## 📈 Métricas de Calidad

- **Cobertura**: 6 casos críticos de registro de consultas
- **Tiempo promedio**: ~3-4 segundos (incluye creación de fixtures)
- **Independencia**: Cada test es independiente (fixtures aislados)
- **Reusabilidad**: Fixtures modulares reutilizables

---

## 🔗 Archivos Relacionados

### Backend
- `app/models/consulta.py` - Modelo de datos
- `app/schemas/consulta_schema.py` - Validación Pydantic
- `app/routes/consulta_routes.py` - Endpoints HTTP
- `app/services/consulta_service.py` - Lógica de negocio

### Pruebas
- `conftest.py` - Configuración global de pytest
- `requirements.txt` - Dependencias (pytest, requests)
- `.env` - Variables de entorno para tests

---

## 👥 Mantenimiento

### Actualizar Credenciales
Si cambian las credenciales del médico, actualizar en `test_consulta_http.py`:

```python
MEDICO_CREDENTIALS = {
    "email": "nuevo.medico@hospital.com",
    "password": "nueva_password"
}
```

### Agregar Nuevos Casos
1. Crear nueva clase `TestCasoXXX`
2. Implementar método `test_xxx_http`
3. Usar fixtures existentes
4. Documentar en este README

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar `GUIA_EJECUCION_CONSULTA.md` (guía detallada)
2. Verificar logs del backend (errores 500)
3. Ejecutar tests individuales con `-v -s` para debugging

---

**Última actualización**: 11/11/2025  
**Autor**: Grupo 04 - Sistema de Gestión Médica  
**Versión**: 1.0
