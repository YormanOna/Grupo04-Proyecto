from pydantic import BaseModel
from typing import Optional

class SignosVitalesBase(BaseModel):
    presion_arterial: Optional[str] = None
    presion: Optional[float] = None
    frecuencia_cardiaca: Optional[int] = None
    frecuencia_respiratoria: Optional[int] = None
    temperatura: Optional[float] = None
    saturacion_oxigeno: Optional[float] = None
    peso: Optional[float] = None
    talla: Optional[float] = None
    imc: Optional[float] = None
    observaciones: Optional[str] = None

class SignosVitalesCreate(SignosVitalesBase):
    pass

class SignosVitalesOut(SignosVitalesBase):
    id: int

    class Config:
        orm_mode = True
