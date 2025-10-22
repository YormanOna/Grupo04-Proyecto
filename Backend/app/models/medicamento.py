from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Medicamento(Base):
    __tablename__ = "medicamentos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    stock = Column(Integer, default=0)
    contenido = Column(String(100), nullable=True)  # Cambiado a String para aceptar "500mg", "100ml", etc.

    # farmacia_id es nullable ya que no siempre hay una farmacia creada
    farmacia_id = Column(Integer, ForeignKey("farmacias.id", ondelete="SET NULL"), nullable=True)
    farmacia = relationship("Farmacia", back_populates="medicamentos")
