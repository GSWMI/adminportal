import { create } from 'zustand'

export interface AuthUser {
  id: string
  username: string
  email: string
  avatar?: string
}

interface AuthState {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (token: string, user: AuthUser, refreshToken?: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: localStorage.getItem('gswmi_token'),
  user: (() => {
    const stored = localStorage.getItem('gswmi_user')
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })(),
  isAuthenticated: !!localStorage.getItem('gswmi_token'),

  login: (token, user, refreshToken) => {
    localStorage.setItem('gswmi_token', token)
    localStorage.setItem('gswmi_user', JSON.stringify(user))
    if (refreshToken) {
      localStorage.setItem('gswmi_refresh_token', refreshToken)
    }
    set({ token, user, isAuthenticated: true })
  },

  logout: () => {
    localStorage.removeItem('gswmi_token')
    localStorage.removeItem('gswmi_user')
    localStorage.removeItem('gswmi_refresh_token')
    set({ token: null, user: null, isAuthenticated: false })
  },
}))