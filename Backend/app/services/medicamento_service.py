from sqlalchemy.orm import Session
from app.models.medicamento import Medicamento
from app.models.farmacia import Farmacia
from app.schemas.medicamento_schema import MedicamentoCreate

def create_medicamento(db: Session, payload: MedicamentoCreate):
    # Si no se proporciona farmacia_id, intentar obtener la primera farmacia disponible
    farmacia_id = payload.farmacia_id
    if farmacia_id is None:
        primera_farmacia = db.query(Farmacia).first()
        if primera_farmacia:
            farmacia_id = primera_farmacia.id
    
    m = Medicamento(
        nombre=payload.nombre, 
        stock=payload.stock, 
        contenido=payload.contenido, 
        farmacia_id=farmacia_id
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

def list_medicamentos(db: Session):
    return db.query(Medicamento).all()

def get_medicamento(db: Session, med_id: int):
    return db.query(Medicamento).filter(Medicamento.id == med_id).first()
