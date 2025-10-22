import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, Thermometer, Wind, Droplets, Weight, Ruler, Calculator, Save, AlertCircle } from 'lucide-react';
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
        fecha: hoy,
        estado: 'confirmada'
      });
      setPacientesEnEspera(response.data || []);
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
    if (imcNum < 18.5) return { text: 'Bajo peso', color: 'text-yellow-600' };
    if (imcNum < 25) return { text: 'Normal', color: 'text-green-600' };
    if (imcNum < 30) return { text: 'Sobrepeso', color: 'text-orange-600' };
    return { text: 'Obesidad', color: 'text-red-600' };
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Activity className="w-8 h-8 text-emerald-600" />
          Registro de Signos Vitales
        </h1>
        <p className="text-gray-600 mt-2">
          Seleccione un paciente de la lista de espera y registre sus signos vitales
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pacientes en espera */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              Pacientes en Espera ({pacientesEnEspera.length})
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Cargando pacientes...</p>
              </div>
            ) : pacientesEnEspera.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No hay pacientes en espera</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {pacientesEnEspera.map((cita) => (
                  <button
                    key={cita.id}
                    onClick={() => seleccionarPaciente(cita)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      citaSeleccionada?.id === cita.id
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">
                      {cita.paciente?.nombre} {cita.paciente?.apellido}
                    </div>
                    <div className="text-sm text-gray-600">
                      Cédula: {cita.paciente?.cedula}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Hora: {cita.hora_inicio} - Dr. {cita.medico?.nombre}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Formulario de signos vitales */}
        <div className="lg:col-span-2">
          {!citaSeleccionada ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Seleccione un paciente de la lista para registrar sus signos vitales
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {citaSeleccionada.paciente?.nombre} {citaSeleccionada.paciente?.apellido}
                </h2>
                <p className="text-gray-600">
                  Cédula: {citaSeleccionada.paciente?.cedula} | 
                  Edad: {citaSeleccionada.paciente?.edad || 'N/A'} años
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Presión Arterial */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-600" />
                    Presión Arterial (mmHg) *
                  </label>
                  <input
                    type="text"
                    name="presion_arterial"
                    value={signosVitales.presion_arterial}
                    onChange={handleInputChange}
                    placeholder="120/80"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Frecuencia Cardíaca */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    Frecuencia Cardíaca (lpm) *
                  </label>
                  <input
                    type="number"
                    name="frecuencia_cardiaca"
                    value={signosVitales.frecuencia_cardiaca}
                    onChange={handleInputChange}
                    placeholder="72"
                    min="40"
                    max="200"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Frecuencia Respiratoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    Frecuencia Respiratoria (rpm) *
                  </label>
                  <input
                    type="number"
                    name="frecuencia_respiratoria"
                    value={signosVitales.frecuencia_respiratoria}
                    onChange={handleInputChange}
                    placeholder="16"
                    min="8"
                    max="40"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Temperatura */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-orange-600" />
                    Temperatura (°C) *
                  </label>
                  <input
                    type="number"
                    name="temperatura"
                    value={signosVitales.temperatura}
                    onChange={handleInputChange}
                    placeholder="36.5"
                    step="0.1"
                    min="35"
                    max="42"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Saturación de Oxígeno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-600" />
                    Saturación O₂ (%) *
                  </label>
                  <input
                    type="number"
                    name="saturacion_oxigeno"
                    value={signosVitales.saturacion_oxigeno}
                    onChange={handleInputChange}
                    placeholder="98"
                    min="70"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Weight className="w-4 h-4 text-purple-600" />
                    Peso (kg) *
                  </label>
                  <input
                    type="number"
                    name="peso"
                    value={signosVitales.peso}
                    onChange={handleInputChange}
                    placeholder="70"
                    step="0.1"
                    min="1"
                    max="300"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* Talla */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-indigo-600" />
                    Talla (m) *
                  </label>
                  <input
                    type="number"
                    name="talla"
                    value={signosVitales.talla}
                    onChange={handleInputChange}
                    placeholder="1.70"
                    step="0.01"
                    min="0.3"
                    max="2.5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                {/* IMC (calculado automáticamente) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-teal-600" />
                    IMC (calculado)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="imc"
                      value={signosVitales.imc}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                    {signosVitales.imc && (
                      <span className={`text-sm font-semibold ${getIMCCategory(signosVitales.imc).color}`}>
                        {getIMCCategory(signosVitales.imc).text}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observaciones"
                  value={signosVitales.observaciones}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Observaciones adicionales sobre los signos vitales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Botones de acción */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={guardarSignosVitales}
                  disabled={guardando}
                  className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
                >
                  {guardando ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar y Enviar a Consulta
                    </>
                  )}
                </button>

                <button
                  onClick={() => setCitaSeleccionada(null)}
                  disabled={guardando}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancelar
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                * Campos obligatorios
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignosVitales;
