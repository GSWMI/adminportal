import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Copy, UserPlus, ArrowLeft, ChevronDown } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { addUserSchema, addUserInitialValues } from '../validations/userValidation'
import { addUser } from '../services/userService'

interface Props {
  onClose: () => void
}

interface CreatedUser {
  firstName: string
  lastName: string
  email: string
  role: string
}

export default function AddUserModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null)
  const [shareEmail, setShareEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const fireConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ['#3b5bdb', '#4caf50', '#ff9800', '#e91e63'],
    })
  }

  const formik = useFormik({
    initialValues: addUserInitialValues,
    validationSchema: addUserSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await addUser(values)
        setCreatedUser(result)
        setSuccess(true)
        fireConfetti()
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Failed to add user'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled =
    formik.values.firstName.trim() &&
    formik.values.lastName.trim() &&
    formik.values.email.trim() &&
    formik.values.phone.trim() &&
    formik.values.password.trim()

  const handleCopy = () => {
    if (!createdUser) return
    const text = `Name: ${createdUser.firstName} ${createdUser.lastName}\nEmail: ${createdUser.email}\nRole: ${createdUser.role}`
    navigator.clipboard.writeText(text)
    toast.success('Details copied!')
  }

  const handleSendEmail = async () => {
    if (!shareEmail.trim()) return
    setSendingEmail(true)
    try {
      // TODO: wire to email API when available
      await new Promise((r) => setTimeout(r, 800))
      toast.success(`Details sent to ${shareEmail}`)
      setShareEmail('')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleAddAnother = () => {
    setSuccess(false)
    setCreatedUser(null)
    setShareEmail('')
    formik.resetForm()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
    >
      <div className="bg-white rounded-2xl w-full max-w-120 mx-4 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {!success ? (
          <div className="px-10 py-8">
            <h2 className="text-[20px] font-bold text-gray-900 text-center mb-7">New user</h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

              {/* First name + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First name"
                  name="firstName"
                  placeholder="First name"
                  icon={<User size={15} />}
                  formik={formik}
                />
                <Field
                  label="Last name"
                  name="lastName"
                  placeholder="Last name"
                  icon={<User size={15} />}
                  formik={formik}
                />
              </div>

              {/* Email */}
              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="Enter email address"
                icon={<Mail size={15} />}
                formik={formik}
              />

              {/* Phone */}
              <Field
                label="Phone number"
                name="phone"
                type="tel"
                placeholder="Enter phone number"
                icon={<Phone size={15} />}
                formik={formik}
              />

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter a password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-[14px] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
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
                    {showPassword ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-[12px] text-red-500">{formik.errors.password}</p>
                )}
              </div>

              {/* Role */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formik.values.role}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] text-gray-800 bg-white outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all pr-8"
                  >
                    <option value="subadmin">Subadmin</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                {formik.touched.role && formik.errors.role && (
                  <p className="text-[12px] text-red-500">{formik.errors.role}</p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!isFilled || formik.isSubmitting}
                className={`w-full py-3 rounded-lg text-[15px] font-medium flex items-center justify-center gap-2 transition-all mt-1 ${
                  isFilled && !formik.isSubmitting
                    ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7] cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {formik.isSubmitting && <Loader2 size={16} className="animate-spin" />}
                Add user
              </button>
            </form>
          </div>
        ) : (
          /* ── Success state ── */
          <div className="px-10 py-10 flex flex-col items-center">
            <h2 className="text-[20px] font-bold text-gray-900 text-center mb-6">
              User added successfully
            </h2>

            {/* Summary card */}
            <div className="w-full bg-gray-50 rounded-xl overflow-hidden mb-3">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <span className="text-[13px] font-semibold text-gray-700">Name</span>
                <span className="text-[13px] text-gray-500">
                  {createdUser?.firstName} {createdUser?.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <span className="text-[13px] font-semibold text-gray-700">Email</span>
                <span className="text-[13px] text-gray-500">{createdUser?.email}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-semibold text-gray-700">Role</span>
                <span className="text-[13px] text-gray-500 capitalize">{createdUser?.role}</span>
              </div>
            </div>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[#3b5bdb] text-[13px] font-medium hover:opacity-80 transition-opacity mb-6"
            >
              <Copy size={14} />
              Copy details
            </button>

            {/* Share via email */}
            <div className="w-full mb-7">
              <p className="text-[12px] text-gray-500 mb-2">Share via email</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address of recipient"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-[13px] placeholder:text-gray-400 outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={!shareEmail.trim() || sendingEmail}
                  className="px-4 py-2 bg-[#3b5bdb] text-white text-[13px] font-medium rounded-lg hover:bg-[#3451c7] transition-colors disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleAddAnother}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-[14px] text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-3"
            >
              <UserPlus size={15} />
              Add another user
            </button>

            <button
              onClick={() => { onClose(); navigate('/dashboard') }}
              className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={13} />
              Back to dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Reusable field component
interface FieldProps {
  label: string
  name: string
  placeholder: string
  icon: React.ReactNode
  type?: string
  formik: { values: Record<string, string>; touched: Record<string, boolean>; errors: Record<string, string>; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void }
}

function Field({ label, name, placeholder, icon, type = 'text', formik }: FieldProps) {
  const touched = formik.touched[name]
  const error = formik.errors[name]
  const value = formik.values[name] ?? ''

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          type={type}
          name={name}
          value={value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder={placeholder}
          className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-[14px] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
            touched && error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
          }`}
        />
      </div>
      {touched && error && <p className="text-[12px] text-red-500">{error}</p>}
    </div>
  )
}