# MEJORAS SOLICITADAS - SISTEMA MÉDICO

## 1. ✅ COMPLETADO - Paciente: Quitar "Otro" del género
**Archivo**: `Frontend/src/pages/Pacientes/PacienteForm.jsx`
**Cambio**: Eliminada la opción "Otro" del select de género, solo Masculino y Femenino

---

## 2. TODO - Médico: Bloquear acceso a consulta sin signos vitales
**Archivos a modificar**:
- `Frontend/src/pages/Consulta/ConsultaMedica.jsx`
  
**Cambios necesarios**:
1. Al seleccionar paciente, validar que tenga signos vitales registrados
2. Si NO tiene signos vitales, mostrar mensaje y bloquear acceso
3. Mensaje: "Este paciente aún no tiene signos vitales registrados. La enfermera debe registrarlos primero."

**Código a agregar en `seleccionarPaciente`**:
```javascript
// Validar que tenga signos vitales
if (!cita.signos_vitales || Object.keys(cita.signos_vitales).length === 0) {
  Swal.fire({
    icon: 'warning',
    title: 'Signos Vitales Pendientes',
    text: 'Este paciente aún no tiene signos vitales registrados. La enfermera debe registrarlos primero.',
    confirmButtonText: 'Entendido'
  });
  return; // No permitir continuar
}
```

---

## 3. TODO - Enfermera: Solo permitir tomar signos si paciente "llegó"
**Archivos a modificar**:
- `Frontend/src/pages/Enfermeria/SignosVitales.jsx`
- `Backend/app/models/cita.py` - Ya actualizado con estado "en_espera"

**Flujo**:
1. Administrativo marca cita como "en_espera" cuando paciente llega
2. Solo citas con estado "en_espera" aparecen en lista de enfermera
3. Después de registrar signos, cambiar estado a "en_consulta"

**Cambios en SignosVitales.jsx**:
1. Filtrar solo citas con `estado === 'en_espera'`
2. Mostrar mensaje si no hay pacientes: "No hay pacientes que hayan llegado aún"
3. Al guardar signos vitales, actualizar estado de cita a "en_consulta"

---

## 4. TODO - Médico Consulta: Cambiar botón "Guardar" por "Guardar y Siguiente"
**Archivo**: `Frontend/src/pages/Consulta/ConsultaMedica.jsx`

**Buscar**: Botón "Guardar Consulta" en la sección de consulta
**Cambiar a**: "Guardar y Siguiente"
**Funcionalidad**: Al hacer clic, guardar y pasar automáticamente a la pestaña de prescripción

---

## 5. TODO - Médico Prescripción: Quitar botones redundantes
**Archivo**: `Frontend/src/pages/Consulta/ConsultaMedica.jsx`

**En la pestaña de Prescripción, quitar**:
- Botón "Finalizar Consulta"
- Botón "Enviar Receta a Farmacia"
- Botón "Finalizar sin Receta"

**Razón**: Estos botones están duplicados en la pantalla de finalización

---

## Estados de Cita (Flujo Completo)

```
PROGRAMADA (inicial)
    ↓
CONFIRMADA (opcional, paciente confirma)
    ↓
EN_ESPERA (paciente llegó - marcado por administrativo)
    ↓
EN_CONSULTA (enfermera registró signos vitales)
    ↓
COMPLETADA (médico finalizó consulta)
```

Estados adicionales:
- CANCELADA (cita cancelada)
- NO_ASISTIO (paciente no llegó)

---

## Resumen de Cambios por Rol

### Administrativo/Recepcionista
- Al registrar llegada del paciente → cambiar estado a "en_espera"

### Enfermera
- Solo ver pacientes con estado "en_espera"
- Al registrar signos vitales → cambiar estado a "en_consulta"

### Médico
- Solo ver pacientes con estado "en_consulta" (con signos vitales)
- Validar signos vitales antes de permitir acceso
- Botón "Guardar y Siguiente" en lugar de "Guardar"
- Sin botones de finalización en pestaña de prescripción

