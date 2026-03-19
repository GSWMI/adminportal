import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useTicketStore } from '../../store/ticketStore'
import StepEventInfo from './steps/StepEventInfo'
import StepTicketType from './steps/StepTicketType'
import StepOptions from './steps/StepOptions'
import StepRegistrationForm from './steps/StepRegistrationForm'
import StepReviewDetails from './steps/StepReviewDetails'
import StepPublish from './steps/StepPublish'
import { toast } from 'sonner'

const STEPS = [
  { label: 'Event info' },
  { label: 'Ticket type' },
  { label: 'Options, prices & quantity limit' },
  { label: 'Registration form' },
  { label: 'Review details' },
  { label: 'Publish' },
]

function canProceed(step: number, form: ReturnType<typeof useTicketStore.getState>['form']): boolean {
  switch (step) {
    case 0: return !!form.programName.trim() && !!form.startDate && !!form.endDate && form.totalDays >= 1
    case 1: return !!form.ticketType
    case 2: return form.days.some((d) => d.slots.some((s) => s.options.length > 0))
    case 3: return true // Registration form is optional beyond defaults
    case 4: return true
    default: return true
  }
}

export default function NewTicketPage() {
  const navigate = useNavigate()
  const { form, setStep, completeStep } = useTicketStore()
  const { currentStep, completedSteps } = form

  const handleNext = () => {
    if (!canProceed(currentStep, form)) {
      toast.error('Please fill in the required fields before continuing')
      return
    }
    completeStep(currentStep)
    setStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setStep(currentStep - 1)
  }

  const handlePreview = () => {
    navigate('/tickets/preview')
  }

  const handleSaveDraft = () => {
    toast.success('Saved as draft')
  }

  return (
    <div className="max-w-[1000px]">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[18px] font-semibold text-gray-900">New ticket</h1>
        </div>
        <button
          onClick={handleSaveDraft}
          className="px-4 py-2 border border-gray-300 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Save as draft
        </button>
      </div>

      <div className="flex gap-8">
        {/* Left stepper */}
        <div className="w-[220px] flex-shrink-0">
          <div className="flex flex-col gap-1">
            {STEPS.map((step, i) => {
              const isCompleted = completedSteps.includes(i)
              const isActive = currentStep === i
              const isDisabled = !isCompleted && !isActive && i > currentStep

              return (
                <button
                  key={step.label}
                  onClick={() => !isDisabled && setStep(i)}
                  disabled={isDisabled}
                  className={`flex items-center justify-between px-0 py-2 text-left transition-all group ${
                    isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span
                    className={`text-[13px] font-medium transition-colors ${
                      isCompleted
                        ? 'text-green-600'
                        : isActive
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>

                  {isCompleted ? (
                    <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </span>
                  ) : (
                    <ArrowRight isActive={isActive} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 px-7 py-6 mb-6">
            {currentStep === 0 && <StepEventInfo />}
            {currentStep === 1 && <StepTicketType />}
            {currentStep === 2 && <StepOptions />}
            {currentStep === 3 && <StepRegistrationForm />}
            {currentStep === 4 && <StepReviewDetails />}
            {currentStep === 5 && <StepPublish onPreview={handlePreview} />}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between px-1">
            <button
              onClick={handleBack}
              className={`text-[14px] text-gray-500 hover:text-gray-700 transition-colors ${
                currentStep === 0 ? 'invisible' : ''
              }`}
            >
              Back
            </button>
            {currentStep < 5 && (
              <button
                onClick={handleNext}
                className={`text-[14px] font-medium transition-colors ${
                  canProceed(currentStep, form)
                    ? 'text-white bg-[#3b5bdb] px-5 py-2 rounded-lg hover:bg-[#3451c7]'
                    : 'text-gray-400'
                }`}
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowRight({ isActive }: { isActive: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isActive ? 'text-gray-900' : 'text-gray-300'}>
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}