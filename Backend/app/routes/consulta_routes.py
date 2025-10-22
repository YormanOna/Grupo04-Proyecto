from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import SessionLocal
from app.schemas.consulta_schema import ConsultaCreate, ConsultaOut, ConsultaUpdate
from app.services.consulta_service import create_consulta, list_consultas, get_consulta, update_consulta

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ConsultaOut)
def create(payload: ConsultaCreate, db: Session = Depends(get_db)):
    return create_consulta(db, payload)

@router.get("/", response_model=List[ConsultaOut])
def all(
    paciente_id: Optional[int] = Query(None),
    medico_id: Optional[int] = Query(None),
    fecha_desde: Optional[str] = Query(None),
    fecha_hasta: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    return list_consultas(db, paciente_id, medico_id, fecha_desde, fecha_hasta)

@router.get("/{consulta_id}", response_model=ConsultaOut)
def one(consulta_id: int, db: Session = Depends(get_db)):
    c = get_consulta(db, consulta_id)
    if not c:
        raise HTTPException(404, "Consulta no encontrada")
    return c

@router.put("/{consulta_id}", response_model=ConsultaOut)
def update(consulta_id: int, payload: ConsultaUpdate, db: Session = Depends(get_db)):
    c = update_consulta(db, consulta_id, payload)
    if not c:
        raise HTTPException(404, "Consulta no encontrada")
    return c
