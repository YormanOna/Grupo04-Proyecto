import api from './api'

export const crearEncuesta = async (data) => {
  const res = await api.post('/encuestas', data)
  return res.data
}

export const getEncuestas = async (pacienteId = null) => {
  const params = {}
  if (pacienteId) params.paciente_id = pacienteId
  
  const res = await api.get('/encuestas', { params })
  return res.data
}

export const getPromedioSatisfaccion = async () => {
  const res = await api.get('/encuestas/promedio')
  return res.data
}

export const getEncuesta = async (id) => {
  const res = await api.get(`/encuestas/${id}`)
  return res.data
}
