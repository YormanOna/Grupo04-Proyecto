from sqlalchemy.orm import Session
from app.models.cita import Cita
from app.schemas.cita_schema import CitaCreate, CitaUpdate
import asyncio

def create_cita(db: Session, payload: CitaCreate):
    c = Cita(
        fecha=payload.fecha, 
        paciente_id=payload.paciente_id, 
        medico_id=payload.medico_id,
        encargado_id=payload.encargado_id,
        motivo=payload.motivo,
        estado=payload.estado
    )
    db.add(c)
    db.commit()
    db.refresh(c)
    
    # Notificar via WebSocket (si está disponible)
    try:
        from app.core.websocket import notificar_cita_actualizada
        asyncio.create_task(
            notificar_cita_actualizada(
                c.id, 
                c.paciente_id, 
                c.estado, 
                f"Cita agendada para {c.fecha.strftime('%d/%m/%Y %H:%M')}"
            )
        )
    except Exception as e:
        print(f"No se pudo enviar notificación WebSocket: {e}")
    
    return c

def list_citas(db: Session, medico_id: int = None):
    """
    Lista citas. Si se proporciona medico_id, solo devuelve citas de ese médico.
    """
    if medico_id:
        return db.query(Cita).filter(Cita.medico_id == medico_id).all()
    return db.query(Cita).all()

def get_cita(db: Session, cita_id: int):
    return db.query(Cita).filter(Cita.id == cita_id).first()

def update_cita(db: Session, cita_id: int, payload: CitaUpdate):
    cita = get_cita(db, cita_id)
    if not cita:
        return None
    
    # Guardar estado anterior
    estado_anterior = cita.estado
    
    # Actualizar solo los campos proporcionados
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(cita, field, value)
    
    db.commit()
    db.refresh(cita)
    
    # Notificar cambios vía WebSocket si cambió el estado
    if estado_anterior != cita.estado:
        try:
            from app.core.websocket import notificar_cita_actualizada
            mensajes = {
                "confirmada": "Su cita ha sido confirmada",
                "cancelada": "Su cita ha sido cancelada",
                "completada": "Su cita ha sido completada",
                "en_curso": "Su cita está en curso"
            }
            mensaje = mensajes.get(cita.estado, f"Estado actualizado a: {cita.estado}")
            
            asyncio.create_task(
                notificar_cita_actualizada(cita.id, cita.paciente_id, cita.estado, mensaje)
            )
        except Exception as e:
            print(f"No se pudo enviar notificación WebSocket: {e}")
    
    return cita

def delete_cita(db: Session, cita_id: int):
    cita = get_cita(db, cita_id)
    if not cita:
        return None
    db.delete(cita)
    db.commit()
    return True
