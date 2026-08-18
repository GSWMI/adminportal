import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil, Calendar, MapPin, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { getEventById, updateEvent, updateRegistration, getEventAccommodations, getEventTransport, updateAccommodation, updateTransportById, type EventData, type AccommodationData, type TransportData } from '../../../services/eventService'
import { qk } from '../../../lib/queryKeys'
import { toast } from 'sonner'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const SECTIONS = ['Event info', 'Ticket type', 'Options, prices & quantity limit', 'Registration form', 'Sponsorship pricing', 'Registration']

function formatDate(s: string) {
  if (!s) return ''
  return new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Event Info Section ──
function EventInfoSection({ event, editing, onEdit, onSave }: {
  event: EventData
  editing: boolean
  onEdit: () => void
  onSave: (data: Partial<EventData>) => Promise<void>
}) {
  const [name, setName] = useState(event.name)
  const [desc, setDesc] = useState(event.description)
  const [saving, setSaving] = useState(false)
  const dirty = name !== event.name || desc !== event.description

  const handleSave = async () => {
    setSaving(true)
    await onSave({ name, description: desc })
    setSaving(false)
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Event info</h2>
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
        </div>
        {event.bannerUrl && <img src={event.bannerUrl} alt="" className="w-[80px] h-[80px] rounded-lg object-cover mb-3" />}
        <p className="text-[15px] font-semibold text-gray-900 mb-2">{event.name}</p>
        <p className="text-[13px] text-gray-600 leading-relaxed mb-4">{event.description}</p>
        <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-2">
          <Calendar size={13} className="text-gray-400" />
          {formatDate(event.startDate)} — {formatDate(event.endDate)}
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-[13px] text-[#3b5bdb]">
            <MapPin size={13} />
            {event.location}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-4">Event info</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[14px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 mb-3 transition-all"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        rows={5}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 resize-none transition-all leading-relaxed mb-3"
      />
      <div className="flex items-center gap-2 text-[13px] text-gray-600 mb-2">
        <Calendar size={13} className="text-gray-400" />
        {formatDate(event.startDate)} — {formatDate(event.endDate)}
      </div>
      {event.location && (
        <div className="flex items-center gap-1.5 text-[13px] text-[#3b5bdb] mb-4">
          <MapPin size={13} />
          {event.location}
        </div>
      )}
      <SaveBtn dirty={dirty} saving={saving} onSave={handleSave} />
    </div>
  )
}

// ── Ticket Type Section ──
function TicketTypeSection({ event, editing, onEdit }: {
  event: EventData
  editing: boolean
  onEdit: () => void
  onSave?: (data: Partial<EventData>) => Promise<void>
}) {
  // An event can offer multiple ticket types — show every enabled one, not just the first.
  const ticketTypes: string[] = []
  if (event.mealRegistrationOpen || (event.mealOptions?.length ?? 0) > 0) ticketTypes.push('Meal')
  if (event.accommodationRegistrationOpen) ticketTypes.push('Accommodation')
  if (event.transportRegistrationOpen) ticketTypes.push('Transport')
  if (ticketTypes.length === 0) ticketTypes.push('Meal')

  const badges = (
    <div className="flex items-center gap-2 flex-wrap">
      {ticketTypes.map((t) => (
        <span key={t} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-[13px] font-medium">
          {t} ticket
        </span>
      ))}
    </div>
  )

  if (!editing) {
    return (
      <div>
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Ticket type</h2>
          <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>
        </div>
        {badges}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-4">Ticket type</h2>
      {badges}
      <p className="text-[12px] text-gray-400 mt-3">
        Ticket type changes require backend support. Contact your developer.
      </p>
    </div>
  )
}

// ── Options Section ──
function OptionsSection({ event, editing, onEdit, onSave }: {
  event: EventData
  editing: boolean
  onEdit: () => void
  onSave: (data: Partial<EventData>) => Promise<void>
}) {
  const [openSlots, setOpenSlots] = useState<string[]>([])
  const [prices, setPrices] = useState({ breakfast: event.mealPrices?.breakfast ?? 0, lunch: event.mealPrices?.lunch ?? 0, dinner: event.mealPrices?.dinner ?? 0 })
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(prices) !== JSON.stringify(event.mealPrices)

  // Accommodation & transport live on their own endpoints (shared cache with the sponsorship-pricing section).
  const queryClient = useQueryClient()
  const accommodationsQuery = useQuery({
    queryKey: qk.eventAccommodations(event._id),
    queryFn: () => getEventAccommodations(event._id),
  })
  const transportsQuery = useQuery({
    queryKey: qk.eventTransports(event._id),
    queryFn: () => getEventTransport(event._id),
  })
  const accommodations = accommodationsQuery.data ?? []
  const transports = transportsQuery.data ?? []
  const loadingExtras = accommodationsQuery.isLoading || transportsQuery.isLoading

  const toggleSlot = (slot: string) =>
    setOpenSlots((p) => p.includes(slot) ? p.filter((s) => s !== slot) : [...p, slot])

  const handleSave = async () => {
    setSaving(true)
    await onSave({ mealPrices: prices })
    setSaving(false)
  }

  const slots = ['breakfast', 'lunch', 'dinner'] as const

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Options, prices & quantity limit</h2>
        {!editing && <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>}
      </div>

      {Array.from({ length: event.totalDays }, (_, i) => i + 1).map((day) => (
        <div key={day} className="border border-gray-200 rounded-lg overflow-hidden mb-3">
          <button
            onClick={() => toggleSlot(`day-${day}`)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-[14px] font-semibold text-[#3b5bdb]">Day {day}</span>
            {openSlots.includes(`day-${day}`)
              ? <ChevronUp size={15} className="text-gray-400" />
              : <ChevronDown size={15} className="text-gray-400" />
            }
          </button>

          {openSlots.includes(`day-${day}`) && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-3 flex flex-col gap-2">
              {slots.map((slot) => (
                <div key={slot} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-[13px] text-gray-700 capitalize">{slot}</span>
                  {editing ? (
                    <div className="relative w-28">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">₦</span>
                      <input
                        type="number"
                        value={prices?.[slot] ?? 0}
                        onChange={(e) => setPrices((p) => ({ ...p, [slot]: Number(e.target.value) }))}
                        className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all"
                      />
                    </div>
                  ) : (
                    <span className="text-[13px] text-gray-600">
                      ₦{(event.mealPrices?.[slot] ?? 0).toLocaleString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {editing && <SaveBtn dirty={dirty} saving={saving} onSave={handleSave} />}

      {loadingExtras && (
        <p className="text-[12px] text-gray-400 mt-5 flex items-center gap-2">
          <Loader2 size={13} className="animate-spin" /> Loading accommodation &amp; transport…
        </p>
      )}

      {/* Accommodation */}
      {accommodations.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-gray-800 mb-2">Accommodation</p>
          <div className="flex flex-col gap-2">
            {accommodations.map((a) => (
              <EditableAccommodationCard
                key={a.id ?? a._id ?? a.name}
                acc={a}
                editing={editing}
                onUpdated={(u) => queryClient.setQueryData<AccommodationData[]>(qk.eventAccommodations(event._id), (prev) => (prev ?? []).map((x) => ((x.id ?? x._id) === (u.id ?? u._id) ? u : x)))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transport */}
      {transports.length > 0 && (
        <div className="mt-6">
          <p className="text-[13px] font-semibold text-gray-800 mb-2">Transport</p>
          <div className="flex flex-col gap-2">
            {transports.map((t) => (
              <EditableTransportCard
                key={t._id ?? t.name}
                item={t}
                editing={editing}
                onUpdated={(u) => queryClient.setQueryData<TransportData[]>(qk.eventTransports(event._id), (prev) => (prev ?? []).map((x) => (x._id === u._id ? u : x)))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Editable accommodation / transport cards (used inside OptionsSection) ──
function MiniField({ label, value, onChange, type = 'text', prefix }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; prefix?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-medium text-gray-500">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-gray-400">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${prefix ? 'pl-6' : 'pl-2.5'} pr-2 py-1.5 border border-gray-200 rounded-lg text-[13px] outline-none focus:border-[#3b5bdb] transition-all`}
        />
      </div>
    </div>
  )
}

function EditableAccommodationCard({ acc, editing, onUpdated }: {
  acc: AccommodationData; editing: boolean; onUpdated: (a: AccommodationData) => void
}) {
  const queryClient = useQueryClient()
  const cap0 = acc.totalCapacity ?? acc.capacity
  const [name, setName] = useState(acc.name)
  const [price, setPrice] = useState(String(acc.price ?? ''))
  const [ppr, setPpr] = useState(acc.peoplePerRoom != null ? String(acc.peoplePerRoom) : '')
  const [capacity, setCapacity] = useState(cap0 != null ? String(cap0) : '')
  const [saving, setSaving] = useState(false)

  const dirty =
    name !== acc.name ||
    Number(price) !== (acc.price ?? 0) ||
    (acc.peoplePerRoom != null ? Number(ppr) !== acc.peoplePerRoom : ppr.trim() !== '') ||
    (cap0 != null ? Number(capacity) !== cap0 : capacity.trim() !== '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const capNum = capacity.trim() ? Number(capacity) : cap0
      const payload: Record<string, unknown> = {
        name,
        description: acc.description ?? '',
        price: Number(price) || 0,
        peoplePerRoom: Number(ppr) || 0,
        available: acc.available ?? true,
        amenities: acc.amenities ?? [],
        eventId: acc.eventId,
      }
      if (typeof capNum === 'number') payload.capacity = capNum
      await updateAccommodation((acc.id ?? acc._id) as string, payload)
      onUpdated({
        ...acc, name, price: Number(price) || 0, peoplePerRoom: Number(ppr) || 0,
        capacity: (capNum ?? acc.capacity) as number, totalCapacity: capNum ?? acc.totalCapacity,
      })
      // Refresh other views of this event's accommodations (ticket page, sponsorship detail).
      queryClient.invalidateQueries({ queryKey: qk.eventAccommodations(acc.eventId) })
      toast.success('Accommodation updated')
    } catch {
      toast.error('Failed to update accommodation')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    const cap = acc.totalCapacity ?? acc.capacity
    return (
      <div className="border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-gray-900">{acc.name}</span>
          <span className="text-[13px] text-gray-700 whitespace-nowrap">₦{(acc.price ?? 0).toLocaleString()}</span>
        </div>
        <p className="text-[12px] text-gray-500 mt-0.5">
          {acc.peoplePerRoom ? `${acc.peoplePerRoom} per room` : ''}
          {typeof cap === 'number' ? `${acc.peoplePerRoom ? ' · ' : ''}Capacity ${cap}` : ''}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-2.5">
      <MiniField label="Name" value={name} onChange={setName} />
      <div className="grid grid-cols-3 gap-2">
        <MiniField label="Price" value={price} onChange={setPrice} type="number" prefix="₦" />
        <MiniField label="Per room" value={ppr} onChange={setPpr} type="number" />
        <MiniField label="Capacity" value={capacity} onChange={setCapacity} type="number" />
      </div>
      <div><SaveBtn dirty={dirty} saving={saving} onSave={handleSave} /></div>
    </div>
  )
}

function EditableTransportCard({ item, editing, onUpdated }: {
  item: TransportData; editing: boolean; onUpdated: (t: TransportData) => void
}) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(item.name)
  const [price, setPrice] = useState(String(item.price ?? ''))
  const [pickup, setPickup] = useState(item.pickupLocation ?? '')
  const [saving, setSaving] = useState(false)

  const dirty = name !== item.name || Number(price) !== (item.price ?? 0) || pickup !== (item.pickupLocation ?? '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        name,
        description: item.description ?? '',
        price: Number(price) || 0,
        available: item.available ?? true,
        pickupLocation: pickup,
        dropoffLocation: item.dropoffLocation ?? 'Conference Venue',
        eventId: item.eventId,
      }
      await updateTransportById(item._id, payload)
      onUpdated({ ...item, name, price: Number(price) || 0, pickupLocation: pickup })
      queryClient.invalidateQueries({ queryKey: qk.eventTransports(item.eventId) })
      toast.success('Transport updated')
    } catch {
      toast.error('Failed to update transport')
    } finally {
      setSaving(false)
    }
  }

  if (!editing) {
    return (
      <div className="border border-gray-200 rounded-lg px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-medium text-gray-900">{item.name}</span>
          <span className="text-[13px] text-gray-700 whitespace-nowrap">₦{(item.price ?? 0).toLocaleString()}</span>
        </div>
        {item.pickupLocation && <p className="text-[12px] text-gray-500 mt-0.5">Pickup: {item.pickupLocation}</p>}
      </div>
    )
  }

  return (
    <div className="border border-gray-200 rounded-lg px-4 py-3 flex flex-col gap-2.5">
      <MiniField label="Name" value={name} onChange={setName} />
      <div className="grid grid-cols-2 gap-2">
        <MiniField label="Price" value={price} onChange={setPrice} type="number" prefix="₦" />
        <MiniField label="Pickup location" value={pickup} onChange={setPickup} />
      </div>
      <div><SaveBtn dirty={dirty} saving={saving} onSave={handleSave} /></div>
    </div>
  )
}

// ── Registration Form Section ──
function RegFormSection({ editing, onEdit }: { editing: boolean; onEdit: () => void }) {
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-[#3b5bdb]">Registration form</h2>
        {!editing && <button onClick={onEdit} className="text-gray-400 hover:text-gray-600 transition-colors"><Pencil size={15} /></button>}
      </div>
      <div className="flex flex-col gap-2">
        {['First name *', 'Last name *', 'Email address *', 'Phone number *'].map((f) => (
          <div key={f} className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-gray-400 bg-gray-50">{f}</div>
        ))}
      </div>
      {editing && (
        <p className="text-[12px] text-gray-400 mt-3">
          Custom questions require backend support. Contact your developer.
        </p>
      )}
    </div>
  )
}


// ── Toggle Switch ──
function ToggleSwitch({ checked, onChange, loading }: { checked: boolean; onChange: () => void; loading?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={loading}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? 'bg-[#3b5bdb]' : 'bg-gray-200'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-4' : 'translate-x-1'
      }`} />
    </button>
  )
}

// ── Registration Section ──
function RegistrationSection({ event, onUpdate }: { event: EventData; onUpdate: (updates: Partial<EventData>) => void }) {
  const [loadingType, setLoadingType] = useState<string | null>(null)

  const toggle = async (type: 'meal' | 'accommodation' | 'transport' | 'all') => {
    const currentVal = type === 'meal' ? event.mealRegistrationOpen
      : type === 'accommodation' ? event.accommodationRegistrationOpen
      : type === 'transport' ? event.transportRegistrationOpen
      : event.registrationOpen
    const newVal = !currentVal
    setLoadingType(type)
    try {
      await updateRegistration(event._id, type, newVal)
      const updates: Partial<EventData> = {}
      if (type === 'meal' || type === 'all') updates.mealRegistrationOpen = newVal
      if (type === 'accommodation' || type === 'all') updates.accommodationRegistrationOpen = newVal
      if (type === 'transport' || type === 'all') updates.transportRegistrationOpen = newVal
      if (type === 'all') updates.registrationOpen = newVal
      onUpdate(updates)
      const label = type === 'all' ? 'All registration' : `${type.charAt(0).toUpperCase() + type.slice(1)} registration`
      toast.success(`${label} ${newVal ? 'opened' : 'closed'}`)
    } catch {
      toast.error('Failed to update registration')
    } finally {
      setLoadingType(null)
    }
  }

  const rows: { type: 'meal' | 'accommodation' | 'transport'; label: string; key: keyof EventData }[] = [
    { type: 'meal', label: 'Meal registration', key: 'mealRegistrationOpen' },
    { type: 'accommodation', label: 'Accommodation registration', key: 'accommodationRegistrationOpen' },
    { type: 'transport', label: 'Transport registration', key: 'transportRegistrationOpen' },
  ]

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-5">Registration</h2>
      <div className="flex flex-col gap-4">
        {rows.map(({ type, label, key }) => (
          event[key] !== undefined && (
            <div key={type} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-[14px] font-medium text-gray-800">{label}</p>
                <p className={`text-[12px] mt-0.5 ${event[key] ? 'text-green-500' : 'text-red-400'}`}>
                  {event[key] ? 'Open' : 'Closed'}
                </p>
              </div>
              <ToggleSwitch
                checked={!!event[key]}
                onChange={() => toggle(type)}
                loading={loadingType === type}
              />
            </div>
          )
        ))}

        <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
          <div>
            <p className="text-[14px] font-medium text-gray-800">All registration</p>
            <p className="text-[12px] text-gray-400 mt-0.5">Toggle all at once</p>
          </div>
          <ToggleSwitch
            checked={!!event.registrationOpen}
            onChange={() => toggle('all')}
            loading={loadingType === 'all'}
          />
        </div>
      </div>
    </div>
  )
}

function SaveBtn({ dirty, saving, onSave }: { dirty: boolean; saving: boolean; onSave: () => void }) {
  return (
    <button
      onClick={onSave}
      disabled={!dirty || saving}
      className={`flex items-center gap-2 px-5 py-2 rounded-lg text-[14px] font-medium transition-all ${
        dirty && !saving ? 'bg-[#3b5bdb] text-white hover:bg-[#3451c7]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {saving && <Loader2 size={14} className="animate-spin" />}
      Save changes
    </button>
  )
}

// ── Sponsorship Pricing Section ──
function PriceField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mb-3">
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]">₦</span>
        <input
          type="number"
          min="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg text-[14px] outline-none focus:border-[#3b5bdb] focus:ring-2 focus:ring-[#3b5bdb]/20 transition-all"
        />
      </div>
    </div>
  )
}

function SponsorshipPricingSection({ event, onSave }: {
  event: EventData
  onSave: (data: Partial<EventData>) => Promise<void>
}) {
  const sup = event.sponsorshipUnitPrices
  const accommodationsQuery = useQuery({
    queryKey: qk.eventAccommodations(event._id),
    queryFn: () => getEventAccommodations(event._id),
  })
  const accommodations = accommodationsQuery.data ?? []
  const loadingAcc = accommodationsQuery.isLoading
  // Prefill from the event's saved sponsorship prices (GET now returns them).
  const [meal, setMeal] = useState(sup?.meal != null ? String(sup.meal) : '')
  const [transport, setTransport] = useState(sup?.transport != null ? String(sup.transport) : '')
  const [accPrices, setAccPrices] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    for (const a of sup?.accommodation ?? []) init[a.accommodationId] = String(a.pricePerPerson)
    return init
  })
  const [saving, setSaving] = useState(false)

  const accId = (a: AccommodationData) => (a.id ?? a._id) as string

  const accommodationsPriced =
    accommodations.length === 0 || accommodations.every((a) => Number(accPrices[accId(a)]) > 0)
  const valid = Number(meal) > 0 && Number(transport) > 0 && accommodationsPriced

  const handleSave = async () => {
    setSaving(true)
    await onSave({
      sponsorshipUnitPrices: {
        meal: Number(meal),
        transport: Number(transport),
        accommodation: accommodations.map((a) => ({
          accommodationId: accId(a),
          pricePerPerson: Number(accPrices[accId(a)]),
        })),
      },
    })
    setSaving(false)
  }

  return (
    <div>
      <h2 className="text-[15px] font-semibold text-[#3b5bdb] mb-1">Sponsorship pricing</h2>
      <p className="text-[12px] text-gray-500 mb-5">
        Set the per-person amount a sponsor pays for each category. This must be set before attendees can sponsor others.
      </p>

      <PriceField label="Meal (per person)" value={meal} onChange={setMeal} />
      <PriceField label="Transport (per person)" value={transport} onChange={setTransport} />

      <p className="text-[13px] font-semibold text-gray-800 mt-5 mb-2">Accommodation (price per person)</p>
      {loadingAcc ? (
        <Skeleton count={2} height={44} className="mb-2" />
      ) : accommodations.length === 0 ? (
        <p className="text-[12px] text-gray-400 mb-2">This event has no accommodations to price.</p>
      ) : (
        accommodations.map((a) => (
          <PriceField
            key={accId(a)}
            label={a.name}
            value={accPrices[accId(a)] ?? ''}
            onChange={(v) => setAccPrices((p) => ({ ...p, [accId(a)]: v }))}
          />
        ))
      )}

      <div className="mt-5">
        <SaveBtn dirty={valid} saving={saving} onSave={handleSave} />
      </div>
    </div>
  )
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState(0)
  const [editingSection, setEditingSection] = useState<number | null>(null)

  const eventQuery = useQuery({
    queryKey: qk.event(id ?? ''),
    queryFn: () => getEventById(id!),
    enabled: !!id,
  })
  const event = eventQuery.data ?? null
  const loading = eventQuery.isLoading

  const handleRegistrationUpdate = (updates: Partial<EventData>) => {
    if (!id) return
    queryClient.setQueryData<EventData>(qk.event(id), (prev) => prev ? { ...prev, ...updates } : prev)
  }

  const handleSave = async (updates: Partial<EventData>) => {
    if (!id) return
    try {
      const updated = await updateEvent(id, updates)
      queryClient.setQueryData<EventData>(qk.event(id), (prev) => prev ? { ...prev, ...updated, ...updates } : prev)
      queryClient.invalidateQueries({ queryKey: qk.events() }) // keep the Tickets list in sync
      setEditingSection(null)
      toast.success('Changes saved')
    } catch {
      toast.error('Failed to save changes')
    }
  }

  if (loading) {
    return (
      <div className="max-w-[1000px]">
        <div className="flex items-center gap-3 mb-6">
          <Skeleton width={24} height={24} />
          <Skeleton width={200} height={24} />
        </div>
        <div className="flex gap-8">
          <div className="w-[220px]"><Skeleton count={4} height={32} className="mb-2" /></div>
          <div className="flex-1 bg-white rounded-xl border border-gray-200 px-7 py-6">
            <Skeleton height={20} width="40%" className="mb-4" />
            <Skeleton count={5} height={16} className="mb-2" />
          </div>
        </div>
      </div>
    )
  }

  if (!event) return <div className="text-center py-20 text-gray-400">Ticket not found</div>

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/tickets')} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-[18px] font-semibold text-gray-900">{event.name}</h1>
      </div>

      <div className="flex gap-8">
        {/* Left nav */}
        <div className="w-[220px] flex-shrink-0">
          {SECTIONS.map((sec, i) => (
            <button
              key={sec}
              onClick={() => { setActiveSection(i); setEditingSection(null) }}
              className="w-full flex items-center justify-between py-2.5 text-left"
            >
              <span className={`text-[13px] font-medium ${activeSection === i ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
                {sec}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className={activeSection === i ? 'text-gray-900' : 'text-gray-300'}>
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-200 px-7 py-6">
            {activeSection === 0 && (
              <EventInfoSection
                event={event}
                editing={editingSection === 0}
                onEdit={() => setEditingSection(0)}
                onSave={handleSave}
              />
            )}
            {activeSection === 1 && (
              <TicketTypeSection
                event={event}
                editing={editingSection === 1}
                onEdit={() => setEditingSection(1)}
                onSave={handleSave}
              />
            )}
            {activeSection === 2 && (
              <OptionsSection
                event={event}
                editing={editingSection === 2}
                onEdit={() => setEditingSection(2)}
                onSave={handleSave}
              />
            )}
            {activeSection === 3 && (
              <RegFormSection
                editing={editingSection === 3}
                onEdit={() => setEditingSection(3)}
              />
            )}
            {activeSection === 4 && (
              <SponsorshipPricingSection
                event={event}
                onSave={handleSave}
              />
            )}
            {activeSection === 5 && (
              <RegistrationSection
                event={event}
                onUpdate={handleRegistrationUpdate}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}