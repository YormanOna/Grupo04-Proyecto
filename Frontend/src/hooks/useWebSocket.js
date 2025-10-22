import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const useWebSocket = () => {
  const { user } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const [notifications, setNotifications] = useState([])
  const ws = useRef(null)

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
            // Reproducir sonido si está disponible
            playNotificationSound()
            break
          
          case 'cita_actualizada':
            toast.info(data.title + ': ' + data.message, {
              duration: 5000,
              icon: '📅'
            })
            break
          
          case 'receta_lista':
            toast.success(data.title + ': ' + data.message, {
              duration: 7000,
              icon: '💊'
            })
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

  return {
    isConnected,
    notifications,
    sendMessage,
    clearNotifications
  }
}

export default useWebSocket
