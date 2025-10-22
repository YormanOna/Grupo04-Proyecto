from sqlalchemy.orm import Session
from sqlalchemy import JSON
from typing import Optional
from datetime import datetime
from app.models.consulta import Consulta
from app.models.cita import Cita
from app.models.historia import Historia
from app.schemas.consulta_schema import ConsultaCreate, ConsultaUpdate
import json

def create_consulta(db: Session, payload: ConsultaCreate):
    # Obtener cita para extraer paciente_id e historia_id
    historia_id = payload.historia_id
    paciente_id = None
    
    if payload.cita_id:
        cita = db.query(Cita).filter(Cita.id == payload.cita_id).first()
        if cita:
            paciente_id = cita.paciente_id
            # Buscar o crear historia clínica
            historia = db.query(Historia).filter(Historia.paciente_id == paciente_id).first()
            if not historia:
                historia = Historia(paciente_id=paciente_id)
                db.add(historia)
                db.flush()
            historia_id = historia.id
    
    # Convertir signos_vitales dict a JSON
    signos_vitales_json = None
    if payload.signos_vitales:
        signos_vitales_json = payload.signos_vitales

    consulta = Consulta(
        cita_id=payload.cita_id,
        historia_id=historia_id,
        paciente_id=paciente_id,
        medico_id=payload.medico_id,
        motivo_consulta=payload.motivo_consulta,
        enfermedad_actual=payload.enfermedad_actual,
        examen_fisico=payload.examen_fisico,
        diagnostico=payload.diagnostico,
        diagnosticos_secundarios=payload.diagnosticos_secundarios,
        tratamiento=payload.tratamiento,
        indicaciones=payload.indicaciones,
        examenes_solicitados=payload.examenes_solicitados,
        pronostico=payload.pronostico,
        observaciones=payload.observaciones,
        signos_vitales=signos_vitales_json
    )
    db.add(consulta)
    db.commit()
    db.refresh(consulta)
    return consulta

def list_consultas(
    db: Session, 
    paciente_id: Optional[int] = None,
    medico_id: Optional[int] = None,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None
):
    query = db.query(Consulta)
    
    if paciente_id:
        query = query.filter(Consulta.paciente_id == paciente_id)
    if medico_id:
        query = query.filter(Consulta.medico_id == medico_id)
    if fecha_desde:
        query = query.filter(Consulta.fecha_consulta >= fecha_desde)
    if fecha_hasta:
        query = query.filter(Consulta.fecha_consulta <= fecha_hasta)
    
    return query.all()

def get_consulta(db: Session, consulta_id: int):
    return db.query(Consulta).filter(Consulta.id == consulta_id).first()

def update_consulta(db: Session, consulta_id: int, payload: ConsultaUpdate):
    consulta = db.query(Consulta).filter(Consulta.id == consulta_id).first()
    if not consulta:
        return None
    
    update_data = payload.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(consulta, field, value)
    
    db.commit()
    db.refresh(consulta)
    return consulta
