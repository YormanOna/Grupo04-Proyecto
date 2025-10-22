from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import SessionLocal
from app.schemas.empleado_schema import EmpleadoCreate, EmpleadoOut, EmpleadoUpdate
from app.services.empleado_service import create_empleado, get_empleado, list_empleados, update_empleado, delete_empleado

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=EmpleadoOut)
def create(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    return create_empleado(db, payload)

@router.get("/", response_model=List[EmpleadoOut])
def all_empleados(db: Session = Depends(get_db)):
    return list_empleados(db)

@router.get("/{empleado_id}", response_model=EmpleadoOut)
def one(empleado_id: int, db: Session = Depends(get_db)):
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        raise HTTPException(404, "Empleado no encontrado")
    return empleado

@router.put("/{empleado_id}", response_model=EmpleadoOut)
def modify(empleado_id: int, payload: EmpleadoUpdate, db: Session = Depends(get_db)):
    return update_empleado(db, empleado_id, payload)

@router.delete("/{empleado_id}")
def remove(empleado_id: int, db: Session = Depends(get_db)):
    delete_empleado(db, empleado_id)
    return {"detail": "Eliminado"}
