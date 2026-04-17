import { useState } from 'react'
import { toast } from 'sonner'
import { ChevronDown, ChevronUp, X, MapPin, Users, Hash, Plus } from 'lucide-react'
import { useTicketStore } from '../../../store/ticketStore'
import type { MealOption } from '../../../store/ticketStore'
import { Trash2 } from 'lucide-react'
import RichTextEditor from '../../../components/ui/RichTextEditor'

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

// ── Meal Slot Panel ──────────────────────────────────────────────────────────

function SlotPanel({ dayId, slotId, slotName, options }: {
  dayId: string; slotId: string; slotName: string; options: MealOption[]
}) {
  const { addMealOption, removeMealOption } = useTicketStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [limit, setLimit] = useState('')
  const [duplicateError, setDuplicateError] = useState('')

  const isFilled = name.trim() && Number(price) >= 0 && Number(limit) > 0

  const handleAdd = () => {
    if (!isFilled) return
    const trimmed = name.trim().toLowerCase()
    const isDuplicate = options.some((o) => o.name.toLowerCase() === trimmed)
    if (isDuplicate) {
      const msg = `"${name.trim()}" already exists in this slot.`
      setDuplicateError(msg)
      toast.error(msg)
      return
    }
    setDuplicateError('')
    addMealOption(dayId, slotId, {
      id: generateId(),
      name: name.trim(),
      price: Number(price),
      limit: Math.min(5, Number(limit)),
    })
    setName(''); setPrice(''); setLimit('')
  }

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-4 py-3 bg-blue-50/60 hover:bg-blue-50 transition-colors text-left">
        {open ? <ChevronUp size={16} className="text-gray-500 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />}
        <span className="text-[13px] font-medium text-gray-700">{slotName}</span>
      </button>

      {open && (
        <div className="px-4 py-3 bg-white">
          {options.length > 0 && (
            <table className="w-full mb-3">
              <thead>
                <tr>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Meal option</th>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Price (₦)</th>
                  <th className="text-left text-[11px] font-medium text-gray-400 pb-2">Limit</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody>
                {options.map((opt) => (
                  <tr key={opt.id} className="border-t border-gray-50">
                    <td className="py-2 text-[13px] text-gray-700 max-w-[180px] truncate pr-2">{opt.name}</td>
                    <td className="py-2 text-[13px] text-gray-700">₦{opt.price.toLocaleString()}</td>
                    <td className="py-2 text-[13px] text-gray-700">{opt.limit}</td>
                    <td className="py-2">
                      <button onClick={() => removeMealOption(dayId, slotId, opt.id)}
                        className="text-red-500 hover:text-red-600 transition-colors">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setDuplicateError('') }}
              placeholder="Enter meal option"
              className="flex-1 border border-gray-200 rounded-lg px-2.5 py-2 text-[13px] outline-none focus:border-[#3b5bdb] transition-all min-w-0"
            />
            <div className="relative flex-shrink-0 w-24">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">₦</span>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
              />
            </div>
            <input
              type="number"
              min={1}
              max={5}
              value={limit}
              onChange={(e) => {
                const clamped = Math.min(5, Math.max(1, Number(e.target.value)))
                setLimit(clamped === 0 ? '' : String(clamped))
              }}
              onBlur={(e) => { if (Number(e.target.value) > 5) setLimit('5') }}
              placeholder="1–5"
              className="w-14 border border-gray-200 rounded-lg px-2 py-2 text-[13px] outline-none focus:border-[#3b5bdb] transition-all flex-shrink-0"
            />
            <button
              onClick={handleAdd}
              disabled={!isFilled}
              className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 ${
                isFilled ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add
            </button>
          </div>

          {duplicateError && (
            <p className="text-[12px] text-red-500 mt-1">{duplicateError}</p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Day Panel ────────────────────────────────────────────────────────────────

function DayPanel({ dayId, label, slots, onRemove }: {
  dayId: string
  label: string
  slots: { id: string; name: string; options: MealOption[] }[]
  onRemove?: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="flex items-center px-4 py-3.5 hover:bg-gray-50 transition-colors">
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="flex-1 flex items-center justify-between text-left">
          <span className="text-[14px] font-semibold text-[#3b5bdb]">{label}</span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
            title="Remove this day"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-100 pt-3">
          {slots.map((slot) => (
            <SlotPanel key={slot.id} dayId={dayId} slotId={slot.id} slotName={slot.name} options={slot.options} />
          ))}
        </div>
      )}
    </div>
  )
}


// ── Meal Section (with dynamic days) ────────────────────────────────────────

function MealSection() {
  const { form, addDay, removeDay } = useTicketStore()

  return (
    <div className="flex flex-col gap-3">
      {form.days.map((day) => (
        <DayPanel
          key={day.id}
          dayId={day.id}
          label={day.label}
          slots={day.slots}
          onRemove={form.days.length > 1 ? () => removeDay(day.id) : undefined}
        />
      ))}
      <button
        type="button"
        onClick={addDay}
        className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-[#3b5bdb]/40 text-[#3b5bdb] rounded-lg text-[13px] font-medium hover:bg-blue-50 transition-colors w-fit"
      >
        <Plus size={14} />
        Add Day {form.days.length + 1}
      </button>
    </div>
  )
}

// ── Accommodation Section ────────────────────────────────────────────────────

function AccommodationSection() {
  const { form, addAccommodation, removeAccommodation } = useTicketStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [peoplePerRoom, setPeoplePerRoom] = useState('')
  const [totalCapacity, setTotalCapacity] = useState('')
  const [price, setPrice] = useState('')
  const [openCards, setOpenCards] = useState<string[]>([])
  const [accDuplicateError, setAccDuplicateError] = useState('')

  const isFilled = name.trim() && Number(peoplePerRoom) > 0 && Number(price) > 0

  const handleAdd = () => {
    if (!isFilled) return
    const trimmed = name.trim().toLowerCase()
    const isDuplicate = form.accommodations.some((a) => a.name.toLowerCase() === trimmed)
    if (isDuplicate) {
      const msg = `An option named "${name.trim()}" already exists.`
      setAccDuplicateError(msg)
      toast.error(msg)
      return
    }
    setAccDuplicateError('')
    addAccommodation({
      id: generateId(),
      name: name.trim(),
      description,
      peoplePerRoom: Number(peoplePerRoom),
      totalCapacity: Number(totalCapacity),
      price: Number(price),
    })
    setName(''); setDescription(''); setPeoplePerRoom(''); setTotalCapacity(''); setPrice('')
  }

  const toggleCard = (id: string) =>
    setOpenCards((p) => p.includes(id) ? p.filter((i) => i !== id) : [...p, id])

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
        <span className="text-[14px] font-semibold text-[#3b5bdb]">Accommodation ticket</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 flex flex-col gap-3">

          {/* Existing accommodation cards */}
          {form.accommodations.map((acc) => (
            <div key={acc.id} className="border border-gray-200 rounded-lg overflow-hidden bg-[#f0f4ff]/40">
              <div className="flex items-center justify-between px-4 py-3">
                <button type="button" onClick={() => toggleCard(acc.id)}
                  className="flex items-center gap-2 flex-1 text-left">
                  {openCards.includes(acc.id)
                    ? <ChevronUp size={14} className="text-[#3b5bdb]" />
                    : <ChevronDown size={14} className="text-[#3b5bdb]" />}
                  <span className="text-[13px] font-semibold text-[#3b5bdb]">{acc.name}</span>
                </button>
                <button onClick={() => removeAccommodation(acc.id)}
                  className="text-red-400 hover:text-red-600 transition-colors ml-2">
                  <X size={14} />
                </button>
              </div>
              {openCards.includes(acc.id) && (
                <div className="px-4 pb-3 text-[13px] text-gray-600 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                  {acc.description && <p className="text-gray-500 text-[12px] leading-relaxed">{acc.description}</p>}
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users size={12} /><span>Per room: {acc.peoplePerRoom}</span>
                  </div>
                  {acc.totalCapacity > 0 && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Users size={12} /><span>Total capacity: {acc.totalCapacity}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Hash size={12} /><span>Price: ₦{acc.price.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add form */}
          <div className="flex flex-col gap-3 border border-dashed border-gray-200 rounded-lg p-4">
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setAccDuplicateError('') }}
              placeholder="Enter name of accommodation. E.g Hotel accommodation (Shared)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
            />
            <RichTextEditor
              value={description}
              onChange={setDescription}
              placeholder="Enter accommodation description"
              minHeight="100px"
            />
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={peoplePerRoom}
                  onChange={(e) => setPeoplePerRoom(e.target.value)}
                  placeholder="No. per room"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                />
              </div>
              <div className="relative flex-1">
                <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  min="1"
                  value={totalCapacity}
                  onChange={(e) => setTotalCapacity(e.target.value)}
                  placeholder="Total capacity"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                />
              </div>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">₦</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Set price"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                />
              </div>
              <button
                onClick={handleAdd}
                disabled={!isFilled}
                className={`px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 ${
                  isFilled ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>
            {accDuplicateError && (
              <p className="text-[12px] text-red-500">{accDuplicateError}</p>
            )}
          </div>

          {/* Add another option */}
          {form.accommodations.length > 0 && (
            <button type="button"
              className="flex items-center gap-2 px-4 py-2 border border-[#3b5bdb]/40 text-[#3b5bdb] rounded-lg text-[13px] font-medium hover:bg-blue-50 transition-colors w-fit">
              <Plus size={14} />
              Add another option
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Transportation Section ───────────────────────────────────────────────────

function TransportationSection() {
  const { form, updateTransport, addPickup, removePickup } = useTicketStore()
  const [open, setOpen] = useState(false)
  const [pickupLocation, setPickupLocation] = useState('')
  const [price, setPrice] = useState('')
  const [pickupDuplicateError, setPickupDuplicateError] = useState('')

  const isFilled = pickupLocation.trim() && Number(price) > 0

  const handleAddPickup = () => {
    if (!isFilled) return
    const trimmed = pickupLocation.trim().toLowerCase()
    const isDuplicate = form.transport.pickups.some((p) => p.pickupLocation.toLowerCase() === trimmed)
    if (isDuplicate) {
      const msg = `"${pickupLocation.trim()}" is already in the pickup list.`
      setPickupDuplicateError(msg)
      toast.error(msg)
      return
    }
    setPickupDuplicateError('')
    addPickup({ id: generateId(), pickupLocation: pickupLocation.trim(), price: Number(price) })
    setPickupLocation(''); setPrice('')
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors text-left">
        <span className="text-[14px] font-semibold text-[#3b5bdb]">Transportation ticket</span>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-4 flex flex-col gap-3">
          <input
            type="text"
            value={form.transport.name}
            onChange={(e) => updateTransport({ name: e.target.value })}
            placeholder="Enter name of transport"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
          />
          <RichTextEditor
            value={form.transport.description}
            onChange={(v) => updateTransport({ description: v })}
            placeholder="Enter transport description"
            minHeight="100px"
          />

          <div>
            <p className="text-[13px] font-semibold text-[#3b5bdb] mb-2">Pickup option</p>

            {form.transport.pickups.map((pickup) => (
              <div key={pickup.id}
                className="flex items-center justify-between py-2 px-3 bg-[#f0f4ff]/40 rounded-lg mb-2">
                <div className="flex items-center gap-2 text-[13px] text-gray-700">
                  <MapPin size={13} className="text-[#3b5bdb]" />
                  {pickup.pickupLocation}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[13px] font-medium text-gray-700">₦{pickup.price.toLocaleString()}</span>
                  <button onClick={() => removePickup(pickup.id)}
                    className="text-red-400 hover:text-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => { setPickupLocation(e.target.value); setPickupDuplicateError('') }}
                  placeholder="Set pickup location"
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                />
              </div>
              <div className="relative w-32 flex-shrink-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-bold text-gray-400">₦</span>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Set price"
                  className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                />
              </div>
              <button
                onClick={handleAddPickup}
                disabled={!isFilled}
                className={`px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all flex-shrink-0 ${
                  isFilled ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Add
              </button>
            </div>

            {pickupDuplicateError && (
              <p className="text-[12px] text-red-500 mt-1">{pickupDuplicateError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Step ────────────────────────────────────────────────────────────────

export default function StepOptions() {
  const { form } = useTicketStore()
  const hasMeal = form.ticketTypes.includes('Meal')
  const hasAccommodation = form.ticketTypes.includes('Accommodation')
  const hasTransport = form.ticketTypes.includes('Transportation')

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Options, prices & quantity limit</h2>
      <div className="flex flex-col gap-3">
        {hasMeal && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3.5 bg-white">
              <p className="text-[14px] font-semibold text-[#3b5bdb] mb-3">Meal ticket</p>
              <MealSection />
            </div>
          </div>
        )}

        {hasAccommodation && <AccommodationSection />}
        {hasTransport && <TransportationSection />}

        {!hasMeal && !hasAccommodation && !hasTransport && (
          <p className="text-[13px] text-gray-400 text-center py-8">
            Go back to Step 2 and select at least one ticket type to configure options.
          </p>
        )}
      </div>
    </div>
  )
}