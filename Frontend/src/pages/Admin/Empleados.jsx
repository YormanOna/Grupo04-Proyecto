import { useState, useEffect } from 'react';
import { Users, Plus, Edit, Trash2, Search, Mail, Phone, IdCard, UserCog, Eye, EyeOff, X } from 'lucide-react';
import Modal from '../../components/Modal';

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    cedula: '',
    telefono: '',
    cargo: ''
  });
  const [errores, setErrores] = useState({});

  const cargos = [
    'Admin General',
    'Administrador',
    'Medico',
    'Enfermera',
    'Farmaceutico'
  ];

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const cargarEmpleados = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/empleados', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEmpleados(data);
      }
    } catch (error) {
      console.error('Error cargando empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const abrirModalNuevo = () => {
    setEmpleadoSeleccionado(null);
    setFormulario({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      cedula: '',
      telefono: '',
      cargo: ''
    });
    setErrores({});
    setMostrarPassword(false);
    setModalAbierto(true);
  };

  const abrirModalEditar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setFormulario({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      password: '', // No mostrar password existente
      cedula: empleado.cedula,
      telefono: empleado.telefono || '',
      cargo: empleado.cargo
    });
    setErrores({});
    setMostrarPassword(false);
    setModalAbierto(true);
  };

  const abrirModalEliminar = (empleado) => {
    setEmpleadoSeleccionado(empleado);
    setModalEliminar(true);
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!formulario.apellido.trim()) nuevosErrores.apellido = 'El apellido es requerido';
    if (!formulario.email.trim()) {
      nuevosErrores.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email)) {
      nuevosErrores.email = 'Email inválido';
    }
    if (!empleadoSeleccionado && !formulario.password) {
      nuevosErrores.password = 'La contraseña es requerida';
    } else if (formulario.password && formulario.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!formulario.cedula.trim()) nuevosErrores.cedula = 'La cédula es requerida';
    if (!formulario.cargo) nuevosErrores.cargo = 'El cargo es requerido';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarEmpleado = async () => {
    if (!validarFormulario()) return;

    try {
      const token = localStorage.getItem('token');
      const url = empleadoSeleccionado
        ? `http://localhost:8000/empleados/${empleadoSeleccionado.id}`
        : 'http://localhost:8000/empleados';
      
      const method = empleadoSeleccionado ? 'PUT' : 'POST';
      
      // Si es edición y no hay password, no enviarlo
      const body = { ...formulario };
      if (empleadoSeleccionado && !formulario.password) {
        delete body.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        setModalAbierto(false);
        cargarEmpleados();
      } else {
        const error = await response.json();
        alert(error.detail || 'Error al guardar empleado');
      }
    } catch (error) {
      console.error('Error guardando empleado:', error);
      alert('Error al guardar empleado');
    }
  };

  const eliminarEmpleado = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:8000/empleados/${empleadoSeleccionado.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setModalEliminar(false);
        cargarEmpleados();
      } else {
        const error = await response.json();
        alert(error.detail || 'Error al eliminar empleado');
      }
    } catch (error) {
      console.error('Error eliminando empleado:', error);
      alert('Error al eliminar empleado');
    }
  };

  const empleadosFiltrados = empleados.filter(emp =>
    emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    emp.cedula.includes(busqueda) ||
    emp.cargo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getCargoColor = (cargo) => {
    const colores = {
      'Admin General': 'bg-purple-100 text-purple-800 border-purple-300',
      'Administrador': 'bg-blue-100 text-blue-800 border-blue-300',
      'Medico': 'bg-green-100 text-green-800 border-green-300',
      'Enfermera': 'bg-pink-100 text-pink-800 border-pink-300',
      'Farmaceutico': 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return colores[cargo] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gestión de Usuarios</h1>
            <p className="text-gray-600 dark:text-gray-400">Administración de empleados y permisos del sistema</p>
          </div>
        </div>
        <button
          onClick={abrirModalNuevo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Búsqueda y estadísticas */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-transparent dark:border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nombre, email, cédula o cargo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {cargos.map(cargo => (
            <div key={cargo} className="text-center">
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {empleados.filter(e => e.cargo === cargo).length}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{cargo}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de empleados */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-transparent dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cédula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Cargando usuarios...</p>
                  </td>
                </tr>
              ) : empleadosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                empleadosFiltrados.map((empleado) => (
                  <tr key={empleado.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {empleado.nombre[0]}{empleado.apellido[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {empleado.nombre} {empleado.apellido}
                          </div>
                          <div className="text-xs text-gray-500">ID: {empleado.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {empleado.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <IdCard className="w-4 h-4 text-gray-400" />
                        {empleado.cedula}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {empleado.telefono || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCargoColor(empleado.cargo)}`}>
                        {empleado.cargo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => abrirModalEditar(empleado)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => abrirModalEliminar(empleado)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <UserCog className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {empleadoSeleccionado ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">
                      {empleadoSeleccionado 
                        ? 'Actualiza la información del usuario' 
                        : 'Completa todos los campos para crear un usuario'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalAbierto(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Body del Modal */}
            <div className="p-8 overflow-y-auto max-h-[calc(95vh-180px)]">
              <div className="space-y-6">
                {/* Sección: Información Personal */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded"></div>
                    Información Personal
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formulario.nombre}
                        onChange={(e) => setFormulario({ ...formulario, nombre: e.target.value })}
                        className={`w-full px-4 py-3 border-2 ${errores.nombre ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="Ej: Juan"
                      />
                      {errores.nombre && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.nombre}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apellido *
                      </label>
                      <input
                        type="text"
                        value={formulario.apellido}
                        onChange={(e) => setFormulario({ ...formulario, apellido: e.target.value })}
                        className={`w-full px-4 py-3 border-2 ${errores.apellido ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all`}
                        placeholder="Ej: Pérez"
                      />
                      {errores.apellido && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.apellido}</p>}
                    </div>
                  </div>
                </div>

                {/* Sección: Credenciales */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded"></div>
                    Credenciales de Acceso
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Correo Electrónico *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={formulario.email}
                          onChange={(e) => setFormulario({ ...formulario, email: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 border-2 ${errores.email ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all`}
                          placeholder="usuario@hospital.com"
                        />
                      </div>
                      {errores.email && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {empleadoSeleccionado ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                      </label>
                      {empleadoSeleccionado && (
                        <p className="text-xs text-gray-500 mb-2">Dejar vacío para mantener la contraseña actual</p>
                      )}
                      <div className="relative">
                        <input
                          type={mostrarPassword ? 'text' : 'password'}
                          value={formulario.password}
                          onChange={(e) => setFormulario({ ...formulario, password: e.target.value })}
                          className={`w-full px-4 py-3 border-2 ${errores.password ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all pr-12`}
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarPassword(!mostrarPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          {mostrarPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errores.password && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.password}</p>}
                    </div>
                  </div>
                </div>

                {/* Sección: Documentos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                    Documentación
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cédula/DNI *
                      </label>
                      <div className="relative">
                        <IdCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formulario.cedula}
                          onChange={(e) => setFormulario({ ...formulario, cedula: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 border-2 ${errores.cedula ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all`}
                          placeholder="1234567890"
                        />
                      </div>
                      {errores.cedula && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.cedula}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formulario.telefono}
                          onChange={(e) => setFormulario({ ...formulario, telefono: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 focus:border-blue-500 rounded-xl focus:ring-4 focus:ring-blue-100 transition-all"
                          placeholder="0987654321"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sección: Rol y Permisos */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-orange-600 rounded"></div>
                    Rol y Permisos
                  </h3>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cargo/Rol en el Sistema *
                    </label>
                    <select
                      value={formulario.cargo}
                      onChange={(e) => setFormulario({ ...formulario, cargo: e.target.value })}
                      className={`w-full px-4 py-3 border-2 ${errores.cargo ? 'border-red-500 focus:border-red-600' : 'border-gray-200 focus:border-blue-500'} rounded-xl focus:ring-4 focus:ring-blue-100 transition-all bg-white`}
                    >
                      <option value="">Seleccione un cargo</option>
                      {cargos.map(cargo => (
                        <option key={cargo} value={cargo}>{cargo}</option>
                      ))}
                    </select>
                    {errores.cargo && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">⚠ {errores.cargo}</p>}
                    
                    {/* Info sobre permisos */}
                    {formulario.cargo && (
                      <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="text-xs font-medium text-blue-800 mb-2">Permisos del rol:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          {formulario.cargo === 'Admin General' && (
                            <>
                              <li>✓ Acceso total al sistema</li>
                              <li>✓ Gestión de usuarios</li>
                              <li>✓ Auditoría del sistema</li>
                            </>
                          )}
                          {formulario.cargo === 'Administrador' && (
                            <>
                              <li>✓ Gestión de pacientes</li>
                              <li>✓ Agendamiento de citas</li>
                              <li>✓ Control de asistencias</li>
                            </>
                          )}
                          {formulario.cargo === 'Medico' && (
                            <>
                              <li>✓ Consultas médicas</li>
                              <li>✓ Prescripción de recetas</li>
                              <li>✓ Historial clínico</li>
                            </>
                          )}
                          {formulario.cargo === 'Enfermera' && (
                            <>
                              <li>✓ Registro de signos vitales</li>
                              <li>✓ Visualización de citas</li>
                              <li>✓ Asistencia a pacientes</li>
                            </>
                          )}
                          {formulario.cargo === 'Farmaceutico' && (
                            <>
                              <li>✓ Gestión de medicamentos</li>
                              <li>✓ Dispensación de recetas</li>
                              <li>✓ Inventario de farmacia</li>
                            </>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 px-8 py-5 flex gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={guardarEmpleado}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg shadow-blue-500/30"
              >
                {empleadoSeleccionado ? '💾 Actualizar Usuario' : '✨ Crear Usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {modalEliminar && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                  <Trash2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Eliminar Usuario</h2>
                  <p className="text-red-100 text-sm">Esta acción es irreversible</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              {empleadoSeleccionado && (
                <>
                  <p className="text-gray-700 mb-4 font-medium">
                    ¿Está seguro que desea eliminar permanentemente al usuario:
                  </p>
                  
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-xl border-2 border-red-200 mb-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {empleadoSeleccionado.nombre[0]}{empleadoSeleccionado.apellido[0]}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-lg">
                          {empleadoSeleccionado.nombre} {empleadoSeleccionado.apellido}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {empleadoSeleccionado.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/60 px-3 py-2 rounded-lg">
                      <UserCog className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-gray-700">{empleadoSeleccionado.cargo}</span>
                    </div>
                  </div>

                  <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-800 mb-1">Advertencia Importante</p>
                        <p className="text-xs text-red-700">
                          Se eliminará toda la información asociada: historial, registros de auditoría, y no podrá recuperarse.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex gap-3">
              <button
                onClick={() => setModalEliminar(false)}
                className="flex-1 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarEmpleado}
                className="flex-1 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-semibold shadow-lg shadow-red-500/30"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Empleados;
