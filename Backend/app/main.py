from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core import config, database
from app.core.init_data import initialize_default_data
from app.routes import (
    auth_routes, empleado_routes, paciente_routes, medico_routes,
    cita_routes, historia_routes, consulta_routes, farmacia_routes, medicamento_routes,
    asistencia_routes, receta_routes, websocket_routes, encuesta_routes, email_preview_routes,
    auditoria_routes, diagnostico_routes
)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Sistema Gestión Médica - API", 
        version="1.0.0",
        description="API REST para gestión de citas, consultas, historias clínicas y farmacia",
        docs_url="/docs",
        redoc_url="/redoc"
    )
    
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # cambiar a dominios en producción
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Ruta raíz de bienvenida
    @app.get("/", tags=["Sistema"])
    def root():
        return {
            "mensaje": "🏥 Bienvenido al Sistema de Gestión Médica",
            "version": "1.0.0",
            "documentacion": "/docs",
            "estado": "activo"
        }
    
    # Routers
    app.include_router(auth_routes.router, prefix="/auth", tags=["auth"])
    app.include_router(empleado_routes.router, prefix="/empleados", tags=["empleados"])
    app.include_router(paciente_routes.router, prefix="/pacientes", tags=["pacientes"])
    app.include_router(medico_routes.router, prefix="/medicos", tags=["medicos"])
    app.include_router(cita_routes.router, prefix="/citas", tags=["citas"])
    app.include_router(historia_routes.router, prefix="/historias", tags=["historias"])
    app.include_router(consulta_routes.router, prefix="/consultas", tags=["consultas"])
    app.include_router(farmacia_routes.router, prefix="/farmacia", tags=["farmacia"])
    app.include_router(medicamento_routes.router, prefix="/medicamentos", tags=["medicamentos"])
    app.include_router(asistencia_routes.router, prefix="/asistencias", tags=["asistencias"])
    app.include_router(receta_routes.router, prefix="/recetas", tags=["recetas"])
    app.include_router(encuesta_routes.router, prefix="/encuestas", tags=["encuestas"])
    app.include_router(auditoria_routes.router, prefix="/auditoria", tags=["auditoria"])
    app.include_router(diagnostico_routes.router, tags=["diagnosticos"])
    app.include_router(websocket_routes.router, tags=["websocket"])
    app.include_router(email_preview_routes.router, prefix="/api", tags=["desarrollo"])

    @app.on_event("startup")
    def startup():
        print("🚀 Iniciando Sistema de Gestión Médica...")
        database.init_db()
        print("📊 Inicializando datos por defecto...")
        initialize_default_data()
        print("✅ Sistema listo!")

    return app

app = create_app()
