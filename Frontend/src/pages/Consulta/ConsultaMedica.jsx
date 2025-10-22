import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Stethoscope, User, Calendar, Activity, FileText, Pill, 
  Save, Send, AlertCircle, Clock, Heart, Thermometer,
  ArrowLeft, Plus, Trash2, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import consultaService from '../../services/consultaService';
import citaService from '../../services/citaService';
import recetaService from '../../services/recetaService';

const ConsultaMedica = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pacientesEnCola, setPacientesEnCola] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [consultaActual, setConsultaActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [vistaActiva, setVistaActiva] = useState('cola'); // 'cola', 'consulta', 'historia'

  // Datos de la consulta
  const [datosConsulta, setDatosConsulta] = useState({
    motivo_consulta: '',
    enfermedad_actual: '',
    examen_fisico: '',
    diagnostico: '',
    diagnosticos_secundarios: '',
    tratamiento: '',
    indicaciones: '',
    examenes_solicitados: '',
    pronostico: '',
    observaciones: ''
  });

  // Medicamentos para prescripción
  const [medicamentos, setMedicamentos] = useState([
    { nombre: '', dosis: '', frecuencia: '', duracion: '', via: '' }
  ]);
  const [indicacionesReceta, setIndicacionesReceta] = useState('');

  useEffect(() => {
    cargarPacientesEnCola();
  }, []);

  const cargarPacientesEnCola = async () => {
    setLoading(true);
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const response = await citaService.listar({
        fecha: hoy,
        medico_id: user.id,
        estado: 'en_consulta'
      });
      setPacientesEnCola(response.data || []);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar la cola de pacientes');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarPaciente = async (cita) => {
    setCitaSeleccionada(cita);
    setVistaActiva('consulta');
    
    // Buscar si ya existe una consulta iniciada
    try {
      const response = await consultaService.listar({
        paciente_id: cita.paciente_id,
        medico_id: user.id
      });
      
      const consultasHoy = response.data.filter(c => {
        const fechaConsulta = new Date(c.fecha_consulta).toDateString();
        const hoy = new Date().toDateString();
        return fechaConsulta === hoy;
      });

      if (consultasHoy.length > 0) {
        const consulta = consultasHoy[0];
        setConsultaActual(consulta);
        
        // Cargar datos de la consulta existente
        setDatosConsulta({
          motivo_consulta: consulta.motivo_consulta || '',
          enfermedad_actual: consulta.enfermedad_actual || '',
          examen_fisico: consulta.examen_fisico || '',
          diagnostico: consulta.diagnostico || '',
          diagnosticos_secundarios: consulta.diagnosticos_secundarios || '',
          tratamiento: consulta.tratamiento || '',
          indicaciones: consulta.indicaciones || '',
          examenes_solicitados: consulta.examenes_solicitados || '',
          pronostico: consulta.pronostico || '',
          observaciones: consulta.observaciones || ''
        });
      }
    } catch (error) {
      console.error('Error al buscar consulta:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDatosConsulta(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const agregarMedicamento = () => {
    setMedicamentos([...medicamentos, { nombre: '', dosis: '', frecuencia: '', duracion: '', via: '' }]);
  };

  const eliminarMedicamento = (index) => {
    setMedicamentos(medicamentos.filter((_, i) => i !== index));
  };

  const handleMedicamentoChange = (index, field, value) => {
    const nuevosMedicamentos = [...medicamentos];
    nuevosMedicamentos[index][field] = value;
    setMedicamentos(nuevosMedicamentos);
  };

  const validarConsulta = () => {
    const errores = [];
    
    if (!datosConsulta.motivo_consulta.trim()) {
      errores.push('El motivo de consulta es obligatorio');
    }
    if (!datosConsulta.enfermedad_actual.trim()) {
      errores.push('La enfermedad actual es obligatoria');
    }
    if (!datosConsulta.examen_fisico.trim()) {
      errores.push('El examen físico es obligatorio');
    }
    if (!datosConsulta.diagnostico.trim()) {
      errores.push('El diagnóstico es obligatorio');
    }
    if (!datosConsulta.tratamiento.trim()) {
      errores.push('El tratamiento es obligatorio');
    }

    return errores;
  };

  const guardarConsulta = async () => {
    const errores = validarConsulta();
    if (errores.length > 0) {
      errores.forEach(error => toast.error(error));
      return;
    }

    // Validar que exista paciente_id
    if (!citaSeleccionada?.paciente_id) {
      toast.error('Error: No se puede guardar consulta sin paciente asociado');
      return;
    }

    setGuardando(true);
    try {
      if (consultaActual) {
        // Actualizar consulta existente
        await consultaService.actualizar(consultaActual.id, datosConsulta);
        toast.success('Consulta actualizada correctamente');
      } else {
        // Crear nueva consulta (no debería llegar aquí si la enfermera ya la creó)
        const payload = {
          cita_id: citaSeleccionada.id,
          paciente_id: citaSeleccionada.paciente_id,
          medico_id: user.id,
          ...datosConsulta
        };
        const response = await consultaService.crear(payload);
        setConsultaActual(response.data);
        toast.success('Consulta guardada correctamente');
      }
    } catch (error) {
      console.error('Error al guardar consulta:', error);
      const errorMsg = error.response?.data?.detail || 'Error al guardar la consulta';
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

  const finalizarYPrescribir = async () => {
    // Primero guardar la consulta
    await guardarConsulta();

    // Validar que haya al menos un medicamento
    const medicamentosValidos = medicamentos.filter(m => m.nombre.trim() !== '');
    if (medicamentosValidos.length === 0) {
      toast.error('Debe agregar al menos un medicamento para prescribir');
      return;
    }

    // Validar que cada medicamento tenga todos los campos necesarios
    for (let i = 0; i < medicamentosValidos.length; i++) {
      const med = medicamentosValidos[i];
      if (!med.dosis || !med.frecuencia || !med.duracion || !med.via) {
        toast.error(`Medicamento ${i + 1}: Complete todos los campos (dosis, frecuencia, duración, vía)`);
        return;
      }
    }

    if (!consultaActual?.id) {
      toast.error('Error: Debe guardar la consulta antes de prescribir');
      return;
    }

    setGuardando(true);
    try {
      // Formatear medicamentos para la receta
      const medicamentosTexto = medicamentosValidos.map((m, i) => 
        `${i + 1}. ${m.nombre}\n   Dosis: ${m.dosis}\n   Frecuencia: ${m.frecuencia}\n   Duración: ${m.duracion}\n   Vía: ${m.via}`
      ).join('\n\n');

      // Crear receta
      const recetaPayload = {
        consulta_id: consultaActual.id,
        medico_id: user.id,
        paciente_id: citaSeleccionada.paciente_id,
        medicamentos: medicamentosTexto,
        indicaciones: indicacionesReceta || datosConsulta.indicaciones,
        estado: 'pendiente'
      };

      await recetaService.crearReceta(recetaPayload);

      // Actualizar estado de la cita a "completada"
      await citaService.actualizar(citaSeleccionada.id, {
        estado: 'completada'
      });

      toast.success('✅ Consulta finalizada y receta enviada a farmacia');
      
      // Volver a la cola
      volverACola();
      cargarPacientesEnCola();
    } catch (error) {
      console.error('Error al finalizar consulta:', error);
      const errorMsg = error.response?.data?.detail || 'Error al finalizar la consulta';
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

  const finalizarSinReceta = async () => {
    if (!window.confirm('¿Finalizar consulta sin prescribir medicamentos?')) {
      return;
    }

    await guardarConsulta();

    try {
      // Actualizar estado de la cita a "completada"
      await citaService.actualizar(citaSeleccionada.id, {
        estado: 'completada'
      });

      toast.success('✅ Consulta finalizada exitosamente');
      volverACola();
      cargarPacientesEnCola();
    } catch (error) {
      console.error('Error al finalizar consulta:', error);
      toast.error('Error al finalizar la consulta');
    }
  };

  const volverACola = () => {
    setVistaActiva('cola');
    setCitaSeleccionada(null);
    setConsultaActual(null);
    setDatosConsulta({
      motivo_consulta: '',
      enfermedad_actual: '',
      examen_fisico: '',
      diagnostico: '',
      diagnosticos_secundarios: '',
      tratamiento: '',
      indicaciones: '',
      examenes_solicitados: '',
      pronostico: '',
      observaciones: ''
    });
    setMedicamentos([{ nombre: '', dosis: '', frecuencia: '', duracion: '', via: '' }]);
    setIndicacionesReceta('');
  };

  const formatearSignosVitales = (consulta) => {
    if (!consulta?.signos_vitales) return 'No disponible';
    
    const sv = consulta.signos_vitales;
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-red-50 p-2 rounded">
          <p className="text-red-600 font-semibold">PA</p>
          <p className="text-gray-800">{sv.presion_arterial || 'N/A'}</p>
        </div>
        <div className="bg-green-50 p-2 rounded">
          <p className="text-green-600 font-semibold">FC</p>
          <p className="text-gray-800">{sv.frecuencia_cardiaca || 'N/A'} lpm</p>
        </div>
        <div className="bg-blue-50 p-2 rounded">
          <p className="text-blue-600 font-semibold">FR</p>
          <p className="text-gray-800">{sv.frecuencia_respiratoria || 'N/A'} rpm</p>
        </div>
        <div className="bg-orange-50 p-2 rounded">
          <p className="text-orange-600 font-semibold">Temp</p>
          <p className="text-gray-800">{sv.temperatura || 'N/A'} °C</p>
        </div>
        <div className="bg-cyan-50 p-2 rounded">
          <p className="text-cyan-600 font-semibold">SpO₂</p>
          <p className="text-gray-800">{sv.saturacion_oxigeno || 'N/A'}%</p>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <p className="text-purple-600 font-semibold">Peso</p>
          <p className="text-gray-800">{sv.peso || 'N/A'} kg</p>
        </div>
        <div className="bg-indigo-50 p-2 rounded">
          <p className="text-indigo-600 font-semibold">Talla</p>
          <p className="text-gray-800">{sv.talla || 'N/A'} m</p>
        </div>
        <div className="bg-teal-50 p-2 rounded">
          <p className="text-teal-600 font-semibold">IMC</p>
          <p className="text-gray-800">{sv.imc || 'N/A'}</p>
        </div>
      </div>
    );
  };

  // Vista de Cola de Pacientes
  if (vistaActiva === 'cola') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Consulta Médica
          </h1>
          <p className="text-gray-600 mt-2">
            Pacientes en espera con signos vitales registrados
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Cola de Pacientes ({pacientesEnCola.length})
            </h2>
            <button
              onClick={cargarPacientesEnCola}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Actualizar
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando pacientes...</p>
            </div>
          ) : pacientesEnCola.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No hay pacientes en cola</p>
              <p className="text-gray-500 text-sm mt-2">
                Los pacientes aparecerán aquí después de que enfermería registre sus signos vitales
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pacientesEnCola.map((cita) => (
                <div
                  key={cita.id}
                  className="border-2 border-gray-200 rounded-lg p-5 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => seleccionarPaciente(cita)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">
                          {cita.paciente?.nombre} {cita.paciente?.apellido}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Cédula: {cita.paciente?.cedula} | Edad: {cita.paciente?.edad || 'N/A'} años
                        </p>
                        {cita.paciente?.alergias && (
                          <p className="text-red-600 text-sm font-semibold flex items-center gap-1 mt-1">
                            <AlertCircle className="w-4 h-4" />
                            Alergias: {cita.paciente.alergias}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Hora de cita</p>
                      <p className="font-semibold text-gray-800">{cita.hora_inicio}</p>
                    </div>
                  </div>

                  {/* Signos Vitales */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      Signos Vitales
                    </p>
                    {formatearSignosVitales(consultaActual)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista de Consulta
  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={volverACola}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la cola
          </button>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Consulta Médica
          </h1>
        </div>
      </div>

      {/* Información del Paciente */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {citaSeleccionada?.paciente?.nombre} {citaSeleccionada?.paciente?.apellido}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cédula</p>
                <p className="font-semibold text-gray-800">{citaSeleccionada?.paciente?.cedula}</p>
              </div>
              <div>
                <p className="text-gray-600">Edad</p>
                <p className="font-semibold text-gray-800">{citaSeleccionada?.paciente?.edad || 'N/A'} años</p>
              </div>
              <div>
                <p className="text-gray-600">Género</p>
                <p className="font-semibold text-gray-800">{citaSeleccionada?.paciente?.genero || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Grupo Sanguíneo</p>
                <p className="font-semibold text-gray-800">{citaSeleccionada?.paciente?.grupo_sanguineo || 'N/A'}</p>
              </div>
            </div>
            {citaSeleccionada?.paciente?.alergias && (
              <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  ALERGIAS: {citaSeleccionada.paciente.alergias}
                </p>
              </div>
            )}
            {citaSeleccionada?.paciente?.antecedentes_medicos && (
              <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-amber-800 text-sm">
                  <strong>Antecedentes:</strong> {citaSeleccionada.paciente.antecedentes_medicos}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Signos Vitales */}
        <div className="mt-4 pt-4 border-t border-blue-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" />
            Signos Vitales Registrados
          </h3>
          {formatearSignosVitales(consultaActual)}
        </div>
      </div>

      {/* Formulario de Consulta */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-600" />
          Registro de Consulta
        </h3>

        <div className="grid grid-cols-1 gap-6">
          {/* Motivo de Consulta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de Consulta *
            </label>
            <input
              type="text"
              name="motivo_consulta"
              value={datosConsulta.motivo_consulta}
              onChange={handleInputChange}
              placeholder="¿Por qué acude el paciente?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Enfermedad Actual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enfermedad Actual *
            </label>
            <textarea
              name="enfermedad_actual"
              value={datosConsulta.enfermedad_actual}
              onChange={handleInputChange}
              rows="4"
              placeholder="Descripción detallada de la enfermedad actual, inicio, evolución, síntomas..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Examen Físico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Examen Físico *
            </label>
            <textarea
              name="examen_fisico"
              value={datosConsulta.examen_fisico}
              onChange={handleInputChange}
              rows="4"
              placeholder="Hallazgos del examen físico completo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Diagnóstico Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico Principal *
              </label>
              <input
                type="text"
                name="diagnostico"
                value={datosConsulta.diagnostico}
                onChange={handleInputChange}
                placeholder="CIE-10 o descripción del diagnóstico"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Diagnósticos Secundarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnósticos Secundarios
              </label>
              <input
                type="text"
                name="diagnosticos_secundarios"
                value={datosConsulta.diagnosticos_secundarios}
                onChange={handleInputChange}
                placeholder="Diagnósticos adicionales"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Tratamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento *
            </label>
            <textarea
              name="tratamiento"
              value={datosConsulta.tratamiento}
              onChange={handleInputChange}
              rows="3"
              placeholder="Plan de tratamiento, medidas generales..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Indicaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Indicaciones
            </label>
            <textarea
              name="indicaciones"
              value={datosConsulta.indicaciones}
              onChange={handleInputChange}
              rows="3"
              placeholder="Indicaciones al paciente, recomendaciones..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Exámenes Solicitados */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exámenes Solicitados
              </label>
              <textarea
                name="examenes_solicitados"
                value={datosConsulta.examenes_solicitados}
                onChange={handleInputChange}
                rows="2"
                placeholder="Laboratorios, imágenes, otros estudios..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Pronóstico */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pronóstico
              </label>
              <select
                name="pronostico"
                value={datosConsulta.pronostico}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccionar...</option>
                <option value="Excelente">Excelente</option>
                <option value="Bueno">Bueno</option>
                <option value="Regular">Regular</option>
                <option value="Reservado">Reservado</option>
                <option value="Grave">Grave</option>
              </select>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones Adicionales
            </label>
            <textarea
              name="observaciones"
              value={datosConsulta.observaciones}
              onChange={handleInputChange}
              rows="2"
              placeholder="Cualquier observación adicional..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Botón Guardar Consulta */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={guardarConsulta}
            disabled={guardando}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
          >
            <Save className="w-5 h-5" />
            Guardar Consulta
          </button>
        </div>
      </div>

      {/* Sección de Prescripción */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Pill className="w-6 h-6 text-orange-600" />
          Prescripción de Medicamentos
        </h3>

        <div className="space-y-4 mb-6">
          {medicamentos.map((med, index) => (
            <div key={index} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-700">Medicamento {index + 1}</h4>
                {medicamentos.length > 1 && (
                  <button
                    onClick={() => eliminarMedicamento(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Nombre del Medicamento *
                  </label>
                  <input
                    type="text"
                    value={med.nombre}
                    onChange={(e) => handleMedicamentoChange(index, 'nombre', e.target.value)}
                    placeholder="Ej: Amoxicilina 500mg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Dosis
                  </label>
                  <input
                    type="text"
                    value={med.dosis}
                    onChange={(e) => handleMedicamentoChange(index, 'dosis', e.target.value)}
                    placeholder="Ej: 1 tableta"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Frecuencia
                  </label>
                  <input
                    type="text"
                    value={med.frecuencia}
                    onChange={(e) => handleMedicamentoChange(index, 'frecuencia', e.target.value)}
                    placeholder="Ej: Cada 8 horas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Duración
                  </label>
                  <input
                    type="text"
                    value={med.duracion}
                    onChange={(e) => handleMedicamentoChange(index, 'duracion', e.target.value)}
                    placeholder="Ej: 7 días"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2 lg:col-span-5">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vía de Administración
                  </label>
                  <select
                    value={med.via}
                    onChange={(e) => handleMedicamentoChange(index, 'via', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Seleccionar vía...</option>
                    <option value="Oral">Oral</option>
                    <option value="Sublingual">Sublingual</option>
                    <option value="Intravenosa">Intravenosa</option>
                    <option value="Intramuscular">Intramuscular</option>
                    <option value="Subcutánea">Subcutánea</option>
                    <option value="Tópica">Tópica</option>
                    <option value="Inhalatoria">Inhalatoria</option>
                    <option value="Oftálmica">Oftálmica</option>
                    <option value="Ótica">Ótica</option>
                    <option value="Rectal">Rectal</option>
                    <option value="Vaginal">Vaginal</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={agregarMedicamento}
          className="mb-6 px-4 py-2 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors flex items-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" />
          Agregar Otro Medicamento
        </button>

        {/* Indicaciones de la Receta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indicaciones para la Receta
          </label>
          <textarea
            value={indicacionesReceta}
            onChange={(e) => setIndicacionesReceta(e.target.value)}
            rows="3"
            placeholder="Indicaciones específicas para la toma de medicamentos..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Botones de Acción Final */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={finalizarYPrescribir}
            disabled={guardando}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-all shadow-lg"
          >
            {guardando ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Procesando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Finalizar y Enviar Receta a Farmacia
              </>
            )}
          </button>

          <button
            onClick={finalizarSinReceta}
            disabled={guardando}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 font-semibold transition-colors"
          >
            <Save className="w-5 h-5" />
            Finalizar Sin Receta
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          * La receta se enviará automáticamente a farmacia para su dispensación
        </p>
      </div>
    </div>
  );
};

export default ConsultaMedica;
