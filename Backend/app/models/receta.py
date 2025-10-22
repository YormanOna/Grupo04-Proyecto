from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class Receta(Base):
    """
    Modelo para prescripciones médicas (recetas)
    Permite gestionar medicamentos prescritos por el médico
    """
    __tablename__ = "recetas"

    id = Column(Integer, primary_key=True, index=True)
    consulta_id = Column(Integer, ForeignKey("consultas.id"), nullable=False)
    medico_id = Column(Integer, ForeignKey("empleados.id"), nullable=False)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    fecha_emision = Column(DateTime, default=datetime.utcnow, nullable=False)
    medicamentos = Column(Text, nullable=False)  # Lista de medicamentos en formato JSON o texto
    indicaciones = Column(Text, nullable=True)
    estado = Column(String(50), default="pendiente")  # pendiente, dispensada, parcial, cancelada
    dispensada_por = Column(Integer, ForeignKey("empleados.id"), nullable=True)  # Farmacéutico
    fecha_dispensacion = Column(DateTime, nullable=True)
    observaciones = Column(Text, nullable=True)

    # Relaciones
    consulta = relationship("Consulta", foreign_keys=[consulta_id])
    medico = relationship("Empleado", foreign_keys=[medico_id])
    paciente = relationship("Paciente", foreign_keys=[paciente_id])
    farmaceutico = relationship("Empleado", foreign_keys=[dispensada_por])

    def __repr__(self):
        return f"<Receta {self.id} - Paciente: {self.paciente_id}>"
