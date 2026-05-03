import { useState, useEffect } from 'react'
import { storage } from '../utils/storage.js'
import api from '../services/api.js'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = storage.get('user')
    if (storedUser) {
      setUser(storedUser)
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password })
    const data = response.data || response
    const userData = data.user || data
    const token = data.access_token || data.token || userData.token

    if (token) {
      storage.set('token', token)
    }
    storage.set('user', userData)
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (e) {
    }
    storage.remove('token')
    storage.remove('user')
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}
