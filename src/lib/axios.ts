import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://ticket-booking-dev.onrender.com/api' 

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gswmi_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 — attempt refresh once, then logout
let isRefreshing = false
let refreshQueue: Array<(token: string) => void> = []

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('gswmi_refresh_token')
    if (!refreshToken) {
      clearAuthAndRedirect()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          resolve(api(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
      const inner = data?.data ?? data
      const newAccessToken = inner?.accessToken ?? inner?.token ?? ''
      const newRefreshToken = inner?.refreshToken ?? ''

      if (!newAccessToken) throw new Error('No token in refresh response')

      localStorage.setItem('gswmi_token', newAccessToken)
      if (newRefreshToken) localStorage.setItem('gswmi_refresh_token', newRefreshToken)

      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
      refreshQueue.forEach((cb) => cb(newAccessToken))
      refreshQueue = []

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
      return api(originalRequest)
    } catch {
      clearAuthAndRedirect()
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)

function clearAuthAndRedirect() {
  localStorage.removeItem('gswmi_token')
  localStorage.removeItem('gswmi_user')
  localStorage.removeItem('gswmi_refresh_token')
  window.location.href = '/login'
}

export default api
