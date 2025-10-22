from sqlalchemy.orm import Session
from app.models.empleado import Empleado
from app.schemas.empleado_schema import EmpleadoCreate, EmpleadoUpdate
from app.core.security import get_password_hash, verify_password

def create_empleado(db: Session, payload: EmpleadoCreate):
    empleado = Empleado(
        nombre=payload.nombre,
        apellido=payload.apellido,
        cedula=payload.cedula,
        cargo=payload.cargo,
        email=payload.email,
        hashed_password=get_password_hash(payload.password)
    )
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def list_empleados(db: Session):
    return db.query(Empleado).all()

def get_empleado(db: Session, empleado_id: int):
    return db.query(Empleado).filter(Empleado.id == empleado_id).first()

def update_empleado(db: Session, empleado_id: int, payload: EmpleadoUpdate):
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        return None
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(empleado, field, value)
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def delete_empleado(db: Session, empleado_id: int):
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        return None
    db.delete(empleado)
    db.commit()
    return True

def authenticate_empleado(db: Session, email: str, password: str):
    if not email:
        return None
    empleado = db.query(Empleado).filter(Empleado.email == email).first()
    if not empleado:
        return None
    if not empleado.hashed_password:
        return None
    if not verify_password(password, empleado.hashed_password):
        return None
    return empleado
