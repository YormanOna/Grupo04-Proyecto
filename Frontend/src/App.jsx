import React from 'react'
import { useLocation } from 'react-router-dom'
import AppRouter from './router/AppRouter'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './context/AuthContext'
import useWebSocket from './hooks/useWebSocket'

function App() {
  const { user } = useAuth()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  
  // Conectar WebSocket si el usuario está autenticado
  const { isConnected, notifications } = useWebSocket()

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {user && !isLoginPage ? (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 overflow-hidden transition-colors duration-200">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <div className="container mx-auto px-6 py-8 max-w-7xl">
                <AppRouter />
              </div>
            </main>
          </div>
        </div>
      ) : (
        <AppRouter />
      )}
    </>
  )
}

export default App

