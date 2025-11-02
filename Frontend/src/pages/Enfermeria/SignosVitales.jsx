import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Thermometer, Wind, Droplets, Weight, Ruler, Calculator, Save, AlertCircle, Clock, User, Stethoscope, Calendar, CheckCircle2, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import citaService from '../../services/citaService';
import consultaService from '../../services/consultaService';

const SignosVitales = () => {
  const navigate = useNavigate();
  const [pacientesEnEspera, setPacientesEnEspera] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [signosVitales, setSignosVitales] = useState({
    presion_arterial: '',
    frecuencia_cardiaca: '',
    frecuencia_respiratoria: '',
    temperatura: '',
    saturacion_oxigeno: '',
    peso: '',
    talla: '',
    imc: '',
    observaciones: ''
  });

  // Cargar pacientes en espera (citas confirmadas del día)
  useEffect(() => {
    cargarPacientesEnEspera();
  }, []);

  const cargarPacientesEnEspera = async () => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await citaService.listar({
        fecha: hoy
      });
      
      // Filtrar solo citas pendientes y confirmadas (no canceladas ni completadas)
      const citasPendientes = (response.data || []).filter(cita => 
        cita.estado && !['Cancelada', 'Completada'].includes(cita.estado)
      );
      
      setPacientesEnEspera(citasPendientes);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar la lista de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPaciente = (cita) => {
    setCitaSeleccionada(cita);
    setSignosVitales({
      presion_arterial: '',
      frecuencia_cardiaca: '',
      frecuencia_respiratoria: '',
      temperatura: '',
      saturacion_oxigeno: '',
      peso: '',
      talla: '',
      imc: '',
      observaciones: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSignosVitales(prev => {
      const updated = { ...prev, [name]: value };
      
      // Calcular IMC automáticamente si se ingresa peso y talla
      if ((name === 'peso' || name === 'talla') && updated.peso && updated.talla) {
        const peso = parseFloat(updated.peso);
        const talla = parseFloat(updated.talla);
        if (!isNaN(peso) && !isNaN(talla) && talla > 0) {
          const imc = (peso / Math.pow(talla, 2)).toFixed(2);
          updated.imc = imc;
        }
      }
      
      return updated;
    });
  };

  const validarSignosVitales = () => {
    const errores = [];

    // Presión arterial (formato: 120/80)
    if (!signosVitales.presion_arterial) {
      errores.push('La presión arterial es obligatoria');
    } else if (!/^\d{2,3}\/\d{2,3}$/.test(signosVitales.presion_arterial)) {
      errores.push('Formato de presión arterial inválido (ej: 120/80)');
    }

    // Frecuencia cardíaca (40-200 lpm)
    const fc = parseFloat(signosVitales.frecuencia_cardiaca);
    if (!signosVitales.frecuencia_cardiaca) {
      errores.push('La frecuencia cardíaca es obligatoria');
    } else if (isNaN(fc) || fc < 40 || fc > 200) {
      errores.push('Frecuencia cardíaca debe estar entre 40-200 lpm');
    }

    // Frecuencia respiratoria (8-40 rpm)
    const fr = parseFloat(signosVitales.frecuencia_respiratoria);
    if (!signosVitales.frecuencia_respiratoria) {
      errores.push('La frecuencia respiratoria es obligatoria');
    } else if (isNaN(fr) || fr < 8 || fr > 40) {
      errores.push('Frecuencia respiratoria debe estar entre 8-40 rpm');
    }

    // Temperatura (35-42 °C)
    const temp = parseFloat(signosVitales.temperatura);
    if (!signosVitales.temperatura) {
      errores.push('La temperatura es obligatoria');
    } else if (isNaN(temp) || temp < 35 || temp > 42) {
      errores.push('Temperatura debe estar entre 35-42 °C');
    }

    // Saturación de oxígeno (70-100%)
    const spo2 = parseFloat(signosVitales.saturacion_oxigeno);
    if (!signosVitales.saturacion_oxigeno) {
      errores.push('La saturación de oxígeno es obligatoria');
    } else if (isNaN(spo2) || spo2 < 70 || spo2 > 100) {
      errores.push('Saturación de oxígeno debe estar entre 70-100%');
    }

    // Peso (1-300 kg)
    const peso = parseFloat(signosVitales.peso);
    if (!signosVitales.peso) {
      errores.push('El peso es obligatorio');
    } else if (isNaN(peso) || peso < 1 || peso > 300) {
      errores.push('Peso debe estar entre 1-300 kg');
    }

    // Talla (0.3-2.5 m)
    const talla = parseFloat(signosVitales.talla);
    if (!signosVitales.talla) {
      errores.push('La talla es obligatoria');
    } else if (isNaN(talla) || talla < 0.3 || talla > 2.5) {
      errores.push('Talla debe estar entre 0.3-2.5 m');
    }

    return errores;
  };

  const guardarSignosVitales = async () => {
    if (!citaSeleccionada) {
      toast.error('Debe seleccionar un paciente');
      return;
    }

    const errores = validarSignosVitales();
    if (errores.length > 0) {
      errores.forEach(error => toast.error(error));
      return;
    }

    setGuardando(true);
    try {
      // Validar que la cita tenga médico asignado
      if (!citaSeleccionada.medico_id) {
        toast.error('Esta cita no tiene médico asignado');
        setGuardando(false);
        return;
      }

      // Validar que la cita tenga paciente
      if (!citaSeleccionada.paciente_id) {
        toast.error('Error: Cita sin paciente asociado');
        setGuardando(false);
        return;
      }

      // Crear consulta con los signos vitales
      const payload = {
        cita_id: citaSeleccionada.id,
        paciente_id: citaSeleccionada.paciente_id,
        medico_id: citaSeleccionada.medico_id,
        signos_vitales: signosVitales
      };

      await consultaService.crear(payload);

      toast.success('Signos vitales registrados correctamente');
      
      // Actualizar estado de la cita a "en_consulta"
      await citaService.actualizar(citaSeleccionada.id, {
        estado: 'en_consulta'
      });

      // Limpiar formulario y recargar lista
      setCitaSeleccionada(null);
      setSignosVitales({
        presion_arterial: '',
        frecuencia_cardiaca: '',
        frecuencia_respiratoria: '',
        temperatura: '',
        saturacion_oxigeno: '',
        peso: '',
        talla: '',
        imc: '',
        observaciones: ''
      });
      cargarPacientesEnEspera();

    } catch (error) {
      console.error('Error al guardar signos vitales:', error);
      const errorMsg = error.response?.data?.detail || 'Error al guardar signos vitales';
      if (typeof errorMsg === 'object') {
        const errores = Object.values(errorMsg).flat();
        errores.forEach(err => toast.error(err));
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setGuardando(false);
    }
  };

  const getIMCCategory = (imc) => {
    const imcNum = parseFloat(imc);
    if (imcNum < 18.5) return { text: 'Bajo peso', color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    if (imcNum < 25) return { text: 'Normal', color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-200' };
    if (imcNum < 30) return { text: 'Sobrepeso', color: 'text-orange-600', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' };
    return { text: 'Obesidad', color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
  };

  const getEstadoCitaBadge = (estado) => {
    const badges = {
      'Pendiente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'Confirmada': { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
      'En Consulta': { color: 'bg-purple-100 text-purple-800', icon: Activity },
      'Completada': { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
      'Cancelada': { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[estado] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
  };

  const getSignoVitalStatus = (nombre, valor) => {
    // Rangos normales para adultos
    const rangos = {
      frecuencia_cardiaca: { min: 60, max: 100, unit: 'lpm' },
      frecuencia_respiratoria: { min: 12, max: 20, unit: 'rpm' },
      temperatura: { min: 36, max: 37.5, unit: '°C' },
      saturacion_oxigeno: { min: 95, max: 100, unit: '%' }
    };

    const rango = rangos[nombre];
    if (!rango || !valor) return null;

    const num = parseFloat(valor);
    if (num < rango.min) return { status: 'low', icon: TrendingDown, color: 'text-blue-600' };
    if (num > rango.max) return { status: 'high', icon: TrendingUp, color: 'text-red-600' };
    return { status: 'normal', icon: CheckCircle2, color: 'text-green-600' };
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Panel izquierdo - Lista de pacientes */}
      <div className="w-96 bg-white border-r-2 border-blue-100 shadow-xl overflow-y-auto">
        {/* Header del panel */}
        <div className="sticky top-0 z-10 bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Stethoscope className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Pacientes del Día</h2>
                <p className="text-blue-100 text-sm flex items-center mt-1">
                  <Calendar size={14} className="mr-1" />
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
          <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <span className="text-white font-semibold">Total en espera:</span>
            <span className="text-2xl font-bold text-white">{pacientesEnEspera.length}</span>
          </div>
        </div>

        {/* Lista de pacientes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Cargando pacientes...</p>
            </div>
          </div>
        ) : pacientesEnEspera.length === 0 ? (
          <div className="p-8 text-center">
            <div className="bg-gray-50 rounded-2xl p-8">
              <User size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-lg font-medium">No hay pacientes en espera</p>
              <p className="text-gray-400 text-sm mt-2">Los pacientes con citas para hoy aparecerán aquí</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {pacientesEnEspera.map((cita) => {
              const estadoBadge = getEstadoCitaBadge(cita.estado);
              const IconEstado = estadoBadge.icon;
              const isSelected = citaSeleccionada?.id === cita.id;
              
              return (
                <button
                  key={cita.id}
                  onClick={() => seleccionarPaciente(cita)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 transform hover:scale-[1.02] ${
                    isSelected
                      ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-full ${isSelected ? 'bg-blue-500' : 'bg-gray-100'}`}>
                      <User size={24} className={isSelected ? 'text-white' : 'text-gray-600'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {cita.paciente?.nombre} {cita.paciente?.apellido}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 ${estadoBadge.color}`}>
                          <IconEstado size={12} />
                          {cita.estado}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-600 flex items-center">
                          <span className="font-semibold mr-2">CI:</span> {cita.paciente?.cedula}
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Clock size={14} className="mr-2 text-blue-500" />
                          <span className="font-semibold">{cita.hora_inicio}</span>
                        </p>
                        <p className="text-gray-600 flex items-center">
                          <Stethoscope size={14} className="mr-2 text-green-500" />
                          Dr. {cita.medico?.nombre} {cita.medico?.apellido}
                          {cita.medico?.especialidad && (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              {cita.medico.especialidad}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel derecho - Formulario de signos vitales */}
      <div className="flex-1 overflow-y-auto">
        {!citaSeleccionada ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center max-w-md">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl p-12 shadow-lg">
                <Activity size={80} className="mx-auto text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Seleccione un Paciente</h3>
                <p className="text-gray-600">
                  Elija un paciente de la lista para comenzar a registrar sus signos vitales
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Header del paciente seleccionado */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-6 shadow-lg text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-white/20 rounded-xl backdrop-blur-sm">
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {citaSeleccionada.paciente?.nombre} {citaSeleccionada.paciente?.apellido}
                    </h2>
                    <div className="flex items-center space-x-4 text-blue-100">
                      <span className="flex items-center">
                        <span className="font-semibold mr-2">CI:</span> {citaSeleccionada.paciente?.cedula}
                      </span>
                      {citaSeleccionada.paciente?.edad && (
                        <span className="flex items-center">
                          <span className="font-semibold mr-2">Edad:</span> {citaSeleccionada.paciente.edad} años
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setCitaSeleccionada(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Volver a la lista"
                >
                  <XCircle size={24} />
                </button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-sm">
                <span className="flex items-center">
                  <Clock size={16} className="mr-2" />
                  Cita: {citaSeleccionada.hora_inicio}
                </span>
                <span className="flex items-center">
                  <Stethoscope size={16} className="mr-2" />
                  Dr. {citaSeleccionada.medico?.nombre} {citaSeleccionada.medico?.apellido}
                </span>
              </div>
            </div>

            {/* Formulario de signos vitales */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Activity className="mr-3 text-blue-600" size={24} />
                Signos Vitales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Presión Arterial */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-red-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Heart className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <span>Presión Arterial</span>
                      <span className="text-red-600 ml-1">*</span>
                      <p className="text-xs font-normal text-gray-500">Normal: 90/60 - 120/80 mmHg</p>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="presion_arterial"
                    value={signosVitales.presion_arterial}
                    onChange={handleInputChange}
                    placeholder="Ej: 120/80"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Frecuencia Cardíaca */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-green-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Frecuencia Cardíaca</span>
                          <span className="text-red-600 ml-1">*</span>
                          <p className="text-xs font-normal text-gray-500">Normal: 60-100 lpm</p>
                        </div>
                        {signosVitales.frecuencia_cardiaca && (() => {
                          const status = getSignoVitalStatus('frecuencia_cardiaca', signosVitales.frecuencia_cardiaca);
                          if (status) {
                            const IconStatus = status.icon;
                            return (
                              <span className={`flex items-center text-xs font-semibold ${status.color}`}>
                                <IconStatus size={16} className="mr-1" />
                                {status.status === 'low' ? 'Bajo' : status.status === 'high' ? 'Alto' : 'Normal'}
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="frecuencia_cardiaca"
                    value={signosVitales.frecuencia_cardiaca}
                    onChange={handleInputChange}
                    placeholder="Ej: 72"
                    min="40"
                    max="200"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Frecuencia Respiratoria */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wind className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Frecuencia Respiratoria</span>
                          <span className="text-red-600 ml-1">*</span>
                          <p className="text-xs font-normal text-gray-500">Normal: 12-20 rpm</p>
                        </div>
                        {signosVitales.frecuencia_respiratoria && (() => {
                          const status = getSignoVitalStatus('frecuencia_respiratoria', signosVitales.frecuencia_respiratoria);
                          if (status) {
                            const IconStatus = status.icon;
                            return (
                              <span className={`flex items-center text-xs font-semibold ${status.color}`}>
                                <IconStatus size={16} className="mr-1" />
                                {status.status === 'low' ? 'Bajo' : status.status === 'high' ? 'Alto' : 'Normal'}
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="frecuencia_respiratoria"
                    value={signosVitales.frecuencia_respiratoria}
                    onChange={handleInputChange}
                    placeholder="Ej: 16"
                    min="8"
                    max="40"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Temperatura */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-orange-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Thermometer className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Temperatura Corporal</span>
                          <span className="text-red-600 ml-1">*</span>
                          <p className="text-xs font-normal text-gray-500">Normal: 36-37.5 °C</p>
                        </div>
                        {signosVitales.temperatura && (() => {
                          const status = getSignoVitalStatus('temperatura', signosVitales.temperatura);
                          if (status) {
                            const IconStatus = status.icon;
                            return (
                              <span className={`flex items-center text-xs font-semibold ${status.color}`}>
                                <IconStatus size={16} className="mr-1" />
                                {status.status === 'low' ? 'Bajo' : status.status === 'high' ? 'Alto' : 'Normal'}
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="temperatura"
                    value={signosVitales.temperatura}
                    onChange={handleInputChange}
                    placeholder="Ej: 36.5"
                    step="0.1"
                    min="35"
                    max="42"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Saturación de Oxígeno */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-cyan-100 rounded-lg">
                      <Droplets className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span>Saturación de Oxígeno</span>
                          <span className="text-red-600 ml-1">*</span>
                          <p className="text-xs font-normal text-gray-500">Normal: 95-100%</p>
                        </div>
                        {signosVitales.saturacion_oxigeno && (() => {
                          const status = getSignoVitalStatus('saturacion_oxigeno', signosVitales.saturacion_oxigeno);
                          if (status) {
                            const IconStatus = status.icon;
                            return (
                              <span className={`flex items-center text-xs font-semibold ${status.color}`}>
                                <IconStatus size={16} className="mr-1" />
                                {status.status === 'low' ? 'Bajo' : status.status === 'high' ? 'Alto' : 'Normal'}
                              </span>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="saturacion_oxigeno"
                    value={signosVitales.saturacion_oxigeno}
                    onChange={handleInputChange}
                    placeholder="Ej: 98"
                    min="70"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Peso */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Weight className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span>Peso Corporal</span>
                      <span className="text-red-600 ml-1">*</span>
                      <p className="text-xs font-normal text-gray-500">En kilogramos</p>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={signosVitales.peso}
                    onChange={handleInputChange}
                    placeholder="Ej: 70.5"
                    step="0.1"
                    min="1"
                    max="300"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* Talla */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-300 transition-colors">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Ruler className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <span>Talla</span>
                      <span className="text-red-600 ml-1">*</span>
                      <p className="text-xs font-normal text-gray-500">En metros</p>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="talla"
                    value={signosVitales.talla}
                    onChange={handleInputChange}
                    placeholder="Ej: 1.70"
                    step="0.01"
                    min="0.3"
                    max="2.5"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg font-semibold transition-all"
                  />
                </div>

                {/* IMC (calculado automáticamente) - Full width */}
                <div className="col-span-full bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border-2 border-teal-200">
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <div className="p-2 bg-teal-100 rounded-lg">
                      <Calculator className="w-5 h-5 text-teal-600" />
                    </div>
                    <span>Índice de Masa Corporal (IMC) - Calculado automáticamente</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      name="imc"
                      value={signosVitales.imc}
                      readOnly
                      placeholder="Se calculará automáticamente"
                      className="flex-1 px-4 py-3 border-2 border-teal-300 rounded-lg bg-white text-lg font-bold text-teal-700"
                    />
                    {signosVitales.imc && (() => {
                      const imcCat = getIMCCategory(signosVitales.imc);
                      return (
                        <div className={`px-6 py-3 rounded-xl ${imcCat.bgColor} border-2 ${imcCat.borderColor}`}>
                          <p className="text-xs text-gray-600 font-semibold">Clasificación</p>
                          <p className={`text-lg font-bold ${imcCat.color}`}>{imcCat.text}</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-6">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  Observaciones Adicionales
                </label>
                <textarea
                  name="observaciones"
                  value={signosVitales.observaciones}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Anote cualquier observación relevante sobre el estado del paciente o los signos vitales..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                />
              </div>

              {/* Botones de acción */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={guardarSignosVitales}
                  disabled={guardando}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      <span>Guardar y Enviar a Consulta</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCitaSeleccionada(null)}
                  disabled={guardando}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Cancelar
                </button>
              </div>

              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Información importante:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700">
                      <li>Los campos marcados con <span className="text-red-600 font-bold">*</span> son obligatorios</li>
                      <li>El IMC se calcula automáticamente al ingresar peso y talla</li>
                      <li>Al guardar, el paciente será enviado a consulta médica</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignosVitales;
