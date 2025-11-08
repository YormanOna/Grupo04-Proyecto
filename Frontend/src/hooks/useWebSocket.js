import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const useWebSocket = () => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [lastUpdate, setLastUpdate] = useState(null) // Para triggear recargas
  const ws = useRef(null)
  const listeners = useRef(new Map()) // Para callbacks específicos

  useEffect(() => {
    if (!user) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Determinar el protocolo (ws o wss)
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${window.location.hostname}:8000/ws`
    
    // Conectar al WebSocket
    ws.current = new WebSocket(`${wsUrl}?token=${token}`)

    ws.current.onopen = () => {
      console.log('✅ WebSocket conectado')
      setIsConnected(true)
    }

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Mensaje WebSocket:', data)

        // Agregar a notificaciones
        setNotifications(prev => [...prev, data])

        // Actualizar timestamp para triggear recargas
        setLastUpdate({ type: data.type, timestamp: Date.now(), data })

        // Llamar listeners registrados para este tipo de evento
        if (listeners.current.has(data.type)) {
          listeners.current.get(data.type).forEach(callback => {
            try {
              callback(data)
            } catch (err) {
              console.error('Error en listener:', err)
            }
          })
        }

        // Mostrar toast según el tipo de mensaje
        switch (data.type) {
          case 'connection_established':
            toast.success(data.message)
            break
          
          case 'llamada_paciente':
            toast.success(data.title + ': ' + data.message, {
              duration: 10000,
              icon: '👨‍⚕️'
            })
            playNotificationSound()
            break
          
          case 'cita_actualizada':
          case 'cita_creada':
            toast.info(data.title + ': ' + data.message, {
              duration: 5000,
              icon: '📅'
            })
            // Triggear recarga de citas
            triggerReload('citas')
            break
          
          case 'receta_lista':
          case 'receta_creada':
            toast.success(data.title + ': ' + data.message, {
              duration: 7000,
              icon: '💊'
            })
            // Triggear recarga de recetas
            triggerReload('recetas')
            break
          
          case 'consulta_creada':
          case 'consulta_actualizada':
            toast.info(data.title || 'Consulta actualizada', {
              duration: 5000,
              icon: '📋'
            })
            // Triggear recarga de consultas
            triggerReload('consultas')
            break
          
          case 'notificacion_medico':
          case 'notificacion_farmacia':
            toast(data.message, {
              duration: 5000,
              icon: '🔔'
            })
            break
          
          default:
            console.log('Mensaje no manejado:', data)
        }
      } catch (error) {
        console.error('Error procesando mensaje WebSocket:', error)
      }
    }

    const triggerReload = (entity) => {
      // Disparar evento personalizado del DOM
      window.dispatchEvent(new CustomEvent(`reload:${entity}`, { 
        detail: { timestamp: Date.now() } 
      }))
    }

    ws.current.onerror = (error) => {
      console.error('❌ Error WebSocket:', error)
      setIsConnected(false)
    }

    ws.current.onclose = () => {
      console.log('🔌 WebSocket desconectado')
      setIsConnected(false)
    }

    // Cleanup al desmontar
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [user])

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3')
      audio.play().catch(e => console.log('No se pudo reproducir sonido:', e))
    } catch (e) {
      console.log('Audio no disponible')
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Registrar listener para un tipo específico de evento
  const onEvent = useCallback((eventType, callback) => {
    if (!listeners.current.has(eventType)) {
      listeners.current.set(eventType, [])
    }
    listeners.current.get(eventType).push(callback)

    // Retornar función de cleanup
    return () => {
      const callbacks = listeners.current.get(eventType)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }, [])

  return {
    isConnected,
    notifications,
    sendMessage,
    clearNotifications,
    onEvent,
    lastUpdate
  }
}

export default useWebSocket
