from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scalar_fastapi import get_scalar_api_reference

from app.core import config, database
from app.core.init_data import initialize_default_data
from app.routes import (
    auth_routes, empleado_routes, paciente_routes, medico_routes,
    cita_routes, historia_routes, consulta_routes, farmacia_routes, medicamento_routes,
    asistencia_routes, receta_routes, websocket_routes, encuesta_routes, email_preview_routes,
    auditoria_routes, diagnostico_routes, lote_routes, notificacion_routes
)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Sistema Gestión Médica - API", 
        version="1.0.0",
        description="API REST para gestión de citas, consultas, historias clínicas y farmacia",
        docs_url="/docs",
        redoc_url="/redoc"
        # openapi_url="/openapi.json" es el valor por defecto, no es necesario ponerlo
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
            "documentacion": {
                "swagger": "/docs",
                "redoc": "/redoc",
                "scalar": "/scalar"
            },
            "estado": "activo"
        }
    
    # Ruta para Scalar API Reference - Configuración avanzada
    @app.get("/scalar", include_in_schema=False)
    async def scalar_html():
        from scalar_fastapi import Theme, Layout, SearchHotKey
        return get_scalar_api_reference(
            openapi_url=app.openapi_url,
            title=app.title,
            # Tema y diseño
            theme=Theme.PURPLE,  # Tema morado (opciones: DEFAULT, ALTERNATE, MOON, PURPLE, SOLARIZED, BLUE_PLANET, SATURN, KEPLER, MARS, DEEP_SPACE)
            layout=Layout.MODERN,  # Diseño moderno con barra lateral
            dark_mode=True,  # Modo oscuro activado
            # Navegación y búsqueda
            show_sidebar=True,  # Mostrar barra lateral con todas las rutas
            search_hot_key=SearchHotKey.K,  # Atajo de búsqueda Ctrl+K / Cmd+K
            hide_search=False,  # Mostrar barra de búsqueda
            # Expansión de contenido
            default_open_all_tags=True,  # Abrir todos los grupos de rutas por defecto
            expand_all_model_sections=False,  # No expandir modelos por defecto
            expand_all_responses=False,  # No expandir respuestas por defecto
            # Modelos y visualización
            hide_models=False,  # Mostrar modelos de datos (schemas)
            hide_test_request_button=False,  # Mostrar botón "Test Request"
            hide_download_button=False,  # Mostrar botón de descarga
            hide_client_button=False,  # Mostrar botón de clientes HTTP
            # Servidores
            servers=[
                {
                    "url": "http://localhost:8000",
                    "description": "Servidor de Desarrollo"
                }
            ],
            # Autenticación
            authentication={
                "preferredSecurityScheme": "bearerAuth"
            },
            persist_auth=True,  # Persistir autenticación en localStorage
            # Personalización visual
            custom_css="""
                /* Personalización adicional */
                .scalar-app {
                    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }
            """,
            with_default_fonts=True,  # Usar fuentes por defecto (Inter y JetBrains Mono)
            # Ordenamiento
            order_required_properties_first=True,  # Ordenar propiedades requeridas primero
        )
    
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
    app.include_router(lote_routes.router, tags=["lotes"])
    app.include_router(notificacion_routes.router, tags=["notificaciones"])
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
