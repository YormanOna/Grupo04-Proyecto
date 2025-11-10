from sqlalchemy.orm import Session
from app.models.empleado import Empleado, EstadoEmpleado
from app.schemas.empleado_schema import EmpleadoCreate, EmpleadoUpdate
from app.core.security import get_password_hash, verify_password

def create_empleado(db: Session, payload: EmpleadoCreate):
    empleado = Empleado(
        nombre=payload.nombre,
        apellido=payload.apellido,
        cedula=payload.cedula,
        cargo=payload.cargo,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        activo=payload.activo if hasattr(payload, 'activo') else True,  # Por defecto activo (no eliminado)
        estado=payload.estado if hasattr(payload, 'estado') else EstadoEmpleado.ACTIVO  # Por defecto activo para login
    )
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def list_empleados(db: Session):
    """Listar solo empleados activos (no eliminados)"""
    return db.query(Empleado).filter(Empleado.activo == True).all()

def get_empleado(db: Session, empleado_id: int):
    """Obtener empleado activo por ID"""
    return db.query(Empleado).filter(
        Empleado.id == empleado_id,
        Empleado.activo == True
    ).first()

def update_empleado(db: Session, empleado_id: int, payload: EmpleadoUpdate):
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        return None
    
    # Actualizar campos del payload
    for field, value in payload.dict(exclude_unset=True).items():
        # Hashear password si se está actualizando
        if field == 'password' and value is not None:
            empleado.hashed_password = get_password_hash(value)
        # Manejar el campo estado que es un Enum
        elif field == 'estado' and value is not None:
            if isinstance(value, str):
                # Convertir string a Enum
                setattr(empleado, field, EstadoEmpleado(value))
            else:
                setattr(empleado, field, value)
        else:
            setattr(empleado, field, value)
    
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def delete_empleado(db: Session, empleado_id: int):
    """Borrado lógico de empleado"""
    empleado = get_empleado(db, empleado_id)
    if not empleado:
        return None
    # Borrado lógico en lugar de físico
    empleado.soft_delete()
    db.commit()
    return True

def authenticate_empleado(db: Session, email: str, password: str):
    """
    Autenticar empleados.
    Validaciones:
    1. activo = True (no está eliminado lógicamente)
    2. estado = 'Activo' (tiene permiso de acceso)
    """
    if not email:
        return None
    
    empleado = db.query(Empleado).filter(
        Empleado.email == email,
        Empleado.activo == True,  # No eliminado
        Empleado.estado == EstadoEmpleado.ACTIVO  # Estado activo para login
    ).first()
    
    if not empleado:
        return None
    if not empleado.hashed_password:
        return None
    if not verify_password(password, empleado.hashed_password):
        return None
    return empleado
