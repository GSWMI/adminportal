import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import AuthLayout from '../../components/layout/AuthLayout'
import { setPasswordSchema, setPasswordInitialValues } from '../../validations/adminAuthValidation'
import { setPassword } from '../../services/authService'

/**
 * New-admin onboarding — opened from the invite email link (/set-password?token=...).
 * Collects a username + password and activates the account with the link token.
 */
export default function SetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: setPasswordInitialValues,
    validationSchema: setPasswordSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await setPassword({ token, username: values.username, newPassword: values.password })
        toast.success('Account created! Please log in.')
        navigate('/login')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Could not create your account. The link may have expired.'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled = formik.values.username.trim() !== '' && formik.values.password.trim() !== ''

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-gray-900 mb-2">Invalid link</h1>
          <p className="text-[15px] text-gray-500 mb-6">
            This invite link is missing or has expired. Please ask an admin to resend your invite.
          </p>
          <Link to="/login" className="text-[14px] font-medium text-[#3b5bdb] hover:underline">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-[22px] font-semibold text-gray-900 mb-1">
          Welcome to GSWMI Ticketing Portal
        </h1>
        <p className="text-[15px] text-gray-500">Create an account to continue</p>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        {/* Username */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-gray-700">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </span>
            <input
              type="text"
              name="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your username"
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                formik.touched.username && formik.errors.username
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
              }`}
            />
          </div>
          {formik.touched.username && formik.errors.username && (
            <p className="text-[12px] text-red-500">{formik.errors.username}</p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-gray-700">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                formik.touched.password && formik.errors.password
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <p className="text-[12px] text-red-500">{formik.errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isFilled || formik.isSubmitting}
          className={`w-full py-2.5 rounded-lg text-[15px] font-medium flex items-center justify-center gap-2 transition-all ${
            isFilled && !formik.isSubmitting
              ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {formik.isSubmitting && <Loader2 size={16} className="animate-spin" />}
          Continue
        </button>
      </form>
    </AuthLayout>
  )
}
