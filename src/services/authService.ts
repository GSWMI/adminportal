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
// NOTE: the exact request shapes below are BEST-GUESS pending backend confirmation
// (see the admin-auth confirmation list). They are intentionally isolated here so a
// field-name change is a one-line edit and never touches the pages/components.

interface SetPasswordPayload {
  token: string
  username: string
  newPassword: string
}

// New-admin onboarding (email invite link → set password).
// Postman documents /auth/set-password as { currentPassword, newPassword }, but a freshly
// invited admin has no current password and the link carries a token — so we send
// { token, username, newPassword }. CONFIRM #1/#2 with backend.
export async function setPassword({ token, username, newPassword }: SetPasswordPayload): Promise<void> {
  await api.post('/auth/set-password', { token, username, newPassword })
}

// Forgot-password: request a reset link by email.
export async function forgotPassword(email: string): Promise<void> {
  await api.post('/auth/forgot-password', { email })
}

interface ResetPasswordPayload {
  token: string
  newPassword: string
}

// Forgot-password: submit the new password with the token from the emailed link.
// Backend said the reset reuses the same set-password flow; if a dedicated
// /auth/reset-password endpoint is added, change only this line. CONFIRM #3.
export async function resetPassword({ token, newPassword }: ResetPasswordPayload): Promise<void> {
  await api.post('/auth/set-password', { token, newPassword })
}

interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

// Change password for the logged-in admin (JWT attached by the axios interceptor).
export async function changePassword({ currentPassword, newPassword }: ChangePasswordPayload): Promise<void> {
  await api.post('/auth/change-password', { currentPassword, newPassword })
}