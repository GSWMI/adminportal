import * as Yup from 'yup'

export const addUserInitialValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  role: 'subadmin' as 'admin' | 'subadmin',
}

export const addUserSchema = Yup.object({
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  phone: Yup.string().required('Phone number is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  role: Yup.string().oneOf(['admin', 'subadmin']).required('Role is required'),
})