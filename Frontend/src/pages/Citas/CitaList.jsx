import React, { useEffect, useState } from 'react'
import { getCitas, deleteCita, updateCita } from '../../services/citaService'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Plus, Search, Clock, User, Stethoscope, Edit, Trash2, CheckCircle, XCircle, Activity } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const CitaList = () => {
  const [citas, setCitas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const isAdmin = user?.cargo === 'Administrador' || user?.cargo === 'Admin General'
  const isNurse = user?.cargo === 'Enfermera'
  const canManageCitas = !isNurse // Enfermera solo puede VER citas, no gestionarlas

  useEffect(() => {
    loadCitas()
  }, [])

  const loadCitas = async () => {
    try {
      const data = await getCitas()
      setCitas(data)
    } catch (error) {
      console.error('Error loading appointments:', error)
      toast.error('Error al cargar citas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta cita?')) {
      try {
        await deleteCita(id)
        toast.success('Cita eliminada exitosamente')
        loadCitas()
      } catch (error) {
        console.error('Error deleting appointment:', error)
        if (error.response?.status === 403) {
          toast.error('No tienes permisos para eliminar citas')
        } else {
          toast.error('Error al eliminar cita')
        }
      }
    }
  }

  const handleEdit = (id) => {
    navigate(`/citas/editar/${id}`)
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateCita(id, { estado: newStatus })
      toast.success('Estado actualizado')
      loadCitas()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Error al actualizar estado')
    }
  }

  const getStatusBadge = (estado) => {
    const badges = {
      programada: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Programada' },
      completada: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completada' },
      cancelada: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelada' },
    }
    const badge = badges[estado] || badges.programada
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  const filteredCitas = citas.filter(c => {
    const matchesSearch = c.id?.toString().includes(searchTerm)
    const matchesStatus = filterStatus === 'todas' || c.estado === filterStatus
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Calendar className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Citas Médicas</h2>
            <p className="text-gray-600 mt-1">Gestión completa de citas programadas</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {canManageCitas && (
            <Link
              to="/citas/calendario"
              className="flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Calendar className="w-5 h-5" />
              <span>Ver Calendario</span>
            </Link>
          )}
          {canManageCitas && (
            <Link
              to="/citas/nueva"
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Cita</span>
            </Link>
          )}
          {isNurse && (
            <div className="bg-blue-50 border-2 border-blue-200 text-blue-700 px-6 py-3 rounded-xl font-semibold flex items-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>Citas para Signos Vitales</span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID, paciente o médico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white font-medium"
          >
            <option value="todas">Todas las citas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Confirmada">Confirmadas</option>
            <option value="Completada">Completadas</option>
            <option value="Cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Citas</p>
              <p className="text-3xl font-bold text-blue-700">{citas.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 shadow-lg border border-green-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completadas</p>
              <p className="text-3xl font-bold text-green-700">
                {citas.filter(c => c.estado === 'Completada').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pendientes</p>
              <p className="text-3xl font-bold text-purple-700">
                {citas.filter(c => c.estado === 'Pendiente' || c.estado === 'Confirmada').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Canceladas</p>
              <p className="text-3xl font-bold text-red-700">
                {citas.filter(c => c.estado === 'Cancelada').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border-b-2 border-purple-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Médico
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCitas.length > 0 ? (
                filteredCitas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-800">
                        #{cita.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{cita.fecha}</p>
                          <p className="text-xs text-gray-500">{cita.hora}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {cita.paciente_nombre} {cita.paciente_apellido}
                          </p>
                          {cita.paciente_cedula && (
                            <p className="text-xs text-gray-500">CI: {cita.paciente_cedula}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            Dr. {cita.medico_nombre} {cita.medico_apellido}
                          </p>
                          {cita.medico_especialidad && (
                            <p className="text-xs text-gray-500">{cita.medico_especialidad}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate">
                        {cita.motivo || 'No especificado'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(cita.estado)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {canManageCitas && cita.estado !== 'completada' && (
                          <button 
                            onClick={() => handleStatusChange(cita.id, 'completada')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Completar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {canManageCitas && (
                          <button 
                            onClick={() => handleEdit(cita.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        {canManageCitas && cita.estado !== 'cancelada' && (
                          <button 
                            onClick={() => handleStatusChange(cita.id, 'cancelada')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        {isNurse && (
                          <Link
                            to={`/enfermeria/signos-vitales?paciente=${cita.paciente_id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Registrar Signos Vitales"
                          >
                            <Activity className="w-4 h-4" />
                          </Link>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(cita.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Calendar className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">No se encontraron citas</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default CitaList

