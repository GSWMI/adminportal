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

function mapProfile(profileData: Record<string, unknown>): AuthUser {
  // API returns { success: true, data: { admin: { firstName, lastName, email, id, role } } }
  const data = profileData.data as Record<string, unknown> ?? profileData
  const profile = data.admin as Record<string, unknown> ?? data

  return {
    id: profile.id as string ?? profile._id as string ?? '',
    username: profile.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : profile.email as string ?? '',
    email: profile.email as string ?? '',
    avatar: profile.avatar as string ?? undefined,
  }
}

export async function loginUser({ email, password }: LoginPayload): Promise<LoginResult> {
  const { data: loginData } = await api.post('/auth/login', { email, password })

  const token = loginData.token ?? loginData.data?.token

  if (!token) throw new Error('No token returned from server')

  const { data: profileData } = await api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })

  return { token, user: mapProfile(profileData) }
}

export async function fetchProfile(): Promise<AuthUser> {
  const { data } = await api.get('/auth/profile')
  return mapProfile(data)
}