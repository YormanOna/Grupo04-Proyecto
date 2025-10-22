from sqlalchemy.orm import Session
from app.models.receta import Receta
from app.schemas.receta_schema import RecetaCreate, RecetaDispensar
from datetime import datetime
from typing import Optional

def crear_receta(db: Session, payload: RecetaCreate):
    """
    Crea una nueva receta médica
    """
    receta = Receta(
        consulta_id=payload.consulta_id,
        medico_id=payload.medico_id,
        paciente_id=payload.paciente_id,
        medicamentos=payload.medicamentos,
        indicaciones=payload.indicaciones,
        estado="pendiente"
    )
    db.add(receta)
    db.commit()
    db.refresh(receta)
    return receta

def listar_recetas(db: Session, paciente_id: Optional[int] = None, estado: Optional[str] = None):
    """
    Lista recetas con filtros opcionales
    """
    query = db.query(Receta)
    
    if paciente_id:
        query = query.filter(Receta.paciente_id == paciente_id)
    
    if estado:
        query = query.filter(Receta.estado == estado)
    
    return query.order_by(Receta.fecha_emision.desc()).all()

def obtener_receta(db: Session, receta_id: int):
    """
    Obtiene una receta por ID
    """
    return db.query(Receta).filter(Receta.id == receta_id).first()

def dispensar_receta(db: Session, receta_id: int, farmaceutico_id: int, payload: RecetaDispensar):
    """
    Marca una receta como dispensada
    """
    receta = obtener_receta(db, receta_id)
    if not receta:
        return None
    
    receta.estado = payload.estado
    receta.dispensada_por = farmaceutico_id
    receta.fecha_dispensacion = datetime.utcnow()
    if payload.observaciones:
        receta.observaciones = payload.observaciones
    
    db.commit()
    db.refresh(receta)
    return receta

def cancelar_receta(db: Session, receta_id: int, observaciones: Optional[str] = None):
    """
    Cancela una receta
    """
    receta = obtener_receta(db, receta_id)
    if not receta:
        return None
    
    receta.estado = "cancelada"
    if observaciones:
        receta.observaciones = observaciones
    
    db.commit()
    db.refresh(receta)
    return receta
