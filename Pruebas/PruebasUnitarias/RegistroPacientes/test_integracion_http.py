"""
Pruebas de Integración - Registro de Pacientes (API HTTP)
==========================================================

⚠️ IMPORTANTE: Estas pruebas requieren que el backend esté en EJECUCIÓN
   Antes de ejecutar, iniciar el servidor: uvicorn app.main:app --reload

Diferencias con pruebas unitarias:
- ✅ Prueban las RUTAS HTTP reales (POST /pacientes/)
- ✅ Muestran códigos de estado HTTP (200, 400, 500)
- ✅ Muestran mensajes de error reales de la API
- ✅ Miden tiempo de respuesta
- ✅ Requieren autenticación (token Bearer)
- ✅ Afectan la base de datos REAL (no en memoria)

Casos de Uso Cubiertos:
- CASO 1: Registro exitoso con datos completos → 200 OK
- CASO 2: Registro solo datos obligatorios → 200 OK
- CASO 3: Rechazo por cédula duplicada → 400 Bad Request
- CASO 4: Rechazo por email duplicado → 400 Bad Request
- CASO 5: Rechazo por campo obligatorio faltante → 422 Unprocessable Entity
- CASO 6: Rechazo por formato email inválido → 422 Unprocessable Entity

Autor: Sistema de Gestión Médica
Fecha: 11/11/2025
"""

import pytest
import requests
import time
from datetime import datetime

# Configuración del servidor
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/pacientes/"
LOGIN_URL = f"{BASE_URL}/auth/login"

# Credenciales de admin (del archivo USUARIOS_DEFECTO.md)
ADMIN_CREDENTIALS = {
    "email": "admin@hospital.com",
    "password": "admin123"
}


@pytest.fixture(scope="module")
def auth_token():
    """
    Obtener token de autenticación como Administrador
    Se ejecuta UNA VEZ para todas las pruebas del módulo
    """
    print(f"\n🔐 Obteniendo token de autenticación...")
    print(f"   URL: {LOGIN_URL}")
    print(f"   Usuario: {ADMIN_CREDENTIALS['email']}")
    
    response = requests.post(LOGIN_URL, json=ADMIN_CREDENTIALS)
    
    if response.status_code != 200:
        pytest.fail(f"❌ No se pudo autenticar: {response.status_code} - {response.text}")
    
    token = response.json().get("access_token")
    print(f"   ✅ Token obtenido correctamente")
    
    return token


@pytest.fixture
def headers(auth_token):
    """
    Headers con autenticación Bearer
    """
    return {
        "Authorization": f"Bearer {auth_token}",
        "Content-Type": "application/json"
    }


class TestCaso1RegistroCompletoHTTP:
    """
    CASO 1: Registro exitoso de paciente con datos completos (HTTP)
    
    Endpoint: POST /pacientes/
    Autenticación: Bearer token (Administrador)
    Datos: Todos los campos completos
    
    Resultado Esperado:
    - Status Code: 200 OK
    - Body: Objeto paciente completo con ID asignado
    - Tiempo de respuesta: < 2 segundos
    """
    
    def test_registro_completo_http(self, headers):
        """Prueba HTTP de registro con datos completos"""
        # Arrange (Preparar datos)
        # Usar timestamp para evitar duplicados entre ejecuciones
        timestamp = int(time.time())
        
        datos = {
            "nombre": "Juan",
            "apellido": "Pérez García",
            "cedula": "1713175071",
            "email": f"juan.perez.{timestamp}@email.com",  # Email único
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
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 1: Registro Completo (HTTP)")
        print(f"{'='*70}")
        print(f"🌐 URL: {API_URL}")
        print(f"📤 Datos enviados:")
        print(f"   - Nombre: {datos['nombre']} {datos['apellido']}")
        print(f"   - Cédula: {datos['cedula']}")
        print(f"   - Email: {datos['email']}")
        print(f"   - Teléfono: {datos['telefono']}")
        print(f"   - Seguro: {datos['tipo_seguro']}")
        
        # Act (Ejecutar petición HTTP)
        inicio = time.time()
        response = requests.post(API_URL, json=datos, headers=headers)
        tiempo_respuesta = time.time() - inicio
        
        # Assert (Verificar respuesta)
        print(f"\n📥 Respuesta del servidor:")
        print(f"   ⏱️  Tiempo de respuesta: {tiempo_respuesta:.3f} segundos")
        print(f"   📊 Status Code: {response.status_code}")
        
        assert response.status_code == 200, (
            f"❌ Se esperaba 200 OK, pero se recibió {response.status_code}\n"
            f"   Mensaje: {response.text}"
        )
        
        # Verificar cuerpo de respuesta
        paciente = response.json()
        print(f"   ✅ Paciente creado exitosamente")
        print(f"   🆔 ID asignado: {paciente.get('id')}")
        print(f"   📋 Historia clínica: {paciente.get('numero_historia_clinica', 'N/A')}")
        print(f"   📧 Email confirmado: {paciente.get('email')}")
        
        assert paciente.get("id") is not None, "El paciente debe tener un ID"
        assert paciente.get("nombre") == datos["nombre"]
        assert paciente.get("cedula") == datos["cedula"]
        assert paciente.get("email") == datos["email"]
        
        # Verificar tiempo de respuesta
        assert tiempo_respuesta < 2.0, (
            f"⚠️ Tiempo de respuesta muy alto: {tiempo_respuesta:.3f}s (esperado < 2s)"
        )
        
        print(f"\n{'='*70}")
        print(f"✅ CASO 1 PASADO: Registro completo exitoso")
        print(f"{'='*70}\n")


class TestCaso2RegistroObligatoriosHTTP:
    """
    CASO 2: Registro exitoso solo con datos obligatorios
    
    Endpoint: POST /pacientes/
    Datos: Solo nombre, apellido, cédula
    
    Resultado Esperado:
    - Status Code: 200 OK
    - Campos opcionales en null
    """
    
    def test_registro_solo_obligatorios_http(self, headers):
        """Prueba HTTP con solo campos obligatorios"""
        timestamp = int(time.time())
        
        datos = {
            "nombre": "Ana",
            "apellido": "Torres",
            "cedula": "1705251732",  # Cédula válida Ecuador
            "fecha_nacimiento": "1995-03-20",
            "genero": "Femenino"
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 2: Registro Solo Obligatorios (HTTP)")
        print(f"{'='*70}")
        print(f"📤 Datos enviados (mínimos):")
        print(f"   - Nombre: {datos['nombre']} {datos['apellido']}")
        print(f"   - Cédula: {datos['cedula']}")
        print(f"   - Fecha Nacimiento: {datos['fecha_nacimiento']}")
        print(f"   - Género: {datos['genero']}")
        print(f"   ⚠️  Email: No proporcionado (opcional)")
        print(f"   ⚠️  Teléfono: No proporcionado (opcional)")
        
        inicio = time.time()
        response = requests.post(API_URL, json=datos, headers=headers)
        tiempo_respuesta = time.time() - inicio
        
        print(f"\n📥 Respuesta:")
        print(f"   ⏱️  Tiempo: {tiempo_respuesta:.3f}s")
        print(f"   📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            paciente = response.json()
            print(f"   ✅ Paciente creado")
            print(f"   🆔 ID: {paciente.get('id')}")
            print(f"   📧 Email: {paciente.get('email', 'null')}")
            print(f"   📞 Teléfono: {paciente.get('telefono', 'null')}")
        else:
            print(f"   ❌ Error: {response.text}")
        
        assert response.status_code == 200
        print(f"\n✅ CASO 2 PASADO\n")


class TestCaso3RechazoCedulaDuplicadaHTTP:
    """
    CASO 3: Rechazo por cédula duplicada
    
    Endpoint: POST /pacientes/
    Escenario: Crear paciente, luego intentar crear otro con misma cédula
    
    Resultado Esperado:
    - Primera inserción: 200 OK
    - Segunda inserción: 400 Bad Request
    - Mensaje: "Ya existe un paciente con esta cédula"
    """
    
    def test_rechazo_cedula_duplicada_http(self, headers):
        """Prueba HTTP de rechazo por cédula duplicada"""
        timestamp = int(time.time())
        cedula_comun = "1206013169"  # Cédula válida Ecuador
        
        # Primera inserción (debe funcionar)
        datos1 = {
            "nombre": "Carlos",
            "apellido": "Ruiz",
            "cedula": cedula_comun,
            "email": f"carlos.ruiz.{timestamp}@test.com",
            "fecha_nacimiento": "1988-07-10",
            "genero": "Masculino"
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 3: Rechazo Cédula Duplicada (HTTP)")
        print(f"{'='*70}")
        print(f"📤 Primera inserción:")
        print(f"   - Nombre: {datos1['nombre']} {datos1['apellido']}")
        print(f"   - Cédula: {datos1['cedula']}")
        
        response1 = requests.post(API_URL, json=datos1, headers=headers)
        print(f"\n📥 Respuesta 1:")
        print(f"   📊 Status: {response1.status_code}")
        
        if response1.status_code == 200:
            print(f"   ✅ Primera inserción exitosa")
        elif response1.status_code == 400 and "Ya existe" in response1.text:
            print(f"   ℹ️  Paciente ya existía (de ejecución anterior)")
        else:
            print(f"   ⚠️  Respuesta inesperada: {response1.text}")
        
        # Segunda inserción (debe fallar)
        datos2 = {
            "nombre": "Pedro",
            "apellido": "Gómez",
            "cedula": cedula_comun,  # MISMA CÉDULA
            "email": f"pedro.gomez.{timestamp}@test.com",
            "fecha_nacimiento": "1992-11-25",
            "genero": "Masculino"
        }
        
        print(f"\n📤 Segunda inserción (DUPLICADA):")
        print(f"   - Nombre: {datos2['nombre']} {datos2['apellido']}")
        print(f"   - Cédula: {datos2['cedula']} ⚠️  DUPLICADA")
        
        inicio = time.time()
        response2 = requests.post(API_URL, json=datos2, headers=headers)
        tiempo_respuesta = time.time() - inicio
        
        print(f"\n📥 Respuesta 2:")
        print(f"   ⏱️  Tiempo: {tiempo_respuesta:.3f}s")
        print(f"   📊 Status: {response2.status_code}")
        print(f"   💬 Mensaje: {response2.json().get('detail', 'N/A')}")
        
        assert response2.status_code == 400, (
            f"Se esperaba 400 Bad Request por cédula duplicada, "
            f"pero se recibió {response2.status_code}"
        )
        
        assert "Ya existe" in response2.text or "duplicada" in response2.text.lower(), (
            "El mensaje debe indicar que la cédula ya existe"
        )
        
        print(f"\n✅ CASO 3 PASADO: Cédula duplicada rechazada correctamente\n")


class TestCaso4RechazoEmailDuplicadoHTTP:
    """
    CASO 4: Rechazo por email duplicado
    
    Resultado Esperado:
    - Primera inserción: 200 OK
    - Segunda inserción: 400 Bad Request
    - Mensaje: "Ya existe un paciente con este email"
    """
    
    def test_rechazo_email_duplicado_http(self, headers):
        """Prueba HTTP de rechazo por email duplicado"""
        timestamp = int(time.time())
        email_comun = f"test.hospital.{timestamp}@hospital.com"
        
        # Primera inserción
        datos1 = {
            "nombre": "Laura",
            "apellido": "Mendoza",
            "cedula": "1304603259",  # Cédula válida Ecuador (Manabí)
            "email": email_comun,
            "fecha_nacimiento": "1991-02-14",
            "genero": "Femenino"
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 4: Rechazo Email Duplicado (HTTP)")
        print(f"{'='*70}")
        print(f"📤 Primera inserción:")
        print(f"   - Nombre: {datos1['nombre']} {datos1['apellido']}")
        print(f"   - Email: {email_comun}")
        
        response1 = requests.post(API_URL, json=datos1, headers=headers)
        print(f"   📊 Status: {response1.status_code}")
        
        if response1.status_code == 200:
            print(f"   ✅ Primera inserción exitosa")
        elif "Ya existe" in response1.text:
            print(f"   ℹ️  Email ya existía")
        
        # Segunda inserción con email duplicado
        datos2 = {
            "nombre": "Miguel",
            "apellido": "Castro",
            "cedula": "1713311494",  # Cédula válida Ecuador
            "email": email_comun,  # MISMO EMAIL
            "fecha_nacimiento": "1989-09-03",
            "genero": "Masculino"
        }
        
        print(f"\n📤 Segunda inserción (EMAIL DUPLICADO):")
        print(f"   - Nombre: {datos2['nombre']} {datos2['apellido']}")
        print(f"   - Email: {email_comun} ⚠️  DUPLICADO")
        
        response2 = requests.post(API_URL, json=datos2, headers=headers)
        
        print(f"\n📥 Respuesta 2:")
        print(f"   📊 Status: {response2.status_code}")
        print(f"   💬 Mensaje: {response2.json().get('detail', 'N/A')}")
        
        assert response2.status_code == 400
        assert "email" in response2.text.lower()
        
        print(f"\n✅ CASO 4 PASADO: Email duplicado rechazado\n")


class TestCaso5RechazoCampoObligatorioHTTP:
    """
    CASO 5: Rechazo por campo obligatorio faltante
    
    Resultado Esperado:
    - Status Code: 422 Unprocessable Entity (validación Pydantic)
    - Mensaje: Indica el campo faltante
    """
    
    def test_rechazo_cedula_faltante_http(self, headers):
        """Prueba HTTP sin cédula (campo obligatorio)"""
        datos = {
            "nombre": "Roberto",
            "apellido": "Díaz",
            # cedula: OMITIDA intencionalmente
            "fecha_nacimiento": "1987-06-20",
            "genero": "Masculino"
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 5: Rechazo Campo Obligatorio Faltante (HTTP)")
        print(f"{'='*70}")
        print(f"📤 Datos enviados SIN cédula:")
        print(f"   - Nombre: {datos['nombre']} {datos['apellido']}")
        print(f"   ❌ Cédula: [OMITIDA]")
        
        response = requests.post(API_URL, json=datos, headers=headers)
        
        print(f"\n📥 Respuesta:")
        print(f"   📊 Status: {response.status_code}")
        print(f"   💬 Errores de validación:")
        
        try:
            errores = response.json().get('detail', [])
            if isinstance(errores, list):
                for error in errores:
                    campo = error.get('loc', ['?'])[-1]
                    mensaje = error.get('msg', 'N/A')
                    print(f"      - Campo '{campo}': {mensaje}")
            else:
                print(f"      {errores}")
        except:
            print(f"      {response.text}")
        
        assert response.status_code == 422, (
            f"Se esperaba 422 Unprocessable Entity, "
            f"pero se recibió {response.status_code}"
        )
        
        print(f"\n✅ CASO 5 PASADO: Campo faltante detectado\n")


class TestCaso6RechazoEmailInvalidoHTTP:
    """
    CASO 6: Rechazo por formato de email inválido
    
    Resultado Esperado:
    - Status Code: 422 Unprocessable Entity
    - Mensaje: Email inválido
    """
    
    def test_rechazo_email_sin_arroba_http(self, headers):
        """Prueba HTTP con email sin @"""
        datos = {
            "nombre": "Sofía",
            "apellido": "Jiménez",
            "cedula": "1803017241",  # Cédula válida Ecuador (Tungurahua)
            "email": "correo_invalido_sin_arroba.com",  # SIN @
            "fecha_nacimiento": "1993-12-08",
            "genero": "Femenino"
        }
        
        print(f"\n{'='*70}")
        print(f"📋 CASO 6: Rechazo Email Inválido (HTTP)")
        print(f"{'='*70}")
        print(f"📤 Datos enviados:")
        print(f"   - Nombre: {datos['nombre']} {datos['apellido']}")
        print(f"   - Email: {datos['email']} ❌ (sin @)")
        
        response = requests.post(API_URL, json=datos, headers=headers)
        
        print(f"\n📥 Respuesta:")
        print(f"   📊 Status: {response.status_code}")
        
        try:
            errores = response.json().get('detail', [])
            if isinstance(errores, list):
                for error in errores:
                    print(f"   💬 {error.get('msg', 'N/A')}")
            else:
                print(f"   💬 {errores}")
        except:
            print(f"   💬 {response.text}")
        
        assert response.status_code == 422
        assert "email" in response.text.lower()
        
        print(f"\n✅ CASO 6 PASADO: Email inválido rechazado\n")


# ========================================
# Configuración de pytest
# ========================================

def pytest_configure(config):
    """Mensaje de advertencia al iniciar las pruebas"""
    print("\n" + "="*70)
    print("⚠️  PRUEBAS DE INTEGRACIÓN HTTP - BACKEND DEBE ESTAR EN EJECUCIÓN")
    print("="*70)
    print("Antes de continuar, asegúrate de que:")
    print("  1. El backend esté corriendo: uvicorn app.main:app --reload")
    print("  2. La base de datos MySQL esté activa")
    print("  3. Haya un usuario admin registrado (admin@hospital.com)")
    print("="*70 + "\n")
