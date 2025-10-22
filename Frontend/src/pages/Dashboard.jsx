import React, { useState, useEffect } from 'react'
import { 
  Users, 
  Calendar, 
  UserCheck, 
  Pill, 
  TrendingUp,
  Activity,
  Clock,
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Stethoscope
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getPacientes } from '../services/pacienteService'
import { getCitas } from '../services/citaService'
import { getMedicos } from '../services/medicoService'
import { getMedicamentos } from '../services/medicamentoService'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    pacientes: 0,
    citas: 0,
    citasHoy: 0,
    medicos: 0,
    medicamentos: 0
  })
  const [upcomingCitas, setUpcomingCitas] = useState([])
  const [loading, setLoading] = useState(true)

  const isAdmin = user?.cargo === 'Administrador'
  const isMedic = user?.cargo === 'Medico'
  const isNurse = user?.cargo === 'Enfermera'
  const isPharmacist = user?.cargo === 'Farmaceutico'

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Cargar datos según el rol
      let pacientes = [], citas = [], medicos = [], medicamentos = []

      if (isAdmin || isMedic || isNurse) {
        pacientes = await getPacientes()
        citas = await getCitas()
        medicos = await getMedicos()
      }

      if (isAdmin || isPharmacist) {
        medicamentos = await getMedicamentos()
      }

      // Filtrar citas de hoy
      const hoy = new Date().toDateString()
      const citasHoy = citas.filter(cita => {
        const citaDate = new Date(cita.fecha).toDateString()
        return citaDate === hoy && cita.estado === 'programada'
      })

      // Obtener próximas citas (ordenadas por fecha)
      const proximasCitas = citas
        .filter(c => c.estado === 'programada' && new Date(c.fecha) >= new Date())
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(0, 4)

      setStats({
        pacientes: pacientes.length,
        citas: citas.length,
        citasHoy: citasHoy.length,
        medicos: medicos.length,
        medicamentos: medicamentos.length
      })
      setUpcomingCitas(proximasCitas)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, title, value, change, gradient, link }) => (
    <Link to={link} className="block group">
      <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden border border-gray-100`}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/40 shadow-sm">
              <Icon className="w-7 h-7 text-white" />
            </div>
            {change && (
              <div className="flex items-center space-x-1 bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full border border-white/40">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-sm font-bold text-white">{change}%</span>
              </div>
            )}
          </div>
          <h3 className="text-white/90 text-sm font-medium mb-2">{title}</h3>
          <p className="text-4xl font-bold text-white mb-2">{value}</p>
          <div className="flex items-center text-white/70 text-xs">
            <span>Ver detalles</span>
            <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  )



  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 min-h-screen -m-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Panel de Control</h2>
          <p className="text-gray-600 text-lg">Bienvenido, {user?.nombre} {user?.apellido}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {user?.cargo}
          </span>
        </div>
        <div className="flex items-center space-x-3 bg-white px-5 py-3 rounded-xl shadow-md border border-gray-200">
          <Clock className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Fecha actual</p>
            <p className="text-sm font-semibold text-gray-700">
              {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas - Solo para Administrador */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Users} title="Total Pacientes" value={stats.pacientes} gradient="from-blue-600 via-blue-700 to-blue-800" link="/pacientes" />
          <StatCard icon={Calendar} title="Citas Hoy" value={stats.citasHoy} gradient="from-purple-600 via-purple-700 to-purple-800" link="/citas" />
          <StatCard icon={UserCheck} title="Médicos Activos" value={stats.medicos} gradient="from-green-600 via-green-700 to-green-800" link="/medicos" />
          <StatCard icon={Pill} title="Medicamentos" value={stats.medicamentos} gradient="from-orange-600 via-orange-700 to-orange-800" link="/farmacia" />
        </div>
      )}

      {/* Vista para Médicos */}
      {isMedic && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/citas" className="block group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-bold text-white">{stats.citasHoy}</p>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Mis Citas Hoy</h3>
              <p className="text-blue-100 text-sm">Ver agenda completa →</p>
            </div>
          </Link>
          <Link to="/pacientes" className="block group">
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-green-500">
              <div className="flex items-center justify-between mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <p className="text-5xl font-bold text-white">{stats.pacientes}</p>
              </div>
              <h3 className="text-white text-xl font-semibold mb-2">Mis Pacientes</h3>
              <p className="text-green-100 text-sm">Ver lista de pacientes →</p>
            </div>
          </Link>
        </div>
      )}

      {/* Vista para Enfermeras */}
      {isNurse && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard icon={Calendar} title="Citas Hoy" value={stats.citasHoy} gradient="from-purple-600 to-purple-800" link="/citas" />
          <StatCard icon={Users} title="Pacientes Registrados" value={stats.pacientes} gradient="from-blue-600 to-blue-800" link="/pacientes" />
          <StatCard icon={Activity} title="Total Citas" value={stats.citas} gradient="from-green-600 to-green-800" link="/citas" />
        </div>
      )}

      {/* Vista para Farmacéuticos */}
      {isPharmacist && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatCard icon={Pill} title="Inventario Total" value={stats.medicamentos} gradient="from-orange-600 to-orange-800" link="/farmacia" />
          <StatCard icon={AlertCircle} title="Stock Bajo" value="8" gradient="from-red-600 to-red-800" link="/farmacia" />
        </div>
      )}

      {/* Sección de contenido principal - Solo para Admin y Personal Médico */}
      {(isAdmin || isMedic || isNurse) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Próximas Citas</h3>
              </div>
              <Link to="/citas" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center space-x-1 hover:underline">
                <span>Ver todas</span>
                <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {upcomingCitas.length > 0 ? (
              upcomingCitas.map(cita => (
                <div key={cita.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 group cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      {cita.paciente?.nombre?.[0]}{cita.paciente?.apellido?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {cita.paciente?.nombre} {cita.paciente?.apellido}
                      </p>
                      <p className="text-sm text-gray-600">
                        {cita.medico ? `Dr(a). ${cita.medico.nombre} ${cita.medico.apellido}` : 'Sin médico asignado'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {new Date(cita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(cita.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay citas programadas</p>
              </div>
            )}
          </div>
        </div>

      </div>
      )}
    </div>
  )
}

export default Dashboard
