from pydantic import BaseModel

class DiagnosticoCIE10Base(BaseModel):
    codigo: str
    descripcion: str
    categoria: str | None = None

class DiagnosticoCIE10Response(DiagnosticoCIE10Base):
    id: int

    class Config:
        from_attributes = True
