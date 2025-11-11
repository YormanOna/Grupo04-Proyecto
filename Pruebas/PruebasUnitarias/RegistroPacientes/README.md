# Pruebas Unitarias - Registro de Pacientes

## 📋 Descripción

Este módulo contiene las pruebas unitarias para la funcionalidad de **Registro de Pacientes** del Sistema de Gestión Médica.

## 🎯 Casos de Uso Cubiertos

### CU-PAC-001: Registro Exitoso de Paciente con Cédula Válida
**Objetivo**: Verificar que un paciente con datos válidos se registra correctamente.

**Pruebas incluidas**:
- `test_registro_exitoso_con_cedula_valida`: Registro con todos los campos
- `test_registro_con_datos_minimos_obligatorios`: Solo campos obligatorios
- `test_multiples_registros_historias_secuenciales`: Múltiples pacientes

**Datos de entrada**: Cédula válida (1713175071), datos completos  
**Resultado esperado**: Paciente creado, historia clínica generada, activo=True

---

### CU-PAC-002: Rechazo por Cédula Ecuatoriana Inválida
**Objetivo**: Verificar que el sistema rechaza cédulas inválidas.

**Pruebas incluidas**:
- `test_rechazo_cedula_digito_verificador_incorrecto`: Dígito verificador malo
- `test_rechazo_cedula_provincia_inexistente`: Código de provincia inválido
- `test_rechazo_cedula_longitud_incorrecta`: Cédula muy corta/larga
- `test_multiple_cedulas_invalidas`: Prueba parametrizada con múltiples casos

**Datos de entrada**: Cédulas con errores diversos  
**Resultado esperado**: HTTPException 400, "Cédula inválida"

---

### CU-PAC-003: Rechazo por Cédula Duplicada
**Objetivo**: Verificar que no se permiten cédulas duplicadas.

**Pruebas incluidas**:
- `test_rechazo_cedula_duplicada`: Intento de duplicar cédula
- `test_diferentes_pacientes_diferentes_cedulas`: Múltiples cédulas únicas OK

**Datos de entrada**: Cédula ya registrada  
**Resultado esperado**: HTTPException 400, "Ya existe un paciente con esta cédula"

---

### CU-PAC-004: Generación Correcta de Número de Historia Clínica
**Objetivo**: Verificar formato y secuencialidad de historias clínicas.

**Pruebas incluidas**:
- `test_formato_historia_clinica`: Validar formato HCL-YYYYMMDD-NNNN
- `test_secuencialidad_historias_clinicas`: Números consecutivos
- `test_historias_unicas`: Cada historia es única

**Datos de entrada**: Múltiples pacientes  
**Resultado esperado**: Formato correcto, números secuenciales (0001, 0002...)

---

### CU-PAC-005: Rechazo por Fecha de Nacimiento Incoherente
**Objetivo**: Verificar validación de fechas lógicas.

**Pruebas incluidas**:
- `test_rechazo_fecha_nacimiento_futura`: Fecha en el futuro
- `test_rechazo_fecha_nacimiento_muy_antigua`: > 150 años atrás
- `test_aceptacion_fechas_validas`: Rangos válidos (0-150 años)

**Datos de entrada**: Fechas ilógicas  
**Resultado esperado**: HTTPException 400, mensaje descriptivo

---

### CU-PAC-006: Validación de Email Único
**Objetivo**: Verificar unicidad de emails.

**Pruebas incluidas**:
- `test_rechazo_email_duplicado`: Intento de duplicar email
- `test_email_nulo_permitido_multiples_veces`: Múltiples NULL OK
- `test_diferentes_emails_permitidos`: Emails únicos OK

**Datos de entrada**: Email duplicado  
**Resultado esperado**: HTTPException 400, "Ya existe un paciente con este email"

---

## ▶️ Ejecutar Pruebas

### Todas las pruebas de este módulo
```bash
pytest PruebasUnitarias/RegistroPacientes/ -v
```

### Una clase específica
```bash
pytest PruebasUnitarias/RegistroPacientes/test_registro_pacientes.py::TestRegistroPacienteExitoso -v
```

### Una prueba específica
```bash
pytest PruebasUnitarias/RegistroPacientes/test_registro_pacientes.py::TestValidacionCedulaInvalida::test_rechazo_cedula_digito_verificador_incorrecto -v
```

### Con cobertura
```bash
pytest PruebasUnitarias/RegistroPacientes/ --cov=app.services.paciente_service --cov-report=term-missing
```

## 📊 Resultados Esperados

```
test_registro_pacientes.py::TestRegistroPacienteExitoso::test_registro_exitoso_con_cedula_valida PASSED
test_registro_pacientes.py::TestRegistroPacienteExitoso::test_registro_con_datos_minimos_obligatorios PASSED
test_registro_pacientes.py::TestRegistroPacienteExitoso::test_multiples_registros_historias_secuenciales PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_rechazo_cedula_digito_verificador_incorrecto PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_rechazo_cedula_provincia_inexistente PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_rechazo_cedula_longitud_incorrecta PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_multiple_cedulas_invalidas[1234567890] PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_multiple_cedulas_invalidas[1713175070] PASSED
test_registro_pacientes.py::TestValidacionCedulaInvalida::test_multiple_cedulas_invalidas[9999999999] PASSED
test_registro_pacientes.py::TestValidacionCedulaDuplicada::test_rechazo_cedula_duplicada PASSED
test_registro_pacientes.py::TestValidacionCedulaDuplicada::test_diferentes_pacientes_diferentes_cedulas PASSED
test_registro_pacientes.py::TestGeneracionHistoriaClinica::test_formato_historia_clinica PASSED
test_registro_pacientes.py::TestGeneracionHistoriaClinica::test_secuencialidad_historias_clinicas PASSED
test_registro_pacientes.py::TestGeneracionHistoriaClinica::test_historias_unicas PASSED
test_registro_pacientes.py::TestValidacionFechaNacimiento::test_rechazo_fecha_nacimiento_futura PASSED
test_registro_pacientes.py::TestValidacionFechaNacimiento::test_rechazo_fecha_nacimiento_muy_antigua PASSED
test_registro_pacientes.py::TestValidacionFechaNacimiento::test_aceptacion_fechas_validas PASSED
test_registro_pacientes.py::TestValidacionEmailUnico::test_rechazo_email_duplicado PASSED
test_registro_pacientes.py::TestValidacionEmailUnico::test_email_nulo_permitido_multiples_veces PASSED
test_registro_pacientes.py::TestValidacionEmailUnico::test_diferentes_emails_permitidos PASSED

===================== 20 passed in 2.45s =====================
```

## 🔧 Dependencias

- pytest >= 7.4.3
- SQLAlchemy == 1.4.52
- FastAPI == 0.95.2
- Backend modules: `app.services.paciente_service`, `app.models.*`

## 📝 Notas Técnicas

### Base de Datos de Prueba
- Se usa SQLite en memoria (`:memory:`)
- Cada prueba tiene su propia base de datos limpia
- Las tablas se crean y eliminan automáticamente

### Fixtures Utilizados
- `db_session`: Sesión de base de datos para cada prueba
- `paciente_data_valido`: Datos válidos de paciente
- `cedulas_validas`: Lista de cédulas ecuatorianas válidas
- `cedulas_invalidas`: Lista de cédulas inválidas

### Patrón AAA
Todas las pruebas siguen el patrón:
1. **Arrange** (Preparar): Configurar datos y estado
2. **Act** (Actuar): Ejecutar la función a probar
3. **Assert** (Verificar): Comprobar resultados

## 🐛 Troubleshooting

### Error: "No se puede resolver importación app.*"
**Solución**: Verificar que el path al Backend esté correcto en `conftest.py`

### Error: "Table 'pacientes' doesn't exist"
**Solución**: Verificar que `Base.metadata.create_all()` se ejecute en el fixture

### Error: "pytest not found"
**Solución**: Instalar dependencias: `pip install -r requirements_test.txt`

## ✅ Checklist de Mantenimiento

- [x] Documentación completa de casos de uso
- [x] 20+ pruebas implementadas
- [x] Cobertura de todos los flujos (éxito + error)
- [x] Mensajes descriptivos en assertions
- [x] Fixtures reutilizables
- [x] Pruebas parametrizadas donde aplica
- [ ] Integración con CI/CD

---

**Última actualización**: 11/11/2025  
**Autor**: Equipo Grupo04-Proyecto
