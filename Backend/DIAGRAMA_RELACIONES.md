# 📊 Diagrama de Relaciones - Sistema de Gestión Médica

## ✅ Relaciones Corregidas y Verificadas

### 🏥 Entidades Principales y sus Relaciones

#### 1. **Empleado** (Tabla Central)
```
Empleado (1) ──── (N) Consulta [medico_empleado]
Empleado (1) ──── (N) Cita [encargado]
Empleado (1) ──── (N) Receta [medico - recetas_emitidas]
Empleado (1) ──── (N) Receta [farmaceutico - recetas_dispensadas]
Empleado (1) ──── (N) Asistencia
Empleado (1) ──── (N) Auditoria
Empleado (1) ──── (1) Farmacia [farmaceutico]
Empleado (1) ──── (1) Medico [opcional - herencia]
```

#### 2. **Paciente**
```
Paciente (1) ──── (1) Historia
Paciente (1) ──── (N) Cita
Paciente (1) ──── (N) Consulta
Paciente (1) ──── (N) Receta
Paciente (1) ──── (N) EncuestaSatisfaccion
```

#### 3. **Cita**
```
Cita (N) ──── (1) Paciente
Cita (N) ──── (1) Medico
Cita (N) ──── (1) Empleado [encargado]
Cita (1) ──── (N) Consulta
Cita (1) ──── (N) EncuestaSatisfaccion
```

#### 4. **Consulta**
```
Consulta (N) ──── (1) Cita
Consulta (N) ──── (1) Historia
Consulta (N) ──── (1) Paciente
Consulta (N) ──── (1) Empleado [medico]
Consulta (1) ──── (N) Receta
```

#### 5. **Historia**
```
Historia (1) ──── (1) Paciente
Historia (1) ──── (N) Consulta
```

#### 6. **Receta**
```
Receta (N) ──── (1) Consulta
Receta (N) ──── (1) Empleado [medico]
Receta (N) ──── (1) Paciente
Receta (N) ──── (1) Empleado [farmaceutico]
Receta (N) ──── (1) Lote [lote_obj] ✨ NUEVO
```

#### 7. **Medicamento**
```
Medicamento (N) ──── (1) Farmacia
Medicamento (1) ──── (N) Lote ✨ RF-004
```

#### 8. **Lote** ✨ RF-004
```
Lote (N) ──── (1) Medicamento
Lote (1) ──── (N) Receta [opcional - trazabilidad]
```

#### 9. **Farmacia**
```
Farmacia (1) ──── (N) Medicamento
Farmacia (N) ──── (1) Empleado [farmaceutico]
```

#### 10. **Asistencia**
```
Asistencia (N) ──── (1) Empleado
```

#### 11. **EncuestaSatisfaccion**
```
EncuestaSatisfaccion (N) ──── (1) Paciente
EncuestaSatisfaccion (N) ──── (1) Cita
```

#### 12. **Auditoria** ✅ Corregida
```
Auditoria (N) ──── (1) Empleado [usuario]
```

#### 13. **Medico**
```
Medico (1) ──── (N) Cita
Medico (N) ──── (1) Empleado [opcional - herencia]
```

#### 14. **DiagnosticoCIE10** ⚠️ Sin relaciones directas
```
DiagnosticoCIE10 (Tabla de catálogo independiente)
- Usada en Consulta.diagnostico_codigo como referencia string
- No tiene FK directa para mantener flexibilidad
```

#### 15. **SignosVitales** 📝 Legacy
```
SignosVitales (Tabla legacy - datos históricos)
- Los signos vitales actuales se almacenan en Consulta.signos_vitales (JSON)
- Se mantiene para compatibilidad con datos antiguos
```

---

## 🔄 Cambios Realizados

### ✅ Relaciones Agregadas:

1. **Empleado**:
   - ✅ `recetas_emitidas` → Receta (como médico)
   - ✅ `recetas_dispensadas` → Receta (como farmacéutico)
   - ✅ `asistencias` → Asistencia
   - ✅ `auditorias` → Auditoria

2. **Paciente**:
   - ✅ `recetas` → Receta
   - ✅ `encuestas` → EncuestaSatisfaccion

3. **Cita**:
   - ✅ `encuestas` → EncuestaSatisfaccion

4. **Consulta**:
   - ✅ `recetas` → Receta

5. **Receta**:
   - ✅ `lote_id` → Lote (FK)
   - ✅ `lote_obj` → Lote (relationship)
   - ✅ Relaciones bidireccionales con Empleado y Paciente

6. **Asistencia**:
   - ✅ Relación bidireccional con Empleado

7. **EncuestaSatisfaccion**:
   - ✅ Relaciones bidireccionales con Paciente y Cita

8. **Auditoria**:
   - ✅ `usuario_id` → Empleado (FK)
   - ✅ `usuario` → Empleado (relationship)

---

## 📈 Diagrama de Flujo de Relaciones

```
                                    EMPLEADO (Central)
                                         │
                ┌────────────────────────┼────────────────────────┐
                │                        │                        │
             MÉDICO                  CONSULTA                 ASISTENCIA
                │                        │                        
                │                        ├─────────────┐          
             CITA ──── PACIENTE         │             │          
                │         │          HISTORIA      RECETA        
                │         │             │             │          
                │         └─────────────┼─────────────┤          
                │                       │             │          
          ENCUESTA ──────────────────────┘             │          
                                                    LOTE          
                                                       │          
                                                 MEDICAMENTO      
                                                       │          
                                                   FARMACIA       
                                                       │          
                                              EMPLEADO (farmacéutico)
```

---

## 🎯 Tablas por Tipo

### 📌 Tablas Core (Con múltiples relaciones):
- ✅ Empleado (8 relaciones)
- ✅ Paciente (5 relaciones)
- ✅ Cita (5 relaciones)
- ✅ Consulta (5 relaciones)
- ✅ Receta (5 relaciones)

### 📌 Tablas de Soporte (Con relaciones):
- ✅ Historia (2 relaciones)
- ✅ Medicamento (2 relaciones)
- ✅ Lote (2 relaciones)
- ✅ Farmacia (2 relaciones)
- ✅ Asistencia (1 relación)
- ✅ EncuestaSatisfaccion (2 relaciones)
- ✅ Auditoria (1 relación)
- ✅ Medico (2 relaciones)

### 📌 Tablas de Catálogo (Sin relaciones FK):
- ⚠️ DiagnosticoCIE10 (Catálogo CIE-10)
- 📝 SignosVitales (Legacy - JSON en Consulta)

---

## ✅ Verificación de Integridad

Todas las tablas ahora tienen relaciones apropiadas. Las únicas excepciones son:

1. **DiagnosticoCIE10**: Tabla de catálogo que se usa como referencia string en `Consulta.diagnostico_codigo`. No requiere FK para mantener flexibilidad.

2. **SignosVitales**: Tabla legacy mantenida para datos históricos. Los signos vitales actuales se almacenan en `Consulta.signos_vitales` como JSON.

---

## 🔧 Para Aplicar los Cambios

1. **Ejecutar migración SQL**:
```bash
mysql -u root -p hospital_db < Backend/migrations_relaciones.sql
```

2. **Reiniciar el backend**:
```bash
cd Backend
source venv/bin/activate
uvicorn app.main:app --reload
```

3. **Verificar relaciones**:
```bash
# Ver todas las foreign keys
mysql -u root -p -e "
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'hospital_db'
    AND REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY TABLE_NAME;
"
```

---

## 📝 Notas Importantes

- ✅ Todas las relaciones son bidireccionales donde tiene sentido
- ✅ Se usan `cascade="all, delete-orphan"` en relaciones parent-child
- ✅ Se usa `ondelete="SET NULL"` para evitar eliminación en cascada no deseada
- ✅ Todos los `foreign_keys` están especificados para evitar ambigüedad
- ✅ Los índices están creados para mejorar rendimiento

---

**Última actualización**: 8 de noviembre de 2025  
**Estado**: ✅ Todas las relaciones verificadas y corregidas
