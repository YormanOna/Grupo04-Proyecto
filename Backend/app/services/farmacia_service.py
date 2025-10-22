from sqlalchemy.orm import Session
from app.models.farmacia import Farmacia
from app.schemas.farmacia_schema import FarmaciaCreate

def create_farmacia(db: Session, payload: FarmaciaCreate):
    f = Farmacia(nombre=payload.nombre)
    db.add(f)
    db.commit()
    db.refresh(f)
    return f

def list_farmacias(db: Session):
    return db.query(Farmacia).all()

def get_farmacia(db: Session, farmacia_id: int):
    return db.query(Farmacia).filter(Farmacia.id == farmacia_id).first()
