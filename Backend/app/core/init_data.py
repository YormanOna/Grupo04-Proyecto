"""
Módulo para inicializar datos por defecto en la base de datos
Crea usuarios de prueba si no existen
"""
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import get_password_hash
from app.models.empleado import Empleado
from app.models.medico import Medico
from app.utils.logger import logger
from app.core.init_cie10 import inicializar_diagnosticos_cie10


def create_default_users(db: Session):
    """
    Crea usuarios por defecto si no existen en la base de datos
    """
    default_users = [
        # Usuarios del sistema base
        {
            "nombre": "Super",
            "apellido": "Admin",
            "cedula": 1111111111,
            "cargo": "Admin General",
            "email": "superadmin@hospital.com",
            "password": "superadmin123"
        },
        {
            "nombre": "Admin",
            "apellido": "Sistema",
            "cedula": 1234567890,
            "cargo": "Administrador",
            "email": "admin@hospital.com",
            "password": "admin123"
        },
        {
            "nombre": "Doctor",
            "apellido": "Principal",
            "cedula": 9876543210,
            "cargo": "Medico",
            "email": "medico@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Enfermera",
            "apellido": "Jefe",
            "cedula": 5555555555,
            "cargo": "Enfermera",
            "email": "enfermera@hospital.com",
            "password": "enfer123"
        },
        {
            "nombre": "Farmaceutico",
            "apellido": "Principal",
            "cedula": 7777777777,
            "cargo": "Farmaceutico",
            "email": "farmacia@hospital.com",
            "password": "farma123"
        },
        # Usuarios de datos de ejemplo (InsertDatos.sql)
        {
            "nombre": "Carlos",
            "apellido": "Méndez",
            "cedula": 1104567890,
            "cargo": "Medico",
            "email": "carlos.mendez@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "María",
            "apellido": "González",
            "cedula": 1104567891,
            "cargo": "Medico",
            "email": "maria.gonzalez@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Juan",
            "apellido": "Rodríguez",
            "cedula": 1104567892,
            "cargo": "Medico",
            "email": "juan.rodriguez@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Ana",
            "apellido": "Pérez",
            "cedula": 1104567893,
            "cargo": "Medico",
            "email": "ana.perez@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Luis",
            "apellido": "Torres",
            "cedula": 1104567894,
            "cargo": "Medico",
            "email": "luis.torres@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Carmen",
            "apellido": "Sánchez",
            "cedula": 1104567895,
            "cargo": "Farmaceutico",
            "email": "carmen.sanchez@hospital.com",
            "password": "farma123"
        },
        {
            "nombre": "Pedro",
            "apellido": "Ramírez",
            "cedula": 1104567896,
            "cargo": "Farmaceutico",
            "email": "pedro.ramirez@hospital.com",
            "password": "farma123"
        },
        {
            "nombre": "Sofia",
            "apellido": "Jiménez",
            "cedula": 1104567897,
            "cargo": "Enfermera",
            "email": "sofia.jimenez@hospital.com",
            "password": "enfer123"
        },
        {
            "nombre": "Miguel",
            "apellido": "Castro",
            "cedula": 1104567898,
            "cargo": "Enfermera",
            "email": "miguel.castro@hospital.com",
            "password": "enfer123"
        },
        {
            "nombre": "Laura",
            "apellido": "Morales",
            "cedula": 1104567899,
            "cargo": "Administrador",
            "email": "laura.morales@hospital.com",
            "password": "admin123"
        },
        {
            "nombre": "Diego",
            "apellido": "Vargas",
            "cedula": 1104567900,
            "cargo": "Administrador",
            "email": "diego.vargas@hospital.com",
            "password": "admin123"
        },
        {
            "nombre": "Patricia",
            "apellido": "Herrera",
            "cedula": 1104567901,
            "cargo": "Admin General",
            "email": "patricia.herrera@hospital.com",
            "password": "superadmin123"
        },
        {
            "nombre": "Roberto",
            "apellido": "Díaz",
            "cedula": 1104567902,
            "cargo": "Medico",
            "email": "roberto.diaz@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Valeria",
            "apellido": "Ruiz",
            "cedula": 1104567903,
            "cargo": "Medico",
            "email": "valeria.ruiz@hospital.com",
            "password": "medico123"
        },
        {
            "nombre": "Fernando",
            "apellido": "Ortiz",
            "cedula": 1104567904,
            "cargo": "Medico",
            "email": "fernando.ortiz@hospital.com",
            "password": "medico123"
        }
    ]
    
    created_count = 0
    
    for user_data in default_users:
        # Verificar si el empleado ya existe (por email o cédula)
        existing_user = db.query(Empleado).filter(
            (Empleado.email == user_data["email"]) | 
            (Empleado.cedula == user_data["cedula"])
        ).first()
        
        if not existing_user:
            # Crear el empleado con contraseña hasheada
            # Asegurar que la contraseña sea un string y no exceda 72 bytes
            password = str(user_data["password"])[:50]  # Limitar a 50 caracteres por seguridad
            
            new_employee = Empleado(
                nombre=user_data["nombre"],
                apellido=user_data["apellido"],
                cedula=user_data["cedula"],
                cargo=user_data["cargo"],
                email=user_data["email"],
                hashed_password=get_password_hash(password)
            )
            db.add(new_employee)
            db.flush()  # Para obtener el ID
            
            # Si es médico, crear también el registro en la tabla de médicos
            if user_data["cargo"] == "Medico":
                existing_medico = db.query(Medico).filter(
                    Medico.cedula == user_data["cedula"]
                ).first()
                
                if not existing_medico:
                    new_medico = Medico(
                        nombre=user_data["nombre"],
                        apellido=user_data["apellido"],
                        cedula=user_data["cedula"],
                        especialidad="Medicina General",
                        email=user_data["email"],
                        empleado_id=new_employee.id
                    )
                    db.add(new_medico)
            
            created_count += 1
            logger.info(f"✅ Usuario creado: {user_data['cargo']} - {user_data['email']}")
        else:
            logger.info(f"ℹ️  Usuario ya existe: {user_data['email']}")
    
    if created_count > 0:
        db.commit()
        logger.info(f"🎉 Se crearon {created_count} usuarios por defecto")
    else:
        logger.info("ℹ️  No se crearon usuarios nuevos, todos ya existen")


def initialize_default_data():
    """
    Función principal para inicializar datos por defecto
    """
    logger.info("🚀 Iniciando creación de datos por defecto...")
    
    db = SessionLocal()
    try:
        create_default_users(db)
        inicializar_diagnosticos_cie10(db)
        logger.info("✅ Inicialización de datos completada")
    except Exception as e:
        logger.error(f"❌ Error al inicializar datos: {str(e)}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    # Permite ejecutar este script directamente
    initialize_default_data()
