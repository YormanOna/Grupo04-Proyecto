import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  UserCheck, 
  Pill,
  Activity,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Clock,
  FileText
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user } = useAuth()

  // Definir roles
  const isAdmin = user?.cargo === 'Administrador'
  const isMedic = user?.cargo === 'Medico'
  const isNurse = user?.cargo === 'Enfermera'
  const isPharmacist = user?.cargo === 'Farmaceutico'

  // Todos los items del menú con roles permitidos
  const allMenuItems = [
    { 
      path: '/', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      roles: ['Administrador', 'Medico', 'Enfermera', 'Farmaceutico'] // Todos
    },
    { 
      path: '/asistencia', 
      icon: Clock, 
      label: 'Asistencia', 
      gradient: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      roles: ['Administrador', 'Medico', 'Enfermera', 'Farmaceutico'] // Todos
    },
    { 
      path: '/pacientes', 
      icon: Users, 
      label: 'Pacientes', 
      gradient: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      roles: ['Administrador', 'Medico', 'Enfermera'] // Solo personal médico
    },
    { 
      path: '/citas', 
      icon: Calendar, 
      label: 'Citas', 
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      roles: ['Administrador', 'Medico', 'Enfermera'] // Solo personal médico
    },
    { 
      path: '/medicos', 
      icon: UserCheck, 
      label: 'Médicos', 
      gradient: 'from-cyan-500 to-cyan-600',
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      roles: ['Administrador', 'Medico', 'Enfermera'] // Solo personal médico
    },
    { 
      path: '/enfermeria/signos-vitales', 
      icon: Activity, 
      label: 'Signos Vitales', 
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      roles: ['Administrador', 'Enfermera'] // Solo enfermeras
    },
    { 
      path: '/consulta-medica', 
      icon: Stethoscope, 
      label: 'Consulta Médica', 
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      roles: ['Administrador', 'Medico'] // Solo médicos
    },
    { 
      path: '/recetas', 
      icon: FileText, 
      label: 'Recetas', 
      gradient: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      roles: ['Administrador', 'Medico', 'Farmaceutico'] // Médicos y farmacia
    },
    { 
      path: '/farmacia', 
      icon: Pill, 
      label: 'Farmacia', 
      gradient: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      roles: ['Administrador', 'Farmaceutico'] // Solo admin y farmacéutico
    },
  ]

  // Filtrar items según el rol del usuario
  const menuItems = allMenuItems.filter(item => 
    item.roles.includes(user?.cargo)
  )

  const isActive = (path) => location.pathname === path

  return (
    <aside 
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-xl relative ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Header del Sidebar */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-500 to-cyan-500">
        {!isCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-xl">MediCare+</h2>
              <p className="text-xs text-white/80">Sistema Médico</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/30"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-white" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white" />
          )}
        </button>
      </div>

      {/* Menú de navegación */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    active
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                      : `${item.bgColor} ${item.textColor} hover:scale-105 hover:shadow-md`
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  {/* Efecto de brillo en hover */}
                  {!active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  )}
                  
                  <Icon 
                    className={`w-5 h-5 ${
                      active ? 'text-white' : ''
                    } group-hover:scale-110 transition-transform relative z-10`} 
                  />
                  {!isCollapsed && (
                    <span className={`font-semibold relative z-10 ${active ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {!isCollapsed && active && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse relative z-10"></div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer del Sidebar */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-gray-800">Estado del Sistema</h3>
                <p className="text-xs text-gray-600">Todos los servicios activos</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

