# Pruebas Unitarias - Sistema de Gestión Médica

Este directorio contiene las pruebas unitarias del sistema organizadas por funcionalidades.

## 📁 Estructura

```
PruebasUnitarias/
├── conftest.py                    # Configuración global y fixtures
├── __init__.py
├── requirements_test.txt          # Dependencias para testing
├── README.md                      # Este archivo
│
├── RegistroPacientes/            # ✅ IMPLEMENTADO
│   ├── __init__.py
│   ├── test_registro_pacientes.py   # 6 casos de uso, 15+ pruebas
│   └── README.md
│
├── AgendamientoCitas/            # 🔜 PRÓXIMO
│   └── test_agendamiento_citas.py
│
├── ValidacionFarmaceutica/       # 🔜 PRÓXIMO
│   └── test_validacion_farmaceutica.py
│
├── NotificacionesStock/          # 🔜 PRÓXIMO
│   └── test_notificaciones_stock.py
│
└── BusquedaPacientes/            # 🔜 PRÓXIMO
    └── test_busqueda_pacientes.py
```

## 🚀 Instalación

### 1. Activar entorno virtual del backend

```bash
cd Backend
source venv/bin/activate  # En Linux/Mac
# o
venv\Scripts\activate     # En Windows
```

### 2. Instalar dependencias de testing

```bash
pip install -r ../PruebasUnitarias/requirements_test.txt
```

## ▶️ Ejecutar Pruebas

### Ejecutar TODAS las pruebas

```bash
# Desde la raíz del proyecto
pytest PruebasUnitarias/ -v
```

### Ejecutar solo pruebas de Registro de Pacientes

```bash
pytest PruebasUnitarias/RegistroPacientes/ -v
```

### Ejecutar una prueba específica

```bash
pytest PruebasUnitarias/RegistroPacientes/test_registro_pacientes.py::TestRegistroPacienteExitoso::test_registro_exitoso_con_cedula_valida -v
```

### Ejecutar con reporte de cobertura

```bash
pytest PruebasUnitarias/ --cov=app --cov-report=html
```

### Ejecutar pruebas en paralelo (más rápido)

```bash
pytest PruebasUnitarias/ -n auto
```

## 📊 Opciones útiles de pytest

| Comando | Descripción |
|---------|-------------|
| `-v` o `--verbose` | Salida detallada |
| `-s` | Mostrar prints en consola |
| `-x` | Detener al primer fallo |
| `--lf` | Ejecutar solo las que fallaron |
| `--ff` | Ejecutar primero las que fallaron |
| `-k "nombre"` | Ejecutar solo pruebas que coincidan |
| `--markers` | Ver todos los marcadores disponibles |

## 🎯 Casos de Uso Implementados

### ✅ Registro de Pacientes (15 pruebas)

| ID | Caso de Uso | Pruebas | Estado |
|----|-------------|---------|--------|
| CU-PAC-001 | Registro exitoso con cédula válida | 3 | ✅ |
| CU-PAC-002 | Rechazo por cédula inválida | 4 | ✅ |
| CU-PAC-003 | Rechazo por cédula duplicada | 2 | ✅ |
| CU-PAC-004 | Generación historia clínica | 3 | ✅ |
| CU-PAC-005 | Validación fecha nacimiento | 3 | ✅ |
| CU-PAC-006 | Validación email único | 3 | ✅ |

**Total: 15+ pruebas unitarias**

## 📝 Convenciones de Nombres

- **Clases de prueba**: `TestNombreFuncionalidad` (PascalCase)
- **Métodos de prueba**: `test_descripcion_breve` (snake_case)
- **Fixtures**: Minúsculas con guiones bajos
- **Archivos**: `test_nombre_funcionalidad.py`

## 🔍 Estructura de una Prueba (Patrón AAA)

```python
def test_ejemplo(self, db_session, fixture_data):
    # Arrange (Preparar)
    payload = PacienteCreate(**fixture_data)
    
    # Act (Actuar)
    resultado = create_paciente(db_session, payload)
    
    # Assert (Verificar)
    assert resultado is not None
    assert resultado.nombre == "Esperado"
```

## 🏷️ Marcadores Disponibles

```python
@pytest.mark.smoke       # Pruebas rápidas críticas
@pytest.mark.regression  # Pruebas de regresión
@pytest.mark.parametrize # Pruebas con múltiples datos
```

## 📈 Cobertura de Código

Objetivo: **>= 80% de cobertura** en servicios críticos

Servicios prioritarios:
- `paciente_service.py` ✅
- `cita_service.py` 🔜
- `validacion_farmaceutica_service.py` 🔜
- `notificacion_stock_service.py` 🔜

## 🐛 Debugging

### Ver salida de prints

```bash
pytest -s PruebasUnitarias/RegistroPacientes/
```

### Debugger interactivo en fallos

```bash
pytest --pdb PruebasUnitarias/
```

### Ver valores de variables en fallos

```bash
pytest -vv --showlocals PruebasUnitarias/
```

## 📚 Recursos

- [Documentación de pytest](https://docs.pytest.org/)
- [Fixtures de pytest](https://docs.pytest.org/en/stable/fixture.html)
- [Parametrización](https://docs.pytest.org/en/stable/parametrize.html)
- [SQLAlchemy Testing](https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites)

## ✅ Checklist de Testing

- [x] Configuración de pytest (`conftest.py`)
- [x] Fixtures para base de datos en memoria
- [x] Fixtures para datos de prueba
- [x] Tests de Registro de Pacientes (6 casos de uso)
- [ ] Tests de Agendamiento de Citas
- [ ] Tests de Validación Farmacéutica
- [ ] Tests de Notificaciones de Stock
- [ ] Tests de Búsqueda de Pacientes
- [ ] Reporte de cobertura >= 80%
- [ ] CI/CD con GitHub Actions

## 👥 Contribuir

Al agregar nuevas pruebas:

1. Crear carpeta para la funcionalidad
2. Documentar casos de uso al inicio del archivo
3. Seguir patrón AAA (Arrange-Act-Assert)
4. Incluir mensajes descriptivos en asserts
5. Agregar prints informativos para éxitos
6. Actualizar este README

## 📞 Contacto

Para dudas sobre las pruebas unitarias, consultar con el equipo de desarrollo.

---

**Fecha última actualización**: 11/11/2025
**Autor**: Equipo Grupo04-Proyecto
