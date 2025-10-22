from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RecetaBase(BaseModel):
    medicamentos: str
    indicaciones: Optional[str] = None

class RecetaCreate(RecetaBase):
    consulta_id: int
    paciente_id: int
    medico_id: int

class RecetaOut(RecetaBase):
    id: int
    consulta_id: int
    medico_id: int
    paciente_id: int
    fecha_emision: datetime
    estado: str
    dispensada_por: Optional[int]
    fecha_dispensacion: Optional[datetime]
    observaciones: Optional[str]

    class Config:
        orm_mode = True

class RecetaDispensar(BaseModel):
    """Schema para dispensar receta"""
    observaciones: Optional[str] = None
    estado: str = "dispensada"  # dispensada, parcial
