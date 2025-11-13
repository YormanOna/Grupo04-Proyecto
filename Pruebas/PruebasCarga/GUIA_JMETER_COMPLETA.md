# 📊 GUÍA COMPLETA DE PRUEBAS DE CARGA CON JMETER

## 🎯 Índice

1. [Introducción](#1-introducción)
2. [Instalación de JMeter](#2-instalación-de-jmeter)
3. [Configuración Inicial](#3-configuración-inicial)
4. [Crear Plan de Pruebas Básico](#4-crear-plan-de-pruebas-básico)
5. [Prueba Avanzada: Sistema Médico](#5-prueba-avanzada-sistema-médico)
6. [Análisis de Resultados](#6-análisis-de-resultados)
7. [Mejores Prácticas](#7-mejores-prácticas)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Introducción

### ¿Qué es JMeter?

Apache JMeter es una herramienta open-source para pruebas de carga y medición de rendimiento. Puede simular múltiples usuarios concurrentes, medir tiempos de respuesta y detectar cuellos de botella.

### ¿Cuándo usar JMeter?

- ✅ Pruebas de carga (performance testing)
- ✅ Pruebas de estrés (stress testing)
- ✅ Pruebas de resistencia (endurance testing)
- ✅ Pruebas de picos (spike testing)
- ✅ APIs REST, SOAP, WebSockets
- ✅ Bases de datos, FTP, LDAP

### Requisitos Previos

- ☕ Java JDK 8 o superior instalado
- 💻 4GB RAM mínimo (8GB recomendado)
- 🌐 Backend corriendo en `http://localhost:8000`

---

## 2. Instalación de JMeter

### Opción 1: Linux (Ubuntu/Debian)

```bash
# Actualizar sistema
sudo apt update

# Instalar Java (si no está instalado)
sudo apt install default-jdk -y

# Verificar instalación de Java
java -version

# Descargar JMeter (última versión)
cd ~/Downloads
wget https://dlcdn.apache.org//jmeter/binaries/apache-jmeter-5.6.3.tgz

# Extraer
tar -xzf apache-jmeter-5.6.3.tgz

# Mover a /opt (opcional)
sudo mv apache-jmeter-5.6.3 /opt/jmeter

# Crear alias para facilitar el uso
echo 'export PATH=$PATH:/opt/jmeter/bin' >> ~/.bashrc
source ~/.bashrc

# Iniciar JMeter
jmeter
```

### Opción 2: Windows

1. **Instalar Java:**
   - Descargar desde: https://www.oracle.com/java/technologies/downloads/
   - Ejecutar instalador
   - Agregar Java a las variables de entorno PATH

2. **Descargar JMeter:**
   - Ir a: https://jmeter.apache.org/download_jmeter.cgi
   - Descargar archivo .zip
   - Extraer en `C:\JMeter`

3. **Ejecutar:**
   - Ir a `C:\JMeter\bin`
   - Ejecutar `jmeter.bat`

### Opción 3: macOS

```bash
# Instalar Homebrew (si no está instalado)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Instalar JMeter
brew install jmeter

# Ejecutar
jmeter
```

### Verificar Instalación

```bash
# Debe mostrar la versión instalada
jmeter --version

# Output esperado:
# Apache JMeter 5.6.3
```

---

## 3. Configuración Inicial

### Estructura de JMeter

```
Plan de Pruebas (Test Plan)
├── Thread Group (Grupo de Hilos)
│   ├── HTTP Request Defaults
│   ├── HTTP Header Manager
│   ├── HTTP Cookie Manager
│   ├── User Defined Variables
│   ├── Samplers (Peticiones HTTP)
│   ├── Listeners (Visualizadores de resultados)
│   └── Assertions (Validaciones)
└── Configuración global
```

### Configurar Variables Globales

1. Abrir JMeter
2. Click derecho en **Test Plan** → Add → Config Element → **User Defined Variables**
3. Agregar variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `BASE_URL` | `localhost` | Dominio del servidor |
| `PORT` | `8000` | Puerto del servidor |
| `PROTOCOL` | `http` | Protocolo (http/https) |
| `ADMIN_EMAIL` | `admin@hospital.com` | Email de admin |
| `ADMIN_PASSWORD` | `admin123` | Password de admin |
| `MEDICO_EMAIL` | `medico@hospital.com` | Email de médico |
| `MEDICO_PASSWORD` | `medico123` | Password de médico |

---

## 4. Crear Plan de Pruebas Básico

### Paso 1: Crear Thread Group (Grupo de Usuarios)

1. Click derecho en **Test Plan** → Add → Threads (Users) → **Thread Group**

2. Configurar:
   - **Name:** `Usuarios Concurrentes`
   - **Number of Threads (users):** `10` (simula 10 usuarios)
   - **Ramp-Up Period (seconds):** `5` (5 segundos para crear los 10 usuarios)
   - **Loop Count:** `10` (cada usuario ejecuta 10 veces)

**Cálculo:** 10 usuarios × 10 repeticiones = 100 requests totales

### Paso 2: Agregar HTTP Request Defaults

1. Click derecho en **Thread Group** → Add → Config Element → **HTTP Request Defaults**

2. Configurar:
   - **Protocol:** `${PROTOCOL}` (usa variable)
   - **Server Name or IP:** `${BASE_URL}`
   - **Port Number:** `${PORT}`

### Paso 3: Agregar HTTP Header Manager

1. Click derecho en **Thread Group** → Add → Config Element → **HTTP Header Manager**

2. Agregar headers:
   - **Name:** `Content-Type`, **Value:** `application/json`
   - **Name:** `Accept`, **Value:** `application/json`

### Paso 4: Crear Primera Petición (Login)

1. Click derecho en **Thread Group** → Add → Sampler → **HTTP Request**

2. Configurar:
   - **Name:** `POST - Login Admin`
   - **Method:** `POST`
   - **Path:** `/auth/login`
   - **Body Data:**
   ```json
   {
     "email": "${ADMIN_EMAIL}",
     "password": "${ADMIN_PASSWORD}"
   }
   ```

### Paso 5: Extraer Token (JSON Extractor)

1. Click derecho en **POST - Login Admin** → Add → Post Processors → **JSON Extractor**

2. Configurar:
   - **Name:** `Extraer Token JWT`
   - **Names of created variables:** `token`
   - **JSON Path expressions:** `$.access_token`
   - **Match No.:** `1`
   - **Default Values:** `TOKEN_NO_ENCONTRADO`

### Paso 6: Usar Token en Siguientes Peticiones

1. Click derecho en **Thread Group** → Add → Sampler → **HTTP Request**

2. Configurar:
   - **Name:** `GET - Listar Pacientes`
   - **Method:** `GET`
   - **Path:** `/pacientes/`

3. Click derecho en **GET - Listar Pacientes** → Add → Config Element → **HTTP Header Manager**

4. Agregar header:
   - **Name:** `Authorization`, **Value:** `Bearer ${token}`

### Paso 7: Agregar Listeners (Resultados)

1. Click derecho en **Thread Group** → Add → Listener → **View Results Tree**
   - Muestra cada request individual

2. Click derecho en **Thread Group** → Add → Listener → **Summary Report**
   - Muestra estadísticas generales

3. Click derecho en **Thread Group** → Add → Listener → **Graph Results**
   - Muestra gráficas de rendimiento

### Paso 8: Ejecutar Prueba

1. **Guardar:** File → Save Test Plan As → `prueba_basica.jmx`

2. **Ejecutar:** Click en el botón verde ▶️ (Start) o Ctrl+R

3. **Ver Resultados:** Click en cualquier Listener

---

## 5. Prueba Avanzada: Sistema Médico

### Escenario Completo: Flujo de Consulta Médica

Vamos a simular un flujo realista:

1. **Recepcionista:** Login → Crear paciente → Agendar cita
2. **Médico:** Login → Ver citas → Crear consulta → Prescribir receta
3. **Farmacéutico:** Login → Ver recetas → Dispensar medicamento

### Configuración Avanzada

#### Thread Group 1: Recepcionistas (40% del tráfico)

```
Nombre: Recepcionistas
Usuarios: 40
Ramp-Up: 10 segundos
Loop Count: 5
```

**Peticiones:**

1. **POST /auth/login**
   ```json
   {
     "email": "admin@hospital.com",
     "password": "admin123"
   }
   ```
   - JSON Extractor: `token` desde `$.access_token`

2. **POST /pacientes/** (Crear Paciente)
   ```json
   {
     "nombre": "Juan",
     "apellido": "Pérez",
     "cedula": "${__Random(1000000000,9999999999)}",
     "fecha_nacimiento": "1990-05-15",
     "genero": "Masculino",
     "telefono": "0987654321",
     "email": "juan.perez${__Random(1000,9999)}@test.com"
   }
   ```
   - JSON Extractor: `paciente_id` desde `$.id`

3. **GET /pacientes/** (Listar Pacientes)
   - Header: `Authorization: Bearer ${token}`
   - JSON Extractor: Extraer lista de pacientes

4. **GET /medicos/** (Obtener Médicos)
   - JSON Extractor: `medico_id` desde `$[0].id`

5. **POST /citas/** (Agendar Cita)
   ```json
   {
     "paciente_id": ${paciente_id},
     "medico_id": ${medico_id},
     "fecha": "${__time(yyyy-MM-dd,)}T09:00:00",
     "hora_inicio": "09:00",
     "hora_fin": "09:30",
     "motivo": "Control general",
     "estado": "programada",
     "tipo_cita": "consulta"
   }
   ```
   - JSON Extractor: `cita_id` desde `$.id`

#### Thread Group 2: Médicos (30% del tráfico)

```
Nombre: Médicos
Usuarios: 30
Ramp-Up: 10 segundos
Loop Count: 5
```

**Peticiones:**

1. **POST /auth/login**
   ```json
   {
     "email": "medico@hospital.com",
     "password": "medico123"
   }
   ```

2. **GET /citas/** (Ver Mis Citas)

3. **POST /consultas/** (Crear Consulta)
   ```json
   {
     "paciente_id": ${paciente_id},
     "medico_id": ${medico_id},
     "cita_id": ${cita_id},
     "motivo_consulta": "Control de rutina",
     "diagnostico": "Paciente sano",
     "tratamiento": "Ninguno necesario",
     "signos_vitales": {
       "presion_arterial": "120/80",
       "frecuencia_cardiaca": 75,
       "temperatura": 36.5,
       "saturacion_oxigeno": 98
     }
   }
   ```
   - JSON Extractor: `consulta_id` desde `$.id`

4. **POST /recetas/** (Prescribir Receta)
   ```json
   {
     "consulta_id": ${consulta_id},
     "paciente_id": ${paciente_id},
     "medico_id": ${medico_id},
     "medicamentos": "Paracetamol 500mg - 1 tableta cada 8 horas por 5 días",
     "indicaciones": "Tomar después de las comidas"
   }
   ```

#### Thread Group 3: Farmacéuticos (15% del tráfico)

```
Nombre: Farmacéuticos
Usuarios: 15
Ramp-Up: 5 segundos
Loop Count: 10
```

**Peticiones:**

1. **POST /auth/login**
   ```json
   {
     "email": "farmacia@hospital.com",
     "password": "farma123"
   }
   ```

2. **GET /recetas/?estado=pendiente** (Listar Recetas Pendientes)

3. **POST /recetas/{receta_id}/dispensar** (Dispensar Medicamento)

### Agregar Assertions (Validaciones)

Para cada petición importante, agregar:

1. Click derecho en **HTTP Request** → Add → Assertions → **Response Assertion**

2. Configurar:
   - **Field to Test:** `Response Code`
   - **Pattern Matching Rules:** `Equals`
   - **Patterns to Test:** `200`

### Agregar Timers (Delays Realistas)

1. Click derecho en **Thread Group** → Add → Timer → **Gaussian Random Timer**

2. Configurar:
   - **Constant Delay Offset (ms):** `1000` (1 segundo base)
   - **Deviation (ms):** `500` (variación de ±500ms)

Esto simula que los usuarios no hacen todo instantáneamente.

### Agregar CSV Data Set Config (Datos Dinámicos)

Si tienes muchos usuarios, usa un archivo CSV:

1. Crear `usuarios.csv`:
```csv
email,password
admin1@hospital.com,admin123
admin2@hospital.com,admin123
medico1@hospital.com,medico123
medico2@hospital.com,medico123
```

2. Click derecho en **Thread Group** → Add → Config Element → **CSV Data Set Config**

3. Configurar:
   - **Filename:** `usuarios.csv`
   - **Variable Names:** `email,password`
   - **Recycle on EOF:** `True`
   - **Sharing mode:** `All threads`

4. Usar en Login:
```json
{
  "email": "${email}",
  "password": "${password}"
}
```

---

## 6. Análisis de Resultados

### Métricas Clave

#### 1. **Average Response Time** (Tiempo Promedio de Respuesta)
- **Excelente:** < 200ms
- **Bueno:** 200-500ms
- **Aceptable:** 500-1000ms
- **Malo:** > 1000ms
- **Crítico:** > 2000ms

#### 2. **Throughput** (Rendimiento)
- Requests por segundo (req/s)
- **Objetivo:** Maximizar sin incrementar errores

#### 3. **Error Rate** (Tasa de Error)
- **Excelente:** 0%
- **Bueno:** < 0.1%
- **Aceptable:** < 1%
- **Malo:** > 1%
- **Crítico:** > 5%

#### 4. **95th Percentile** (Percentil 95)
- El 95% de los requests se completan en este tiempo
- Más importante que el promedio (ignora outliers)
- **Objetivo:** < 1000ms

#### 5. **Concurrent Users** (Usuarios Concurrentes)
- Máximo número de usuarios simultáneos soportados
- **Objetivo:** Depende del caso de uso

### Listeners Recomendados

#### 1. **Aggregate Report** (Reporte Agregado)
Muestra estadísticas por endpoint:
- Label (nombre de la petición)
- Samples (cantidad de peticiones)
- Average (tiempo promedio)
- Min/Max (tiempos mínimo/máximo)
- Std. Dev. (desviación estándar)
- Error % (porcentaje de errores)
- Throughput (peticiones/segundo)

#### 2. **Response Time Graph** (Gráfica de Tiempos)
Visualiza cómo evoluciona el tiempo de respuesta:
- Eje X: Tiempo transcurrido
- Eje Y: Tiempo de respuesta (ms)
- Detecta degradación de rendimiento

#### 3. **Active Threads Over Time** (Plugin)
Muestra usuarios concurrentes vs tiempo:
- Ayuda a visualizar el ramp-up
- Detecta problemas de escalabilidad

### Exportar Resultados

#### Opción 1: Guardar Resultados en CSV

1. Click derecho en **Thread Group** → Add → Listener → **Simple Data Writer**

2. Configurar:
   - **Filename:** `resultados.csv`
   - **Configure:** Seleccionar campos a guardar

#### Opción 2: Generar Reporte HTML

```bash
# Durante la ejecución (modo no-GUI)
jmeter -n -t prueba.jmx -l resultados.jtl -e -o reporte_html/

# Después de la ejecución
jmeter -g resultados.jtl -o reporte_html/
```

El reporte HTML incluye:
- Dashboard con métricas clave
- Gráficas interactivas
- Desglose por endpoint
- Errores y sus causas

---

## 7. Mejores Prácticas

### 1. **Modo No-GUI para Pruebas de Carga**

La interfaz gráfica consume muchos recursos. Para pruebas reales, usar:

```bash
# Ejecutar en modo no-GUI
jmeter -n -t prueba.jmx -l resultados.jtl -j jmeter.log

# Con reporte HTML automático
jmeter -n -t prueba.jmx -l resultados.jtl -e -o reporte/ -j jmeter.log
```

Parámetros:
- `-n`: Modo no-GUI
- `-t`: Archivo del plan de pruebas
- `-l`: Archivo de resultados
- `-e`: Generar reporte después de la ejecución
- `-o`: Carpeta de salida del reporte
- `-j`: Archivo de logs de JMeter

### 2. **Configurar JVM para Mejor Rendimiento**

Editar `jmeter` (Linux/Mac) o `jmeter.bat` (Windows):

```bash
# Aumentar heap de Java
HEAP="-Xms1g -Xmx4g -XX:MaxMetaspaceSize=256m"

# Para pruebas muy grandes
HEAP="-Xms4g -Xmx8g -XX:MaxMetaspaceSize=512m"
```

### 3. **Estrategia de Ramp-Up**

No iniciar todos los usuarios al mismo tiempo:

| Usuarios | Ramp-Up Recomendado |
|----------|---------------------|
| 10       | 5-10 segundos       |
| 50       | 30 segundos         |
| 100      | 1 minuto            |
| 500      | 5 minutos           |
| 1000+    | 10+ minutos         |

### 4. **Think Time (Tiempo de Espera)**

Usuarios reales no ejecutan acciones instantáneamente. Agregar:

```
Gaussian Random Timer:
- Constant Delay: 2000ms (2 segundos)
- Deviation: 1000ms (±1 segundo)
```

### 5. **Reutilizar Conexiones HTTP**

1. En **HTTP Request Defaults**:
   - ✅ **Use KeepAlive**
   - ✅ **Use multipart/form-data for POST**

### 6. **Deshabilitar Listeners Durante Pruebas**

Los listeners consumen memoria. Para pruebas grandes:
- Deshabilitarlos durante la ejecución
- Generar reporte HTML después

### 7. **Distribución de Carga**

Para simular > 1000 usuarios, usar modo distribuido:

```bash
# Servidor Master
jmeter -n -t prueba.jmx -R servidor1,servidor2,servidor3

# Servidores Workers (en cada máquina)
jmeter-server
```

### 8. **Validar Respuestas**

Agregar Assertions para verificar:
- Response Code = 200
- Response contiene texto esperado
- Response Time < umbral definido

---

## 8. Troubleshooting

### Problema 1: "Address already in use"

**Causa:** JMeter ya está corriendo o el puerto está ocupado

**Solución:**
```bash
# Ver procesos de JMeter
ps aux | grep jmeter

# Matar procesos
killall java

# O específicamente
kill -9 <PID>
```

### Problema 2: "OutOfMemoryError"

**Causa:** Heap de Java insuficiente

**Solución:**
```bash
# Aumentar heap en jmeter script
export HEAP="-Xms2g -Xmx4g"
jmeter
```

### Problema 3: "Too many open files"

**Causa:** Límite de archivos abiertos del sistema

**Solución (Linux):**
```bash
# Ver límite actual
ulimit -n

# Aumentar límite (temporal)
ulimit -n 65536

# Permanente: editar /etc/security/limits.conf
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf
```

### Problema 4: Muchos Errores 401 (Unauthorized)

**Causas Posibles:**
- Token no se extrajo correctamente
- Token expiró (vida útil corta)
- Usuario no existe

**Solución:**
1. Verificar JSON Extractor del token
2. Aumentar vida del token en backend
3. Agregar Debug Sampler para ver variables:
   - Click derecho → Add → Sampler → Debug Sampler
   - Ver valores de `${token}`

### Problema 5: Backend se Cae

**Causas Posibles:**
- Demasiados usuarios concurrentes
- Ramp-up muy agresivo
- Base de datos sobrecargada
- Falta de optimización

**Solución:**
1. Reducir número de usuarios
2. Aumentar ramp-up period
3. Optimizar consultas SQL (agregar índices)
4. Implementar caché (Redis)
5. Escalar backend (más instancias)

### Problema 6: Resultados Inconsistentes

**Causas:**
- Caché del navegador/proxy
- Conexiones keep-alive reutilizadas
- Estado compartido entre threads

**Solución:**
- Agregar HTTP Cache Manager (deshabilitar caché)
- Usar datos únicos por thread (CSV o funciones ${__threadNum})
- Configurar correctamente el sharing mode

---

## 📋 Checklist de Prueba de Carga

Antes de ejecutar una prueba de carga importante:

### Pre-Ejecución

- [ ] Backend corriendo en servidor dedicado (no localhost para producción)
- [ ] Base de datos limpia o con datos de prueba controlados
- [ ] Usuarios de prueba creados y verificados
- [ ] Plan de pruebas guardado (.jmx)
- [ ] Listeners deshabilitados (si es prueba grande)
- [ ] Heap de Java configurado adecuadamente
- [ ] Timeout configurado en HTTP Requests
- [ ] Assertions agregadas a peticiones críticas

### Durante Ejecución

- [ ] Monitorear uso de CPU del servidor
- [ ] Monitorear uso de memoria del servidor
- [ ] Monitorear conexiones de base de datos
- [ ] Observar tiempos de respuesta en tiempo real
- [ ] Revisar logs de errores del backend

### Post-Ejecución

- [ ] Generar reporte HTML
- [ ] Analizar métricas clave (avg, 95th percentile, error rate)
- [ ] Identificar endpoints lentos
- [ ] Documentar hallazgos
- [ ] Comparar con baseline (si existe)
- [ ] Planificar optimizaciones

---

## 🚀 Comandos Útiles

### Ejecución Básica

```bash
# GUI Mode (desarrollo)
jmeter

# Non-GUI Mode (producción)
jmeter -n -t prueba.jmx -l resultados.jtl

# Con reporte HTML
jmeter -n -t prueba.jmx -l resultados.jtl -e -o reporte/

# Generar reporte de archivo existente
jmeter -g resultados.jtl -o reporte/
```

### Configuración Avanzada

```bash
# Con propiedades personalizadas
jmeter -n -t prueba.jmx -Jusers=100 -Jrampup=30 -l resultados.jtl

# Modo distribuido (master con 3 workers)
jmeter -n -t prueba.jmx -R slave1,slave2,slave3 -l resultados.jtl

# Con log específico
jmeter -n -t prueba.jmx -l resultados.jtl -j jmeter.log
```

### Utilidades

```bash
# Ver versión
jmeter --version

# Listar plugins instalados
jmeter --?

# Limpiar resultados previos
rm -rf resultados.jtl reporte/
```

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **JMeter Oficial:** https://jmeter.apache.org/
- **User Manual:** https://jmeter.apache.org/usermanual/index.html
- **Best Practices:** https://jmeter.apache.org/usermanual/best-practices.html

### Plugins Útiles

- **JMeter Plugins Manager:** https://jmeter-plugins.org/
- **PerfMon (Server Monitoring):** Monitorear CPU, memoria del servidor
- **Custom Thread Groups:** Más control sobre usuarios concurrentes

### Instalación de Plugins Manager

```bash
cd /opt/jmeter/lib/ext
wget https://jmeter-plugins.org/get/ -O jmeter-plugins-manager.jar
```

Reiniciar JMeter y verás: Options → Plugins Manager

---

## ✅ Conclusión

JMeter es una herramienta poderosa para pruebas de carga. Los puntos clave son:

1. **Configurar adecuadamente:** Thread Groups, Ramp-Up, Loops
2. **Simular usuarios reales:** Think Time, datos dinámicos
3. **Validar respuestas:** Assertions, Response Codes
4. **Medir correctamente:** Listeners, métricas clave
5. **Optimizar:** Modo no-GUI, heap adecuado
6. **Analizar resultados:** Identificar cuellos de botella

**Próximos pasos:**
1. Crear tu primer Test Plan siguiendo la sección 4
2. Ejecutar prueba básica con 10 usuarios
3. Analizar resultados y optimizar
4. Escalar gradualmente (50, 100, 500 usuarios)
5. Implementar mejoras en el backend según hallazgos

---

**Fecha:** 12 de noviembre de 2025  
**Versión:** 1.0  
**Autor:** Sistema de Gestión Médica - Grupo 04
