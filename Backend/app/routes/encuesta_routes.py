from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.encuesta_schema import EncuestaCreate, EncuestaOut
from app.services.encuesta_service import (
    crear_encuesta,
    listar_encuestas,
    obtener_encuesta,
    calcular_promedio_satisfaccion
)

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EncuestaOut)
def crear(payload: EncuestaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva encuesta de satisfacción
    """
    return crear_encuesta(db, payload)

@router.get("/", response_model=List[EncuestaOut])
def listar(paciente_id: int = None, db: Session = Depends(get_db)):
    """
    Lista todas las encuestas o filtra por paciente
    """
    return listar_encuestas(db, paciente_id)

@router.get("/promedio")
def promedio(db: Session = Depends(get_db)):
    """
    Calcula el promedio de satisfacción general
    """
    promedio_satisfaccion = calcular_promedio_satisfaccion(db)
    return {
        "promedio_satisfaccion": promedio_satisfaccion,
        "mensaje": f"Promedio de satisfacción: {promedio_satisfaccion}/5.0"
    }

@router.get("/{encuesta_id}", response_model=EncuestaOut)
def obtener(encuesta_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una encuesta por ID
    """
    encuesta = obtener_encuesta(db, encuesta_id)
    if not encuesta:
        raise HTTPException(404, "Encuesta no encontrada")
    return encuesta
