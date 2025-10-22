import React, { useState, useEffect } from 'react'
import { Pill, FileText, CheckCircle2, XCircle, Clock, User, Download } from 'lucide-react'
import recetaService from '../../services/recetaService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const RecetaList = () => {
  const { user } = useAuth()
  const [recetas, setRecetas] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todas')
  const [loading, setLoading] = useState(false)

  const isFarmaceutico = user?.cargo === 'Farmaceutico'
  const isAdmin = user?.cargo === 'Administrador'

  useEffect(() => {
    loadRecetas()
  }, [filtroEstado])

  const loadRecetas = async () => {
    setLoading(true)
    try {
      const estado = filtroEstado === 'todas' ? null : filtroEstado
      const data = await recetaService.getRecetas(null, estado)
      setRecetas(data)
    } catch (error) {
      console.error('Error cargando recetas:', error)
      toast.error('Error al cargar recetas')
    } finally {
      setLoading(false)
    }
  }

  const handleDescargarPDF = async (recetaId) => {
    try {
      toast.loading('Generando PDF...', { id: 'pdf' })
      await recetaService.descargarRecetaPDF(recetaId)
      toast.success('PDF descargado correctamente', { id: 'pdf' })
    } catch (error) {
      console.error('Error al descargar PDF:', error)
      toast.error('Error al generar el PDF', { id: 'pdf' })
    }
  }

  const handleDispensar = async (recetaId) => {
    if (!window.confirm('¿Confirmar dispensación de medicamentos?')) return

    try {
      await recetaService.dispensarReceta(recetaId, { estado: 'dispensada' })
      toast.success('✅ Receta dispensada exitosamente')
      loadRecetas()
    } catch (error) {
      toast.error('Error al dispensar receta')
      console.error(error)
    }
  }

  const handleDispensarParcial = async (recetaId) => {
    const observaciones = prompt('Ingrese observaciones sobre la dispensación parcial:')
    if (!observaciones) return

    try {
      await recetaService.dispensarReceta(recetaId, { 
        estado: 'parcial',
        observaciones 
      })
      toast.success('✅ Dispensación parcial registrada')
      loadRecetas()
    } catch (error) {
      toast.error('Error al registrar dispensación parcial')
      console.error(error)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: Clock,
        label: 'Pendiente'
      },
      dispensada: {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: CheckCircle2,
        label: 'Dispensada'
      },
      parcial: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: FileText,
        label: 'Parcial'
      },
      cancelada: {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: XCircle,
        label: 'Cancelada'
      }
    }

    const badge = badges[estado] || badges.pendiente
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 ${badge.bg} ${badge.text} rounded-full text-xs font-semibold`}>
        <Icon className="w-3 h-3" />
        <span>{badge.label}</span>
      </span>
    )
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gestión de Recetas</h1>
          <p className="text-gray-600 mt-1">
            {isFarmaceutico || isAdmin 
              ? 'Dispensación de medicamentos prescritos'
              : 'Prescripciones médicas'
            }
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
          <Pill className="w-6 h-6 text-orange-600" />
          <div>
            <p className="text-xs text-gray-500">Total recetas</p>
            <p className="text-xl font-bold text-gray-700">{recetas.length}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-semibold text-gray-700">Filtrar por estado:</span>
          {['todas', 'pendiente', 'dispensada', 'parcial', 'cancelada'].map((estado) => (
            <button
              key={estado}
              onClick={() => setFiltroEstado(estado)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filtroEstado === estado
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de recetas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando recetas...</p>
          </div>
        ) : recetas.length > 0 ? (
          <div className="space-y-4">
            {recetas.map((receta) => (
              <div
                key={receta.id}
                className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          Receta #{receta.id}
                        </h3>
                        {getEstadoBadge(receta.estado)}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Fecha emisión:</p>
                          <p className="font-semibold text-gray-800">
                            {formatearFecha(receta.fecha_emision)}
                          </p>
                        </div>
                        {receta.fecha_dispensacion && (
                          <div>
                            <p className="text-gray-500">Fecha dispensación:</p>
                            <p className="font-semibold text-gray-800">
                              {formatearFecha(receta.fecha_dispensacion)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicamentos */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs text-gray-500 mb-2">MEDICAMENTOS PRESCRITOS:</p>
                  <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">
                    {receta.medicamentos}
                  </p>
                </div>

                {/* Indicaciones */}
                {receta.indicaciones && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-blue-600 mb-2">INDICACIONES:</p>
                    <p className="text-sm text-gray-800">
                      {receta.indicaciones}
                    </p>
                  </div>
                )}

                {/* Observaciones */}
                {receta.observaciones && (
                  <div className="bg-amber-50 rounded-lg p-4 mb-4">
                    <p className="text-xs text-amber-600 mb-2">OBSERVACIONES:</p>
                    <p className="text-sm text-gray-800">
                      {receta.observaciones}
                    </p>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  {/* Botón descargar PDF - disponible para todos */}
                  <button
                    onClick={() => handleDescargarPDF(receta.id)}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar PDF</span>
                  </button>

                  {/* Botones de dispensación - solo farmacéutico con recetas pendientes */}
                  {(isFarmaceutico || isAdmin) && receta.estado === 'pendiente' && (
                    <>
                      <button
                        onClick={() => handleDispensar(receta.id)}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Dispensar Completo</span>
                      </button>
                      <button
                        onClick={() => handleDispensarParcial(receta.id)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Dispensar Parcial</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No hay recetas {filtroEstado !== 'todas' && `con estado "${filtroEstado}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecetaList
