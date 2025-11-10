# 🚀 Optimización de Base de Datos para Pruebas de Carga

## Problema Detectado

```
sqlalchemy.exc.TimeoutError: QueuePool limit of size 5 overflow 10 reached
```

El pool de conexiones de SQLAlchemy se agotaba bajo carga, causando timeouts y errores.

## ✅ Soluciones Aplicadas

### 1. **Aumento del Pool de Conexiones en SQLAlchemy**

**Archivo:** `app/core/database.py`

```python
engine = create_engine(
    DATABASE_URL, 
    pool_size=20,         # ⬆️ Antes: 5 (default)
    max_overflow=30,      # ⬆️ Antes: 10 (default)
    pool_timeout=60,      # ⬆️ Antes: 30 (default)
    pool_recycle=3600,    # ♻️ Reciclar conexiones cada hora
    pool_pre_ping=True    # ✅ Verificar conexiones antes de usar
)
```

**Capacidad:** Hasta **50 conexiones simultáneas** (20 base + 30 overflow)

### 2. **Configuración Recomendada de MySQL**

Para soportar la carga, MySQL también debe estar configurado correctamente.

#### **Verificar configuración actual de MySQL:**

```sql
SHOW VARIABLES LIKE 'max_connections';
SHOW VARIABLES LIKE 'wait_timeout';
SHOW STATUS LIKE 'Threads_connected';
```

#### **Valores Recomendados:**

Edita el archivo de configuración de MySQL (`my.ini` en Windows o `my.cnf` en Linux):

```ini
[mysqld]
# Número máximo de conexiones simultáneas
max_connections = 200

# Tiempo de espera antes de cerrar conexiones inactivas (en segundos)
wait_timeout = 600
interactive_timeout = 600

# Tamaño del buffer de consultas
innodb_buffer_pool_size = 256M

# Número de archivos abiertos
open_files_limit = 5000
table_open_cache = 2000
```

**Ubicación del archivo:**
- **Windows (XAMPP):** `C:\xampp\mysql\bin\my.ini`
- **Windows (MySQL standalone):** `C:\ProgramData\MySQL\MySQL Server X.X\my.ini`
- **Linux:** `/etc/mysql/my.cnf` o `/etc/my.cnf`

#### **Aplicar cambios:**

1. Guarda el archivo `my.ini` o `my.cnf`
2. Reinicia el servicio MySQL:
   ```bash
   # Windows (XAMPP)
   En el panel de XAMPP, detener y arrancar MySQL
   
   # Windows (Servicio)
   net stop MySQL80
   net start MySQL80
   
   # Linux
   sudo systemctl restart mysql
   ```

### 3. **Verificación Post-Configuración**

Ejecuta en MySQL:

```sql
-- Ver conexiones actuales
SHOW PROCESSLIST;

-- Ver máximo de conexiones
SHOW VARIABLES LIKE 'max_connections';

-- Ver estadísticas de conexiones
SHOW STATUS LIKE 'Max_used_connections';
SHOW STATUS LIKE 'Threads_connected';
```

## 📊 **Resultados Esperados**

Después de estas optimizaciones:

✅ El backend soportará **hasta 50 conexiones simultáneas** desde Locust
✅ Las conexiones inactivas se reciclarán automáticamente
✅ Se eliminarán los errores `TimeoutError` durante las pruebas
✅ Mayor estabilidad bajo carga pesada

## 🧪 **Pruebas de Carga Recomendadas**

Con la nueva configuración, puedes ejecutar:

```bash
# Prueba moderada
locust -f locustfile.py --host=http://localhost:8000 --users 50 --spawn-rate 10

# Prueba intensiva
locust -f locustfile.py --host=http://localhost:8000 --users 100 --spawn-rate 20

# Prueba de estrés (límite del sistema)
locust -f locustfile.py --host=http://localhost:8000 --users 200 --spawn-rate 30
```

## 📈 **Monitoreo Durante Pruebas**

### En MySQL:
```sql
-- Ejecutar en consola MySQL mientras corren las pruebas
SHOW STATUS LIKE 'Threads%';
SHOW STATUS LIKE 'Connections';
SHOW PROCESSLIST;
```

### En el Backend (logs):
Observa si aparecen errores de timeout. Si aún hay problemas, aumenta más el pool.

## 🔧 **Ajustes Adicionales (Opcional)**

Si aún experimentas problemas con cargas muy altas:

### Opción 1: Aumentar más el pool
```python
pool_size=30,
max_overflow=50,  # Total: 80 conexiones
```

### Opción 2: Usar pool NullPool para desarrollo
```python
from sqlalchemy.pool import NullPool
engine = create_engine(DATABASE_URL, poolclass=NullPool)
```
⚠️ **Nota:** NullPool crea una nueva conexión para cada request (más lento pero sin límite)

### Opción 3: Implementar caché
Agrega Redis para cachear consultas frecuentes y reducir carga en la DB.

## 🎯 **Resumen**

| Métrica | Antes | Después |
|---------|-------|---------|
| Pool size | 5 | 20 |
| Max overflow | 10 | 30 |
| **Total conexiones** | **15** | **50** |
| Pool timeout | 30s | 60s |
| Pool recycle | No | 1 hora |

---

**Última actualización:** 10 de noviembre de 2025
