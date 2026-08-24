import * as Yup from 'yup'

// Shared password policy (mirrors backend): min 8, with uppercase, lowercase, number
// and special character.
export const PASSWORD_MIN = 8
const passwordRule = Yup.string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .matches(/[A-Z]/, 'Include at least one uppercase letter')
  .matches(/[a-z]/, 'Include at least one lowercase letter')
  .matches(/[0-9]/, 'Include at least one number')
  .matches(/[^A-Za-z0-9]/, 'Include at least one special character')
  .required('Password is required')

// ── Set password (unified: new-admin onboarding AND forgot-password reset) ──────
export const setPasswordInitialValues = {
  newPassword: '',
  confirmPassword: '',
}

export const setPasswordSchema = Yup.object({
  newPassword: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
})

// ── Forgot password (request reset link) ────────────────────────────────────────
export const forgotPasswordInitialValues = {
  email: '',
}

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
})

// ── Change password (logged-in admin) ───────────────────────────────────────────
export const changePasswordInitialValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: passwordRule.notOneOf(
    [Yup.ref('currentPassword')],
    'New password must be different from current password'
  ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
})
