import { User, Mail, Phone, MessageCircle, Plus, X, Users } from 'lucide-react'
import { useTicketStore } from '../../../store/ticketStore'
import RichTextEditor from '../../../components/ui/RichTextEditor'

const DEFAULT_FIELDS = [
  { icon: <User size={14} />, label: 'First name' },
  { icon: <User size={14} />, label: 'Last name' },
  { icon: <Mail size={14} />, label: 'Email address' },
  { icon: <Phone size={14} />, label: 'Attendee phone number' },
  { icon: <MessageCircle size={14} />, label: 'Attendee WhatsApp number' },
  { icon: <User size={14} />, label: 'Gender' },
  { icon: <Users size={14} />, label: 'Next of kin (full name)' },
  { icon: <Mail size={14} />, label: 'Next of kin (email address)' },
  { icon: <Phone size={14} />, label: 'Next of kin (phone number)' },
  { icon: <MessageCircle size={14} />, label: 'Next of kin (WhatsApp number)' },
]

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

export default function StepRegistrationForm() {
  const { form, addCustomField, removeCustomField, updateCustomField, updateConsentText } = useTicketStore()

  const handleAddQuestion = () => {
    addCustomField({
      id: generateId(),
      type: 'Short text',
      question: '',
      required: false,
    })
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Registration form</h2>

      {/* Default fields */}
      <div className="mb-6">
        <p className="text-[13px] font-semibold text-gray-800 mb-1">Default fields</p>
        <p className="text-[12px] text-gray-500 mb-3">
          The following default questions are on the registration page
        </p>
        <div className="flex flex-col gap-1.5">
          {DEFAULT_FIELDS.map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 text-[13px] text-gray-700">
              <span className="text-gray-400">{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Custom questions */}
      <div className="border-t border-gray-100 pt-5 mb-5">
        <p className="text-[13px] font-semibold text-gray-800 mb-1">Custom questions</p>
        <p className="text-[12px] text-gray-500 mb-3">
          Add extra questions to collect from attendees
        </p>

        {form.customFields.length > 0 && (
          <div className="flex flex-col gap-2.5 mb-3">
            {form.customFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2 p-3 border border-gray-200 rounded-lg bg-white">
                <span className="text-[12px] text-gray-400 font-medium mt-2.5 w-5 flex-shrink-0">
                  {index + 1}.
                </span>
                <div className="flex-1 flex flex-col gap-2">
                  <input
                    type="text"
                    value={field.question}
                    onChange={(e) => updateCustomField(field.id, { question: e.target.value })}
                    placeholder="Type your question here"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-${field.id}`}
                      checked={field.required}
                      onChange={(e) => updateCustomField(field.id, { required: e.target.checked })}
                      className="w-3.5 h-3.5 accent-[#3b5bdb]"
                    />
                    <label htmlFor={`req-${field.id}`} className="text-[12px] text-gray-500 cursor-pointer">
                      Required
                    </label>
                  </div>
                </div>
                <button
                  onClick={() => removeCustomField(field.id)}
                  className="mt-2 text-red-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleAddQuestion}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-[#3b5bdb]/40 text-[#3b5bdb] rounded-lg text-[13px] font-medium hover:bg-blue-50 transition-colors"
        >
          <Plus size={14} />
          {form.customFields.length > 0 ? 'Add another question' : 'Add a question'}
        </button>
      </div>

      {/* Consent & Terms */}
      <div className="border-t border-gray-100 pt-5">
        <p className="text-[13px] font-semibold text-gray-800 mb-3">Consent & Terms</p>
        <RichTextEditor
          value={form.consentText}
          onChange={updateConsentText}
          placeholder="Start typing..."
          minHeight="100px"
        />
      </div>
    </div>
  )
}