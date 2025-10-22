from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.historia_schema import HistoriaCreate, HistoriaOut
from app.services.historia_service import create_historia, list_historias, get_historia

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=HistoriaOut)
def create(payload: HistoriaCreate, db: Session = Depends(get_db)):
    return create_historia(db, payload)

@router.get("/", response_model=List[HistoriaOut])
def all(db: Session = Depends(get_db)):
    return list_historias(db)

@router.get("/{historia_id}", response_model=HistoriaOut)
def one(historia_id: int, db: Session = Depends(get_db)):
    h = get_historia(db, historia_id)
    if not h:
        raise HTTPException(404, "Historia no encontrada")
    return h
