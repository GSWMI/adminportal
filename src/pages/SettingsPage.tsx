import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useFormik } from 'formik'
import { toast } from 'sonner'
import { useAuth } from '../hooks/useAuth'
import { changePasswordSchema, changePasswordInitialValues } from '../validations/adminAuthValidation'
import { changePassword } from '../services/authService'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-[720px]">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">Settings</h1>

      {/* Account */}
      <section className="bg-white rounded-xl border border-gray-200 px-6 py-5 mb-6">
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Account</h2>
        <div className="flex flex-col gap-3">
          <ReadOnlyRow label="Name" value={user?.username || '—'} />
          <ReadOnlyRow label="Email" value={user?.email || '—'} />
        </div>
      </section>

      {/* Change password */}
      <ChangePasswordPanel />
    </div>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 last:border-0 pb-3 last:pb-0">
      <span className="text-[13px] font-medium text-gray-500">{label}</span>
      <span className="text-[13px] text-gray-800">{value}</span>
    </div>
  )
}

function ChangePasswordPanel() {
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  const formik = useFormik({
    initialValues: changePasswordInitialValues,
    validationSchema: changePasswordSchema,
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await changePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        })
        toast.success('Password changed successfully')
        resetForm()
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })
            ?.response?.data?.message ?? 'Could not change your password'
        toast.error(message)
      } finally {
        setSubmitting(false)
      }
    },
  })

  const isFilled =
    formik.values.currentPassword.trim() !== '' &&
    formik.values.newPassword.trim() !== '' &&
    formik.values.confirmPassword.trim() !== ''

  return (
    <section className="bg-white rounded-xl border border-gray-200 px-6 py-5">
      <h2 className="text-[15px] font-semibold text-gray-900 mb-1">Change password</h2>
      <p className="text-[12px] text-gray-500 mb-4">
        Enter your current password and choose a new one
      </p>

      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 max-w-[420px]">
        <PasswordField
          label="Current password"
          name="currentPassword"
          value={formik.values.currentPassword}
          visible={show.current}
          onToggle={() => setShow((s) => ({ ...s, current: !s.current }))}
          formik={formik}
        />
        <PasswordField
          label="New password"
          name="newPassword"
          value={formik.values.newPassword}
          visible={show.next}
          onToggle={() => setShow((s) => ({ ...s, next: !s.next }))}
          formik={formik}
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          value={formik.values.confirmPassword}
          visible={show.confirm}
          onToggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
          formik={formik}
        />

        <button
          type="submit"
          disabled={!isFilled || formik.isSubmitting}
          className={`self-start px-5 py-2.5 rounded-lg text-[14px] font-medium flex items-center justify-center gap-2 transition-all mt-1 ${
            isFilled && !formik.isSubmitting
              ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7] cursor-pointer'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {formik.isSubmitting && <Loader2 size={15} className="animate-spin" />}
          Change password
        </button>
      </form>
    </section>
  )
}

interface PasswordFieldProps {
  label: string
  name: string
  value: string
  visible: boolean
  onToggle: () => void
  formik: {
    touched: Record<string, boolean>
    errors: Record<string, string>
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void
  }
}

function PasswordField({ label, name, value, visible, onToggle, formik }: PasswordFieldProps) {
  const touched = formik.touched[name]
  const error = formik.errors[name]
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium text-gray-700">{label}</label>
      <div className="relative">
        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type={visible ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Enter your password"
          className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:ring-2 transition-all ${
            touched && error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-300 focus:border-[#3b5bdb] focus:ring-[#3b5bdb]/20'
          }`}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {visible ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
      </div>
      {touched && error && <p className="text-[12px] text-red-500">{error}</p>}
    </div>
  )
}
