from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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
    paciente: Optional[dict] = None  # Datos del paciente anidados
    medico: Optional[dict] = None  # Datos del médico anidados

    class Config:
        orm_mode = True
