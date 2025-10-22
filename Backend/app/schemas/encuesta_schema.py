from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EncuestaBase(BaseModel):
    calidad_atencion: Optional[int] = None
    tiempo_espera: Optional[int] = None
    trato_personal: Optional[int] = None
    limpieza_instalaciones: Optional[int] = None
    satisfaccion_general: Optional[int] = None
    comentarios: Optional[str] = None
    sugerencias: Optional[str] = None
    recomendaria: Optional[str] = None

class EncuestaCreate(EncuestaBase):
    paciente_id: int
    cita_id: Optional[int] = None

class EncuestaOut(EncuestaBase):
    id: int
    paciente_id: int
    cita_id: Optional[int]
    fecha: datetime

    class Config:
        orm_mode = True
