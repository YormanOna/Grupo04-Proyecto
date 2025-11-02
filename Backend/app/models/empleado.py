from sqlalchemy import Column, Integer, String, BigInteger
from sqlalchemy.orm import relationship
from app.core.database import Base

class Empleado(Base):
    """
    Modelo base para empleados del sistema médico.
    Tipos de cargo: 'Admin General', 'Administrador', 'Médico', 'Enfermera', 'Farmacéutico'
    
    - Admin General: Acceso total al sistema, gestión de usuarios y configuración
    - Administrador: Recepcionista, gestión de citas y pacientes
    - Médico: Consultas médicas y recetas
    - Enfermera: Signos vitales y asistencia
    - Farmacéutico: Gestión de medicamentos y recetas
    """
    __tablename__ = "empleados"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    cedula = Column(BigInteger, unique=True, nullable=False)
    cargo = Column(String(50), nullable=False)  # Admin General, Administrador, Médico, Enfermera, Farmacéutico
    email = Column(String(150), unique=True, nullable=True)
    telefono = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=True)

    # Relaciones
    # Consultas donde el empleado actúa como médico
    consultas = relationship("Consulta", back_populates="medico_empleado", cascade="all, delete-orphan")
    
    # Citas donde el empleado es el encargado administrativo
    citas = relationship("Cita", back_populates="encargado", foreign_keys="Cita.encargado_id", cascade="all, delete-orphan")
