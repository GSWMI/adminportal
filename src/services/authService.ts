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
  const data = (profileData.data as Record<string, unknown>) ?? profileData
  const profile = (data.admin as Record<string, unknown>) ?? data

  return {
    id: (profile.id as string) ?? (profile._id as string) ?? '',
    username: profile.firstName
      ? `${profile.firstName} ${profile.lastName}`
      : (profile.email as string) ?? '',
    email: (profile.email as string) ?? '',
    avatar: (profile.avatar as string) ?? undefined,
  }
}

export async function loginUser({ email, password }: LoginPayload): Promise<LoginResult> {
  const { data: loginData } = await api.post('/auth/login', { email, password })

  // Backend returns accessToken (not token) as of v8
  const token =
    loginData?.data?.accessToken ??
    loginData?.data?.token ??
    loginData?.accessToken ??
    loginData?.token

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

// ── Password lifecycle ─────────────────────────────────────────────────────────

interface SetPasswordPayload {
  token: string
  newPassword: string
}

// Single token-based set-password endpoint used for BOTH new-admin onboarding and
// forgot-password reset — the token in the body carries the context, so the flows are
// unified (per backend). Body shape per Postman: { token, password }.
export async function setPassword({ token, newPassword }: SetPasswordPayload): Promise<void> {
  await api.post('/auth/set-password', { token, password: newPassword })
}

// Forgot-password: request a reset link by email. Backend emails a /set-password?token= link.
export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// Change password for the logged-in admin (JWT attached by the axios interceptor).
export async function changePassword({ currentPassword, newPassword }: ChangePasswordPayload): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword })
}