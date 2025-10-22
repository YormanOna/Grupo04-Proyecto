from sqlalchemy.orm import Session
from app.models.paciente import Paciente
from app.schemas.paciente_schema import PacienteCreate, PacienteUpdate

def create_paciente(db: Session, payload: PacienteCreate):
    p = Paciente(
        nombre=payload.nombre, 
        apellido=payload.apellido, 
        cedula=payload.cedula,
        email=payload.email,
        telefono=payload.telefono,
        direccion=payload.direccion
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def list_pacientes(db: Session, medico_id: int = None):
    """
    Lista pacientes. Si se proporciona medico_id, solo devuelve pacientes de ese médico.
    """
    if medico_id:
        # Obtener pacientes que tienen citas con este médico
        from app.models.cita import Cita
        pacientes_ids = db.query(Cita.paciente_id).filter(Cita.medico_id == medico_id).distinct().all()
        pacientes_ids = [pid[0] for pid in pacientes_ids]
        return db.query(Paciente).filter(Paciente.id.in_(pacientes_ids)).all()
    return db.query(Paciente).all()

def get_paciente(db: Session, paciente_id: int):
    return db.query(Paciente).filter(Paciente.id == paciente_id).first()

def update_paciente(db: Session, paciente_id: int, payload: PacienteUpdate):
    paciente = get_paciente(db, paciente_id)
    if not paciente:
        return None
    
    # Actualizar solo los campos proporcionados
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(paciente, field, value)
    
    db.commit()
    db.refresh(paciente)
    return paciente

def delete_paciente(db: Session, paciente_id: int):
    p = get_paciente(db, paciente_id)
    if not p:
        return None
    db.delete(p)
    db.commit()
    return True
