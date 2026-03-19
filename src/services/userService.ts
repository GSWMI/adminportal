import api from '../lib/axios'

export interface AddUserPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  role: 'admin' | 'subadmin'
}

export interface AddUserResult {
  firstName: string
  lastName: string
  email: string
  role: string
}

export async function addUser(payload: AddUserPayload): Promise<AddUserResult> {
  const { data } = await api.post('/auth/register', payload)
  const user = data.user ?? data.data ?? data
  return {
    firstName: user.firstName ?? payload.firstName,
    lastName: user.lastName ?? payload.lastName,
    email: user.email ?? payload.email,
    role: user.role ?? payload.role,
  }
}