import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, LogIn, Activity, Heart, Stethoscope, Shield, Users, Calendar } from 'lucide-react'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    await login(form.email, form.password)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo animado con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      {/* Formas decorativas */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Lado izquierdo - Información */}
        <div className="hidden md:block text-white space-y-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-2xl border border-white/30">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold">MediCare+</h1>
                <p className="text-xl text-white/90">Sistema de Gestión Clínica</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {[
              { icon: Heart, title: 'Atención Integral', desc: 'Gestión completa de pacientes y historiales médicos' },
              { icon: Calendar, title: 'Agenda Digital', desc: 'Control eficiente de citas y consultas médicas' },
              { icon: Users, title: 'Equipo Médico', desc: 'Coordinación perfecta entre profesionales de la salud' },
              { icon: Shield, title: 'Seguridad Total', desc: 'Protección de datos con los más altos estándares' }
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-white/80 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <p className="text-sm text-white/80 text-center">
              🏥 Confiado por más de 100+ profesionales de la salud
            </p>
          </div>
        </div>

        {/* Lado derecho - Formulario de login */}
        <div className="w-full">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 md:p-12 border border-white/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-xl">
                <Stethoscope className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">¡Bienvenido!</h2>
              <p className="text-gray-600 text-lg">Accede a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 font-medium"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Campo Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800 font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Recordar y olvidé contraseña */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center space-x-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer" 
                  />
                  <span className="text-gray-700 font-medium group-hover:text-blue-600 transition-colors">Recordarme</span>
                </label>
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Botón de login */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-blue-600 hover:to-cyan-600 focus:outline-none focus:ring-4 focus:ring-blue-500/50 transition-all duration-300 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <LogIn className="w-6 h-6" />
                    <span>Iniciar Sesión</span>
                  </span>
                )}
              </button>
            </form>

            {/* Usuarios de prueba */}
            <div className="mt-8 pt-6 border-t-2 border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4 font-semibold uppercase tracking-wide">Usuarios de Prueba</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { role: 'Admin', email: 'admin@hospital.com', color: 'from-blue-500 to-blue-600' },
                  { role: 'Médico', email: 'medico@hospital.com', color: 'from-green-500 to-green-600' }
                ].map((user, idx) => (
                  <div key={idx} className={`bg-gradient-to-br ${user.color} p-3 rounded-xl text-white shadow-lg`}>
                    <p className="font-bold text-sm">{user.role}</p>
                    <p className="text-xs opacity-90">{user.email}</p>
                    <p className="text-xs font-mono mt-1 bg-white/20 px-2 py-1 rounded">admin123</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile logo */}
          <div className="md:hidden mt-6 text-center">
            <p className="text-white/80 text-sm">© 2025 MediCare+ - Sistema de Gestión Clínica</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

