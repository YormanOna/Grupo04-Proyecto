import React, { useState } from 'react'
import { createPaciente } from '../../services/pacienteService'
import { useNavigate } from 'react-router-dom'
import { UserPlus, Save, X, User, CreditCard, Mail, Phone, MapPin, Calendar, Droplet, AlertCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'
import FormField, { TextAreaField, SelectField } from '../../components/FormField'

const PacienteForm = () => {
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '', 
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    fecha_nacimiento: '',
    genero: '',
    grupo_sanguineo: '',
    alergias: '',
    antecedentes_medicos: '',
    contacto_emergencia_nombre: '',
    contacto_emergencia_telefono: '',
    contacto_emergencia_relacion: ''
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched({ ...touched, [name]: true })
    validateField(name, form[name])
  }

  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es obligatorio'
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres'
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'El nombre solo puede contener letras'
        }
        break

      case 'apellido':
        if (!value.trim()) {
          error = 'El apellido es obligatorio'
        } else if (value.trim().length < 2) {
          error = 'El apellido debe tener al menos 2 caracteres'
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          error = 'El apellido solo puede contener letras'
        }
        break

      case 'cedula':
        if (!value.trim()) {
          error = 'La cédula es obligatoria'
        } else if (!/^\d{10}$/.test(value.trim())) {
          error = 'La cédula debe tener exactamente 10 dígitos'
        }
        break

      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'El correo electrónico no es válido'
        }
        break

      case 'telefono':
        if (value && value.length < 7) {
          error = 'El teléfono debe tener al menos 7 dígitos'
        } else if (value && !/^[\d\s\+\-\(\)]+$/.test(value)) {
          error = 'El teléfono solo puede contener números y símbolos telefónicos'
        }
        break

      case 'fecha_nacimiento':
        if (value) {
          const fecha = new Date(value)
          const hoy = new Date()
          if (fecha > hoy) {
            error = 'La fecha de nacimiento no puede ser futura'
          }
          const edad = hoy.getFullYear() - fecha.getFullYear()
          if (edad > 120) {
            error = 'La fecha de nacimiento no es válida'
          }
        }
        break

      case 'grupo_sanguineo':
        if (value && !/^(A|B|AB|O)[+-]$/.test(value)) {
          error = 'Formato de grupo sanguíneo inválido (ej: O+, A-, B+)'
        }
        break

      default:
        break
    }

    setErrors(prev => ({ ...prev, [name]: error }))
    return error
  }

  const validateForm = () => {
    const newErrors = {}
    const fields = ['nombre', 'apellido', 'cedula']
    
    fields.forEach(field => {
      const error = validateField(field, form[field])
      if (error) newErrors[field] = error
    })

    // Validar email si está presente
    if (form.email) {
      const emailError = validateField('email', form.email)
      if (emailError) newErrors.email = emailError
    }

    // Validar teléfono si está presente
    if (form.telefono) {
      const telefonoError = validateField('telefono', form.telefono)
      if (telefonoError) newErrors.telefono = telefonoError
    }

    // Validar fecha de nacimiento si está presente
    if (form.fecha_nacimiento) {
      const fechaError = validateField('fecha_nacimiento', form.fecha_nacimiento)
      if (fechaError) newErrors.fecha_nacimiento = fechaError
    }

    // Marcar todos los campos como tocados
    const allTouched = {}
    Object.keys(form).forEach(key => {
      allTouched[key] = true
    })
    setTouched(allTouched)

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar formulario completo
    if (!validateForm()) {
      toast.error('Por favor corrija los errores en el formulario')
      return
    }

    setIsLoading(true)
    try {
      // Convertir cedula a número entero
      const pacienteData = {
        ...form,
        cedula: parseInt(form.cedula.trim(), 10)
      }
      await createPaciente(pacienteData)
      toast.success('Paciente registrado exitosamente')
      navigate('/pacientes')
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Error al registrar paciente'
      toast.error(errorMsg)
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Nuevo Paciente</h2>
            <p className="text-gray-600">Registrar información del paciente</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-card p-8">
        {/* Información Personal */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <User className="w-5 h-5 text-primary-600" />
            <span>Información Personal</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Nombre"
              icon={User}
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.nombre}
              touched={touched.nombre}
              placeholder="Ingrese el nombre"
              required
            />
            <FormField
              label="Apellido"
              icon={User}
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.apellido}
              touched={touched.apellido}
              placeholder="Ingrese el apellido"
              required
            />
            <FormField
              label="Cédula"
              icon={CreditCard}
              name="cedula"
              type="text"
              value={form.cedula}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.cedula}
              touched={touched.cedula}
              placeholder="1234567890"
              maxLength="10"
              required
            />
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Phone className="w-5 h-5 text-primary-600" />
            <span>Información de Contacto</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="Correo Electrónico"
              icon={Mail}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              touched={touched.email}
              placeholder="correo@ejemplo.com"
            />
            <FormField
              label="Teléfono"
              icon={Phone}
              name="telefono"
              type="tel"
              value={form.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.telefono}
              touched={touched.telefono}
              placeholder="+593 999 999 999"
            />
          </div>
          <div className="mt-6">
            <TextAreaField
              label="Dirección"
              icon={MapPin}
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.direccion}
              touched={touched.direccion}
              rows={3}
              placeholder="Ingrese la dirección completa"
            />
          </div>
        </div>

        {/* Información Médica */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span>Información Médica</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Fecha de Nacimiento"
              icon={Calendar}
              name="fecha_nacimiento"
              type="date"
              value={form.fecha_nacimiento}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.fecha_nacimiento}
              touched={touched.fecha_nacimiento}
              max={new Date().toISOString().split('T')[0]}
            />
            <SelectField
              label="Género"
              icon={User}
              name="genero"
              value={form.genero}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.genero}
              touched={touched.genero}
            >
              <option value="">Seleccione</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </SelectField>
            <FormField
              label="Grupo Sanguíneo"
              icon={Droplet}
              name="grupo_sanguineo"
              value={form.grupo_sanguineo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.grupo_sanguineo}
              touched={touched.grupo_sanguineo}
              placeholder="Ej: O+, A-, B+"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <TextAreaField
              label="Alergias"
              name="alergias"
              value={form.alergias}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.alergias}
              touched={touched.alergias}
              rows={3}
              placeholder="Registre las alergias conocidas del paciente"
            />
            <TextAreaField
              label="Antecedentes Médicos"
              name="antecedentes_medicos"
              value={form.antecedentes_medicos}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.antecedentes_medicos}
              touched={touched.antecedentes_medicos}
              rows={3}
              placeholder="Enfermedades previas, cirugías, etc."
            />
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
            <Users className="w-5 h-5 text-orange-600" />
            <span>Contacto de Emergencia</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="Nombre Completo"
              icon={User}
              name="contacto_emergencia_nombre"
              value={form.contacto_emergencia_nombre}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.contacto_emergencia_nombre}
              touched={touched.contacto_emergencia_nombre}
              placeholder="Nombre del contacto"
            />
            <FormField
              label="Teléfono"
              icon={Phone}
              name="contacto_emergencia_telefono"
              value={form.contacto_emergencia_telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.contacto_emergencia_telefono}
              touched={touched.contacto_emergencia_telefono}
              placeholder="+593 999 999 999"
            />
            <FormField
              label="Relación"
              icon={Users}
              name="contacto_emergencia_relacion"
              value={form.contacto_emergencia_relacion}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.contacto_emergencia_relacion}
              touched={touched.contacto_emergencia_relacion}
              placeholder="Ej: Padre, Madre, Hermano/a"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/pacientes')}
            className="flex items-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <X className="w-5 h-5" />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{isLoading ? 'Guardando...' : 'Guardar Paciente'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default PacienteForm

