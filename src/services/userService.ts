import api from '../lib/axios'

export interface InviteAdminPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface InvitedAdmin {
  firstName: string
  lastName: string
  email: string
}

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  status?: string // e.g. 'pending' | 'active' — CONFIRM #6 whether backend returns this
  createdAt?: string
}

// New-admin invite. Backend emails a set-password link — no password is set here.
export async function inviteAdmin(payload: InviteAdminPayload): Promise<InvitedAdmin> {
  const { data } = await api.post('/auth/admin', payload)
  const admin = data?.data?.admin ?? data?.data ?? data?.admin ?? data
  return {
    firstName: admin?.firstName ?? payload.firstName,
    lastName: admin?.lastName ?? payload.lastName,
    email: admin?.email ?? payload.email,
  }
}

// Resend an invite to a pending admin (by email).
// CONFIRM #4: endpoint not yet in the collection — assuming POST /auth/admin/resend { email }.
export async function resendInvite(email: string): Promise<void> {
  await api.post('/auth/admin/resend', { email })
}

// List admins for the Users page.
export async function getAdmins(): Promise<AdminUser[]> {
  const { data } = await api.get('/auth/admins')
  const list = data?.data?.admins ?? data?.data ?? data?.admins ?? []
  return Array.isArray(list)
    ? list.map(
        (a: Record<string, unknown>) =>
          ({ ...a, id: (a.id ?? a._id ?? '') as string } as AdminUser)
      )
    : []
}
