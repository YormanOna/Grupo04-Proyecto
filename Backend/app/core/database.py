from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.exc import OperationalError
from app.core.config import settings

DATABASE_URL = (
    f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}"
    f"@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
)

# Engine & session (sync)
engine = create_engine(DATABASE_URL, pool_pre_ping=True, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    # Import models here so they are registered with Base.metadata
    from app.models import empleado, paciente, medico, cita, historia, consulta, farmacia, medicamento, signos_vitales, asistencia, receta, encuesta
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created or already exist.")
    except OperationalError as e:
        print("Error creando tablas:", e)
