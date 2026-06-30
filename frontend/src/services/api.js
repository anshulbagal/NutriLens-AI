import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_URL,
})

// Interceptors can't use React hooks directly, so we read from localStorage to ensure
// the latest token is always used, preventing HMR or race condition auth drops.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nutrilens_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const analyzeProduct = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const compareProducts = (fileA, fileB) => {
  const formData = new FormData()
  formData.append('file_a', fileA)
  formData.append('file_b', fileB)
  return api.post('/compare', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const chatWithAI = (message, history, productContext) =>
  api.post('/chat', { message, history, product_context: productContext })

export const signup = (email, password) => api.post('/signup', { email, password })

export const login = (email, password) => api.post('/login', { email, password })

export const getHistory = () => api.get('/history')

export const deleteHistoryEntry = (id) => api.delete(`/history/${id}`)

export default api
