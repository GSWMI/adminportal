import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, loginInitialValues } from '../validations/authValidation'
import { loginUser } from '../services/authService'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // All hooks must be called before any early return
  const formik = useFormik({
    initialValues: loginInitialValues,
    validationSchema: loginSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { token, user } = await loginUser(values)
        login(token, user)
        toast.success('Welcome back!')
        navigate('/dashboard')
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Invalid email or password'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  // Early return AFTER all hooks
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const isFilled = formik.values.email.trim() !== '' && formik.values.password.trim() !== ''

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="bg-[#0d1b2a] py-4 px-6 flex items-center justify-center">
        <GswmiLogo />
      </header>

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-[340px]">
          <div className="text-center mb-8">
            <h1 className="text-[22px] font-semibold text-gray-900 mb-1">
              Welcome to GSWMI Ticketing Portal
            </h1>
            <p className="text-[15px] text-gray-500">Login to continue</p>
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
                  placeholder="Enter your email"
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
                  onClick={() => setShowPassword(v => !v)}
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
              Login
            </button>
          </form>
        </div>
      </main>

      <footer className="bg-gray-100 py-3 text-center text-[13px] text-gray-500">
        © GSWMI Logistics Team
      </footer>
    </div>
  )
}

function GswmiLogo() {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white text-2xl font-bold tracking-wide font-serif italic">
        ╱GSWMI
      </span>
      <span className="text-white/60 text-[9px] tracking-widest uppercase">
        Gbenga Samuel-Wemimo Ministry International
      </span>
    </div>
  )
}