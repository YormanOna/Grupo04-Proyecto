import api from './api'

export const loginService = async (email, password) => {
  const res = await api.post('/auth/login', { email, password })
  return res.data
}
