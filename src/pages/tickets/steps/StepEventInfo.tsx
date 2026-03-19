import { useRef, useState } from 'react'
import { Calendar, MapPin, ImageIcon, ExternalLink } from 'lucide-react'
import { useTicketStore } from '../../../store/ticketStore'
import RichTextEditor from '../../../components/ui/RichTextEditor'
import DateRangePicker from '../../../components/ui/DateRangePicker'

function formatDateRange(start: string, end: string) {
  if (!start) return null
  const fmt = (s: string) => new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return end ? `${fmt(start)} — ${fmt(end)}` : fmt(start)
}

export default function StepEventInfo() {
  const { form, updateEventInfo } = useTicketStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const handleBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    updateEventInfo({ banner: file, bannerPreview: url })
  }

  const openGoogleMaps = () => {
    const query = form.location ? encodeURIComponent(form.location) : ''
    const url = query
      ? `https://www.google.com/maps/search/${query}`
      : 'https://www.google.com/maps'
    window.open(url, '_blank')
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Event info</h2>

      {/* Banner upload */}
      <div className="flex items-center gap-3 mb-5">
        <div
          onClick={() => fileRef.current?.click()}
          className="w-22 h-22 rounded-lg overflow-hidden cursor-pointer shrink-0 border border-gray-200"
        >
          {form.bannerPreview ? (
            <img src={form.bannerPreview} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <ImageIcon size={28} className="text-gray-400" />
            </div>
          )}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="text-[13px] text-gray-600 underline underline-offset-2 hover:text-gray-800">
          {form.bannerPreview ? 'Change banner' : 'Upload banner'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleBanner} />
      </div>

      {/* Program name */}
      <input
        type="text"
        value={form.programName}
        onChange={(e) => updateEventInfo({ programName: e.target.value })}
        placeholder="Enter program name"
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all mb-3"
      />

      {/* Description */}
      <div className="mb-4">
        <RichTextEditor
          value={form.description}
          onChange={(val) => updateEventInfo({ description: val })}
          placeholder="Enter program description"
          minHeight="130px"
        />
      </div>

      {/* Date range — opens UPWARD */}
      <div className="relative mb-3">
        <button
          type="button"
          onClick={() => setShowDatePicker((v) => !v)}
          className="flex items-center gap-2 text-[13px] hover:opacity-80 transition-opacity"
        >
          <Calendar size={15} className="text-gray-400" />
          {form.startDate ? (
            <span className="text-gray-800">{formatDateRange(form.startDate, form.endDate)}</span>
          ) : (
            <span className="text-gray-400">Start date — End date</span>
          )}
        </button>

        {/* Open upward: bottom-full positions above the button */}
        {showDatePicker && (
          <div className="absolute bottom-full left-0 z-20 mb-2">
            <DateRangePicker
              startDate={form.startDate}
              endDate={form.endDate}
              onApply={(start, end) => {
                updateEventInfo({ startDate: start, endDate: end })
                setShowDatePicker(false)
              }}
              onCancel={() => setShowDatePicker(false)}
            />
          </div>
        )}
      </div>

      {/* Location with Google Maps link */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={form.location}
            onChange={(e) => updateEventInfo({ location: e.target.value })}
            placeholder="Set location"
            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] text-gray-800 placeholder:text-gray-400 outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
          />
        </div>
        <button
          type="button"
          onClick={openGoogleMaps}
          title="Verify on Google Maps"
          className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 rounded-lg text-[12px] text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all shrink-0"
        >
          <ExternalLink size={13} />
          Maps
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-1.5 ml-1">
        Type a location then click Maps to verify it on Google Maps
      </p>
    </div>
  )
}