import { useState } from 'react'
import { Mail, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import AuthLayout from '../../components/layout/AuthLayout'
import { forgotPasswordSchema, forgotPasswordInitialValues } from '../../validations/adminAuthValidation'
import { forgotPassword } from '../../services/authService'

/**
 * Forgot-password request page (/forgot-password). Submits the admin's email and,
 * on success, swaps to a "Reset link sent" confirmation.
 */
export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)

  const formik = useFormik({
    initialValues: forgotPasswordInitialValues,
    validationSchema: forgotPasswordSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await forgotPassword(values.email)
        setSent(true)
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Could not send the reset link. Please try again.'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled = formik.values.email.trim() !== ''

  if (sent) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="text-[22px] font-semibold text-gray-900 mb-2">Reset link sent</h1>
          <p className="text-[15px] text-gray-500">
            Check your email inbox for a reset link and follow the prompt to create a new password
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <h1 className="text-[22px] font-semibold text-gray-900 mb-1">Forgot password?</h1>
        <p className="text-[15px] text-gray-500">
          Provide the email address connected to your admin account
        </p>
      </div>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-5">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-medium text-gray-700">Email</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Mail size={16} />
            </span>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter your email address"
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                formik.touched.email && formik.errors.email
                  ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
              }`}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <p className="text-[12px] text-red-500">{formik.errors.email}</p>
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
          Reset password
        </button>
      </form>
    </AuthLayout>
  )
}
