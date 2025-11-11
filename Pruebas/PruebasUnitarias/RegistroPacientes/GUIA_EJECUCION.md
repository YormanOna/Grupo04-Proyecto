# 🚀 Guía Rápida - Ejecución de Pruebas Unitarias

## 📦 Instalación Inicial (Solo una vez)

```bash
# 1. Navegar a la carpeta de pruebas
cd Pruebas/PruebasUnitarias

# 2. Activar el entorno virtual (si existe)
source ../venv/bin/activate

# 3. IMPORTANTE: Desinstalar pydantic 2.x si está instalado
pip uninstall pydantic -y

# 4. Instalar todas las dependencias (incluye Backend)
pip install -r requirements.txt
```

**Notas importantes**:
- ⚠️ Es **crítico** usar `pydantic==1.10.11` (NO 2.x) para compatibilidad con el Backend
- Es normal ver el warning sobre `locust` y `pytest` (ya solucionado)
- El archivo `requirements.txt` ahora incluye todas las dependencias del Backend necesarias

---

## ▶️ Ejecutar Pruebas

### 🔥 **IMPORTANTE: Dos tipos de pruebas disponibles**

#### **Opción A: Pruebas de Integración HTTP** (⭐ RECOMENDADO)
Prueban las **rutas HTTP reales** del backend en ejecución.

**Requisitos previos**:
1. Backend corriendo: `uvicorn app.main:app --reload`
2. MySQL activo
3. Usuario admin@hospital.com registrado

```bash
# Ejecutar TODAS las pruebas HTTP (6 casos)
pytest RegistroPacientes/test_integracion_http.py -v -s

# Ver códigos HTTP, mensajes de error, tiempos de respuesta
```

#### **Opción B: Pruebas Unitarias (Base de Datos)**
Prueban solo la lógica de servicios (sin HTTP).

```bash
# Ejecutar pruebas unitarias (no requiere backend corriendo)
pytest RegistroPacientes/test_casos_especificos.py -v -s
```

---

### ✅ TODOS LOS CASOS HTTP (6 pruebas)

```bash
pytest RegistroPacientes/test_integracion_http.py -v -s
```

---

### 📋 CASO POR CASO (Pruebas HTTP)

#### **CASO 1: Registro Completo Exitoso**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso1RegistroCompletoHTTP::test_registro_completo_http -v -s
```

**Datos**: Juan Pérez García, cédula 1713175071, todos los campos  
**Espera**: ✅ 200 OK, paciente creado, tiempo < 2s

**Salida esperada**:
```
📊 Status Code: 200
⏱️  Tiempo de respuesta: 0.234 segundos
🆔 ID asignado: 45
📋 Historia clínica: HCL-20251111-0012
```

---

#### **CASO 2: Registro Solo Obligatorios**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso2RegistroObligatoriosHTTP::test_registro_solo_obligatorios_http -v -s
```

**Datos**: Ana Torres, cédula 923456783, solo nombre/apellido/cédula  
**Espera**: ✅ 200 OK, campos opcionales en null

---

#### **CASO 3: Rechazo Cédula Duplicada**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso3RechazoCedulaDuplicadaHTTP::test_rechazo_cedula_duplicada_http -v -s
```

**Datos**: Carlos Ruiz (cédula 1122334451), luego Pedro Gómez (misma cédula)  
**Espera**: ❌ 400 Bad Request, mensaje "Ya existe un paciente con esta cédula"

---

#### **CASO 4: Rechazo Email Duplicado**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso4RechazoEmailDuplicadoHTTP::test_rechazo_email_duplicado_http -v -s
```

**Datos**: Laura Mendoza (test@hospital.com), luego Miguel Castro (mismo email)  
**Espera**: ❌ 400 Bad Request, mensaje sobre email duplicado

---

#### **CASO 5: Rechazo Campo Obligatorio Faltante**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso5RechazoCampoObligatorioHTTP::test_rechazo_cedula_faltante_http -v -s
```

**Datos**: Roberto Díaz SIN cédula  
**Espera**: ❌ 422 Unprocessable Entity, errores de validación Pydantic

---

#### **CASO 6: Rechazo Email Inválido**
```bash
pytest RegistroPacientes/test_integracion_http.py::TestCaso6RechazoEmailInvalidoHTTP::test_rechazo_email_sin_arroba_http -v -s
```

**Datos**: Sofía Jiménez con email "correo_invalido_sin_arroba.com" (sin @)  
**Espera**: ❌ 422 Unprocessable Entity, validación rechaza formato

---

## 🎯 Opciones Útiles de pytest

| Comando | Descripción |
|---------|-------------|
| `-v` | Salida verbosa (detallada) |
| `-s` | Mostrar prints en consola |
| `-x` | Detener al primer fallo |
| `--lf` | Ejecutar solo las que fallaron la última vez |
| `--tb=short` | Traceback corto en fallos |
| `-k "registro"` | Ejecutar solo pruebas con "registro" en el nombre |

---

## 📊 Generar Reporte HTML

```bash
pytest RegistroPacientes/test_casos_especificos.py --html=reporte.html --self-contained-html
```

Luego abre `reporte.html` en tu navegador.

---

## 🐛 Solución de Problemas

### Error: "No module named 'pytest'"
```bash
pip install -r requirements.txt
```

### Error: "No module named 'app'"
Verifica que estés en `/Pruebas/PruebasUnitarias/` y que la ruta al Backend sea correcta.

### Error: "ImportError: cannot import name 'PacienteCreate'"
Verifica que el backend tenga instalado fastapi y pydantic:
```bash
cd ../../Backend
pip install -r requirements.txt
```

### Ver detalles completos de un fallo
```bash
pytest RegistroPacientes/test_casos_especificos.py::TestCaso1... -v -s --tb=long
```

---

## ✅ Resultado Esperado

```
test_casos_especificos.py::TestCaso1RegistroCompletoExitoso::test_registro_completo_exitoso PASSED
test_casos_especificos.py::TestCaso2RegistroSoloDatosObligatorios::test_registro_solo_obligatorios PASSED
test_casos_especificos.py::TestCaso3RechazoCedulaDuplicada::test_rechazo_cedula_duplicada PASSED
test_casos_especificos.py::TestCaso4RechazoEmailDuplicado::test_rechazo_email_duplicado PASSED
test_casos_especificos.py::TestCaso5RechazoCampoObligatorioFaltante::test_rechazo_cedula_faltante PASSED
test_casos_especificos.py::TestCaso6RechazoEmailInvalido::test_rechazo_email_sin_arroba PASSED

======================== 6 passed in 1.23s ========================
```

---

## 📚 Archivos Creados

```
Pruebas/PruebasUnitarias/
├── conftest.py                              # Configuración global + fixtures
├── requirements.txt                         # Dependencias
├── GUIA_EJECUCION.md                       # Este archivo
└── RegistroPacientes/
    ├── test_casos_especificos.py           # ⭐ 6 casos de prueba principales
    └── test_registro_pacientes.py          # 20+ pruebas adicionales
```

---

## 🎓 Notas Importantes

1. **Base de Datos**: Las pruebas usan SQLite en memoria (no afectan tu BD real)
2. **Cédulas**: Todas las cédulas de prueba son válidas según el algoritmo ecuatoriano
3. **Aislamiento**: Cada prueba tiene su propia BD limpia (fixture `db_session`)
4. **No requiere autenticación**: Son pruebas unitarias, no de integración
5. **Prints informativos**: Usa `-s` para ver los mensajes de cada prueba

---

**Última actualización**: 11/11/2025  
**Autor**: Grupo 04 - Sistema de Gestión Médica
