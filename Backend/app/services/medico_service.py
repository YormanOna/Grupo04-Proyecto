from sqlalchemy.orm import Session
from app.models.medico import Medico
from app.models.empleado import Empleado
from app.schemas.medico_schema import MedicoCreate, MedicoUpdate

def list_medicos(db: Session):
    """Listar todos los médicos del sistema"""
    return db.query(Medico).all()

def get_medico(db: Session, medico_id: int):
    """Obtener un médico por ID"""
    return db.query(Medico).filter(Medico.id == medico_id).first()

def get_medico_by_cedula(db: Session, cedula: int):
    """Obtener un médico por cédula"""
    return db.query(Medico).filter(Medico.cedula == cedula).first()

def create_medico(db: Session, medico_data: MedicoCreate):
    """Crear un nuevo médico"""
    # Verificar si ya existe un médico con esa cédula
    existing = get_medico_by_cedula(db, medico_data.cedula)
    if existing:
        raise ValueError("Ya existe un médico con esa cédula")
    
    medico = Medico(**medico_data.dict())
    db.add(medico)
    db.commit()
    db.refresh(medico)
    return medico

def update_medico(db: Session, medico_id: int, medico_data: MedicoUpdate):
    """Actualizar datos de un médico"""
    medico = get_medico(db, medico_id)
    if not medico:
        return None
    
    # Actualizar solo los campos proporcionados
    update_data = medico_data.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(medico, key, value)
    
    db.commit()
    db.refresh(medico)
    return medico

def delete_medico(db: Session, medico_id: int):
    """Eliminar un médico"""
    medico = get_medico(db, medico_id)
    if not medico:
        return False
    
    db.delete(medico)
    db.commit()
    return True

def list_medicos_empleados(db: Session):
    """Listar empleados que son médicos (basado en cargo)"""
    return db.query(Empleado).filter(Empleado.cargo.ilike("%medico%")).all()
