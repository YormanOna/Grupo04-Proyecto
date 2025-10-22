from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.cita_schema import CitaCreate, CitaOut, CitaUpdate
from app.services.cita_service import create_cita, list_citas, get_cita, update_cita, delete_cita
from app.core.permissions import medical_staff, admin_only

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CitaOut)
def create(payload: CitaCreate, db: Session = Depends(get_db), current_user: dict = Depends(medical_staff)):
    """Crear cita - Requiere rol: Administrador, Médico o Enfermera"""
    return create_cita(db, payload)

@router.get("/", response_model=List[CitaOut])
def all(db: Session = Depends(get_db), current_user: dict = Depends(medical_staff)):
    """Listar todas las citas - Requiere rol: Administrador, Médico o Enfermera"""
    return list_citas(db)

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.cita_schema import CitaCreate, CitaOut, CitaUpdate
from app.services.cita_service import create_cita, get_cita, list_citas, update_cita, delete_cita
from app.core.permissions import get_current_user, admin_only
from app.models.medico import Medico

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=CitaOut)
def create(payload: CitaCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Crear cita - Requiere autenticación"""
    return create_cita(db, payload)

@router.get("/", response_model=List[CitaOut])
def all(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Listar citas - Admin ve todas, médicos solo sus citas"""
    medico_id = None
    
    # Si es médico, obtener su medico_id
    if current_user["cargo"] == "Medico":
        medico = db.query(Medico).filter(Medico.empleado_id == current_user["id"]).first()
        if medico:
            medico_id = medico.id
    
    return list_citas(db, medico_id)

@router.get("/{cita_id}", response_model=CitaOut)
def one(cita_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Obtener una cita - Requiere autenticación"""
    cita = get_cita(db, cita_id)
    if not cita:
        raise HTTPException(404, "Cita no encontrada")
    return cita

@router.put("/{cita_id}", response_model=CitaOut)
def update(cita_id: int, payload: CitaUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Actualizar cita - Requiere autenticación"""
    cita = update_cita(db, cita_id, payload)
    if not cita:
        raise HTTPException(404, "Cita no encontrada")
    return cita

@router.delete("/{cita_id}")
def remove(cita_id: int, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    """Eliminar cita - Solo administradores"""
    result = delete_cita(db, cita_id)
    if not result:
        raise HTTPException(404, "Cita no encontrada")
    return {"detail": "Cita eliminada exitosamente"}

@router.put("/{cita_id}", response_model=CitaOut)
def update(cita_id: int, payload: CitaUpdate, db: Session = Depends(get_db), current_user: dict = Depends(medical_staff)):
    """Actualizar cita - Requiere rol: Administrador, Médico o Enfermera"""
    cita = update_cita(db, cita_id, payload)
    if not cita:
        raise HTTPException(404, "Cita no encontrada")
    return cita

@router.delete("/{cita_id}")
def remove(cita_id: int, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    """Eliminar cita - Requiere rol: Administrador únicamente"""
    result = delete_cita(db, cita_id)
    if not result:
        raise HTTPException(404, "Cita no encontrada")
    return {"detail": "Cita eliminada exitosamente"}
