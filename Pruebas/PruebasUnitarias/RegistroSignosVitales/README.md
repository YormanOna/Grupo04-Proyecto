# 🩺 README - Pruebas de Registro de Signos Vitales

## 📋 Información General

**Módulo:** Registro de Signos Vitales  
**Endpoint:** `POST /consultas/` (con campo `signos_vitales`)  
**Tipo de Pruebas:** Integración HTTP  
**Autenticación:** Bearer Token (Médico/Enfermera)  
**Fecha de Creación:** 12/11/2025

---

## 🎯 Objetivo

Validar el correcto funcionamiento del registro de signos vitales del paciente como parte de una consulta médica, asegurando que:

1. ✅ Se registren correctamente valores válidos dentro de rangos normales
2. ✅ Se rechacen valores negativos o fuera de rangos lógicos
3. ✅ Se acepten valores extremos pero válidos (alertas médicas)
4. ✅ Se valide el formato correcto de presión arterial
5. ✅ Se valide la existencia del paciente

---

## 📊 Casos de Prueba Implementados

| # | Caso de Prueba | Endpoint | Status Esperado | Descripción |
|---|----------------|----------|-----------------|-------------|
| 1 | Signos Vitales Válidos | `POST /consultas/` | 200 OK | PA: 120/80, FC: 80, Temp: 36.5°C, SpO2: 98%, Peso: 70kg, Talla: 1.70m |
| 2 | Frecuencia Cardíaca Negativa | `POST /consultas/` | 422/400 | FC: -10 (inválido), otros valores válidos |
| 3 | Valores Extremos (Alerta) | `POST /consultas/` | 200 OK | Temperatura: 41.7°C (fiebre muy alta), FC: 110, SpO2: 92% |
| 4 | Formato Inválido PA | `POST /consultas/` | 422/400 | PA: "120-80" (debe ser "120/80"), otros válidos |
| 5 | Paciente Inexistente | `POST /consultas/` | 404/400 | paciente_id: 99999, signos vitales válidos |

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

Las dependencias necesarias son:
- `pytest==8.4.2`
- `requests==2.32.4`

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
pytest RegistroSignosVitales/test_signos_vitales_http.py -v
```

### Ejecutar un caso específico

```bash
# CASO 1: Signos vitales válidos
pytest RegistroSignosVitales/test_signos_vitales_http.py::TestCaso1RegistroSignosVitalesValidos -v

# CASO 2: Frecuencia cardíaca negativa
pytest RegistroSignosVitales/test_signos_vitales_http.py::TestCaso2RechazoFrecuenciaCardiaNegativa -v

# CASO 3: Valores extremos
pytest RegistroSignosVitales/test_signos_vitales_http.py::TestCaso3RegistroValoresExtremosAlerta -v

# CASO 4: Formato inválido presión arterial
pytest RegistroSignosVitales/test_signos_vitales_http.py::TestCaso4RechazoFormatoInvalidoPresionArterial -v

# CASO 5: Paciente inexistente
pytest RegistroSignosVitales/test_signos_vitales_http.py::TestCaso5RechazoPacienteInexistente -v
```

### Ejecutar con salida detallada

```bash
pytest RegistroSignosVitales/test_signos_vitales_http.py -v -s
```

La opción `-s` muestra todos los `print()` con información detallada de cada paso.

---

## 📝 Estructura del Payload

### Request Body Completo

```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "motivo_consulta": "Control de rutina",
  "diagnostico": "Paciente sano",
  "signos_vitales": {
    "presion_arterial": "120/80",
    "frecuencia_cardiaca": 80,
    "frecuencia_respiratoria": 16,
    "temperatura": 36.5,
    "saturacion_oxigeno": 98,
    "peso": 70.0,
    "talla": 1.70,
    "observaciones": "Paciente estable"
  }
}
```

### Campos de Signos Vitales

| Campo | Tipo | Rango Normal | Ejemplo | Obligatorio |
|-------|------|--------------|---------|-------------|
| `presion_arterial` | string | "90/60" - "130/85" | "120/80" | No |
| `frecuencia_cardiaca` | int | 60 - 100 lpm | 80 | No |
| `frecuencia_respiratoria` | int | 12 - 20 rpm | 16 | No |
| `temperatura` | float | 36.0 - 37.5 °C | 36.5 | No |
| `saturacion_oxigeno` | float | 95 - 100 % | 98 | No |
| `peso` | float | 1 - 300 kg | 70.0 | No |
| `talla` | float | 0.3 - 2.5 m | 1.70 | No |
| `observaciones` | string | - | "Estable" | No |

---

## 🔍 Resultados Esperados

### ✅ Caso 1: Signos Vitales Válidos

**Request:**
```json
{
  "signos_vitales": {
    "presion_arterial": "120/80",
    "frecuencia_cardiaca": 80,
    "temperatura": 36.5,
    "saturacion_oxigeno": 98,
    "peso": 70.0,
    "talla": 1.70
  }
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_consulta": "2025-11-12T10:00:00",
  "signos_vitales": {
    "presion_arterial": "120/80",
    "frecuencia_cardiaca": 80,
    "temperatura": 36.5,
    "saturacion_oxigeno": 98,
    "peso": 70.0,
    "talla": 1.70
  }
}
```

---

### ❌ Caso 2: Frecuencia Cardíaca Negativa

**Request:**
```json
{
  "signos_vitales": {
    "frecuencia_cardiaca": -10
  }
}
```

**Response (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["body", "signos_vitales", "frecuencia_cardiaca"],
      "msg": "ensure this value is greater than or equal to 0",
      "type": "value_error.number.not_ge"
    }
  ]
}
```

---

### ⚠️ Caso 3: Valores Extremos (Alerta Médica)

**Request:**
```json
{
  "signos_vitales": {
    "temperatura": 41.7,
    "frecuencia_cardiaca": 110,
    "saturacion_oxigeno": 92
  }
}
```

**Response (200 OK):**
```json
{
  "id": 2,
  "signos_vitales": {
    "temperatura": 41.7,
    "frecuencia_cardiaca": 110,
    "saturacion_oxigeno": 92
  },
  "observaciones": "Valores extremos - requiere atención"
}
```

**Nota:** Los valores son válidos pero extremos. El sistema debería generar alertas automáticas.

---

### ❌ Caso 4: Formato Inválido de Presión Arterial

**Request:**
```json
{
  "signos_vitales": {
    "presion_arterial": "120-80"
  }
}
```

**Response (400 Bad Request):**
```json
{
  "detail": "Formato inválido de presión arterial. Use formato XXX/XX (ej: 120/80)"
}
```

---

### ❌ Caso 5: Paciente Inexistente

**Request:**
```json
{
  "paciente_id": 99999
}
```

**Response (404 Not Found):**
```json
{
  "detail": "Paciente no encontrado"
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
🩺 CASO 1: Registro de Signos Vitales Válidos (HTTP)
================================================================================
📤 Datos enviados:
   - Paciente ID: 5
   - Médico ID: 1
   - Presión arterial: 120/80
   - Frecuencia cardíaca: 80 lpm
   - Temperatura: 36.5 °C
   - Saturación O2: 98 %
   - Peso: 70.0 kg
   - Talla: 1.70 m

📥 Respuesta del servidor:
   ⏱️  Tiempo de respuesta: 0.234 segundos
   📊 Status Code: 200
   ✅ Signos vitales registrados exitosamente
   🆔 Consulta ID: 15

================================================================================
✅ CASO 1 PASADO: Signos vitales válidos registrados correctamente
================================================================================
```

---

## 🧪 Validaciones Implementadas

### 1. **Validaciones de Datos**
- ✅ Paciente existe en la base de datos
- ✅ Médico existe en la base de datos
- ✅ Frecuencia cardíaca no negativa
- ✅ Temperatura en rango razonable
- ✅ Formato de presión arterial correcto

### 2. **Validaciones de Respuesta**
- ✅ Status code correcto (200, 400, 404, 422)
- ✅ Consulta creada con ID asignado
- ✅ Signos vitales guardados correctamente
- ✅ Tiempo de respuesta < 2 segundos
- ✅ Mensajes de error descriptivos

### 3. **Alertas Médicas** (valores extremos aceptados)
- ⚠️ Temperatura > 38°C (fiebre)
- ⚠️ Temperatura > 40°C (fiebre muy alta)
- ⚠️ Frecuencia cardíaca > 100 lpm (taquicardia)
- ⚠️ Saturación O2 < 95% (hipoxemia)

---

## 🐛 Troubleshooting

### Error: "Connection refused"
**Problema:** El backend no está corriendo  
**Solución:** Iniciar el servidor backend
```bash
cd Backend
uvicorn app.main:app --reload
```

### Error: "401 Unauthorized"
**Problema:** Token de autenticación inválido  
**Solución:** Verificar que el usuario `medico@hospital.com` exista en la base de datos

### Error: "No se pudo crear paciente de prueba"
**Problema:** Todas las cédulas de prueba ya están en uso  
**Solución:** El fixture intentará buscar los pacientes existentes. Si falla, limpiar la base de datos de pruebas.

### Error: "Módulo pytest no encontrado"
**Problema:** Dependencias no instaladas  
**Solución:**
```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📚 Referencias

- **Modelo Backend:** `Backend/app/models/signos_vitales.py`
- **Schema Backend:** `Backend/app/schemas/signos_vitales_schema.py`
- **Endpoint:** `Backend/app/routes/consulta_routes.py`
- **Frontend:** `Frontend/src/pages/Enfermeria/SignosVitales.jsx`
- **Validadores:** `Frontend/src/utils/signosVitalesValidator.js`

---

## 👥 Autores

- Sistema de Gestión Médica - Grupo 04
- Fecha: 12 de noviembre de 2025

---

## 📄 Licencia

Uso exclusivo para propósitos educativos y de pruebas.
