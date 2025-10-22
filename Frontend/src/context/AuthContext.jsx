import React, { createContext, useState, useContext } from 'react'
import { loginService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)

  const login = async (email, password) => {
    try {
      const res = await loginService(email, password)
      setUser(res.user)
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      toast.success('Inicio de sesión exitoso')
    } catch (error) {
      toast.error('Credenciales incorrectas')
      throw error
    }
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
    toast('Sesión cerrada')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

export default AuthContext
