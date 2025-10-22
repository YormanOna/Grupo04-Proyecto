from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class EncuestaSatisfaccion(Base):
    """
    Modelo para encuestas de satisfacción del paciente
    Actividad 16 del manual de procesos
    """
    __tablename__ = "encuestas_satisfaccion"

    id = Column(Integer, primary_key=True, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False)
    cita_id = Column(Integer, ForeignKey("citas.id"), nullable=True)
    fecha = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Preguntas de la encuesta (escala 1-5)
    calidad_atencion = Column(Integer, nullable=True)  # 1-5
    tiempo_espera = Column(Integer, nullable=True)  # 1-5
    trato_personal = Column(Integer, nullable=True)  # 1-5
    limpieza_instalaciones = Column(Integer, nullable=True)  # 1-5
    satisfaccion_general = Column(Integer, nullable=True)  # 1-5
    
    # Campos de texto
    comentarios = Column(Text, nullable=True)
    sugerencias = Column(Text, nullable=True)
    
    # ¿Recomendaría el servicio?
    recomendaria = Column(String(10), nullable=True)  # Si/No

    # Relaciones
    paciente = relationship("Paciente", foreign_keys=[paciente_id])
    cita = relationship("Cita", foreign_keys=[cita_id])

    def __repr__(self):
        return f"<EncuestaSatisfaccion {self.id} - Paciente: {self.paciente_id}>"
