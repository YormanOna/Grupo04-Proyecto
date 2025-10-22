from sqlalchemy.orm import Session
from app.models.historia import Historia
from app.schemas.historia_schema import HistoriaCreate

def create_historia(db: Session, payload: HistoriaCreate):
    h = Historia(identificador=payload.identificador)
    db.add(h)
    db.commit()
    db.refresh(h)
    return h

def list_historias(db: Session):
    return db.query(Historia).all()

def get_historia(db: Session, historia_id: int):
    return db.query(Historia).filter(Historia.id == historia_id).first()
