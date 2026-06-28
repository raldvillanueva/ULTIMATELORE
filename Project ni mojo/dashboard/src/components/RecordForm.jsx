import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Save, X } from 'lucide-react'

const EMPTY_FORM = {
  // Main Info
  status_crew: '',
  date_assign: '',
  for_check: false,
  date_executed: '',
  type_of_meter: '',
  job_description: '',
  crew_name: '',
  location: '',
  service_number: '',
  field_order_no: '',
  // Remove Meter
  remove_meter: '',
  r_serial_number: '',
  demand_seal_aerolock: '',
  removed_seal: '',
  cabinet_seal_remove: '',
  reading_kwh: '',
  // New Installed Meter
  ins_meter: '',
  ins_serial_number: '',
  demand_seal_installed: '',
  installed_seal: '',
  cabinet_seal_installed: '',
  tln_tag: '',
  pole_tag: '',
  booba_number: '',
  mdltr_no: '',
  aging: '',
  witness_date: '',
  // Remarks & Batch
  remarks: '',
  mflt_checklist: false,
  fo_type: '',
  billed_amount: '',
  for_batch: '',
  date_returned: '',
  crew_payrol: '',
  percentage: '',
  pluscode: '',
}

function Field({ label, children, required, errorMessage }) {
  return (
    <div className="flex flex-col gap-1">

      <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
        {label}
        {required && (
          <span className="text-red-500 ml-0.5">*</span>
        )}
      </label>

      {children}

      {errorMessage && (
        <span className="text-xs text-red-600 mt-1">
          {errorMessage}
        </span>
      )}

    </div>
  )
}

const inputClass = "px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white w-full"
const selectClass = `${inputClass}`

function SectionTitle({ title }) {
  return (
    <div className="col-span-full mt-2">
      <h3 className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-200">{title}</h3>
    </div>
  )
}

export default function RecordForm({ initialData, recordId }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const navigate = useNavigate()

  function set(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

function text(field) {

  return {

    value: form[field] ?? '',

    onChange: e => {

      set(field,e.target.value)

      setFieldErrors(prev=>({
        ...prev,
        [field]:false
      }))

    },


    className: `
      ${inputClass}

      ${
        fieldErrors[field]
        ? '!border-red-500 !bg-red-200'
        : ''
      }

    `

  }

}

  async function handleSubmit(e) {

  e.preventDefault()

  setError('')


  // REQUIRED FIELDS
  const requiredFields = {

    field_order_no: "Field Order no.",

    remove_meter: "Meter Remove no.",

    ins_meter: "Installed Meter no.",

    removed_seal: "Removed seal",

    installed_seal: "Installed seal",

    fo_type: "FO type",

    status_crew: "Status crew",

    date_executed: "Date Executed",

    location: "Location",

    remarks: "Remarks",

    for_batch: "For Batch",

    billed_amount: "Billed Amount"

  }


  const errors = {}


  Object.keys(requiredFields).forEach(field => {

    if (!form[field] || form[field] === '') {

      errors[field] = "This field cannot be blank"
    }

  })

  // STOP SAVE IF REQUIRED FIELD IS EMPTY
  if (Object.keys(errors).length > 0) {

console.log(errors)

setFieldErrors(errors)

return

}

  setSaving(true)

  // CHECK DUPLICATE FIELD ORDER NO.
  const { data: existingFO } = await supabase
    .from('field_orders')
    .select('id')
    .eq(
      'field_order_no',
      form.field_order_no
    )
    .maybeSingle()

  if (existingFO && existingFO.id !== recordId) {

    setFieldErrors({

      field_order_no: "This Field Order number already exists"

    })

    setSaving(false)

    return

  }



  // CHECK DUPLICATE INSTALLED METER NO.
  const { data: existingMeter } = await supabase

    .from('field_orders')

    .select('id')

    .eq(
      'ins_meter',
      form.ins_meter
    )

    .maybeSingle()



  if (existingMeter && existingMeter.id !== recordId) {

    setFieldErrors({

      ins_meter: "This Installed Meter number already exists"

    })

    setSaving(false)

    return

  }



  const payload = {

    ...form,

    aging: form.aging === ''
      ? null
      : parseInt(form.aging),


    billed_amount: form.billed_amount === ''
      ? null
      : parseFloat(form.billed_amount),


    crew_payrol: form.crew_payrol === ''
      ? null
      : parseFloat(form.crew_payrol),


    date_assign: form.date_assign || null,

    date_executed: form.date_executed || null,

    witness_date: form.witness_date || null,

    date_returned: form.date_returned || null,

  }



  let error



  if (recordId) {

    ;({ error } = await supabase

      .from('field_orders')

      .update(payload)

      .eq('id', recordId))

  } 

  else {

    ;({ error } = await supabase

      .from('field_orders')

      .insert([payload]))

  }



  setSaving(false)



  if (error) {

    setError(error.message)

  } 

  else {

    navigate('/field-orders')

  }

}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Section 1 – Main Info */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionTitle title="Main Information" />

          <Field label="Field Order No." required errorMessage={fieldErrors.field_order_no}>
            <input {...text('field_order_no')} placeholder="e.g. F25090604378" />
          </Field>

          <Field label="Service Number">
            <input {...text('service_number')} placeholder="e.g. 43890272-01" />
          </Field>

          <Field label="Status Crew" required  errorMessage={fieldErrors.status_crew}>
<select {...text('status_crew')}>
              <option value="">— Select —</option>
              <option value="FIELD COMPL.">FIELD COMPL.</option>
              <option value="CANCEL">CANCEL</option>
            </select>
          </Field>

          <Field label="Date Assign">
            <input type="date" {...text('date_assign')} />
          </Field>

          <Field label="Date Executed" errorMessage={fieldErrors.date_executed}>
            <input type="date" {...text('date_executed')} />
          </Field>

          <Field label="For Check">
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="for_check"
                checked={!!form.for_check}
                onChange={e => set('for_check', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="for_check" className="text-sm text-slate-600">Checked</label>
            </div>
          </Field>

          <Field label="Type of Meter">
            <select {...text('type_of_meter')} className={selectClass}>
              <option value="">— Select —</option>
              <option value="2S PLAIN METER">2S PLAIN METER</option>
              <option value="1S PLAIN METER">1S PLAIN METER</option>
              <option value="3S PLAIN METER">3S PLAIN METER</option>
            </select>
          </Field>

          <Field label="Job Description">
            <select {...text('job_description')} className={selectClass}>
              <option value="">— Select —</option>
              <option value="REPLACE">REPLACE</option>
              <option value="RETIRE">RETIRE</option>
              <option value="REMOVE">REMOVE</option>
            </select>
          </Field>

          <Field label="Crew Name" required>
            <input {...text('crew_name')} placeholder="e.g. J. BITAGO" />
          </Field>

          <Field label="Location" required errorMessage={fieldErrors.location}>
            <div className="col-span-full">
              <input 
  {...text('location')} 
  placeholder="e.g. 0242 SUMULONG, STA CRUZ, ANTIPOLO RIZAL"
/>
            </div>
          </Field>
        </div>
      </div>

      {/* Section 2 – Remove Meter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionTitle title="Remove Meter" />

          <Field label="Remove Meter No." errorMessage={fieldErrors.remove_meter}>
            <input {...text('remove_meter')} placeholder="e.g. 108BA055151" />
          </Field>

          <Field label="R. Serial Number">
            <input {...text('r_serial_number')} placeholder="e.g. 0824851" />
          </Field>

          <Field label="Demand Seal No. (5) Aerolock">
            <input {...text('demand_seal_aerolock')} placeholder="Seal number" />
          </Field>

          <Field label="Removed Seal" errorMessage={fieldErrors.removed_seal}>
            <input {...text('removed_seal')} placeholder="e.g. A22PT0018882" />
          </Field>

          <Field label="Cabinet Seal (2)">
            <input {...text('cabinet_seal_remove')} placeholder="Cabinet seal" />
          </Field>

          <Field label="Reading (kWh)">
            <input {...text('reading_kwh')} placeholder="e.g. 37812 / NDD / ERROR" />
          </Field>
        </div>
      </div>

      {/* Section 3 – New Installed Meter */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionTitle title="New Installed Meter" />

          <Field label="Installed Meter No." errorMessage={fieldErrors.ins_meter}>
            <input {...text('ins_meter')} placeholder="e.g. 125BAS076970" />
          </Field>

          <Field label="Serial Number">
            <input {...text('ins_serial_number')} placeholder="e.g. SC1076970" />
          </Field>

          <Field label="Demand Seal (5)">
            <input {...text('demand_seal_installed')} placeholder="Demand seal" />
          </Field>

          <Field label="Installed Seal (1)" errorMessage={fieldErrors.installed_seal}>
            <input {...text('installed_seal')} placeholder="e.g. A25PT0196346" />
          </Field>

          <Field label="Cabinet Seal (2)">
            <input {...text('cabinet_seal_installed')} placeholder="Cabinet seal" />
          </Field>

          <Field label="TLN Tag">
            <input {...text('tln_tag')} placeholder="e.g. 199538" />
          </Field>

          <Field label="Pole Tag">
            <input {...text('pole_tag')} placeholder="e.g. 115-0833" />
          </Field>

          <Field label="Booba Number">
            <input {...text('booba_number')} placeholder="e.g. B25BW0109486" />
          </Field>

          <Field label="MDLTR No.">
            <input {...text('mdltr_no')} placeholder="e.g. 384356" />
          </Field>

          <Field label="Aging (days)">
            <input
              type="number"
              value={form.aging ?? ''}
              onChange={e => set('aging', e.target.value)}
              className={inputClass}
              placeholder="e.g. -238"
            />
          </Field>

          <Field label="Witness Date">
            <input type="date" {...text('witness_date')} />
          </Field>
        </div>
      </div>

      {/* Section 4 – Remarks & Batch */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SectionTitle title="Remarks & Batch Information" />

          <Field label="FO Type" required errorMessage={fieldErrors.fo_type}>
          <select
            {...text('fo_type')}
            
            >
              <option value="">— Select —</option>
              <option value="REPLACE">REPLACE</option>
              <option value="RETIRE">RETIRE</option>
              <option value="REMOVE">REMOVE</option>
              <option value="CANCEL">CANCEL</option>
            </select>
          </Field>

          <Field label="Billed Amount (₱)" errorMessage={fieldErrors.billed_amount}>
            <input type="number" value={form.billed_amount ?? ''}
              onChange={e => { set('billed_amount', e.target.value) 
                setFieldErrors(prev=>({...prev, billed_amount:false}))}}
                className={`${inputClass}${fieldErrors.billed_amount? '!border-red-500 !bg-red-200':''}`}
                />
          </Field>

          <Field label="For Batch"errorMessage={fieldErrors.for_batch}>
            <select{...text('for_batch')}>
              <option value="">— Select —</option>
              <option value="ALREADY BATCH">ALREADY BATCH</option>
            </select>
          </Field>

          <Field label="Date Returned">
            <input type="date" {...text('date_returned')} />
          </Field>

          <Field label="Crew Payrol (₱)">
            <input
              type="number"
              step="0.01"
              value={form.crew_payrol ?? ''}
              onChange={e => set('crew_payrol', e.target.value)}
              className={inputClass}
              placeholder="e.g. 220"
            />
          </Field>

          <Field label="Percentage (%)">
            <input {...text('percentage')} placeholder="e.g. 29%" />
          </Field>

          <Field label="Plus Code">
            <input {...text('pluscode')} placeholder="Plus code" />
          </Field>

          <Field label="MFLT Checklist">
            <div className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                id="mflt_checklist"
                checked={!!form.mflt_checklist}
                onChange={e => set('mflt_checklist', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="mflt_checklist" className="text-sm text-slate-600">Checked</label>
            </div>
          </Field>

          <Field label="Remarks" errorMessage={fieldErrors.remarks}>
            <textarea
  {...text('remarks')}
  rows={3}
  placeholder="e.g. REPLACE METER FOR LABTEST"
/>
          </Field>
        </div>
      </div>


      {/* Sticky Actions */}
<div
  className="fixed
    bottom-0
    left-64
    right-0
    bg-white
    border-t
    border-slate-200
    p-4
    flex
    items-center
    justify-end
    gap-3
    shadow-lg
    z-50
  "
>
  <button
    type="button"
    onClick={() => navigate('/field-orders')}
      className="flex items-center gap-2 px-5 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
  >
        <X size={15} />
        Cancel
      </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
  >
          <Save size={15} />
          {saving ? 'Saving...' : recordId ? 'Update Record' : 'Save Record'}
        </button>
      </div>
    </form>
  )
}
