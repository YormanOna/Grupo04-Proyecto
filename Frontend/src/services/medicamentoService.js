import api from './api'

export const getMedicamentos = async () => {
  const res = await api.get('/medicamentos/')
  return res.data
}

export const getMedicamento = async (id) => {
  const res = await api.get(`/medicamentos/${id}`)
  return res.data
}

export const createMedicamento = async (medicamento) => {
  const res = await api.post('/medicamentos/', medicamento)
  return res.data
}

export const updateMedicamento = async (id, medicamento) => {
  const res = await api.put(`/medicamentos/${id}`, medicamento)
  return res.data
}

export const deleteMedicamento = async (id) => {
  const res = await api.delete(`/medicamentos/${id}`)
  return res.data
}

export default {
  getMedicamentos,
  getMedicamento,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
}
