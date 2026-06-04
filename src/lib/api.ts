import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5068',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('furpms_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  // axios auto-sets application/json for object bodies and multipart (with boundary) for FormData.
  if (!(config.data instanceof FormData) && config.data != null && !config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json'
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('furpms_token')
      localStorage.removeItem('furpms_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
