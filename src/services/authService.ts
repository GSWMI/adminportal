import api from '../lib/axios'
import type { AuthUser } from '../store/authStore'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResult {
  token: string
  refreshToken: string
  user: AuthUser
}

function mapAdmin(admin: Record<string, unknown>): AuthUser {
  return {
    id: admin.id as string ?? admin._id as string ?? '',
    username: admin.firstName
      ? `${admin.firstName} ${admin.lastName}`
      : admin.email as string ?? '',
    email: admin.email as string ?? '',
    avatar: admin.avatar as string ?? undefined,
  }
}

// Login — backend returns accessToken (not token) and refreshToken
export async function loginUser({ email, password }: LoginPayload): Promise<LoginResult> {
  const { data } = await api.post('/auth/login', { email, password })

  const inner = data?.data ?? data
  // Backend returns accessToken, not token
  const token = inner?.accessToken ?? inner?.token ?? ''
  const refreshToken = inner?.refreshToken ?? ''
  const admin = inner?.admin ?? inner?.user ?? {}

  if (!token) throw new Error('No token returned from server')

  return { token, refreshToken, user: mapAdmin(admin) }
}

export async function fetchProfile(): Promise<AuthUser> {
  const { data } = await api.get('/auth/profile')
  const inner = data?.data ?? data
  const admin = inner?.admin ?? inner?.user ?? inner
  return mapAdmin(admin)
}

// Refresh access token using the stored refresh token
export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem('gswmi_refresh_token')
  if (!refreshToken) throw new Error('No refresh token available')
  const { data } = await api.post('/auth/refresh', { refreshToken })
  const inner = data?.data ?? data
  const newToken = inner?.accessToken ?? inner?.token ?? ''
  if (!newToken) throw new Error('No token in refresh response')
  localStorage.setItem('gswmi_token', newToken)
  return newToken
}