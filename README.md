# 🏥 Sistema de Gestión Médica

Sistema integral de gestión hospitalaria desarrollado con FastAPI (Backend) y React (Frontend).

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
  - [Clonar el Repositorio](#1-clonar-el-repositorio)
  - [Configurar Backend](#2-configurar-backend)
  - [Configurar Frontend](#3-configurar-frontend)
- [Ejecución](#-ejecución)
- [Documentación API](#-documentación-api)
- [Usuarios por Defecto](#-usuarios-por-defecto)
- [Estructura del Proyecto](#-estructura-del-proyecto)

---

## ✨ Características

- 👥 Gestión de pacientes y empleados
- 📅 Sistema de citas médicas
- 📝 Historias clínicas digitales
- 💊 Control de farmacia y recetas
- 📊 Consultas médicas y diagnósticos
- 📈 Encuestas de satisfacción
- 🔔 Notificaciones en tiempo real (WebSocket)
- 🔐 Autenticación JWT
- 📄 Generación de PDFs (recetas y comprobantes)
- 📱 Interfaz responsive

---

## 🛠️ Tecnologías

### Backend
- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para base de datos
- **MySQL** - Base de datos relacional
- **Pydantic** - Validación de datos
- **JWT** - Autenticación
- **ReportLab** - Generación de PDFs
- **WebSockets** - Comunicación en tiempo real

### Frontend
- **React** - Librería UI
- **React Router** - Enrutamiento
- **Tailwind CSS** - Estilos
- **Axios** - Cliente HTTP
- **React Big Calendar** - Calendario de citas
- **Context API** - Gestión de estado

---

## 📦 Requisitos Previos

### Para Windows y Linux:

- **Python 3.10+** ([Descargar](https://www.python.org/downloads/))
- **Node.js 18+** y **npm** ([Descargar](https://nodejs.org/))
- **MySQL 8.0+** ([Descargar](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Descargar](https://git-scm.com/downloads))

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
# HTTPS
git clone https://github.com/YormanOna/Grupo04-Proyecto.git

# Navegar al directorio
cd Grupo04-Proyecto
```

---

### 2. Configurar Backend

#### 🐧 Linux

```bash
# Navegar a la carpeta del backend
cd Backend

# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt
```

#### 🪟 Windows

```cmd
# Navegar a la carpeta del backend
cd Backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

#### Configurar Variables de Entorno

Crear un archivo `.env` en la carpeta `Backend/`:

```env
# Base de datos
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=GestionMedicaDB

# JWT
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (Opcional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=tu_email@gmail.com
SMTP_PASSWORD=tu_password_app
```

> **Nota**: Reemplaza `tu_password` con tu contraseña de MySQL y genera una `SECRET_KEY` segura.

---

### 3. Configurar Frontend

#### 🐧 Linux / 🪟 Windows

```bash
# Navegar a la carpeta del frontend
cd ../Frontend

# Instalar dependencias
npm install
```

#### Configurar Variables de Entorno

Crear un archivo `.env` en la carpeta `Frontend/`:

```env
VITE_API_URL=http://localhost:8000
```

---

## ▶️ Ejecución

### Iniciar Backend

#### 🐧 Linux

```bash
cd Backend

# Activar entorno virtual (si no está activo)
source venv/bin/activate

# Iniciar servidor
uvicorn app.main:app --reload
```

#### 🪟 Windows

```cmd
cd Backend

# Activar entorno virtual (si no está activo)
venv\Scripts\activate

# Iniciar servidor
uvicorn app.main:app --reload
```

El backend estará disponible en: **http://localhost:8000**

### Iniciar Frontend

#### 🐧 Linux / 🪟 Windows

```bash
cd Frontend

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 📚 Documentación API

Una vez iniciado el backend, puedes acceder a la documentación interactiva:

### Swagger UI
- **URL**: http://localhost:8000/docs
- Documentación interactiva estándar de FastAPI
- Permite probar endpoints directamente

### ReDoc
- **URL**: http://localhost:8000/redoc
- Documentación alternativa con diseño limpio
- Mejor para lectura y exportación

### Scalar API Reference
- **URL**: http://localhost:8000/scalar
- Documentación moderna con tema oscuro
- Diseño elegante con tema purple
- Búsqueda avanzada y navegación mejorada

---

## 👤 Usuarios por Defecto

Al iniciar el backend por primera vez, se crean automáticamente 5 usuarios base. Si cargaste los datos de ejemplo, tendrás acceso a 20 usuarios en total.

### Usuarios Base (Creados automáticamente)

| Rol | Email | Contraseña | Cédula |
|-----|-------|------------|--------|
| Super Admin | `superadmin@hospital.com` | `superadmin123` | 1111111111 |
| Admin | `admin@hospital.com` | `admin123` | 1234567890 |
| Médico | `medico@hospital.com` | `medico123` | 9876543210 |
| Enfermera | `enfermera@hospital.com` | `enfer123` | 5555555555 |
| Farmacéutico | `farmacia@hospital.com` | `farma123` | 7777777777 |

### Usuarios de Ejemplo (Si cargaste `InsertDatos.sql`)

#### Médicos (`medico123`)
- `carlos.mendez@hospital.com` - Cardiología
- `maria.gonzalez@hospital.com` - Pediatría
- `juan.rodriguez@hospital.com` - Medicina General
- `ana.perez@hospital.com` - Ginecología
- `luis.torres@hospital.com` - Traumatología
- `roberto.diaz@hospital.com` - Dermatología
- `valeria.ruiz@hospital.com` - Oftalmología
- `fernando.ortiz@hospital.com` - Neurología

#### Farmacéuticos (`farma123`)
- `carmen.sanchez@hospital.com`
- `pedro.ramirez@hospital.com`

#### Enfermeras (`enfer123`)
- `sofia.jimenez@hospital.com`
- `miguel.castro@hospital.com`

#### Administradores (`admin123`)
- `laura.morales@hospital.com`
- `diego.vargas@hospital.com`

Para más detalles, consulta: [`Backend/USUARIOS_DEFECTO.md`](Backend/USUARIOS_DEFECTO.md)

---

## 📁 Estructura del Proyecto

```
Grupo04-Proyecto/
├── Backend/
│   ├── app/
│   │   ├── core/           # Configuración central
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   ├── security.py
│   │   │   ├── init_data.py
│   │   │   └── websocket.py
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   ├── routes/         # Endpoints de la API
│   │   ├── services/       # Lógica de negocio
│   │   └── utils/          # Utilidades (PDF, email, logs)
│   ├── requirements.txt
│   ├── .env
│   └── USUARIOS_DEFECTO.md
├── Frontend/
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── context/        # Context API (Auth, Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Páginas principales
│   │   ├── router/         # Configuración de rutas
│   │   └── services/       # Servicios API
│   ├── package.json
│   └── .env
└── DB/
    ├── CreateTables.sql    # Script de creación de BD
    └── InsertDatos.sql     # Datos de ejemplo
```

---

## 🔧 Scripts Útiles

### Backend

```bash
# Ejecutar con recarga automática
uvicorn app.main:app --reload

# Ejecutar en modo producción
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Verificar instalación de dependencias
pip list
```

### Frontend

```bash
# Modo desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview

# Linter
npm run lint
```



## 🐛 Solución de Problemas

### Error: "Module not found"

**Backend**:
```bash
# Reactiva el entorno virtual
source venv/bin/activate  # Linux
venv\Scripts\activate     # Windows

# Reinstala dependencias
pip install -r requirements.txt
```

**Frontend**:
```bash
# Elimina node_modules y reinstala
rm -rf node_modules package-lock.json  # Linux
rmdir /s node_modules & del package-lock.json  # Windows
npm install
```



## 👥 Autores

**Grupo 04**



