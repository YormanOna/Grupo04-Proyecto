from fastapi import HTTPException, status, Depends
from jose import jwt, JWTError
from app.core.config import settings
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Obtiene el usuario actual desde el token JWT
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        cargo = payload.get("cargo")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        return {"id": int(user_id), "cargo": cargo}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar las credenciales"
        )

def require_role(allowed_roles: list):
    """
    Decorador para verificar que el usuario tenga un rol permitido
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        if current_user["cargo"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"No tienes permisos. Se requiere uno de estos roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

# Funciones helper para roles específicos
def admin_only(current_user: dict = Depends(get_current_user)):
    """Solo administradores"""
    if current_user["cargo"] not in ["Administrador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador"
        )
    return current_user

def admin_or_medic(current_user: dict = Depends(get_current_user)):
    """Administradores o Médicos"""
    if current_user["cargo"] not in ["Administrador", "Medico"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador o Médico"
        )
    return current_user

def admin_or_nurse(current_user: dict = Depends(get_current_user)):
    """Administradores o Enfermeras"""
    if current_user["cargo"] not in ["Administrador", "Enfermera"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador o Enfermera"
        )
    return current_user

def admin_or_pharmacist(current_user: dict = Depends(get_current_user)):
    """Administradores o Farmacéuticos"""
    if current_user["cargo"] not in ["Administrador", "Farmaceutico"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de Administrador o Farmacéutico"
        )
    return current_user

def medical_staff(current_user: dict = Depends(get_current_user)):
    """Personal médico (Admin, Médico, Enfermera)"""
    if current_user["cargo"] not in ["Administrador", "Medico", "Enfermera"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere rol de personal médico"
        )
    return current_user
