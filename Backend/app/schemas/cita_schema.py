from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.paciente_schema import PacienteOut
from app.schemas.medico_schema import MedicoOut

class CitaBase(BaseModel):
    fecha: datetime
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    motivo: Optional[str] = None
    estado: Optional[str] = "programada"
    sala_asignada: Optional[str] = None
    tipo_cita: Optional[str] = "consulta"

class CitaCreate(CitaBase):
    paciente_id: int
    medico_id: Optional[int] = None
    encargado_id: Optional[int] = None

class CitaUpdate(BaseModel):
    fecha: Optional[datetime] = None
    hora_inicio: Optional[str] = None
    hora_fin: Optional[str] = None
    motivo: Optional[str] = None
    estado: Optional[str] = None
    medico_id: Optional[int] = None
    sala_asignada: Optional[str] = None
    observaciones_cancelacion: Optional[str] = None

class CitaOut(CitaBase):
    id: int
    paciente_id: int
    medico_id: Optional[int] = None
    encargado_id: Optional[int] = None
    observaciones_cancelacion: Optional[str] = None
    
    # Campos opcionales para información adicional (sin validación estricta)
    paciente_nombre: Optional[str] = None
    paciente_apellido: Optional[str] = None
    paciente_cedula: Optional[str] = None
    paciente_edad: Optional[int] = None  # ¡AGREGADO! Edad calculada del paciente
    paciente_genero: Optional[str] = None
    paciente_telefono: Optional[str] = None
    
    medico_nombre: Optional[str] = None
    medico_apellido: Optional[str] = None
    medico_especialidad: Optional[str] = None
    
    # Relaciones completas (opcional, para respuestas detalladas)
    paciente: Optional[PacienteOut] = None
    medico: Optional[MedicoOut] = None

    class Config:
        orm_mode = True
