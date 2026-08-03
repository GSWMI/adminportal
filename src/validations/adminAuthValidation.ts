import * as Yup from 'yup'

// Shared password policy. NOTE: mirror the backend's real "secure password" rules once
// confirmed (min length / complexity) — see admin-auth confirmation list #5.
export const PASSWORD_MIN = 8
const passwordRule = Yup.string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .required('Password is required')

// ── Set password (new-admin onboarding) ────────────────────────────────────────
export const setPasswordInitialValues = {
  username: '',
  password: '',
}

export const setPasswordSchema = Yup.object({
  username: Yup.string().trim().required('Username is required'),
  password: passwordRule,
})

// ── Forgot password (request reset link) ────────────────────────────────────────
export const forgotPasswordInitialValues = {
  email: '',
}

export const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
})

// ── Reset password (from emailed link) ──────────────────────────────────────────
export const resetPasswordInitialValues = {
  newPassword: '',
  confirmPassword: '',
}

export const resetPasswordSchema = Yup.object({
  newPassword: passwordRule,
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords do not match')
    .required('Please confirm your password'),
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
