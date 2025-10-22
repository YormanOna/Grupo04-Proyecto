from sqlalchemy import Column, Integer, String, BigInteger, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from sqlalchemy.ext.hybrid import hybrid_property
from datetime import datetime, date
from app.core.database import Base

class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    cedula = Column(BigInteger, unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    telefono = Column(String(20), nullable=True)
    direccion = Column(String(255), nullable=True)
    
    # Datos adicionales según el manual de procesos
    fecha_nacimiento = Column(Date, nullable=True)
    genero = Column(String(20), nullable=True)  # Masculino, Femenino, Otro
    grupo_sanguineo = Column(String(10), nullable=True)  # A+, O-, etc.
    alergias = Column(Text, nullable=True)  # Registro de alergias
    antecedentes_medicos = Column(Text, nullable=True)  # Antecedentes relevantes
    contacto_emergencia_nombre = Column(String(200), nullable=True)
    contacto_emergencia_telefono = Column(String(20), nullable=True)
    contacto_emergencia_relacion = Column(String(50), nullable=True)
    
    @hybrid_property
    def edad(self):
        """Calcula la edad del paciente basada en fecha_nacimiento"""
        if not self.fecha_nacimiento:
            return None
        hoy = date.today()
        edad = hoy.year - self.fecha_nacimiento.year
        # Ajustar si aún no ha cumplido años este año
        if hoy.month < self.fecha_nacimiento.month or \
           (hoy.month == self.fecha_nacimiento.month and hoy.day < self.fecha_nacimiento.day):
            edad -= 1
        return edad

    # Relación 1:1 con Historia
    historia_id = Column(Integer, ForeignKey("historias.id"), nullable=True, unique=True)
    historia = relationship("Historia", back_populates="paciente")

    # Relación 1:N con Cita
    citas = relationship("Cita", back_populates="paciente", cascade="all, delete-orphan")
    
    # Relación 1:N con Consultas
    consultas = relationship("Consulta", back_populates="paciente")
