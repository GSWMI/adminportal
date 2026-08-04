import * as Yup from 'yup'

// Shared password policy. NOTE: mirror the backend's real "secure password" rules once
// confirmed (min length / complexity) — see admin-auth confirmation list #5.
export const PASSWORD_MIN = 8
const passwordRule = Yup.string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
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
