# 🧪 PRUEBAS UNITARIAS - PARTE 2
## Sistema de Gestión Médica - Backend API

**Base URL:** `http://localhost:8000`

---

## 📋 ÍNDICE - PARTE 2
6. [Consultas](#6-consultas)
7. [Historias Clínicas](#7-historias-clínicas)
8. [Diagnósticos CIE-10](#8-diagnósticos-cie-10)
9. [Medicamentos](#9-medicamentos)
10. [Recetas](#10-recetas)

---

## 6. CONSULTAS

**⚠️ Requisito previo:** 
- Token Bearer
- Tener paciente creado (ID: 1)
- Tener médico creado (ID: 1)

### 🔹 6.1. Crear Consulta
- **Endpoint:** `POST /consultas/`
- **Autenticación:** No requerida (público)
- **Descripción:** RF-003 - Registra una consulta médica completa

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_consulta": "2025-11-09T10:30:00",
  "motivo_consulta": "Control de presión arterial y revisión de tratamiento",
  "enfermedad_actual": "Paciente refiere cefalea ocasional y mareos matutinos",
  "examen_fisico": "TA: 140/90 mmHg, FC: 78 lpm, FR: 16 rpm, Peso: 78 kg, Talla: 1.75m",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "diagnostico_codigo": "I10",
  "tratamiento": "Enalapril 10mg cada 12 horas, Hidroclorotiazida 25mg cada 24 horas",
  "indicaciones": "Dieta hiposódica, ejercicio moderado 30 min diarios, control de peso",
  "observaciones": "Control en 30 días. Traer resultados de laboratorio",
  "signos_vitales": {
    "temperatura": 36.5,
    "presion_arterial": "140/90",
    "frecuencia_cardiaca": 78,
    "frecuencia_respiratoria": 16,
    "saturacion_oxigeno": 98,
    "peso": 78.0,
    "talla": 1.75,
    "imc": 25.5
  }
}
```

**Campos obligatorios:** `paciente_id`, `medico_id`, `fecha_consulta`, `motivo_consulta`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_consulta": "2025-11-09T10:30:00",
  "motivo_consulta": "Control de presión arterial y revisión de tratamiento",
  "enfermedad_actual": "Paciente refiere cefalea ocasional y mareos matutinos",
  "examen_fisico": "TA: 140/90 mmHg, FC: 78 lpm, FR: 16 rpm, Peso: 78 kg, Talla: 1.75m",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "diagnostico_codigo": "I10",
  "tratamiento": "Enalapril 10mg cada 12 horas, Hidroclorotiazida 25mg cada 24 horas",
  "indicaciones": "Dieta hiposódica, ejercicio moderado 30 min diarios, control de peso",
  "observaciones": "Control en 30 días. Traer resultados de laboratorio",
  "signos_vitales": {
    "id": 1,
    "temperatura": 36.5,
    "presion_arterial": "140/90",
    "frecuencia_cardiaca": 78,
    "frecuencia_respiratoria": 16,
    "saturacion_oxigeno": 98,
    "peso": 78.0,
    "talla": 1.75,
    "imc": 25.5
  },
  "paciente": {
    "nombre": "Carlos",
    "apellido": "Ramírez"
  },
  "medico_empleado": {
    "nombre": "Juan",
    "apellido": "Médico"
  }
}
```

---

### 🔹 6.2. Listar Consultas
- **Endpoint:** `GET /consultas/`
- **Autenticación:** No requerida
- **Descripción:** Lista todas las consultas con filtros opcionales

**Ejemplos de uso:**
```
GET /consultas/
GET /consultas/?paciente_id=1
GET /consultas/?medico_id=1
GET /consultas/?fecha_desde=2025-11-01
GET /consultas/?fecha_hasta=2025-11-30
GET /consultas/?paciente_id=1&fecha_desde=2025-11-01&fecha_hasta=2025-11-30
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "paciente_id": 1,
    "medico_id": 1,
    "fecha_consulta": "2025-11-09T10:30:00",
    "motivo_consulta": "Control de presión arterial",
    "diagnostico": "Hipertensión arterial esencial",
    "diagnostico_codigo": "I10",
    "paciente": {
      "nombre": "Carlos",
      "apellido": "Ramírez"
    }
  }
]
```

---

### 🔹 6.3. Obtener Consulta por ID
- **Endpoint:** `GET /consultas/{consulta_id}`
- **Autenticación:** No requerida
- **Descripción:** Obtiene una consulta específica con todos sus detalles

**Ejemplo:** `GET /consultas/1`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_consulta": "2025-11-09T10:30:00",
  "motivo_consulta": "Control de presión arterial y revisión de tratamiento",
  "enfermedad_actual": "Paciente refiere cefalea ocasional y mareos matutinos",
  "examen_fisico": "TA: 140/90 mmHg, FC: 78 lpm",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "diagnostico_codigo": "I10",
  "tratamiento": "Enalapril 10mg cada 12 horas",
  "indicaciones": "Dieta hiposódica",
  "observaciones": "Control en 30 días",
  "signos_vitales": {
    "temperatura": 36.5,
    "presion_arterial": "140/90",
    "frecuencia_cardiaca": 78
  }
}
```

---

### 🔹 6.4. Actualizar Consulta
- **Endpoint:** `PUT /consultas/{consulta_id}`
- **Autenticación:** No requerida
- **Descripción:** Actualiza datos de una consulta

**Ejemplo:** `PUT /consultas/1`

**Request Body (campos opcionales):**
```json
{
  "diagnostico": "Hipertensión arterial esencial (primaria) - Controlada",
  "tratamiento": "Enalapril 10mg cada 12 horas, Hidroclorotiazida 25mg cada 24 horas",
  "observaciones": "Paciente responde bien al tratamiento. Control en 30 días"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "diagnostico": "Hipertensión arterial esencial (primaria) - Controlada",
  "tratamiento": "Enalapril 10mg cada 12 horas, Hidroclorotiazida 25mg cada 24 horas",
  "observaciones": "Paciente responde bien al tratamiento. Control en 30 días"
}
```

---

### 🔹 6.5. Generar Comprobante de Consulta
- **Endpoint:** `POST /consultas/{consulta_id}/comprobante`
- **Autenticación:** No requerida
- **Descripción:** RF-003 - Genera comprobante PDF y opcionalmente envía por email

**Ejemplo:** `POST /consultas/1/comprobante`

**Sin email:**
```
POST /consultas/1/comprobante
```

**Con envío de email:**
```
POST /consultas/1/comprobante?enviar_email_paciente=true
```

**Respuesta Exitosa - Sin email (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=Comprobante_Consulta_1.pdf
[PDF del comprobante]
```

**Respuesta Exitosa - Con email (200):**
```json
{
  "mensaje": "Comprobante generado y enviado por email exitosamente",
  "email_enviado": true,
  "destinatario": "carlos.ramirez@gmail.com"
}
```

---

## 7. HISTORIAS CLÍNICAS

**⚠️ Requisito previo:** 
- Token Bearer
- Tener paciente creado
- Tener consultas registradas

### 🔹 7.1. Crear Historia Clínica
- **Endpoint:** `POST /historias/`
- **Autenticación:** No requerida
- **Descripción:** Crea una historia clínica para un paciente

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "paciente_id": 1,
  "numero_historia": "HC-2025-001",
  "antecedentes_personales": "Hipertensión arterial diagnosticada hace 5 años, Diabetes Mellitus tipo 2",
  "antecedentes_familiares": "Padre con enfermedad cardiovascular, Madre con diabetes",
  "alergias": "Penicilina, Polen",
  "medicamentos_actuales": "Enalapril 10mg c/12h, Metformina 850mg c/12h",
  "cirugias_previas": "Apendicectomía (2010)",
  "hospitalizaciones_previas": "Neumonía (2018)",
  "habitos": "No fuma, Alcohol ocasional (social)",
  "grupo_sanguineo": "O+",
  "factor_rh": "Positivo"
}
```

**Campos obligatorios:** `paciente_id`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "numero_historia": "HC-2025-001",
  "antecedentes_personales": "Hipertensión arterial diagnosticada hace 5 años, Diabetes Mellitus tipo 2",
  "antecedentes_familiares": "Padre con enfermedad cardiovascular, Madre con diabetes",
  "alergias": "Penicilina, Polen",
  "medicamentos_actuales": "Enalapril 10mg c/12h, Metformina 850mg c/12h",
  "cirugias_previas": "Apendicectomía (2010)",
  "hospitalizaciones_previas": "Neumonía (2018)",
  "habitos": "No fuma, Alcohol ocasional (social)",
  "grupo_sanguineo": "O+",
  "factor_rh": "Positivo",
  "fecha_creacion": "2025-11-09T15:00:00",
  "paciente": {
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "cedula": "1750123456"
  }
}
```

---

### 🔹 7.2. Listar Historias Clínicas
- **Endpoint:** `GET /historias/`
- **Autenticación:** No requerida
- **Descripción:** Lista todas las historias clínicas

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "paciente_id": 1,
    "numero_historia": "HC-2025-001",
    "grupo_sanguineo": "O+",
    "alergias": "Penicilina, Polen",
    "paciente": {
      "nombre": "Carlos",
      "apellido": "Ramírez",
      "cedula": "1750123456"
    }
  }
]
```

---

### 🔹 7.3. Obtener Historia por ID
- **Endpoint:** `GET /historias/{historia_id}`
- **Autenticación:** No requerida
- **Descripción:** Obtiene una historia clínica específica

**Ejemplo:** `GET /historias/1`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "numero_historia": "HC-2025-001",
  "antecedentes_personales": "Hipertensión arterial diagnosticada hace 5 años",
  "antecedentes_familiares": "Padre con enfermedad cardiovascular",
  "alergias": "Penicilina, Polen",
  "medicamentos_actuales": "Enalapril 10mg c/12h",
  "grupo_sanguineo": "O+",
  "factor_rh": "Positivo"
}
```

---

### 🔹 7.4. Buscar Expediente Completo
- **Endpoint:** `GET /historias/expediente/buscar?query={termino}`
- **Autenticación:** Bearer Token
- **Descripción:** RF-002 - Búsqueda por número de HC o cédula con control de acceso por rol

**Ejemplos:**
```
GET /historias/expediente/buscar?query=HC-2025-001
GET /historias/expediente/buscar?query=1750123456
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta - Admin General / Médico (Acceso Completo):**
```json
{
  "paciente": {
    "id": 1,
    "cedula": "1750123456",
    "nombre": "Carlos",
    "apellido": "Ramírez",
    "fecha_nacimiento": "1985-05-15",
    "sexo": "M",
    "edad": 40,
    "telefono": "0987654321",
    "email": "carlos.ramirez@gmail.com",
    "tipo_seguro": "IESS"
  },
  "historia": {
    "id": 1,
    "numero_historia": "HC-2025-001",
    "antecedentes_personales": "Hipertensión arterial diagnosticada hace 5 años",
    "antecedentes_familiares": "Padre con enfermedad cardiovascular",
    "alergias": "Penicilina, Polen",
    "medicamentos_actuales": "Enalapril 10mg c/12h",
    "grupo_sanguineo": "O+",
    "factor_rh": "Positivo"
  },
  "consultas": [
    {
      "id": 1,
      "fecha_consulta": "2025-11-09T10:30:00",
      "motivo_consulta": "Control de presión arterial",
      "enfermedad_actual": "Paciente refiere cefalea ocasional",
      "examen_fisico": "TA: 140/90 mmHg",
      "diagnostico": "Hipertensión arterial esencial",
      "diagnostico_codigo": "I10",
      "tratamiento": "Enalapril 10mg cada 12 horas",
      "indicaciones": "Dieta hiposódica",
      "observaciones": "Control en 30 días",
      "signos_vitales": {
        "temperatura": 36.5,
        "presion_arterial": "140/90",
        "frecuencia_cardiaca": 78
      },
      "medico": {
        "nombre": "Juan",
        "apellido": "Médico"
      }
    }
  ],
  "recetas": [
    {
      "id": 1,
      "fecha_emision": "2025-11-09T10:45:00",
      "estado": "pendiente",
      "medicamentos": [
        {
          "medicamento": "Enalapril 10mg",
          "dosis": "1 tableta",
          "frecuencia": "Cada 12 horas",
          "duracion": "30 días"
        }
      ]
    }
  ],
  "total_consultas": 1,
  "total_recetas": 1
}
```

**Respuesta - Administrador (Acceso Limitado):**
```json
{
  "paciente": { ... },
  "historia": { ... },
  "consultas": [],
  "recetas": [],
  "total_consultas": 0,
  "total_recetas": 0,
  "mensaje": "Acceso limitado: Personal administrativo"
}
```

**Respuesta - Enfermera (Acceso Parcial):**
```json
{
  "paciente": { ... },
  "historia": {
    "alergias": "Penicilina, Polen",
    "grupo_sanguineo": "O+",
    "antecedentes_personales": "...",
    "antecedentes_familiares": "..."
  },
  "consultas": [
    {
      "id": 1,
      "fecha_consulta": "2025-11-09T10:30:00",
      "signos_vitales": { ... },
      "medico": { ... }
    }
  ],
  "recetas": [],
  "total_consultas": 1,
  "total_recetas": 0,
  "mensaje": "Acceso limitado: Personal de enfermería"
}
```

**Respuesta - Farmacéutico (Acceso Específico):**
```json
{
  "paciente": { ... },
  "historia": {
    "alergias": "Penicilina, Polen"
  },
  "consultas": [
    {
      "id": 1,
      "fecha_consulta": "2025-11-09T10:30:00",
      "diagnostico": "Hipertensión arterial esencial",
      "diagnostico_codigo": "I10"
    }
  ],
  "recetas": [ ... ],
  "total_consultas": 0,
  "total_recetas": 1,
  "mensaje": "Acceso limitado: Personal farmacéutico"
}
```

---

### 🔹 7.5. Obtener Expediente por ID de Paciente
- **Endpoint:** `GET /historias/expediente/paciente/{paciente_id}`
- **Autenticación:** Bearer Token
- **Descripción:** RF-002 - Expediente completo por ID de paciente (misma lógica de permisos)

**Ejemplo:** `GET /historias/expediente/paciente/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta:** Igual que la búsqueda de expediente, con filtrado según el rol del usuario autenticado.

---

## 8. DIAGNÓSTICOS CIE-10

**⚠️ Requisito:** Token Bearer

### 🔹 8.1. Buscar Diagnósticos CIE-10
- **Endpoint:** `GET /diagnosticos/buscar?query={termino}&limit={cantidad}`
- **Autenticación:** Bearer Token
- **Descripción:** Búsqueda de diagnósticos por código o descripción (mínimo 2 caracteres)

**Ejemplos:**
```
GET /diagnosticos/buscar?query=I10
GET /diagnosticos/buscar?query=hipertension
GET /diagnosticos/buscar?query=diabetes&limit=10
```

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "codigo": "I10",
    "descripcion": "Hipertensión esencial (primaria)",
    "categoria": "Enfermedades del sistema circulatorio"
  },
  {
    "id": 2,
    "codigo": "I11",
    "descripcion": "Enfermedad cardíaca hipertensiva",
    "categoria": "Enfermedades del sistema circulatorio"
  }
]
```

---

### 🔹 8.2. Obtener Diagnóstico por Código
- **Endpoint:** `GET /diagnosticos/{codigo}`
- **Autenticación:** Bearer Token
- **Descripción:** Obtiene un diagnóstico específico por su código CIE-10

**Ejemplo:** `GET /diagnosticos/I10`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "codigo": "I10",
  "descripcion": "Hipertensión esencial (primaria)",
  "categoria": "Enfermedades del sistema circulatorio",
  "subcategoria": "Enfermedades hipertensivas"
}
```

**Respuesta Error (404):**
```json
{
  "detail": "Diagnóstico CIE-10 no encontrado"
}
```

---

## 9. MEDICAMENTOS

### 🔹 9.1. Crear Medicamento
- **Endpoint:** `POST /medicamentos/`
- **Autenticación:** No requerida
- **Descripción:** Registra un nuevo medicamento

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "nombre": "Enalapril",
  "principio_activo": "Maleato de Enalapril",
  "concentracion": "10mg",
  "presentacion": "Tableta",
  "via_administracion": "Oral",
  "laboratorio": "Laboratorios Bagó",
  "codigo_barras": "7501234567890",
  "requiere_receta": true,
  "tipo": "Medicamento genérico",
  "descripcion": "Inhibidor de la enzima convertidora de angiotensina (IECA)"
}
```

**Campos obligatorios:** `nombre`, `presentacion`, `via_administracion`

**Valores válidos para `via_administracion`:**
- `"Oral"`, `"Intravenosa"`, `"Intramuscular"`, `"Subcutánea"`, `"Tópica"`, `"Oftálmica"`, `"Ótica"`, `"Inhalatoria"`, `"Rectal"`, `"Sublingual"`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Enalapril",
  "principio_activo": "Maleato de Enalapril",
  "concentracion": "10mg",
  "presentacion": "Tableta",
  "via_administracion": "Oral",
  "laboratorio": "Laboratorios Bagó",
  "codigo_barras": "7501234567890",
  "requiere_receta": true,
  "tipo": "Medicamento genérico",
  "descripcion": "Inhibidor de la enzima convertidora de angiotensina (IECA)",
  "stock_total": 0,
  "fecha_creacion": "2025-11-09T16:00:00"
}
```

---

### 🔹 9.2. Listar Medicamentos
- **Endpoint:** `GET /medicamentos/`
- **Autenticación:** No requerida
- **Descripción:** Lista todos los medicamentos

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Enalapril",
    "principio_activo": "Maleato de Enalapril",
    "concentracion": "10mg",
    "presentacion": "Tableta",
    "via_administracion": "Oral",
    "laboratorio": "Laboratorios Bagó",
    "stock_total": 150,
    "requiere_receta": true
  }
]
```

---

### 🔹 9.3. Buscar Medicamentos con Stock
- **Endpoint:** `GET /medicamentos/buscar?query={termino}&limit={cantidad}`
- **Autenticación:** No requerida
- **Descripción:** RF-003 - Búsqueda de medicamentos con stock disponible

**Ejemplos:**
```
GET /medicamentos/buscar?query=Enapril
GET /medicamentos/buscar?query=ibuprofeno&limit=10
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "nombre": "Enalapril",
    "principio_activo": "Maleato de Enalapril",
    "concentracion": "10mg",
    "presentacion": "Tableta",
    "via_administracion": "Oral",
    "stock_total": 150,
    "stock_disponible": 150,
    "requiere_receta": true
  }
]
```

---

### 🔹 9.4. Obtener Medicamento por ID
- **Endpoint:** `GET /medicamentos/{medicamento_id}`
- **Autenticación:** No requerida
- **Descripción:** Obtiene un medicamento específico

**Ejemplo:** `GET /medicamentos/1`

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "nombre": "Enalapril",
  "principio_activo": "Maleato de Enalapril",
  "concentracion": "10mg",
  "presentacion": "Tableta",
  "via_administracion": "Oral",
  "laboratorio": "Laboratorios Bagó",
  "codigo_barras": "7501234567890",
  "requiere_receta": true,
  "tipo": "Medicamento genérico",
  "descripcion": "Inhibidor de la enzima convertidora de angiotensina (IECA)",
  "stock_total": 150
}
```

---

## 10. RECETAS

**⚠️ Requisito previo:** 
- Token Bearer (Médico para crear, Farmacéutico para dispensar)
- Tener paciente, médico y medicamentos creados

### 🔹 10.1. Crear Receta
- **Endpoint:** `POST /recetas/`
- **Autenticación:** Bearer Token (Médico/Admin)
- **Descripción:** Crea una nueva receta médica

**Headers:**
```
Authorization: Bearer {token_medico}
Content-Type: application/json
```

**Request Body:**
```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "consulta_id": 1,
  "fecha_emision": "2025-11-09T11:00:00",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "indicaciones_generales": "Tomar los medicamentos con las comidas. No suspender tratamiento sin indicación médica.",
  "vigencia_dias": 30,
  "medicamentos": [
    {
      "medicamento_id": 1,
      "cantidad": 60,
      "dosis": "1 tableta",
      "frecuencia": "cada 12 horas",
      "duracion": "30 días",
      "indicaciones": "Tomar con alimentos"
    }
  ]
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "consulta_id": 1,
  "fecha_emision": "2025-11-09T11:00:00",
  "fecha_vencimiento": "2025-12-09T11:00:00",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "indicaciones_generales": "Tomar los medicamentos con las comidas",
  "vigencia_dias": 30,
  "estado": "pendiente",
  "medicamentos": [
    {
      "id": 1,
      "medicamento_id": 1,
      "medicamento_nombre": "Enalapril",
      "cantidad": 60,
      "cantidad_dispensada": 0,
      "dosis": "1 tableta",
      "frecuencia": "cada 12 horas",
      "duracion": "30 días",
      "indicaciones": "Tomar con alimentos"
    }
  ],
  "paciente": {
    "nombre": "Carlos",
    "apellido": "Ramírez"
  },
  "medico": {
    "nombre": "Juan",
    "apellido": "Médico"
  }
}
```

---

### 🔹 10.2. Listar Recetas
- **Endpoint:** `GET /recetas/`
- **Autenticación:** Bearer Token
- **Descripción:** Lista recetas con filtros opcionales

**Ejemplos:**
```
GET /recetas/
GET /recetas/?paciente_id=1
GET /recetas/?estado=pendiente
GET /recetas/?paciente_id=1&estado=dispensada
```

**Estados válidos:** `pendiente`, `dispensada`, `parcial`, `cancelada`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
[
  {
    "id": 1,
    "paciente_id": 1,
    "medico_id": 1,
    "fecha_emision": "2025-11-09T11:00:00",
    "fecha_vencimiento": "2025-12-09T11:00:00",
    "estado": "pendiente",
    "diagnostico": "Hipertensión arterial esencial",
    "paciente": {
      "nombre": "Carlos",
      "apellido": "Ramírez",
      "cedula": "1750123456"
    },
    "medico": {
      "nombre": "Juan",
      "apellido": "Médico"
    },
    "farmaceutico": null,
    "total_medicamentos": 1
  }
]
```

---

### 🔹 10.3. Obtener Receta por ID
- **Endpoint:** `GET /recetas/{receta_id}`
- **Autenticación:** Bearer Token
- **Descripción:** Obtiene una receta específica con todos sus detalles

**Ejemplo:** `GET /recetas/1`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "paciente_id": 1,
  "medico_id": 1,
  "consulta_id": 1,
  "fecha_emision": "2025-11-09T11:00:00",
  "fecha_vencimiento": "2025-12-09T11:00:00",
  "diagnostico": "Hipertensión arterial esencial (primaria)",
  "indicaciones_generales": "Tomar los medicamentos con las comidas",
  "estado": "pendiente",
  "medicamentos": [
    {
      "id": 1,
      "medicamento_id": 1,
      "medicamento_nombre": "Enalapril",
      "cantidad": 60,
      "cantidad_dispensada": 0,
      "dosis": "1 tableta",
      "frecuencia": "cada 12 horas",
      "duracion": "30 días"
    }
  ]
}
```

---

### 🔹 10.4. Validar Prescripción (Antes de Dispensar)
- **Endpoint:** `POST /recetas/validar-prescripcion`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** RF-004 - Valida stock, alergias, interacciones y dosis

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
Content-Type: application/json
```

**Request Body:**
```json
{
  "paciente_id": 1,
  "medicamentos": [
    {
      "medicamento_id": 1,
      "cantidad": 60,
      "dosis": "1 tableta cada 12 horas"
    }
  ]
}
```

**Respuesta - Sin Problemas (200):**
```json
{
  "validacion_exitosa": true,
  "alertas_criticas": [],
  "advertencias": [],
  "informacion": [
    {
      "tipo": "info",
      "medicamento": "Enalapril",
      "mensaje": "Stock disponible: 150 unidades"
    }
  ],
  "puede_dispensar": true
}
```

**Respuesta - Con Alertas (200):**
```json
{
  "validacion_exitosa": false,
  "alertas_criticas": [
    {
      "tipo": "alergia",
      "medicamento": "Penicilina",
      "mensaje": "⚠️ ALERTA: El paciente es alérgico a este medicamento",
      "nivel": "critico"
    }
  ],
  "advertencias": [
    {
      "tipo": "stock_bajo",
      "medicamento": "Enalapril",
      "mensaje": "Stock bajo: Solo quedan 20 unidades",
      "nivel": "advertencia"
    }
  ],
  "informacion": [],
  "puede_dispensar": false,
  "mensaje": "No se puede dispensar debido a alertas críticas"
}
```

---

### 🔹 10.5. Dispensar Receta
- **Endpoint:** `POST /recetas/{receta_id}/dispensar`
- **Autenticación:** Bearer Token (Farmacéutico/Admin)
- **Descripción:** Dispensa medicamentos de una receta (actualiza stock)

**Ejemplo:** `POST /recetas/1/dispensar`

**Headers:**
```
Authorization: Bearer {token_farmaceutico}
Content-Type: application/json
```

**Request Body:**
```json
{
  "medicamentos_dispensados": [
    {
      "detalle_id": 1,
      "cantidad_dispensada": 60,
      "lote_id": 1
    }
  ],
  "observaciones": "Medicamentos dispensados completos. Se explicó posología al paciente."
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "estado": "dispensada",
  "fecha_dispensacion": "2025-11-09T16:30:00",
  "farmaceutico_id": 5,
  "observaciones": "Medicamentos dispensados completos. Se explicó posología al paciente.",
  "medicamentos": [
    {
      "id": 1,
      "medicamento_nombre": "Enalapril",
      "cantidad": 60,
      "cantidad_dispensada": 60,
      "estado": "dispensado"
    }
  ],
  "farmaceutico": {
    "nombre": "Ana",
    "apellido": "Farmacéutico"
  }
}
```

**Respuesta - Stock Insuficiente (400):**
```json
{
  "detail": "Stock insuficiente para el medicamento Enalapril"
}
```

---

### 🔹 10.6. Cancelar Receta
- **Endpoint:** `PUT /recetas/{receta_id}/cancelar`
- **Autenticación:** Bearer Token (Médico/Admin)
- **Descripción:** Cancela una receta (solo si no ha sido dispensada)

**Ejemplo:** `PUT /recetas/1/cancelar`

**Headers:**
```
Authorization: Bearer {token_medico}
Content-Type: application/json
```

**Request Body (opcional):**
```json
{
  "observaciones": "Receta cancelada por cambio en el tratamiento"
}
```

**Respuesta Exitosa (200):**
```json
{
  "id": 1,
  "estado": "cancelada",
  "observaciones": "Receta cancelada por cambio en el tratamiento",
  "fecha_cancelacion": "2025-11-09T17:00:00"
}
```

---

### 🔹 10.7. Descargar PDF de Receta
- **Endpoint:** `GET /recetas/{receta_id}/pdf`
- **Autenticación:** Bearer Token
- **Descripción:** Descarga el PDF de la receta médica

**Ejemplo:** `GET /recetas/1/pdf`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename=receta_1.pdf
[PDF de la receta]
```

---

**🔗 Continúa en:** [PRUEBAS_PARTE_3.md](./PRUEBAS_PARTE_3.md)
