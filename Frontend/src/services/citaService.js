import api from './api'

export const listar = async (filtros = {}) => {
  const params = new URLSearchParams();
  if (filtros.fecha) params.append('fecha', filtros.fecha);
  if (filtros.estado) params.append('estado', filtros.estado);
  if (filtros.paciente_id) params.append('paciente_id', filtros.paciente_id);
  if (filtros.medico_id) params.append('medico_id', filtros.medico_id);
  
  const res = await api.get(`/citas/?${params.toString()}`);
  return res;
}

export const getCitas = async () => {
  const res = await api.get('/citas/')
  return res.data
}

export const getCita = async (id) => {
  const res = await api.get(`/citas/${id}`)
  return res.data
}

export const createCita = async (data) => {
  const res = await api.post('/citas/', data)
  return res.data
}

export const actualizar = async (id, data) => {
  const res = await api.put(`/citas/${id}`, data)
  return res.data
}

export const updateCita = async (id, data) => {
  const res = await api.put(`/citas/${id}`, data)
  return res.data
}

export const deleteCita = async (id) => {
  const res = await api.delete(`/citas/${id}`)
  return res.data
}

export default {
  listar,
  getCitas,
  getCita,
  createCita,
  actualizar,
  updateCita,
  deleteCita
}
