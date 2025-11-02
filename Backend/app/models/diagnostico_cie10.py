from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base

class DiagnosticoCIE10(Base):
    __tablename__ = "diagnosticos_cie10"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(10), unique=True, index=True, nullable=False)
    descripcion = Column(Text, nullable=False)
    categoria = Column(String(100))  # Ej: "Enfermedades infecciosas", "Sistema respiratorio"
