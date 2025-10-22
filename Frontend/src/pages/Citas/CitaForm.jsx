import React, { useState, useEffect } from 'react'
import { createCita } from '../../services/citaService'
import { getPacientes } from '../../services/pacienteService'
import { getMedicos } from '../../services/medicoService'
import { useNavigate } from 'react-router-dom'
import { Calendar, User, Stethoscope, FileText, Clock, Save, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const CitaForm = () => {
  const [form, setForm] = useState({ 
    fecha: '', 
    paciente_id: '',
    medico_id: '',
    motivo: '',
    estado: 'programada'
  })
  const [pacientes, setPacientes] = useState([])
  const [medicos, setMedicos] = useState([])
  const [searchPaciente, setSearchPaciente] = useState('')
  const [showPacienteSuggestions, setShowPacienteSuggestions] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [pacientesData, medicosData] = await Promise.all([
        getPacientes(),
        getMedicos()
      ])
      setPacientes(pacientesData)
      setMedicos(medicosData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar datos')
    }
  }

  const filteredPacientes = pacientes.filter(p => 
    searchPaciente && (
      p.nombre?.toLowerCase().includes(searchPaciente.toLowerCase()) ||
      p.apellido?.toLowerCase().includes(searchPaciente.toLowerCase()) ||
      p.cedula?.toString().includes(searchPaciente)
    )
  )

  const handlePacienteSelect = (paciente) => {
    setSelectedPaciente(paciente)
    setSearchPaciente(`${paciente.nombre} ${paciente.apellido}`)
    setForm({ ...form, paciente_id: paciente.id })
    setShowPacienteSuggestions(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!form.paciente_id) {
      toast.error('Debe seleccionar un paciente')
      return
    }
    
    if (!form.fecha) {
      toast.error('Debe seleccionar una fecha')
      return
    }

    // Validar que la fecha no sea en el pasado
    const fechaSeleccionada = new Date(form.fecha)
    const ahora = new Date()
    if (fechaSeleccionada < ahora) {
      toast.error('No puede agendar citas en el pasado')
      return
    }

    // Validar que sea una fecha válida
    if (isNaN(fechaSeleccionada.getTime())) {
      toast.error('La fecha seleccionada no es válida')
      return
    }

    setIsLoading(true)
    try {
      const citaData = {
        ...form,
        paciente_id: parseInt(form.paciente_id, 10),
        medico_id: form.medico_id ? parseInt(form.medico_id, 10) : null,
        fecha: fechaSeleccionada.toISOString()
      }
      await createCita(citaData)
      toast.success('Cita agendada exitosamente')
      navigate('/citas')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al agendar la cita'
      if (typeof errorMsg === 'object') {
        // Si es un objeto de errores de validación de Pydantic
        const errores = Object.values(errorMsg).flat()
        errores.forEach(err => toast.error(err))
      } else {
        toast.error(errorMsg)
      }
      console.error('Error al crear cita:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Nueva Cita</h2>
            <p className="text-gray-600">Agendar nueva cita médica</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-8">
        {/* Buscar Paciente */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-purple-600" />
            <span>Información del Paciente</span>
          </h3>
          
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar Paciente *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchPaciente}
                onChange={(e) => {
                  setSearchPaciente(e.target.value)
                  setShowPacienteSuggestions(true)
                }}
                onFocus={() => setShowPacienteSuggestions(true)}
                placeholder="Buscar por nombre, apellido o cédula..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Sugerencias de pacientes */}
            {showPacienteSuggestions && searchPaciente && filteredPacientes.length > 0 && (
              <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {filteredPacientes.map((paciente) => (
                  <div
                    key={paciente.id}
                    onClick={() => handlePacienteSelect(paciente)}
                    className="px-4 py-3 hover:bg-purple-50 cursor-pointer transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {paciente.nombre?.charAt(0)}{paciente.apellido?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {paciente.nombre} {paciente.apellido}
                        </p>
                        <p className="text-sm text-gray-500">
                          Cédula: {paciente.cedula} • ID: {paciente.id}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paciente seleccionado */}
            {selectedPaciente && (
              <div className="mt-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Paciente seleccionado:</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedPaciente.nombre?.charAt(0)}{selectedPaciente.apellido?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedPaciente.nombre} {selectedPaciente.apellido}
                      </p>
                      <p className="text-sm text-gray-600">
                        Cédula: {selectedPaciente.cedula}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaciente(null)
                      setSearchPaciente('')
                      setForm({ ...form, paciente_id: '' })
                    }}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Información de la Cita */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-purple-600" />
            <span>Detalles de la Cita</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fecha y Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="datetime-local"
                  name="fecha"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Médico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médico (Opcional)
              </label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  name="medico_id"
                  value={form.medico_id}
                  onChange={(e) => setForm({ ...form, medico_id: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Seleccionar médico...</option>
                  {medicos.map((medico) => (
                    <option key={medico.id} value={medico.id}>
                      Dr(a). {medico.nombre} {medico.apellido} - {medico.especialidad}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Motivo */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la Consulta
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              name="motivo"
              value={form.motivo}
              onChange={(e) => setForm({ ...form, motivo: e.target.value })}
              rows="4"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              placeholder="Describa el motivo de la consulta..."
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/citas')}
            className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium flex items-center space-x-2"
          >
            <X className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all font-medium flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Guardando...' : 'Agendar Cita'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default CitaForm
