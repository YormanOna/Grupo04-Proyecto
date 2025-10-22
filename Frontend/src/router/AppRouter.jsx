import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Dashboard from '../pages/Dashboard'
import Login from '../pages/Login'
import PacienteList from '../pages/Pacientes/PacienteList'
import PacienteForm from '../pages/Pacientes/PacienteForm'
import CitaList from '../pages/Citas/CitaList'
import CitaForm from '../pages/Citas/CitaForm'
import MedicoList from '../pages/Medicos/MedicoList'
import MedicamentoList from '../pages/Farmacia/MedicamentoList'
import Asistencia from '../pages/Asistencia/Asistencia'
import RecetaList from '../pages/Recetas/RecetaList'
import SignosVitales from '../pages/Enfermeria/SignosVitales'
import ConsultaMedica from '../pages/Consulta/ConsultaMedica'
import Error404 from '../pages/Error404'

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

const AppRouter = () => {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
      
      <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/asistencia" element={<PrivateRoute><Asistencia /></PrivateRoute>} />
      <Route path="/pacientes" element={<PrivateRoute><PacienteList /></PrivateRoute>} />
      <Route path="/pacientes/nuevo" element={<PrivateRoute><PacienteForm /></PrivateRoute>} />
      <Route path="/citas" element={<PrivateRoute><CitaList /></PrivateRoute>} />
      <Route path="/citas/nueva" element={<PrivateRoute><CitaForm /></PrivateRoute>} />
      <Route path="/medicos" element={<PrivateRoute><MedicoList /></PrivateRoute>} />
      <Route path="/enfermeria/signos-vitales" element={<PrivateRoute><SignosVitales /></PrivateRoute>} />
      <Route path="/consulta-medica" element={<PrivateRoute><ConsultaMedica /></PrivateRoute>} />
      <Route path="/recetas" element={<PrivateRoute><RecetaList /></PrivateRoute>} />
      <Route path="/farmacia" element={<PrivateRoute><MedicamentoList /></PrivateRoute>} />
      
      <Route path="*" element={<Error404 />} />
    </Routes>
  )
}

export default AppRouter
