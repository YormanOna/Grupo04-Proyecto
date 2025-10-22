from sqlalchemy import Column, Integer, Float, String
from app.core.database import Base

class SignosVitales(Base):
    """
    Modelo legacy de signos vitales.
    NOTA: En la versión actual, los signos vitales se almacenan como JSON 
    en la tabla consultas. Esta tabla se mantiene por compatibilidad.
    """
    __tablename__ = "signos_vitales"

    id = Column(Integer, primary_key=True, index=True)
    # Signos vitales básicos
    presion_arterial = Column(String(20), nullable=True)  # Ej: "120/80"
    presion = Column(Float, nullable=True)  # Mantener por compatibilidad
    frecuencia_cardiaca = Column(Integer, nullable=True)  # Pulso (latidos por minuto)
    frecuencia_respiratoria = Column(Integer, nullable=True)  # Respiraciones por minuto
    temperatura = Column(Float, nullable=True)  # En grados Celsius
    saturacion_oxigeno = Column(Float, nullable=True)  # Porcentaje de SpO2
    peso = Column(Float, nullable=True)  # En kilogramos
    talla = Column(Float, nullable=True)  # En metros o centímetros
    imc = Column(Float, nullable=True)  # Índice de masa corporal (calculado)
    
    # Campos adicionales
    observaciones = Column(String(500), nullable=True)  # Observaciones de enfermería
