# 🚀 Configuración de Resend para Emails

## ✅ ¿Qué es Resend?

Resend es un servicio moderno de envío de emails que **NO necesita SMTP**. Funciona con una API simple y es **GRATIS** para desarrollo:

- ✅ **100 emails por día** gratis
- ✅ **3,000 emails por mes** gratis
- ✅ No necesitas verificar dominios
- ✅ No hay problemas de "Network unreachable"
- ✅ Funciona perfectamente desde cualquier red

---

## 🎯 Configuración en 3 Pasos

### Paso 1: Crear Cuenta en Resend

1. Ve a: https://resend.com
2. Clic en "Sign Up" (Registrarse)
3. Puedes usar:
   - GitHub (recomendado - 1 clic)
   - Google
   - Email

### Paso 2: Obtener API Key

1. Una vez dentro, ve a: **API Keys**
2. Verás una key que dice: `re_...`
3. **Cópiala completa**

Ejemplo:
```
re_123abc456_xyz789pqr
```

### Paso 3: Configurar en el Backend

Edita `/Backend/.env`:

```env
# Pega tu API Key aquí
RESEND_API_KEY=re_TU_API_KEY_COMPLETA_AQUI
EMAIL_FROM=Sistema Hospitalario <onboarding@resend.dev>
USE_RESEND=true
```

**IMPORTANTE**: 
- Usa `onboarding@resend.dev` como remitente (es el dominio gratuito de Resend)
- NO cambies el dominio a menos que tengas uno verificado

---

## 🚀 Reiniciar y Probar

### 1. Reinicia el Backend

```bash
cd /home/yorman/Documentos/Github/Grupo04-Proyecto/Backend
uvicorn app.main:app --reload
```

### 2. Crea una Cita

1. Login en el frontend
2. Citas → Nueva Cita
3. Asegúrate que el paciente tenga un **email válido**
4. Completa y confirma

### 3. Verifica en la Consola

Deberías ver:
```
✅ Email enviado exitosamente con Resend a paciente@gmail.com
   ID: abc123-def456-ghi789
```

### 4. Revisa el Email

- El email llegará al **correo del paciente**
- Viene de: "Sistema Hospitalario <onboarding@resend.dev>"
- Revisa spam si no lo ves (solo la primera vez)

---

## 🎨 Panel de Control de Resend

Ve a: https://resend.com/emails

Aquí puedes ver:
- ✅ Emails enviados
- 📊 Estadísticas
- 🔍 Logs de cada email
- 📧 Si fue entregado, abierto, etc.

---

## 🔧 Solución de Problemas

### ❌ Error: "Invalid API key"

**Solución**: Verifica que copiaste la API key completa desde Resend

```env
RESEND_API_KEY=re_completa_sin_espacios
```

### ❌ Error: "Domain not verified"

**Solución**: Usa el dominio gratuito de Resend:

```env
EMAIL_FROM=Sistema Hospitalario <onboarding@resend.dev>
```

No uses tu propio dominio a menos que lo hayas verificado en Resend.

### ❌ Los emails no llegan

**Verifica**:
1. La API key está correcta
2. `USE_RESEND=true` en `.env`
3. El email del paciente es válido
4. Revisa spam

---

## 💡 Ventajas de Resend vs SMTP

| Característica | Resend API | SMTP Gmail |
|----------------|------------|------------|
| **Configuración** | 1 API key | Usuario + contraseña de app |
| **Errores de red** | ❌ No hay | ✅ Sí ("Network unreachable") |
| **Velocidad** | ⚡ Muy rápido | 🐌 Puede ser lento |
| **Límite diario** | 100 emails | ~500 emails |
| **Logs** | ✅ Panel web | ❌ No |
| **Costo** | 🆓 Gratis | 🆓 Gratis |

---

## 🌟 Resultado Final

Con Resend configurado:

1. ✅ **Creas una cita** → Email se envía automáticamente
2. ✅ **Sin errores de red** → Funciona desde cualquier lugar
3. ✅ **Logs en tiempo real** → Ves si llegó el email
4. ✅ **Modal con QR** → Se muestra correctamente
5. ✅ **Email profesional** → HTML con gradientes y diseño

---

## 📝 Resumen de Cambios

### Backend
- ✅ Instalado: `resend==0.8.0`
- ✅ Configurado: `USE_RESEND=true` en `.env`
- ✅ Actualizado: `email_utils.py` para usar Resend API
- ✅ Fallback: Si Resend falla, intenta con SMTP

### Frontend
- ✅ Corregido: URL del QR de `/api/citas/{id}/qr` a `/citas/{id}/qr`
- ✅ Modal QR: Funciona correctamente
- ✅ Descarga PDF: Endpoint corregido

---

## 🚀 ¡Todo Listo!

Ahora solo necesitas:
1. Obtener tu API key de Resend
2. Pegarla en `.env`
3. Reiniciar el backend
4. Crear una cita

**Los emails llegarán sin problemas de red!** 🎉
