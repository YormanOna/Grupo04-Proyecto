# 🏥 Guía de Ejecución - Pruebas de Registro de Consulta Médica

## 📋 Descripción

Estas pruebas validan la funcionalidad de **Registro de Consultas Médicas**, una de las operaciones más críticas del sistema de gestión hospitalaria.

### ✅ Casos de Prueba Cubiertos

1. **CASO 1**: Registro consulta completa con todos los campos (motivo, diagnóstico, tratamiento, signos vitales, etc.)
2. **CASO 2**: Registro consulta con campos mínimos obligatorios (paciente, médico, motivo, diagnóstico)
3. **CASO 3**: Rechazo por paciente inexistente (ID 999999)
4. **CASO 4**: Rechazo por diagnóstico vacío (validación de campo obligatorio)
5. **CASO 5**: Registro consulta con motivo muy largo (validación de límites)
6. **CASO 6**: Rechazo por cita no asociada al paciente (validación de integridad)

---

## 🔧 Requisitos Previos

### 1. Backend en ejecución
```bash
cd Backend
uvicorn app.main:app --reload
```

### 2. Base de datos activa
- MySQL corriendo en `localhost:3306`
- Base de datos `GestionMedicaDB` creada

### 3. Usuarios registrados
Usuarios por defecto (creados en `init_data.py`):
- **Médico**: `medico@hospital.com` / `medico123`
- **Admin**: `admin@hospital.com` / `admin123`

### 4. Entorno virtual activado
```bash
cd Pruebas
source venv/bin/activate
cd PruebasUnitarias
```

---

## ▶️ Ejecutar Pruebas

### 🎯 TODAS las pruebas (6 casos)
```bash
pytest RegistroConsulta/test_consulta_http.py -v -s
```

**Salida esperada**:
```
test_consulta_http.py::TestCaso1ConsultaCompletaHTTP::test_registro_consulta_completa_http PASSED
test_consulta_http.py::TestCaso2ConsultaMinimaHTTP::test_registro_consulta_minima_http PASSED
test_consulta_http.py::TestCaso3RechazoPacienteInexistenteHTTP::test_rechazo_paciente_inexistente_http PASSED
test_consulta_http.py::TestCaso4RechazoDiagnosticoVacioHTTP::test_rechazo_diagnostico_vacio_http PASSED
test_consulta_http.py::TestCaso5ConsultaMotivoLargoHTTP::test_registro_motivo_largo_http PASSED
test_consulta_http.py::TestCaso6RechazoCitaNoAsociadaHTTP::test_rechazo_cita_no_asociada_http PASSED

======================== 6 passed in 3.45s ========================
```

---

### 📋 CASO POR CASO

#### **CASO 1: Registro Completo**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso1ConsultaCompletaHTTP::test_registro_consulta_completa_http -v -s
```

**Datos**: 
- Paciente: María González (creado automáticamente)
- Médico: Doctor Principal (medico@hospital.com)
- Diagnóstico: Gastritis aguda (K29.1)
- Signos vitales: PA 120/80, FC 72, Temp 36.5°C

**Espera**: ✅ **200 OK**, consulta creada con ID asignado

---

#### **CASO 2: Registro Mínimo**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso2ConsultaMinimaHTTP::test_registro_consulta_minima_http -v -s
```

**Datos**: 
- Solo campos obligatorios: paciente_id, medico_id, motivo, diagnóstico
- Sin tratamiento, sin exámenes, sin signos vitales

**Espera**: ✅ **200 OK**, campos opcionales en null

---

#### **CASO 3: Paciente Inexistente**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso3RechazoPacienteInexistenteHTTP::test_rechazo_paciente_inexistente_http -v -s
```

**Datos**: 
- Paciente ID: 999999 ❌ (no existe)

**Espera**: ❌ **404 Not Found** o **400 Bad Request**, mensaje "Paciente no encontrado"

---

#### **CASO 4: Diagnóstico Vacío**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso4RechazoDiagnosticoVacioHTTP::test_rechazo_diagnostico_vacio_http -v -s
```

**Datos**: 
- Diagnóstico: `""` (cadena vacía)

**Espera**: ❌ **422 Unprocessable Entity** o **400 Bad Request** (o 200 si es opcional)

---

#### **CASO 5: Motivo Largo**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso5ConsultaMotivoLargoHTTP::test_registro_motivo_largo_http -v -s
```

**Datos**: 
- Motivo: 800+ caracteres (texto extenso)

**Espera**: ✅ **200 OK** (si no hay límite) o ❌ **400 Bad Request** (si hay validación)

---

#### **CASO 6: Cita No Asociada**
```bash
pytest RegistroConsulta/test_consulta_http.py::TestCaso6RechazoCitaNoAsociadaHTTP::test_rechazo_cita_no_asociada_http -v -s
```

**Datos**: 
- Paciente 1 intenta usar cita de Paciente 2

**Espera**: ❌ **400 Bad Request** o **403 Forbidden** (o 200 si no hay validación)

---

## 📊 Opciones Útiles

| Comando | Descripción |
|---------|-------------|
| `-v` | Salida verbosa (detallada) |
| `-s` | Mostrar prints en consola |
| `-x` | Detener al primer fallo |
| `--tb=short` | Traceback corto |
| `--html=reporte.html --self-contained-html` | Generar reporte HTML |

---

## 🐛 Solución de Problemas

### ❌ Error: "No module named 'pytest'"
```bash
pip install -r requirements.txt
```

### ❌ Error: "Connection refused" al conectar con backend
Verifica que el backend esté corriendo:
```bash
# En otra terminal
cd Backend
uvicorn app.main:app --reload
```

### ❌ Error: "No se pudo autenticar"
Verifica que exista el médico en la BD:
```sql
SELECT * FROM empleados WHERE email = 'medico@hospital.com';
```

Este usuario se crea automáticamente al iniciar el backend (`init_data.py`).

### ❌ Error: "Paciente de prueba no se pudo crear"
Verifica que el admin esté autenticado y que las cédulas sean únicas.

---

## 📈 Métricas de Éxito

- ✅ **6/6 casos pasados**: Sistema funcionando correctamente
- ⚠️ **5/6 casos pasados**: Revisar el caso fallido
- ❌ **<5 casos pasados**: Problemas críticos en la funcionalidad

---

## 🎓 Notas Importantes

1. **Autenticación**: Se usa token de **médico**, no de admin (RF específico)
2. **Paciente de prueba**: Se crea automáticamente al inicio (fixture `paciente_prueba`)
3. **Cita de prueba**: Se crea automáticamente si es posible (fixture `cita_prueba`)
4. **Base de datos real**: Las pruebas afectan la BD MySQL, no SQLite en memoria
5. **Cédulas válidas**: Todas las cédulas usan el algoritmo ecuatoriano (módulo 10)
6. **Códigos CIE-10**: Se usan códigos válidos del catálogo internacional

---

## 📚 Estructura de Archivos

```
PruebasUnitarias/
└── RegistroConsulta/
    ├── __init__.py
    ├── test_consulta_http.py       # ⭐ 6 casos de prueba HTTP
    └── GUIA_EJECUCION_CONSULTA.md  # Esta guía
```

---

## 🔗 Referencias

- **Modelo**: `Backend/app/models/consulta.py`
- **Schema**: `Backend/app/schemas/consulta_schema.py`
- **Routes**: `Backend/app/routes/consulta_routes.py`
- **Service**: `Backend/app/services/consulta_service.py`
- **Endpoint**: `POST http://localhost:8000/consultas/`

---

**Última actualización**: 11/11/2025  
**Autor**: Grupo 04 - Sistema de Gestión Médica
