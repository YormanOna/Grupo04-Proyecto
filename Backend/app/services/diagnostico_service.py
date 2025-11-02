from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.diagnostico_cie10 import DiagnosticoCIE10

class DiagnosticoService:
    @staticmethod
    def buscar_diagnosticos(db: Session, query: str, limit: int = 20):
        """
        Busca diagnósticos CIE-10 por código o descripción
        """
        if not query or len(query) < 2:
            return []
        
        search_pattern = f"%{query}%"
        
        diagnosticos = db.query(DiagnosticoCIE10).filter(
            or_(
                DiagnosticoCIE10.codigo.ilike(search_pattern),
                DiagnosticoCIE10.descripcion.ilike(search_pattern)
            )
        ).limit(limit).all()
        
        return diagnosticos
    
    @staticmethod
    def obtener_por_codigo(db: Session, codigo: str):
        """
        Obtiene un diagnóstico específico por su código CIE-10
        """
        return db.query(DiagnosticoCIE10).filter(
            DiagnosticoCIE10.codigo == codigo
        ).first()
