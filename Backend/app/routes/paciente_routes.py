from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.paciente_schema import PacienteCreate, PacienteOut, PacienteUpdate
from app.services.paciente_service import create_paciente, get_paciente, list_pacientes, delete_paciente, update_paciente
from app.core.permissions import get_current_user, admin_only
from app.models.medico import Medico

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=PacienteOut)
def create(payload: PacienteCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Crear paciente - Requiere autenticación"""
    return create_paciente(db, payload)

@router.get("/", response_model=List[PacienteOut])
def all(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Listar pacientes - Admin ve todos, médicos solo sus pacientes"""
    medico_id = None
    
    # Si es médico, obtener su medico_id
    if current_user["cargo"] == "Medico":
        medico = db.query(Medico).filter(Medico.empleado_id == current_user["id"]).first()
        if medico:
            medico_id = medico.id
    
    return list_pacientes(db, medico_id)

@router.get("/{paciente_id}", response_model=PacienteOut)
def one(paciente_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Obtener un paciente - Requiere autenticación"""
    paciente = get_paciente(db, paciente_id)
    if not paciente:
        raise HTTPException(404, "Paciente no encontrado")
    return paciente

@router.put("/{paciente_id}", response_model=PacienteOut)
def update(paciente_id: int, payload: PacienteUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Actualizar paciente - Requiere autenticación"""
    paciente = update_paciente(db, paciente_id, payload)
    if not paciente:
        raise HTTPException(404, "Paciente no encontrado")
    return paciente

@router.delete("/{paciente_id}")
def remove(paciente_id: int, db: Session = Depends(get_db), current_user: dict = Depends(admin_only)):
    """Eliminar paciente - Solo administradores"""
    result = delete_paciente(db, paciente_id)
    if not result:
        raise HTTPException(404, "Paciente no encontrado")
    return {"detail": "Paciente eliminado exitosamente"}
