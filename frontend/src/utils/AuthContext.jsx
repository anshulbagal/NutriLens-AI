import { createContext, useContext, useState, useEffect } from 'react'
import { setAuthToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('nutrilens_token')
    const storedUser = localStorage.getItem('nutrilens_user')
    if (storedToken && storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsed)
        setAuthToken(storedToken)
      } catch {
        localStorage.removeItem('nutrilens_token')
        localStorage.removeItem('nutrilens_user')
      }
    }
  }, [])

  const login = (accessToken, userData) => {
    setToken(accessToken)
    setUser(userData)
    setAuthToken(accessToken)
    localStorage.setItem('nutrilens_token', accessToken)
    localStorage.setItem('nutrilens_user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setAuthToken(null)
    localStorage.removeItem('nutrilens_token')
    localStorage.removeItem('nutrilens_user')
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
