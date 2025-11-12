# 🐳 Docker - Sistema Hospitalario

Configuración completa de Docker para el Sistema de Gestión Médica Hospitalaria.

## 📋 Contenido

Este setup de Docker incluye:

- **MySQL 8.0** - Base de datos con datos iniciales
- **Backend FastAPI** - API REST con Python 3.11
- **Frontend React + Vite** - Interfaz de usuario con hot reload

## 🚀 Inicio Rápido

### 1. Prerrequisitos

- Docker Desktop instalado ([Descargar](https://www.docker.com/products/docker-desktop))
- Docker Compose incluido con Docker Desktop

### 2. Configuración Inicial

```bash
# Navegar a la carpeta docker
cd docker

# Copiar archivo de configuración (opcional)
cp .env.example .env

# Editar .env con tus valores personalizados si es necesario
# (Los valores por defecto funcionan perfectamente)
```

### 3. Levantar los Contenedores

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql
```

### 4. Verificar Estado

```bash
# Ver contenedores en ejecución
docker-compose ps

# Verificar salud de los servicios
docker-compose ps --format json | jq '.[].Health'
```

## 🌐 Acceso a los Servicios

Una vez que los contenedores estén corriendo:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Interfaz de usuario React |
| Backend API | http://localhost:8000 | API REST FastAPI |
| API Docs | http://localhost:8000/docs | Documentación Swagger |
| MySQL | localhost:3307 | Base de datos (puerto 3307 para evitar conflictos) |

## 👤 Usuarios por Defecto

El sistema viene con usuarios precargados:

### Super Administrador
- **Email:** superadmin@hospital.com
- **Password:** superadmin123

### Administrador
- **Email:** admin@hospital.com
- **Password:** admin123

### Médico
- **Email:** medico@hospital.com
- **Password:** medico123

### Enfermera
- **Email:** enfermera@hospital.com
- **Password:** enfer123

### Farmacéutico
- **Email:** farmacia@hospital.com
- **Password:** farma123

## 🛠️ Comandos Útiles

### Gestión de Contenedores

```bash
# Detener todos los servicios
docker-compose stop

# Reiniciar todos los servicios
docker-compose restart

# Reiniciar un servicio específico
docker-compose restart backend

# Detener y eliminar contenedores
docker-compose down

# Detener y eliminar contenedores + volúmenes (⚠️ BORRA LA BASE DE DATOS)
docker-compose down -v

# Reconstruir contenedores
docker-compose up -d --build

# Reconstruir un servicio específico
docker-compose up -d --build backend
```

### Debugging

```bash
# Acceder a shell de un contenedor
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mysql bash

# Ver logs de errores
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend

# Inspeccionar base de datos
docker-compose exec mysql mysql -u hospital_user -phospital_pass GestionMedicaDB

# Ejecutar comandos en backend
docker-compose exec backend python -c "from app.core.database import engine; print(engine.url)"
```

### Gestión de Base de Datos

```bash
# Backup de base de datos
docker-compose exec mysql mysqldump -u hospital_user -phospital_pass GestionMedicaDB > backup.sql

# Restaurar base de datos
docker-compose exec -T mysql mysql -u hospital_user -phospital_pass GestionMedicaDB < backup.sql

# Ver tablas
docker-compose exec mysql mysql -u hospital_user -phospital_pass -e "USE GestionMedicaDB; SHOW TABLES;"

# Resetear base de datos (eliminar datos)
docker-compose down -v
docker-compose up -d
```

## 📊 Monitoreo

### Ver uso de recursos

```bash
# Estadísticas de contenedores
docker stats

# Uso de espacio
docker system df

# Limpiar recursos no utilizados
docker system prune -a
```

### Healthchecks

Los servicios incluyen healthchecks automáticos:

```bash
# Ver estado de salud
docker-compose ps

# Backend: http://localhost:8000/
# MySQL: mysqladmin ping
```

## 🔧 Configuración Avanzada

### Variables de Entorno

Puedes personalizar la configuración editando `.env`:

```bash
# Cambiar puertos
MYSQL_PORT=3308
BACKEND_PORT=8001
FRONTEND_PORT=3000

# Cambiar credenciales de MySQL
MYSQL_PASSWORD=mi_password_seguro
SECRET_KEY=mi-clave-jwt-super-secreta

# Cambiar tiempo de expiración de tokens
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 horas
```

### Volúmenes Persistentes

Los datos se guardan en volúmenes Docker:

- `mysql_data` - Datos de la base de datos
- `backend_cache` - Caché de Python
- `frontend_cache` - Caché de npm

```bash
# Listar volúmenes
docker volume ls

# Inspeccionar volumen
docker volume inspect docker_mysql_data

# Eliminar todos los volúmenes (⚠️ CUIDADO)
docker volume prune
```

## 🚨 Solución de Problemas

### Error: Puerto ya en uso

```bash
# Si el puerto 3306, 5173 u 8000 ya están en uso:
# 1. Cambiar puertos en docker-compose.yml
# 2. O detener el servicio que usa el puerto

# Ver qué proceso usa el puerto
netstat -ano | findstr :3306
netstat -ano | findstr :8000
netstat -ano | findstr :5173
```

### Error: MySQL no inicia

```bash
# Ver logs detallados
docker-compose logs mysql

# Eliminar volumen y reiniciar
docker-compose down -v
docker-compose up -d
```

### Error: Backend no conecta a MySQL

```bash
# Verificar que MySQL esté saludable
docker-compose ps

# Verificar conectividad desde backend
docker-compose exec backend ping mysql

# Verificar variables de entorno
docker-compose exec backend env | grep DB
```

### Error: Frontend no carga

```bash
# Reconstruir node_modules
docker-compose down
docker-compose up -d --build frontend

# Ver logs de npm
docker-compose logs -f frontend
```

## 📝 Desarrollo

### Hot Reload

Ambos servicios (frontend y backend) tienen hot reload activado:

- **Frontend**: Vite detecta cambios automáticamente
- **Backend**: Uvicorn con `--reload` detecta cambios en archivos `.py`

### Instalar nuevas dependencias

```bash
# Backend (Python)
docker-compose exec backend pip install nombre-paquete
# Actualizar requirements.txt
docker-compose exec backend pip freeze > requirements.txt

# Frontend (npm)
docker-compose exec frontend npm install nombre-paquete
```

## 🏗️ Producción

Para despliegue en producción:

1. **Cambiar credenciales** en `.env`
2. **Usar imagen optimizada** para frontend:

```dockerfile
# Build stage
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

3. **Configurar reverse proxy** (nginx/traefik)
4. **Habilitar HTTPS** con Let's Encrypt
5. **Configurar backups automáticos**

## 📚 Recursos

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Vite](https://vitejs.dev/)
- [MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs -f`
2. Verifica el estado: `docker-compose ps`
3. Revisa las variables de entorno: `docker-compose config`
4. Limpia y reconstruye: `docker-compose down -v && docker-compose up -d --build`

---

**¡Listo!** Tu Sistema Hospitalario debería estar corriendo en contenedores Docker 🎉
