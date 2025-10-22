from pydantic import BaseModel, EmailStr
from typing import Optional

class EmpleadoBase(BaseModel):
    nombre: str
    apellido: str
    cedula: int
    cargo: str  # Médico, Enfermera, Farmacéutico, Administrador
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

class EmpleadoCreate(EmpleadoBase):
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    cargo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None

class EmpleadoOut(EmpleadoBase):
    id: int

    class Config:
        orm_mode = True
