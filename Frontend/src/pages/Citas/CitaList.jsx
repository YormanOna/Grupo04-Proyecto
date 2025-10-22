import React, { useEffect, useState } from 'react'
import { getCitas, deleteCita, updateCita } from '../../services/citaService'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Plus, Search, Clock, User, Stethoscope, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const CitaList = () => {
  const [citas, setCitas] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('todas')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const isAdmin = user?.cargo === 'Administrador'

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Citas Médicas</h2>
            <p className="text-gray-600">Gestión de citas programadas</p>
          </div>
        </div>
        <Link
          to="/citas/nueva"
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Cita</span>
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="todas">Todas las citas</option>
            <option value="programada">Programadas</option>
            <option value="completada">Completadas</option>
            <option value="cancelada">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Citas</p>
          <p className="text-2xl font-bold text-gray-800">{citas.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Completadas</p>
          <p className="text-2xl font-bold text-green-600">
            {citas.filter(c => c.estado === 'completada').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Programadas</p>
          <p className="text-2xl font-bold text-purple-600">
            {citas.filter(c => c.estado === 'programada').length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Canceladas</p>
          <p className="text-2xl font-bold text-red-600">
            {citas.filter(c => c.estado === 'cancelada').length}
          </p>
        </div>
      </div>

      {/* Lista de citas */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
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
                        <span className="text-sm text-gray-800">
                          {new Date(cita.fecha).toLocaleString('es-ES', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">ID: {cita.paciente_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-800">
                          {cita.medico_id ? `ID: ${cita.medico_id}` : 'Sin asignar'}
                        </span>
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
                        {cita.estado !== 'completada' && (
                          <button 
                            onClick={() => handleStatusChange(cita.id, 'completada')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" 
                            title="Completar"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleEdit(cita.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {cita.estado !== 'cancelada' && (
                          <button 
                            onClick={() => handleStatusChange(cita.id, 'cancelada')}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" 
                            title="Cancelar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
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

