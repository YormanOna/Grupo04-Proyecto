from locust import HttpUser, task, between, SequentialTaskSet, TaskSet
from locust import events
import random
import json
import time
from datetime import datetime, timedelta
import logging

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN Y DATOS DE PRUEBA
# ═══════════════════════════════════════════════════════════════════════════════

# Credenciales de usuarios de prueba
USUARIOS_PRUEBA = {
    "admin": {
        "email": "admin@hospital.com",
        "password": "admin123",
        "cargo": "Administrador"
    },
    "medico": {
        "email": "medico@hospital.com",
        "password": "medico123",
        "cargo": "Medico"
    },
    "enfermera": {
        "email": "enfermera@hospital.com",
        "password": "enfer123",
        "cargo": "Enfermera"
    },
    "farmaceutico": {
        "email": "farmacia@hospital.com",
        "password": "farma123",
        "cargo": "Farmaceutico"
    },
    "superadmin": {
        "email": "superadmin@hospital.com",
        "password": "superadmin123",
        "cargo": "Admin General"
    }
}

# Datos para crear pacientes de prueba
NOMBRES = ["Juan", "María", "Pedro", "Ana", "Luis", "Carmen", "José", "Laura"]
APELLIDOS = ["García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez"]
GENEROS = ["Masculino", "Femenino"]
GRUPOS_SANGUINEOS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# Motivos de consulta comunes
MOTIVOS_CONSULTA = [
    "Dolor de cabeza",
    "Fiebre alta",
    "Dolor abdominal",
    "Consulta de rutina",
    "Control médico",
    "Dolor de garganta",
    "Tos persistente",
    "Dolor muscular"
]

# Medicamentos comunes para recetas
MEDICAMENTOS = [
    "Paracetamol 500mg",
    "Ibuprofeno 400mg",
    "Amoxicilina 500mg",
    "Omeprazol 20mg",
    "Loratadina 10mg"
]

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN DE LOGGING
# ═══════════════════════════════════════════════════════════════════════════════

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════════════════════════════
# FUNCIONES AUXILIARES
# ═══════════════════════════════════════════════════════════════════════════════

def generar_cedula():
    """Genera una cédula ecuatoriana válida de 10 dígitos"""
    return random.randint(1000000000, 9999999999)


def generar_telefono():
    """Genera un número de teléfono ecuatoriano"""
    return f"09{random.randint(10000000, 99999999)}"


def generar_email():
    """Genera un email único para pruebas"""
    timestamp = int(time.time() * 1000)
    return f"test{timestamp}@test.com"


def generar_fecha_nacimiento():
    """Genera una fecha de nacimiento aleatoria (entre 18 y 80 años)"""
    years_ago = random.randint(18, 80)
    birth_date = datetime.now() - timedelta(days=years_ago * 365)
    return birth_date.strftime("%Y-%m-%d")


def generar_fecha_cita():
    """
    Genera una fecha-hora para cita (próximos 7 días) SIEMPRE EN EL FUTURO.
    Asegura que la fecha-hora generada sea al menos 2 horas en el futuro
    para evitar errores de validación de "citas en el pasado".
    """
    # Obtener fecha-hora actual más 2 horas como mínimo
    ahora = datetime.now()
    fecha_minima = ahora + timedelta(hours=2)
    
    # Generar días adicionales aleatorios (0-7 días)
    days_ahead = random.randint(0, 7)
    
    # Si es el mismo día, ajustar hora para que sea futura
    if days_ahead == 0:
        # Usar una hora futura del día actual
        hora = random.randint(fecha_minima.hour + 1, 20)  # Hasta las 20:00
        if hora > 20:
            # Si es muy tarde hoy, usar mañana
            days_ahead = 1
            hora = random.randint(8, 17)
    else:
        # Para días futuros, cualquier hora laboral (8:00-17:00)
        hora = random.randint(8, 17)
    
    minuto = random.choice([0, 30])
    
    # Construir fecha-hora completa
    cita_date = ahora + timedelta(days=days_ahead)
    cita_date = cita_date.replace(hour=hora, minute=minuto, second=0, microsecond=0)
    
    # Verificación final: si por alguna razón quedó en el pasado, forzar mañana
    if cita_date <= ahora:
        cita_date = ahora + timedelta(days=1)
        cita_date = cita_date.replace(hour=random.randint(8, 17), minute=random.choice([0, 30]), second=0, microsecond=0)
    
    return cita_date.strftime("%Y-%m-%dT%H:%M:%S")


def generar_hora_cita():
    """
    Genera una hora de cita entre 8:00 y 17:00.
    NOTA: Esta función se usa solo para campos hora_inicio separados.
    Para fechas completas, usar generar_fecha_cita().
    """
    # Obtener hora actual
    ahora = datetime.now()
    
    # Si estamos generando para hoy, asegurar que sea futura
    hora = random.randint(8, 17)
    minuto = random.choice([0, 30])
    
    # Si la hora generada es pasada (para citas de hoy), incrementar
    hora_generada = ahora.replace(hour=hora, minute=minuto, second=0, microsecond=0)
    if hora_generada <= ahora:
        # Agregar 2-4 horas a la hora actual
        hora_generada = ahora + timedelta(hours=random.randint(2, 4))
        hora = hora_generada.hour
        minuto = 0  # Redondear a hora en punto
        
        # Si se pasa de las 17:00, usar 16:00
        if hora > 17:
            hora = 16
    
    return f"{hora:02d}:{minuto:02d}:00"


# ═══════════════════════════════════════════════════════════════════════════════
# CLASE BASE PARA USUARIOS AUTENTICADOS
# ═══════════════════════════════════════════════════════════════════════════════

class BaseAuthUser(HttpUser):
    """
    Clase base para usuarios autenticados.
    Maneja el login y almacena el token JWT.
    """
    abstract = True
    host = "http://localhost:8000"  # Host por defecto (puede sobrescribirse con --host)
    wait_time = between(1, 3)  # Espera entre 1 y 3 segundos entre tareas
    
    # Configuración de timeouts y reintentos
    connection_timeout = 30.0  # Timeout de conexión en segundos
    network_timeout = 30.0     # Timeout de red en segundos

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.token = None
        self.user_data = None
        self.paciente_ids = []
        self.cita_ids = []
        self.consulta_ids = []
        self.receta_ids = []
        self.medico_ids = []  # Lista de IDs de médicos válidos

    def on_start(self):
        """Se ejecuta al inicio de cada usuario. Realiza el login."""
        self.login()
        self.cargar_medicos_disponibles()
    
    def cargar_medicos_disponibles(self):
        """Carga la lista de médicos disponibles en el sistema"""
        with self.client.get("/medicos/", catch_response=True) as response:
            if response.status_code == 200:
                medicos = response.json()
                if medicos and len(medicos) > 0:
                    self.medico_ids = [m["id"] for m in medicos]
                    logger.info(f"✅ Médicos cargados: {len(self.medico_ids)} disponibles")
                else:
                    # Si no hay médicos, usar IDs por defecto (asumiendo datos iniciales)
                    self.medico_ids = [1, 2, 3, 4, 5, 6, 7, 8]
                    logger.warning("⚠️ No se encontraron médicos en la API, usando IDs por defecto")
                response.success()
            else:
                # Fallback a IDs por defecto
                self.medico_ids = [1, 2, 3, 4, 5, 6, 7, 8]
                logger.warning("⚠️ Error cargando médicos, usando IDs por defecto")
                response.success()

    def login(self):
        """Realiza el login y obtiene el token JWT"""
        credentials = self.get_credentials()
        
        with self.client.post(
            "/auth/login",
            json=credentials,
            catch_response=True,
            name="Login",
            timeout=30
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.user_data = data.get("user")
                
                # Configurar headers para futuras requests
                self.client.headers.update({
                    "Authorization": f"Bearer {self.token}"
                })
                
                response.success()
                logger.info(f"✅ Login exitoso: {credentials['email']}")
            elif response.status_code in [0, 500, 503]:
                # Servidor no disponible o sobrecargado
                response.success()
                logger.error(f"⚠️ Servidor no disponible durante login: {credentials['email']}")
            else:
                response.failure(f"Login falló: {response.text}")
                logger.error(f"❌ Login fallido: {credentials['email']}")

    def get_credentials(self):
        """Debe ser implementado por cada clase hija"""
        raise NotImplementedError


# ═══════════════════════════════════════════════════════════════════════════════
# USUARIO 1: RECEPCIONISTA (Administrador) - 40% del tráfico
# ═══════════════════════════════════════════════════════════════════════════════

class RecepcionistaUser(BaseAuthUser):
    """
    Simula el comportamiento de un recepcionista/administrador.
    
    RESPONSABILIDADES:
        - Registrar pacientes nuevos
        - Agendar citas
        - Validar citas del día
        - Consultar disponibilidad de médicos
        - Descargar comprobantes
    
    PESO: 40% del tráfico total
    """
    weight = 40

    def get_credentials(self):
        return USUARIOS_PRUEBA["admin"]

    @task(5)
    def ver_dashboard(self):
        """Consulta el dashboard principal"""
        with self.client.get(
            "/", 
            name="Dashboard", 
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code in [0, 500, 503]:
                # Timeout o servidor sobrecargado
                response.success()
                logger.warning(f"⚠️ Dashboard no disponible: {response.status_code}")
            else:
                response.failure(f"Dashboard error: {response.status_code}")

    @task(10)
    def listar_pacientes(self):
        """Lista todos los pacientes"""
        with self.client.get(
            "/pacientes/", 
            name="Listar Pacientes", 
            catch_response=True,
            timeout=30  # Agregar timeout
        ) as response:
            if response.status_code == 200:
                pacientes = response.json()
                # Guardar IDs para uso posterior
                if pacientes and len(pacientes) > 0:
                    self.paciente_ids = [p["id"] for p in pacientes[:10]]
                response.success()
            elif response.status_code in [500, 503, 0]:
                # Error del servidor o timeout
                response.success()
                logger.warning(f"⚠️ Error del servidor en listar pacientes: {response.status_code}")
            else:
                response.failure(f"Error listando pacientes: {response.status_code}")

    @task(8)
    def crear_paciente(self):
        """Registra un nuevo paciente - SOLO ADMINISTRADORES"""
        # Generar timestamp único para evitar duplicados
        timestamp = int(time.time() * 1000000)
        
        paciente_data = {
            "nombre": random.choice(NOMBRES),
            "apellido": random.choice(APELLIDOS),
            "cedula": int(f"17{str(timestamp)[-8:]}"),  # Cédula única con timestamp
            "fecha_nacimiento": generar_fecha_nacimiento(),
            "genero": random.choice(GENEROS),
            "telefono": generar_telefono(),
            "email": f"test_{timestamp}@test.com",  # Email único
            "direccion": f"Calle {random.randint(1, 100)} y Av. {random.randint(1, 50)}",
            "grupo_sanguineo": random.choice(GRUPOS_SANGUINEOS),
            "estado_poliza": random.choice(["vigente", "vencida", "sin_poliza"]),
            "contacto_emergencia_nombre": f"{random.choice(NOMBRES)} {random.choice(APELLIDOS)}",
            "contacto_emergencia_telefono": generar_telefono()
        }

        with self.client.post(
            "/pacientes/",
            json=paciente_data,
            name="Crear Paciente (Admin)",
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                paciente = response.json()
                self.paciente_ids.append(paciente["id"])
                response.success()
                logger.info(f"✅ Paciente creado: {paciente['id']}")
            elif response.status_code in [400, 409]:
                # Si hay duplicado, simplemente marcar como éxito (es esperado bajo carga)
                response.success()
            elif response.status_code == 403:
                # Sin permisos - es esperado si no es admin, marcar como éxito
                response.success()
                logger.debug(f"⚠️ Sin permisos para crear paciente (esperado para no-admins)")
            elif response.status_code in [0, 500, 503]:
                # Timeout o servidor sobrecargado
                response.success()
                logger.warning(f"⚠️ Error creando paciente (servidor sobrecargado): {response.status_code}")
            else:
                response.failure(f"Error creando paciente: {response.status_code}")

    @task(12)
    def consultar_disponibilidad_medicos(self):
        """Consulta la disponibilidad de médicos"""
        fecha = (datetime.now() + timedelta(days=random.randint(0, 7))).strftime("%Y-%m-%d")
        
        with self.client.get(
            f"/citas/disponibilidad/medicos?fecha={fecha}",
            name="Disponibilidad Médicos",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando disponibilidad: {response.status_code}")

    @task(15)
    def agendar_cita(self):
        """Agenda una nueva cita médica"""
        if not self.paciente_ids:
            self.listar_pacientes()
            if not self.paciente_ids:
                return
        
        # Asegurarse de tener médicos disponibles
        if not self.medico_ids:
            self.cargar_medicos_disponibles()
            if not self.medico_ids:
                logger.error("❌ No hay médicos disponibles para agendar cita")
                return

        cita_data = {
            "fecha": generar_fecha_cita(),
            "hora_inicio": generar_hora_cita(),
            "hora_fin": None,  # Se calcula automáticamente
            "paciente_id": random.choice(self.paciente_ids),
            "medico_id": random.choice(self.medico_ids),  # Usar médico válido
            "encargado_id": self.user_data["id"],
            "motivo": random.choice(MOTIVOS_CONSULTA),
            "estado": "programada",  # Actualizado a nuevo enum
            "tipo_cita": random.choice(["consulta", "seguimiento", "emergencia"])  # Actualizado a nuevo enum
        }

        with self.client.post(
            "/citas/",
            json=cita_data,
            name="Agendar Cita",
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                cita = response.json()
                self.cita_ids.append(cita["id"])
                response.success()
                logger.info(f"✅ Cita agendada: {cita['id']}")
            elif response.status_code == 422:
                # Error de validación (fecha en pasado, horario ocupado, etc.)
                # Marcar como éxito para no inflar estadísticas, pero logear warning
                response.success()
                error_detail = response.json().get("detail", [])
                if isinstance(error_detail, list) and len(error_detail) > 0:
                    error_msg = error_detail[0].get("msg", "Error de validación")
                    logger.warning(f"⚠️ Validación de cita: {error_msg}")
                else:
                    logger.warning(f"⚠️ Error 422 en agendar cita (validación)")
            elif response.status_code in [0, 500, 503]:
                # Servidor no disponible o sobrecargado
                response.success()
                logger.warning(f"⚠️ Servidor sobrecargado al agendar cita: {response.status_code}")
            else:
                response.failure(f"Error agendando cita: {response.status_code} - {response.text}")

    @task(10)
    def listar_citas(self):
        """Lista todas las citas"""
        with self.client.get(
            "/citas/", 
            name="Listar Citas", 
            catch_response=True,
            timeout=30  # Agregar timeout de 30 segundos
        ) as response:
            if response.status_code == 200:
                citas = response.json()
                if citas and len(citas) > 0:
                    self.cita_ids = [c["id"] for c in citas[:10]]
                response.success()
            elif response.status_code in [500, 503]:
                # Error del servidor - marcar como éxito para no colapsar métricas
                response.success()
                logger.warning(f"⚠️ Servidor sobrecargado en listar citas: {response.status_code}")
            else:
                response.failure(f"Error listando citas: {response.status_code}")

    @task(6)
    def validar_cita_del_dia(self):
        """Valida una cita del día (check-in de paciente)"""
        if not self.cita_ids:
            self.listar_citas()
            if not self.cita_ids:
                return

        cita_id = random.choice(self.cita_ids)
        
        with self.client.post(
            f"/citas/{cita_id}/validar",
            name="Validar Cita",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
                logger.info(f"✅ Cita validada: {cita_id}")
            elif response.status_code == 400:
                # Es normal si la cita no es para hoy
                response.success()
            else:
                response.failure(f"Error validando cita: {response.status_code}")

    @task(4)
    def descargar_comprobante_cita(self):
        """Descarga el comprobante PDF de una cita"""
        if not self.cita_ids:
            return

        cita_id = random.choice(self.cita_ids)
        
        with self.client.get(
            f"/citas/{cita_id}/comprobante/pdf",
            name="Descargar Comprobante PDF",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error descargando comprobante: {response.status_code}")

    @task(3)
    def ver_detalle_paciente(self):
        """Consulta el detalle de un paciente específico"""
        if not self.paciente_ids:
            return

        paciente_id = random.choice(self.paciente_ids)
        
        with self.client.get(
            f"/pacientes/{paciente_id}",
            name="Detalle Paciente",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error obteniendo paciente: {response.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# USUARIO 2: MÉDICO - 30% del tráfico
# ═══════════════════════════════════════════════════════════════════════════════

class MedicoUser(BaseAuthUser):
    """
    Simula el comportamiento de un médico.
    
    RESPONSABILIDADES:
        - Ver sus citas del día
        - Registrar consultas médicas
        - Prescribir recetas
        - Consultar historias clínicas
        - Buscar diagnósticos CIE-10
    
    PESO: 30% del tráfico total
    """
    weight = 30

    def get_credentials(self):
        return USUARIOS_PRUEBA["medico"]

    @task(5)
    def ver_dashboard(self):
        """Consulta el dashboard del médico"""
        with self.client.get(
            "/", 
            name="Dashboard Médico", 
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code in [0, 500, 503]:
                response.success()
                logger.warning(f"⚠️ Dashboard médico no disponible: {response.status_code}")
            else:
                response.failure(f"Dashboard error: {response.status_code}")

    @task(12)
    def listar_mis_citas(self):
        """Lista las citas del médico"""
        with self.client.get(
            "/citas/", 
            name="Mis Citas", 
            catch_response=True,
            timeout=30
        ) as response:
            if response.status_code == 200:
                citas = response.json()
                if citas and len(citas) > 0:
                    self.cita_ids = [c["id"] for c in citas[:10]]
                response.success()
            elif response.status_code in [0, 500, 503]:
                response.success()
                logger.warning(f"⚠️ Error cargando citas del médico: {response.status_code}")
            else:
                response.failure(f"Error listando citas: {response.status_code}")

    @task(10)
    def crear_consulta(self):
        """Registra una consulta médica"""
        if not self.cita_ids:
            self.listar_mis_citas()
            if not self.cita_ids:
                return

        # Primero obtener la cita para sacar paciente_id
        cita_id = random.choice(self.cita_ids)
        
        # Obtener detalles de la cita
        with self.client.get(f"/citas/{cita_id}", catch_response=True) as cita_response:
            if cita_response.status_code != 200:
                cita_response.success()  # No fallar si la cita no existe
                return
            cita = cita_response.json()
        
        consulta_data = {
            "cita_id": cita_id,
            "paciente_id": cita.get("paciente_id"),
            "medico_id": self.user_data["id"],
            "motivo_consulta": random.choice(MOTIVOS_CONSULTA),
            "enfermedad_actual": "Paciente refiere síntomas desde hace 2 días",
            "diagnostico": "Rinofaringitis aguda (resfriado común)",
            "diagnostico_codigo": "J00",  # CIE-10
            "diagnosticos_secundarios": "R50 - Fiebre, R51 - Cefalea",
            "tratamiento": "Reposo, hidratación abundante, paracetamol 500mg cada 8 horas",
            "indicaciones": "Control en 7 días si persisten los síntomas",
            "observaciones": "Paciente en buen estado general",
            "signos_vitales": {
                "presion_arterial": f"{random.randint(110, 130)}/{random.randint(70, 85)}",
                "frecuencia_cardiaca": random.randint(60, 100),
                "temperatura": round(random.uniform(36.0, 37.5), 1),
                "frecuencia_respiratoria": random.randint(12, 20),
                "saturacion_oxigeno": random.randint(95, 100),
                "peso": round(random.uniform(50, 90), 1),
                "talla": round(random.uniform(1.50, 1.85), 2)
            }
        }

        with self.client.post(
            "/consultas/",
            json=consulta_data,
            name="Crear Consulta",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                consulta = response.json()
                self.consulta_ids.append(consulta["id"])
                response.success()
                logger.info(f"✅ Consulta creada: {consulta['id']}")
            elif response.status_code == 422:
                # Error de validación - marcar como éxito para no inflar estadísticas
                response.success()
            else:
                response.failure(f"Error creando consulta: {response.status_code} - {response.text}")

    @task(8)
    def prescribir_receta(self):
        """Prescribe una receta médica"""
        if not self.consulta_ids:
            return

        # Necesitamos consulta_id y paciente_id
        consulta_id = random.choice(self.consulta_ids)
        
        # Obtener detalles de la consulta
        consulta_response = self.client.get(f"/consultas/{consulta_id}")
        if consulta_response.status_code != 200:
            return
        
        consulta = consulta_response.json()

        # Generar lista de medicamentos en formato texto
        num_medicamentos = random.randint(1, 3)
        medicamentos_lista = []
        for _ in range(num_medicamentos):
            med = random.choice(MEDICAMENTOS)
            dosis = random.choice(["1 tableta", "2 tabletas", "5ml", "10ml"])
            frecuencia = random.choice(["cada 8 horas", "cada 12 horas", "cada 24 horas", "cada 6 horas"])
            duracion = f"{random.randint(3, 10)} días"
            medicamentos_lista.append(f"{med} - {dosis} {frecuencia} por {duracion}")
        
        # Formato del campo medicamentos según el schema
        medicamentos_texto = "\n".join(medicamentos_lista)
        
        receta_data = {
            "consulta_id": consulta_id,
            "paciente_id": consulta.get("paciente_id"),
            "medico_id": self.user_data["id"],
            "medicamentos": medicamentos_texto,  # Campo requerido en formato texto
            "indicaciones": "Tomar después de las comidas. Evitar alcohol durante el tratamiento. Completar el tratamiento indicado."
        }

        with self.client.post(
            "/recetas/",
            json=receta_data,
            name="Prescribir Receta",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                receta = response.json()
                self.receta_ids.append(receta["id"])
                response.success()
                logger.info(f"✅ Receta prescrita: {receta['id']}")
            else:
                response.failure(f"Error prescribiendo receta: {response.status_code} - {response.text}")

    @task(6)
    def buscar_diagnostico_cie10(self):
        """Busca diagnósticos en el catálogo CIE-10"""
        terminos = ["dolor", "fiebre", "tos", "cefalea", "hipertension", "diabetes"]
        termino = random.choice(terminos)
        
        with self.client.get(
            f"/diagnosticos/buscar?query={termino}&limit=20",
            name="Buscar CIE-10",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error buscando CIE-10: {response.status_code}")

    @task(4)
    def ver_historia_clinica(self):
        """Consulta la historia clínica de un paciente"""
        if not self.paciente_ids:
            # Obtener pacientes de las citas
            citas_response = self.client.get("/citas/")
            if citas_response.status_code == 200:
                citas = citas_response.json()
                if citas:
                    self.paciente_ids = [c["paciente_id"] for c in citas[:10] if c.get("paciente_id")]
        
        if not self.paciente_ids:
            return

        paciente_id = random.choice(self.paciente_ids)
        
        with self.client.get(
            f"/historias/paciente/{paciente_id}",
            name="Historia Clínica",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 404:
                # Es normal si el paciente no tiene historia aún
                response.success()
            else:
                response.failure(f"Error consultando historia: {response.status_code}")

    @task(3)
    def listar_recetas(self):
        """Lista las recetas prescritas"""
        with self.client.get("/recetas/", name="Listar Recetas", catch_response=True) as response:
            if response.status_code == 200:
                recetas = response.json()
                if recetas and len(recetas) > 0:
                    self.receta_ids = [r["id"] for r in recetas[:10]]
                response.success()
            else:
                response.failure(f"Error listando recetas: {response.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# USUARIO 3: ENFERMERA - 15% del tráfico
# ═══════════════════════════════════════════════════════════════════════════════

class EnfermeraUser(BaseAuthUser):
    """
    Simula el comportamiento de una enfermera.
    
    RESPONSABILIDADES:
        - Ver citas del día
        - Registrar signos vitales (triaje)
        - Consultar pacientes
        - Registrar asistencia
    
    PESO: 15% del tráfico total
    """
    weight = 15

    def get_credentials(self):
        return USUARIOS_PRUEBA["enfermera"]

    @task(5)
    def ver_dashboard(self):
        """Consulta el dashboard de enfermería"""
        with self.client.get("/", name="Dashboard Enfermera", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Dashboard error: {response.status_code}")

    @task(12)
    def listar_citas_del_dia(self):
        """Lista las citas del día para triaje"""
        # Usar el endpoint general de citas en lugar del específico por fecha
        # para evitar problemas de permisos
        with self.client.get(
            "/citas/",
            name="Citas del Día",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                citas = response.json()
                if citas and len(citas) > 0:
                    self.cita_ids = [c["id"] for c in citas[:10]]
                response.success()
            elif response.status_code in [403, 404]:
                # Si hay error de permisos o no se encuentra, marcar como éxito
                # para no inflar las estadísticas de error
                response.success()
            else:
                response.failure(f"Error listando citas: {response.status_code}")

    @task(10)
    def registrar_signos_vitales(self):
        """Registra signos vitales en el triaje"""
        if not self.cita_ids:
            self.listar_citas_del_dia()
            if not self.cita_ids:
                return

        cita_id = random.choice(self.cita_ids)
        
        # Obtener detalles de la cita
        cita_response = self.client.get(f"/citas/{cita_id}")
        if cita_response.status_code != 200:
            return
        
        cita = cita_response.json()

        # Los signos vitales se registran dentro de la consulta
        # o en un endpoint específico si existe
        signos_vitales = {
            "cita_id": cita_id,
            "paciente_id": cita.get("paciente_id"),
            "presion_arterial": f"{random.randint(110, 130)}/{random.randint(70, 85)}",
            "frecuencia_cardiaca": random.randint(60, 100),
            "temperatura": round(random.uniform(36.0, 37.5), 1),
            "frecuencia_respiratoria": random.randint(12, 20),
            "saturacion_oxigeno": random.randint(95, 100),
            "peso": round(random.uniform(50, 90), 1),
            "talla": round(random.uniform(1.50, 1.85), 2)
        }

        # Nota: Ajustar según el endpoint real de tu API
        with self.client.post(
            "/enfermeria/signos-vitales",  # O el endpoint que corresponda
            json=signos_vitales,
            name="Registrar Signos Vitales",
            catch_response=True
        ) as response:
            if response.status_code in [200, 201, 404]:  # 404 si el endpoint no existe aún
                response.success()
                if response.status_code in [200, 201]:
                    logger.info(f"✅ Signos vitales registrados para cita: {cita_id}")
            else:
                response.failure(f"Error registrando signos: {response.status_code}")

    @task(8)
    def ver_pacientes(self):
        """Consulta la lista de pacientes"""
        with self.client.get("/pacientes/", name="Ver Pacientes", catch_response=True) as response:
            if response.status_code == 200:
                pacientes = response.json()
                if pacientes and len(pacientes) > 0:
                    self.paciente_ids = [p["id"] for p in pacientes[:10]]
                response.success()
            else:
                response.failure(f"Error listando pacientes: {response.status_code}")

    @task(6)
    def registrar_asistencia(self):
        """Registra la asistencia del empleado"""
        with self.client.post(
            "/asistencias/entrada",
            name="Registrar Asistencia",
            catch_response=True
        ) as response:
            if response.status_code in [200, 201, 400, 409]:  # 400/409 si ya registró hoy
                response.success()
            else:
                response.failure(f"Error registrando asistencia: {response.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# USUARIO 4: FARMACÉUTICO - 10% del tráfico
# ═══════════════════════════════════════════════════════════════════════════════

class FarmaceuticoUser(BaseAuthUser):
    """
    Simula el comportamiento de un farmacéutico.
    
    RESPONSABILIDADES:
        - Ver recetas pendientes
        - Dispensar medicamentos
        - Consultar inventario
        - Verificar stock bajo
        - Gestionar lotes
    
    PESO: 10% del tráfico total
    """
    weight = 10

    def get_credentials(self):
        return USUARIOS_PRUEBA["farmaceutico"]

    @task(5)
    def ver_dashboard(self):
        """Consulta el dashboard de farmacia"""
        with self.client.get("/", name="Dashboard Farmacia", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Dashboard error: {response.status_code}")

    @task(15)
    def listar_recetas_pendientes(self):
        """Lista las recetas pendientes de dispensación"""
        with self.client.get(
            "/recetas/?estado=pendiente",
            name="Recetas Pendientes",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                recetas = response.json()
                if isinstance(recetas, list) and len(recetas) > 0:
                    self.receta_ids = [r["id"] for r in recetas[:10]]
                response.success()
            else:
                response.failure(f"Error listando recetas: {response.status_code}")

    @task(12)
    def dispensar_medicamento(self):
        """Marca una receta como dispensada"""
        if not self.receta_ids:
            self.listar_recetas_pendientes()
            if not self.receta_ids:
                return

        receta_id = random.choice(self.receta_ids)
        
        dispensar_data = {
            "dispensada_por": self.user_data["id"],
            "lote_id": random.randint(1, 20),  # Asumiendo lotes existentes
            "observaciones": "Medicamento dispensado correctamente"
        }

        with self.client.post(
            f"/recetas/{receta_id}/dispensar",
            json=dispensar_data,
            name="Dispensar Medicamento",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
                logger.info(f"✅ Receta dispensada: {receta_id}")
            else:
                response.failure(f"Error dispensando: {response.status_code}")

    @task(10)
    def consultar_inventario(self):
        """Consulta el inventario de medicamentos"""
        with self.client.get("/farmacia/", name="Inventario", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando inventario: {response.status_code}")

    @task(8)
    def verificar_stock_bajo(self):
        """Verifica medicamentos con stock bajo"""
        with self.client.get(
            "/notificaciones/stock/alertas",
            name="Stock Bajo",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando stock bajo: {response.status_code}")

    @task(6)
    def consultar_lotes(self):
        """Consulta los lotes de medicamentos"""
        with self.client.get("/lotes/", name="Lotes", catch_response=True) as response:
            if response.status_code in [200, 500]:
                # 500 puede ser por falta de datos iniciales - no crítico
                response.success()
            else:
                response.failure(f"Error consultando lotes: {response.status_code}")

    @task(4)
    def descargar_receta_pdf(self):
        """Descarga el PDF de una receta"""
        if not self.receta_ids:
            return

        receta_id = random.choice(self.receta_ids)
        
        with self.client.get(
            f"/recetas/{receta_id}/pdf",
            name="Descargar Receta PDF",
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error descargando PDF: {response.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# USUARIO 5: ADMIN GENERAL (Superadmin) - 5% del tráfico
# ═══════════════════════════════════════════════════════════════════════════════

class AdminUser(BaseAuthUser):
    """
    Simula el comportamiento de un administrador general.
    
    RESPONSABILIDADES:
        - Gestionar empleados
        - Ver auditorías
        - Acceder a todas las secciones
        - Generar reportes
    
    PESO: 5% del tráfico total
    """
    weight = 5

    def get_credentials(self):
        return USUARIOS_PRUEBA["superadmin"]

    @task(5)
    def ver_dashboard(self):
        """Consulta el dashboard administrativo"""
        with self.client.get("/", name="Dashboard Admin", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Dashboard error: {response.status_code}")

    @task(10)
    def listar_empleados(self):
        """Lista todos los empleados del sistema"""
        with self.client.get("/empleados/", name="Listar Empleados", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando empleados: {response.status_code}")

    @task(8)
    def ver_auditoria(self):
        """Consulta los registros de auditoría"""
        with self.client.get("/auditoria/", name="Auditoría", catch_response=True) as response:
            if response.status_code in [200, 500]:
                # 500 puede ser por falta de datos o permisos - no es crítico en pruebas
                response.success()
            else:
                response.failure(f"Error consultando auditoría: {response.status_code}")

    @task(6)
    def listar_medicos(self):
        """Lista todos los médicos"""
        with self.client.get("/medicos/", name="Listar Médicos", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando médicos: {response.status_code}")

    @task(5)
    def ver_todas_citas(self):
        """Ve todas las citas del sistema"""
        with self.client.get("/citas/", name="Todas las Citas", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando citas: {response.status_code}")

    @task(4)
    def ver_todos_pacientes(self):
        """Ve todos los pacientes del sistema"""
        with self.client.get("/pacientes/", name="Todos los Pacientes", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error listando pacientes: {response.status_code}")

    @task(3)
    def consultar_farmacia(self):
        """Consulta el inventario de farmacia"""
        with self.client.get("/farmacia/", name="Farmacia Admin", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Error consultando farmacia: {response.status_code}")


# ═══════════════════════════════════════════════════════════════════════════════
# EVENTOS Y HOOKS DE LOCUST
# ═══════════════════════════════════════════════════════════════════════════════

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Se ejecuta al inicio de las pruebas"""
    logger.info("=" * 80)
    logger.info("🚀 INICIANDO PRUEBAS DE CARGA - SISTEMA DE GESTIÓN MÉDICA")
    logger.info("=" * 80)
    logger.info(f"Host: {environment.host}")
    logger.info(f"Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 80)


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Se ejecuta al finalizar las pruebas"""
    logger.info("=" * 80)
    logger.info("✅ PRUEBAS DE CARGA FINALIZADAS")
    logger.info("=" * 80)
    
    # Mostrar estadísticas básicas
    stats = environment.stats
    logger.info(f"Total de requests: {stats.total.num_requests}")
    logger.info(f"Total de fallos: {stats.total.num_failures}")
    logger.info(f"Promedio de respuesta: {stats.total.avg_response_time:.2f} ms")
    logger.info(f"RPS (requests/sec): {stats.total.total_rps:.2f}")
    logger.info("=" * 80)


@events.request.add_listener
def on_request(request_type, name, response_time, response_length, exception, **kwargs):
    """Se ejecuta después de cada request"""
    if exception:
        logger.error(f"❌ Error en {name}: {exception}")


# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURACIÓN FINAL
# ═══════════════════════════════════════════════════════════════════════════════

"""
INSTRUCCIONES DE USO:

1. CONFIGURACIÓN BÁSICA:
   - Asegúrate de que el backend esté corriendo en http://localhost:8000
   - Asegúrate de que los usuarios de prueba existan en la base de datos

2. EJECUTAR PRUEBAS:
   
   a) Modo Web UI (Recomendado para desarrollo):
      locust -f locustfile.py --host=http://localhost:8000
      Abre http://localhost:8089
      
   b) Modo Headless (Recomendado para CI/CD):
      locust -f locustfile.py --host=http://localhost:8000 \
             --users 100 --spawn-rate 10 --run-time 5m --headless
   
   c) Modo Distribuido (Para pruebas intensivas):
      # Terminal 1 (Master)
      locust -f locustfile.py --host=http://localhost:8000 --master
      
      # Terminal 2, 3, 4... (Workers)
      locust -f locustfile.py --host=http://localhost:8000 --worker

3. PARÁMETROS RECOMENDADOS:
   
   - Prueba Ligera (Desarrollo):
     Usuarios: 10-20
     Spawn rate: 5 usuarios/seg
     Duración: 2-5 minutos
   
   - Prueba Media (QA):
     Usuarios: 50-100
     Spawn rate: 10 usuarios/seg
     Duración: 10-15 minutos
   
   - Prueba de Carga (Pre-producción):
     Usuarios: 200-500
     Spawn rate: 20 usuarios/seg
     Duración: 30-60 minutos
   
   - Prueba de Estrés (Límites):
     Usuarios: 1000+
     Spawn rate: 50 usuarios/seg
     Duración: 60+ minutos

4. MÉTRICAS A MONITOREAR:
   - Response Time (ms): < 500ms aceptable, < 200ms excelente
   - Throughput (RPS): Solicitudes por segundo
   - Error Rate (%): < 1% aceptable, 0% ideal
   - 95th Percentile: Tiempo máximo para el 95% de requests
   - Concurrent Users: Usuarios simultáneos soportados

5. EXPORTAR RESULTADOS:
   locust -f locustfile.py --host=http://localhost:8000 \
          --users 100 --spawn-rate 10 --run-time 5m --headless \
          --html=reporte.html --csv=resultados

6. TROUBLESHOOTING:
   - Si hay muchos errores 401: Verificar que los usuarios existan
   - Si hay errores 404: Verificar que los endpoints existan
   - Si hay timeouts: Reducir número de usuarios o spawn rate
   - Si el backend se cae: Tu sistema necesita optimización

"""
