from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.empleado_schema import EmpleadoCreate, EmpleadoOut, LoginRequest
from app.services.empleado_service import create_empleado, authenticate_empleado
from app.core.security import create_access_token

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register", response_model=EmpleadoOut)
def register(payload: EmpleadoCreate, db: Session = Depends(get_db)):
    empleado = create_empleado(db, payload)
    return empleado

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    empleado = authenticate_empleado(db, payload.email, payload.password)
    if not empleado:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales no válidas")
    token = create_access_token({"sub": str(empleado.id), "cargo": empleado.cargo})
    return {"access_token": token, "token_type": "bearer", "user": EmpleadoOut.from_orm(empleado)}
