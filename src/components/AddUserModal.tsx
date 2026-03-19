import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, Eye, EyeOff, Loader2, Copy, UserPlus, ArrowLeft } from 'lucide-react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import Toggle from './ui/Toggle'
// import api from '../lib/axios' // TODO: uncomment when API is ready

interface Permissions {
  addUsers: boolean
  manageTickets: boolean
  scanTickets: boolean
  exportReports: boolean
}

interface Props {
  onClose: () => void
}

const schema = Yup.object({
  fullName: Yup.string().required('Full name is required'),
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
})

export default function AddUserModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [permissions, setPermissions] = useState<Permissions>({
    addUsers: false,
    manageTickets: false,
    scanTickets: false,
    exportReports: false,
  })
  const [success, setSuccess] = useState(false)
  const [createdUser, setCreatedUser] = useState({ username: '', password: '' })
  const [shareEmail, setShareEmail] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  const togglePermission = (key: keyof Permissions) => {
    setPermissions((p) => ({ ...p, [key]: !p[key] }))
  }

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
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#3b5bdb', '#4caf50', '#ff9800', '#e91e63'] })
  }

  const formik = useFormik({
    initialValues: { fullName: '', username: '', password: '' },
    validationSchema: schema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // TODO: replace with real API call
        // await api.post('/users', { ...values, permissions })
        await new Promise((r) => setTimeout(r, 1500)) // mock delay
        setCreatedUser({ username: values.username, password: values.password })
        setSuccess(true)
        fireConfetti()
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to add user'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled =
    formik.values.fullName.trim() &&
    formik.values.username.trim() &&
    formik.values.password.trim()

  const handleCopy = () => {
    const text = `Username: ${createdUser.username}\nPassword: ${createdUser.password}`
    navigator.clipboard.writeText(text)
    toast.success('Credentials copied!')
  }

  const handleSendEmail = async () => {
    if (!shareEmail.trim()) return
    setSendingEmail(true)
    try {
      // TODO: replace with real API call
      // await api.post('/users/share-credentials', { email: shareEmail, ...createdUser })
      await new Promise((r) => setTimeout(r, 1000))
      toast.success(`Credentials sent to ${shareEmail}`)
      setShareEmail('')
    } catch {
      toast.error('Failed to send email')
    } finally {
      setSendingEmail(false)
    }
  }

  const handleAddAnother = () => {
    setSuccess(false)
    setCreatedUser({ username: '', password: '' })
    setShareEmail('')
    setPermissions({ addUsers: false, manageTickets: false, scanTickets: false, exportReports: false })
    formik.resetForm()
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]"
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] mx-4 shadow-2xl overflow-hidden">

        {!success ? (
          /* ── Form ── */
          <div className="px-10 py-8">
            <h2 className="text-[20px] font-bold text-gray-900 text-center mb-7">New user</h2>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">
              {/* Full name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Full name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="fullName"
                    type="text"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter first and last name"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-[14px] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
                      formik.touched.fullName && formik.errors.fullName
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
                    }`}
                  />
                </div>
                {formik.touched.fullName && formik.errors.fullName && (
                  <p className="text-[12px] text-red-500">{formik.errors.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-gray-700">Username</label>
                <div className="relative">
                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="username"
                    type="text"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter a username"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg border text-[14px] placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
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
                <label className="text-[13px] font-medium text-gray-700">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
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

              {/* Permissions */}
              <div className="bg-gray-50 rounded-xl px-4 py-4 mt-1">
                <p className="text-[13px] font-semibold text-gray-800 mb-1">Set permissions</p>
                <p className="text-[12px] text-gray-500 mb-3">Allow new user to:</p>
                <div className="flex flex-col gap-3">
                  {([
                    ['addUsers', 'Add users & set permissions'],
                    ['manageTickets', 'Add & manage tickets'],
                    ['scanTickets', 'Scan & redeem tickets'],
                    ['exportReports', 'Export reports'],
                  ] as [keyof Permissions, string][]).map(([key, label]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-[13px] text-gray-700">{label}</span>
                      <Toggle
                        checked={permissions[key]}
                        onChange={() => togglePermission(key)}
                      />
                    </div>
                  ))}
                </div>
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
          /* ── Success ── */
          <div className="px-10 py-10 flex flex-col items-center">
            <h2 className="text-[20px] font-bold text-gray-900 text-center mb-6">
              User added successfully
            </h2>

            {/* Credentials card */}
            <div className="w-full bg-gray-50 rounded-xl overflow-hidden mb-3">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <span className="text-[13px] font-semibold text-gray-700">Username</span>
                <span className="text-[13px] text-gray-500">{createdUser.username}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-[13px] font-semibold text-gray-700">Password</span>
                <span className="text-[13px] text-gray-500">{createdUser.password}</span>
              </div>
            </div>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[#3b5bdb] text-[13px] font-medium hover:opacity-80 transition-opacity mb-6"
            >
              <Copy size={14} />
              Copy
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