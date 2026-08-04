import * as Yup from 'yup'

// Admin invite — no password/role (backend emails a set-password link; roles matrix out of scope).
export const inviteAdminInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

export const inviteAdminSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
})
