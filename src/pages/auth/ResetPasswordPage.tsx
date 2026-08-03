import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import AuthLayout from '../../components/layout/AuthLayout'
import { resetPasswordSchema, resetPasswordInitialValues } from '../../validations/adminAuthValidation'
import { resetPassword } from '../../services/authService'

/**
 * Reset-password page — opened from the forgot-password email link
 * (/reset-password?token=...). Sets a new password using the link token,
 * then shows a "Password changed!" confirmation.
 */
export default function ResetPasswordPage() {
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [done, setDone] = useState(false)
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const formik = useFormik({
    initialValues: resetPasswordInitialValues,
    validationSchema: resetPasswordSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await resetPassword({ token, newPassword: values.newPassword })
        setDone(true)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Could not reset your password. The link may have expired.'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled =
    formik.values.newPassword.trim() !== '' && formik.values.confirmPassword.trim() !== ''

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-gray-900 mb-2">Invalid link</h1>
          <p className="text-[15px] text-gray-500 mb-6">
            This reset link is missing or has expired. Please request a new one.
          </p>
          <Link to="/forgot-password" className="text-[14px] font-medium text-[#3b5bdb] hover:underline">
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-gray-900 mb-1">Password changed!</h1>
          <p className="text-[15px] text-gray-500 mb-6">Continue to login with your new password</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 rounded-lg text-[15px] font-medium bg-[#3b5bdb] text-white hover:bg-[#3451c7] transition-colors"
          >
            Log in
          </button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-[22px] font-semibold text-gray-900">Create a new password</h1>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-gray-700">New password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </span>
            <input
              type={showNew ? 'text' : 'password'}
              name="newPassword"
              value={formik.values.newPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                formik.touched.newPassword && formik.errors.newPassword
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showNew ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <p className="text-[12px] text-red-500">{formik.errors.newPassword}</p>
          )}
        </div>

        {/* Confirm new password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-gray-700">Confirm new password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </span>
            <input
              type={showConfirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your password"
              className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                formik.touched.confirmPassword && formik.errors.confirmPassword
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
          </div>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <p className="text-[12px] text-red-500">{formik.errors.confirmPassword}</p>
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
