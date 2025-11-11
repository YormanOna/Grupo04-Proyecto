# 💊 Guía de Ejecución - Pruebas de Creación de Receta Médica

## 📋 Descripción

Estas pruebas validan la funcionalidad de **Creación de Recetas Médicas**, un proceso crítico que permite a los médicos prescribir medicamentos a los pacientes.

### ✅ Casos de Prueba Cubiertos

1. **CASO 1**: Creación exitosa con medicamento válido (Paracetamol 500mg x10)
2. **CASO 2**: Rechazo por medicamento inexistente (MedicamentoDesconocidoXYZ123)
3. **CASO 3**: Rechazo por cantidad negativa (-5 unidades)
4. **CASO 4**: Creación con indicaciones detalladas y extensas
5. **CASO 5**: Rechazo por datos obligatorios faltantes (medicamentos vacío)

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

### 🎯 TODAS las pruebas (5 casos)
```bash
pytest CreacionReceta/test_receta_http.py -v -s
```

**Salida esperada**:
```
test_receta_http.py::TestCaso1RecetaExitosaHTTP::test_creacion_receta_exitosa_http PASSED
test_receta_http.py::TestCaso2RechazoMedicamentoInexistenteHTTP::test_rechazo_medicamento_inexistente_http PASSED
test_receta_http.py::TestCaso3RechazoCantidadNegativaHTTP::test_rechazo_cantidad_negativa_http PASSED
test_receta_http.py::TestCaso4RecetaIndicacionesDetalladasHTTP::test_creacion_indicaciones_detalladas_http PASSED
test_receta_http.py::TestCaso5RechazoDatosObligatoriosFaltantesHTTP::test_rechazo_medicamentos_faltantes_http PASSED

======================== 5 passed in 2.85s ========================
```

---

### 📋 CASO POR CASO

#### **CASO 1: Creación Exitosa**
```bash
pytest CreacionReceta/test_receta_http.py::TestCaso1RecetaExitosaHTTP::test_creacion_receta_exitosa_http -v -s
```

**Datos**: 
```json
{
  "medicamentos": "[{\"nombre\": \"Paracetamol\", \"dosis\": \"500mg\", \"cantidad\": 10}]",
  "indicaciones": "Tomar cada 8 horas después de las comidas",
  "estado": "pendiente"
}
```

**Espera**: ✅ **200 OK**, receta creada con estado "pendiente"

---

#### **CASO 2: Medicamento Inexistente**
```bash
pytest CreacionReceta/test_receta_http.py::TestCaso2RechazoMedicamentoInexistenteHTTP::test_rechazo_medicamento_inexistente_http -v -s
```

**Datos**: 
- Medicamento: **"MedicamentoDesconocidoXYZ123"** ❌

**Espera**: ❌ **400/404** (si hay validación) o ✅ **200** (si no valida existencia)

---

#### **CASO 3: Cantidad Negativa**
```bash
pytest CreacionReceta/test_receta_http.py::TestCaso3RechazoCantidadNegativaHTTP::test_rechazo_cantidad_negativa_http -v -s
```

**Datos**: 
- Cantidad: **-5** ❌ (negativa)

**Espera**: ❌ **400/422** (si hay validación) o ✅ **200** (si acepta negativos)

---

#### **CASO 4: Indicaciones Detalladas**
```bash
pytest CreacionReceta/test_receta_http.py::TestCaso4RecetaIndicacionesDetalladasHTTP::test_creacion_indicaciones_detalladas_http -v -s
```

**Datos**: 
- Medicamento: Amoxicilina 250mg x12
- Indicaciones: 300+ caracteres con instrucciones detalladas

**Espera**: ✅ **200 OK**, indicaciones completas guardadas

---

#### **CASO 5: Datos Faltantes**
```bash
pytest CreacionReceta/test_receta_http.py::TestCaso5RechazoDatosObligatoriosFaltantesHTTP::test_rechazo_medicamentos_faltantes_http -v -s
```

**Datos**: 
- Medicamentos: **""** (cadena vacía) ❌

**Espera**: ❌ **422 Unprocessable Entity** (validación Pydantic)

---

## 📊 Opciones Útiles

| Comando | Descripción |
|---------|-------------|
| `-v` | Salida verbosa |
| `-s` | Mostrar prints |
| `-x` | Detener al primer fallo |
| `--tb=short` | Traceback corto |
| `--html=reporte.html --self-contained-html` | Generar reporte HTML |

---

## 🐛 Solución de Problemas

### ❌ Error: "Connection refused"
**Causa**: Backend no está corriendo  
**Solución**: `uvicorn app.main:app --reload`

### ❌ Error: "Autenticación fallida"
**Causa**: Médico no existe en BD  
**Solución**: Verificar credenciales o crear usuario médico

### ❌ Error: "Consulta de prueba no se pudo crear"
**Causa**: Paciente no existe o permisos insuficientes  
**Solución**: Verificar fixture `paciente_prueba` y permisos

### ❌ Error: "Medicamentos debe ser un string JSON"
**Causa**: Formato incorrecto de medicamentos  
**Solución**: Usar `json.dumps()` para serializar el array

---

## 📈 Métricas de Éxito

- ✅ **5/5 casos pasados**: Sistema funcionando correctamente
- ⚠️ **4/5 casos pasados**: Revisar el caso fallido
- ❌ **<4 casos pasados**: Problemas críticos

---

## 🎓 Notas Importantes

1. **Formato medicamentos**: Debe ser string JSON válido: `"[{...}]"`
2. **Consulta previa**: Requiere consulta creada (fixture automático)
3. **Estado por defecto**: "pendiente" (puede ser dispensada, parcial, cancelada)
4. **Autenticación**: Solo médicos y administradores pueden crear recetas
5. **Validaciones opcionales**: Algunos rechazos dependen de validaciones implementadas

---

## 📚 Estructura de Archivos

```
CreacionReceta/
├── __init__.py
├── test_receta_http.py              # ⭐ 5 casos de prueba HTTP
└── GUIA_EJECUCION_RECETA.md         # Esta guía
```

---

## 🔗 Referencias

- **Modelo**: `Backend/app/models/receta.py`
- **Schema**: `Backend/app/schemas/receta_schema.py`
- **Routes**: `Backend/app/routes/receta_routes.py`
- **Service**: `Backend/app/services/receta_service.py`
- **Endpoint**: `POST http://localhost:8000/recetas/`

---

**Última actualización**: 11/11/2025  
**Autor**: Grupo 04 - Sistema de Gestión Médica
