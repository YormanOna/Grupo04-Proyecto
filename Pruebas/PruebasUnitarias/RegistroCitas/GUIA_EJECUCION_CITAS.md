# 🚀 GUÍA DE EJECUCIÓN - Pruebas de Registro de Citas Médicas

## ⚡ Inicio Rápido

### 1. Preparar el Entorno

```bash
# Navegar al directorio de pruebas
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Pruebas/PruebasUnitarias

# Activar entorno virtual
source venv/bin/activate

# Verificar instalación
pytest --version  # Debe mostrar: pytest 8.4.2
```

### 2. Iniciar el Backend

**Terminal 1:**
```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Backend
uvicorn app.main:app --reload
```

Esperar a ver:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 3. Ejecutar las Pruebas

**Terminal 2:**
```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Pruebas/PruebasUnitarias
pytest RegistroCitas/test_registro_citas_http.py -v -s
```

---

## 📋 Opciones de Ejecución

### Ejecutar TODAS las pruebas

```bash
pytest RegistroCitas/test_registro_citas_http.py -v
```

**Salida esperada:**
```
RegistroCitas/test_registro_citas_http.py::TestCaso1...::test... PASSED [ 20%]
RegistroCitas/test_registro_citas_http.py::TestCaso2...::test... PASSED [ 40%]
RegistroCitas/test_registro_citas_http.py::TestCaso3...::test... PASSED [ 60%]
RegistroCitas/test_registro_citas_http.py::TestCaso4...::test... PASSED [ 80%]
RegistroCitas/test_registro_citas_http.py::TestCaso5...::test... PASSED [100%]

============= 5 passed in 2.45s =============
```

---

### Ejecutar caso por caso

#### CASO 1: Creación Exitosa de Cita Futura ✅

```bash
pytest RegistroCitas/test_registro_citas_http.py::TestCaso1CreacionExitosaCitaFutura::test_creacion_exitosa_cita_futura_http -v -s
```

**Lo que hace:** Crea una cita para el 01/12/2025 a las 09:00

---

#### CASO 2: Rechazo por Fecha Pasada ❌

```bash
pytest RegistroCitas/test_registro_citas_http.py::TestCaso2RechazoFechaPasada::test_rechazo_fecha_pasada_http -v -s
```

**Lo que hace:** Intenta crear una cita para 01/10/2024 (fecha pasada)

---

#### CASO 3: Paciente Inexistente ❌

```bash
pytest RegistroCitas/test_registro_citas_http.py::TestCaso3RechazoPacienteInexistente::test_rechazo_paciente_inexistente_http -v -s
```

**Lo que hace:** Intenta crear cita con paciente_id: 98765 (no existe)

---

#### CASO 4: Solapamiento de Cita ❌

```bash
pytest RegistroCitas/test_registro_citas_http.py::TestCaso4RechazoSolapamientoCita::test_rechazo_solapamiento_cita_http -v -s
```

**Lo que hace:** Crea dos citas para el mismo médico en el mismo horario

---

#### CASO 5: Hora Inicio > Hora Fin ❌

```bash
pytest RegistroCitas/test_registro_citas_http.py::TestCaso5RechazoHoraInicioMayorFin::test_rechazo_hora_inicio_mayor_fin_http -v -s
```

**Lo que hace:** Intenta crear cita con hora_inicio="10:00" y hora_fin="09:30"

---

## 🔍 Opciones Avanzadas

### Ver salida detallada con prints

```bash
pytest RegistroCitas/ -v -s
```

---

### Generar reporte HTML

```bash
pytest RegistroCitas/ -v --html=report_citas.html --self-contained-html
```

---

### Ejecutar con coverage

```bash
pytest RegistroCitas/ -v --cov=app.routes.cita_routes --cov-report=html
```

---

## 📊 Interpretación de Resultados

### ✅ Prueba PASSED (Exitosa)

```
RegistroCitas/test_registro_citas_http.py::TestCaso1...::test... PASSED [20%]

================================================================================
✅ CASO 1 PASADO: Cita futura creada correctamente
================================================================================
```

---

### ❌ Prueba FAILED (Fallida)

```
RegistroCitas/test_registro_citas_http.py::TestCaso2...::test... FAILED [40%]

FAILED ... AssertionError: Se esperaba 400, pero se recibió 200
```

**Acción:** Verificar que las validaciones estén implementadas en `cita_schema.py`

---

## 🐛 Solución de Problemas Comunes

### ❌ Error: "Connection refused"

**Causa:** Backend no está corriendo  
**Solución:**
```bash
cd Backend
uvicorn app.main:app --reload
```

---

### ❌ Error: "401 Unauthorized"

**Causa:** Usuario médico no existe  
**Solución:** Verificar datos iniciales:
```bash
cd Backend
python -c "from app.core.init_data import init_default_users; from app.core.database import SessionLocal; db = SessionLocal(); init_default_users(db)"
```

---

### ❌ Error: "El bloque horario no está disponible" (sin crear cita previa)

**Causa:** Quedan citas de pruebas anteriores  
**Solución:**
```sql
DELETE FROM citas WHERE fecha = '2025-12-05' AND hora_inicio = '14:00';
```

---

## 📝 Checklist de Pre-Ejecución

Antes de ejecutar las pruebas, verificar:

- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Base de datos MySQL activa
- [ ] Usuario `medico@hospital.com` existe
- [ ] Usuario `admin@hospital.com` existe
- [ ] Entorno virtual activado
- [ ] Dependencias instaladas
- [ ] Directorio correcto (`PruebasUnitarias/`)

---

## 🎯 Criterios de Éxito

Las pruebas son exitosas cuando:

1. ✅ **CASO 1:** Status 200 OK - Cita futura se crea correctamente
2. ✅ **CASO 2:** Status 400/422 - Fecha pasada rechazada
3. ✅ **CASO 3:** Status 404 - Paciente inexistente rechazado
4. ✅ **CASO 4:** Status 400 - Solapamiento detectado y rechazado
5. ✅ **CASO 5:** Status 400/422 - Horario inválido rechazado

---

## 🔄 Flujo de Trabajo Recomendado

```
1. Iniciar Backend
   ↓
2. Activar venv
   ↓
3. Ejecutar todas las pruebas
   ↓
4. ¿Todas pasan?
   ├─ SÍ → ✅ Todo OK
   └─ NO → Ejecutar prueba fallida con -s
          ↓
          Revisar logs detallados
          ↓
          Corregir código backend
          ↓
          Volver a ejecutar
```

---

## 📞 Soporte

Si encuentras problemas:

1. Revisar logs del backend
2. Verificar datos en la base de datos
3. Ejecutar con `-v -s` para salida detallada
4. Consultar el README.md del módulo

---

## 📅 Última Actualización

**Fecha:** 12/11/2025  
**Versión:** 1.0  
**Autor:** Sistema de Gestión Médica - Grupo 04
