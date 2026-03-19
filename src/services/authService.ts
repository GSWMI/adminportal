import api from '../lib/axios'
import type { AuthUser } from '../store/authStore'

interface LoginPayload {
  email: string
  password: string
}

interface LoginResult {
  token: string
  user: AuthUser
}

export async function loginUser({ email, password }: LoginPayload): Promise<LoginResult> {
  const { data: loginData } = await api.post('/auth/login', { email, password })

  const token = loginData.token ?? loginData.data?.token

  if (!token) throw new Error('No token returned from server')

  const { data: profileData } = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })

  const profile = profileData.data ?? profileData

  const user: AuthUser = {
    id: profile._id ?? profile.id ?? '',
    username: profile.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.email,
    email: profile.email,
    avatar: profile.avatar ?? undefined,
  }

  return { token, user }
}

export async function fetchProfile(): Promise<AuthUser> {
  const { data } = await api.get('/auth/profile')
  const profile = data.data ?? data

  return {
    id: profile._id ?? profile.id ?? '',
    username: profile.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.email,
    email: profile.email,
    avatar: profile.avatar ?? undefined,
  }
}