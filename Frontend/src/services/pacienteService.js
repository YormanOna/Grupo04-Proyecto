import api from './api'

export const getPacientes = async () => {
  const res = await api.get('/pacientes')
  return res.data
}

export const getPaciente = async (id) => {
  const res = await api.get(`/pacientes/${id}`)
  return res.data
}

export const createPaciente = async (data) => {
  const res = await api.post('/pacientes', data)
  return res.data
}

export const updatePaciente = async (id, data) => {
  const res = await api.put(`/pacientes/${id}`, data)
  return res.data
}

export const deletePaciente = async (id) => {
  const res = await api.delete(`/pacientes/${id}`)
  return res.data
}
