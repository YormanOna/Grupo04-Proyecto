from sqlalchemy.orm import Session
from app.models.encuesta import EncuestaSatisfaccion
from app.schemas.encuesta_schema import EncuestaCreate
from typing import Optional

def crear_encuesta(db: Session, payload: EncuestaCreate):
    """
    Crea una nueva encuesta de satisfacción
    """
    encuesta = EncuestaSatisfaccion(
        paciente_id=payload.paciente_id,
        cita_id=payload.cita_id,
        calidad_atencion=payload.calidad_atencion,
        tiempo_espera=payload.tiempo_espera,
        trato_personal=payload.trato_personal,
        limpieza_instalaciones=payload.limpieza_instalaciones,
        satisfaccion_general=payload.satisfaccion_general,
        comentarios=payload.comentarios,
        sugerencias=payload.sugerencias,
        recomendaria=payload.recomendaria
    )
    db.add(encuesta)
    db.commit()
    db.refresh(encuesta)
    return encuesta

def listar_encuestas(db: Session, paciente_id: Optional[int] = None):
    """
    Lista encuestas con filtros opcionales
    """
    query = db.query(EncuestaSatisfaccion)
    
    if paciente_id:
        query = query.filter(EncuestaSatisfaccion.paciente_id == paciente_id)
    
    return query.order_by(EncuestaSatisfaccion.fecha.desc()).all()

def obtener_encuesta(db: Session, encuesta_id: int):
    """
    Obtiene una encuesta por ID
    """
    return db.query(EncuestaSatisfaccion).filter(EncuestaSatisfaccion.id == encuesta_id).first()

def calcular_promedio_satisfaccion(db: Session):
    """
    Calcula el promedio de satisfacción general
    """
    from sqlalchemy import func
    resultado = db.query(func.avg(EncuestaSatisfaccion.satisfaccion_general)).scalar()
    return round(resultado, 2) if resultado else 0
