import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Loader2, UserPlus, ArrowLeft, MailCheck } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'
import { inviteAdminSchema, inviteAdminInitialValues } from '../validations/userValidation'
import { inviteAdmin, type InvitedAdmin } from '../services/userService'

interface Props {
  onClose: () => void
}

export default function InviteAdminModal({ onClose }: Props) {
  const navigate = useNavigate()
  const [success, setSuccess] = useState(false)
  const [invited, setInvited] = useState<InvitedAdmin | null>(null)
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
    initialValues: inviteAdminInitialValues,
    validationSchema: inviteAdminSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const result = await inviteAdmin(values)
        setInvited(result)
        setSuccess(true)
        fireConfetti()
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Failed to send invite'
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
    formik.values.phone.trim()

  const handleInviteAnother = () => {
    setSuccess(false)
    setInvited(null)
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
            <h2 className="text-[20px] font-bold text-gray-900 text-center mb-2">Add admin</h2>
            <p className="text-[13px] text-gray-500 text-center mb-7">
              We’ll email them a link to set their password
            </p>

            <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4">

              {/* First name + Last name */}
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" name="firstName" placeholder="First name" icon={<User size={15} />} formik={formik} />
                <Field label="Last name" name="lastName" placeholder="Last name" icon={<User size={15} />} formik={formik} />
              </div>

              {/* Email */}
              <Field label="Email" name="email" type="email" placeholder="Enter email address" icon={<Mail size={15} />} formik={formik} />

              {/* Phone */}
              <Field label="Phone number" name="phone" type="tel" placeholder="Enter phone number" icon={<Phone size={15} />} formik={formik} />

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
                Send invite
              </button>
            </form>
          </div>
        ) : (
          /* ── Success state ── */
          <div className="px-10 py-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-4">
              <MailCheck size={22} className="text-green-600" />
            </div>
            <h2 className="text-[20px] font-bold text-gray-900 mb-2">Invite sent</h2>
            <p className="text-[13px] text-gray-500 mb-7">
              An invite link has been emailed to{' '}
              <span className="font-medium text-gray-700">{invited?.email}</span>{' '}
              to set their password and access the portal.
            </p>

            {/* Actions */}
            <button
              onClick={handleInviteAnother}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-300 rounded-lg text-[14px] text-gray-700 font-medium hover:bg-gray-50 transition-colors mb-3"
            >
              <UserPlus size={15} />
              Invite another admin
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
