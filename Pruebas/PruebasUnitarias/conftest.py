"""
Configuración global de pytest para todas las pruebas unitarias
Fixtures compartidos y configuración de la base de datos de prueba
"""
import pytest
import sys
import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

# Cargar variables de entorno ANTES de importar módulos del Backend
# Esto evita errores de validación de pydantic
env_path = Path(__file__).parent / ".env"
load_dotenv(env_path)

# Agregar el directorio Backend al path para importar módulos
# Path actual: Pruebas/PruebasUnitarias/conftest.py
# Backend está en: ../../Backend (dos niveles arriba, luego Backend)
backend_path = Path(__file__).parent.parent.parent / "Backend"
sys.path.insert(0, str(backend_path))

# Importar Base primero
from app.core.database import Base

# Importar TODOS los modelos para que SQLAlchemy pueda resolver las relaciones
# Esto es necesario porque los modelos tienen relationships entre sí
from app.models.paciente import Paciente
from app.models.historia import Historia
from app.models.empleado import Empleado
from app.models.medico import Medico
from app.models.cita import Cita
from app.models.consulta import Consulta
from app.models.medicamento import Medicamento
from app.models.receta import Receta
from app.models.farmacia import Farmacia
from app.models.lote import Lote
from app.models.asistencia import Asistencia
from app.models.auditoria import Auditoria
from app.models.signos_vitales import SignosVitales
from app.models.diagnostico_cie10 import DiagnosticoCIE10


@pytest.fixture(scope="function")
def db_session():
    """
    Fixture que proporciona una sesión de base de datos en memoria para pruebas.
    Se crea una nueva base de datos para cada prueba y se elimina al finalizar.
    """
    # Crear motor de base de datos en memoria (SQLite)
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    
    # Crear sesión
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        # Limpiar todas las tablas después de cada prueba
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def paciente_data_valido():
    """
    Fixture con datos válidos de un paciente para usar en las pruebas
    Basado en el caso de uso: Registro exitoso con datos completos
    """
    return {
        "nombre": "Juan",
        "apellido": "Pérez García",
        "cedula": 1713175071,  # Cédula ecuatoriana válida (Pichincha)
        "email": "juan.perez@email.com",
        "telefono": "0987654321",
        "direccion": "Av. Principal 123",
        "fecha_nacimiento": "1990-05-15",
        "genero": "Masculino",
        "grupo_sanguineo": "O+",
        "alergias": "Penicilina",
        "antecedentes_medicos": None,
        "contacto_emergencia_nombre": "María Pérez",
        "contacto_emergencia_telefono": "0998765432",
        "contacto_emergencia_relacion": "Hermana",
        "tipo_seguro": "IESS",
        "aseguradora": None,
        "numero_poliza": None,
        "fecha_vigencia_poliza": None
    }


@pytest.fixture(scope="function")
def cedulas_validas():
    """
    Fixture con lista de cédulas ecuatorianas válidas para pruebas
    Generadas con el algoritmo de validación ecuatoriano
    """
    return [
        1713175071,  # Pichincha - Juan Pérez
        923456783,   # Guayas - Ana Torres (caso obligatorios)
        1122334451,  # Loja - Carlos Ruiz (caso duplicado)
        5544332218,  # Manabí - Laura Mendoza (caso email duplicado)
    ]


@pytest.fixture(scope="function")
def cedulas_invalidas():
    """
    Fixture con lista de cédulas ecuatorianas inválidas para pruebas
    """
    return [
        1234567890,  # Dígito verificador incorrecto
        9999999999,  # Provincia inexistente (99)
        1713175070,  # Dígito verificador incorrecto
        123456789,   # Muy corta (9 dígitos)
        17131750711, # Muy larga (11 dígitos)
    ]


@pytest.fixture(scope="function")
def casos_prueba_datos():
    """
    Fixture con todos los casos de prueba específicos del usuario
    """
    return {
        "registro_completo": {
            "nombre": "Juan",
            "apellido": "Pérez García",
            "cedula": 1713175071,
            "email": "juan.perez@email.com",
            "telefono": "0987654321",
            "direccion": "Av. Principal 123",
            "fecha_nacimiento": "1990-05-15",
            "genero": "Masculino",
            "grupo_sanguineo": "O+",
            "alergias": "Penicilina",
            "tipo_seguro": "IESS",
            "contacto_emergencia_nombre": "María Pérez",
            "contacto_emergencia_telefono": "0998765432",
            "contacto_emergencia_relacion": "Hermana"
        },
        "registro_obligatorios": {
            "nombre": "Ana",
            "apellido": "Torres",
            "cedula": 923456783,  # Cédula válida Guayas
            "fecha_nacimiento": "1995-03-20",
            "genero": "Femenino"
        },
        "duplicado_cedula_1": {
            "nombre": "Carlos",
            "apellido": "Ruiz",
            "cedula": 1122334451,  # Cédula válida Loja
            "fecha_nacimiento": "1988-07-10",
            "genero": "Masculino"
        },
        "duplicado_cedula_2": {
            "nombre": "Pedro",
            "apellido": "Gómez",
            "cedula": 1122334451,  # MISMA CÉDULA (duplicada)
            "fecha_nacimiento": "1992-11-25",
            "genero": "Masculino"
        },
        "duplicado_email_1": {
            "nombre": "Laura",
            "apellido": "Mendoza",
            "cedula": 5544332218,  # Cédula válida Manabí
            "email": "test@hospital.com",
            "fecha_nacimiento": "1991-02-14",
            "genero": "Femenino"
        },
        "duplicado_email_2": {
            "nombre": "Miguel",
            "apellido": "Castro",
            "cedula": 6655443329,  # Cédula válida diferente
            "email": "test@hospital.com",  # MISMO EMAIL (duplicado)
            "fecha_nacimiento": "1989-09-03",
            "genero": "Masculino"
        },
        "email_invalido": {
            "nombre": "Sofía",
            "apellido": "Jiménez",
            "cedula": 7788990010,  # Cédula válida
            "email": "correo_invalido_sin_arroba.com",  # SIN @
            "fecha_nacimiento": "1993-12-08",
            "genero": "Femenino"
        }
    }
