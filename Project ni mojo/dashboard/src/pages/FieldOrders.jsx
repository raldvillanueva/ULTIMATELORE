import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Search, ChevronLeft, ChevronRight, X, Save } from 'lucide-react'

const PAGE_SIZE = 50

const STATUS_OPTIONS = ['All', 'FIELD COMPL.', 'CANCEL']
const FO_TYPE_OPTIONS = ['All', 'REPLACE', 'RETIRE', 'REMOVE', 'CANCEL']
const BATCH_OPTIONS = ['All', 'ALREADY BATCH', 'NOT BATCHED']

const EMPTY_FORM = {
  status_crew: '', date_assign: '', for_check: false, date_executed: '', type_of_meter: '',
  job_description: '', crew_name: '', location: '', service_number: '', field_order_no: '',
  remove_meter: '', r_serial_number: '', demand_seal_aerolock: '', removed_seal: '',
  cabinet_seal_remove: '', reading_kwh: '', ins_meter: '', ins_serial_number: '',
  demand_seal_installed: '', installed_seal: '', cabinet_seal_installed: '', tln_tag: '',
  pole_tag: '', booba_number: '', mdltr_no: '', aging: '', witness_date: '', remarks: '',
  mflt_checklist: false, fo_type: '', billed_amount: '', for_batch: '', date_returned: '',
  crew_payrol: '', percentage: '', pluscode: '',
}

function StatusBadge({ status }) {
  const s = status?.toUpperCase() || ''
  if (s === 'CANCEL') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">CANCEL</span>
  if (s.includes('FIELD')) return <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">FIELD COMPL.</span>
  return <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">{status || '—'}</span>
}

function FoTypeBadge({ type }) {
  const t = type?.toUpperCase() || ''
  if (t === 'REPLACE') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">REPLACE</span>
  if (t === 'RETIRE') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">RETIRE</span>
  if (t === 'REMOVE') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">REMOVE</span>
  if (t === 'CANCEL') return <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">CANCEL</span>
  return <span className="text-slate-400 text-xs">{type || '—'}</span>
}

const iCls = 'w-full px-2 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

function PF({ label, children, span2 }) {
  return (
    <div className={span2 ? 'col-span-2' : ''}>
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

function PS({ title, children }) {
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 mt-1 pb-1.5 border-b border-slate-100">{title}</p>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </div>
  )
}

const COLS = [
  { label: 'STATUS CREW', key: 'status_crew', w: 120, render: r => <StatusBadge status={r.status_crew} /> },
  { label: 'DATE ASSIGN', key: 'date_assign', w: 105, render: r => r.date_assign || '—' },
  { label: 'CHK', key: 'for_check', w: 44, render: r => r.for_check ? <span className="text-emerald-600 font-bold">✓</span> : '' },
  { label: 'DATE EXEC', key: 'date_executed', w: 105, render: r => r.date_executed || '—' },
  { label: 'METER TYPE', key: 'type_of_meter', w: 130, render: r => r.type_of_meter || '—' },
  { label: 'JOB DESC', key: 'job_description', w: 90, render: r => r.job_description || '—' },
  { label: 'CREW NAME', key: 'crew_name', w: 130, render: r => r.crew_name || '—' },
  { label: 'LOCATION', key: 'location', w: 260, render: r => r.location || '—' },
  { label: 'SERVICE NO.', key: 'service_number', w: 125, render: r => r.service_number || '—' },
  { label: 'FIELD ORDER', key: 'field_order_no', w: 140, mono: true, render: r => r.field_order_no || '—' },
  { label: 'REMOVE METER', key: 'remove_meter', w: 125, render: r => r.remove_meter || '—' },
  { label: 'INS. METER', key: 'ins_meter', w: 125, render: r => r.ins_meter || '—' },
  { label: 'INS. SEAL (1)', key: 'installed_seal', w: 125, render: r => r.installed_seal || '—' },
  { label: 'CAB. SEAL (2)', key: 'cabinet_seal_installed', w: 120, render: r => r.cabinet_seal_installed || '—' },
  { label: 'REMARKS', key: 'remarks', w: 200, render: r => r.remarks || '—' },
  { label: 'MFLT', key: 'mflt_checklist', w: 52, render: r => r.mflt_checklist ? <span className="text-emerald-600 font-bold">✓</span> : '' },
  { label: 'FO TYPE', key: 'fo_type', w: 90, render: r => <FoTypeBadge type={r.fo_type} /> },
  { label: 'BILLED', key: 'billed_amount', w: 90, render: r => r.billed_amount != null ? `₱${parseFloat(r.billed_amount).toFixed(2)}` : '—' },
  { label: 'BATCH', key: 'for_batch', w: 90, render: r => r.for_batch?.toUpperCase().includes('ALREADY') ? <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">Batched</span> : <span className="text-slate-300">—</span> },
  { label: 'DATE RET.', key: 'date_returned', w: 100, render: r => r.date_returned || '—' },
  { label: 'PAYROL', key: 'crew_payrol', w: 80, render: r => r.crew_payrol != null ? `₱${r.crew_payrol}` : '—' },
  { label: '%', key: 'percentage', w: 60, render: r => r.percentage || '—' },
  { label: 'PLUSCODE', key: 'pluscode', w: 85, render: r => r.pluscode || '—' },
]

export default function FieldOrders() {
  const [records, setRecords] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [foTypeFilter, setFoTypeFilter] = useState('All')
  const [batchFilter, setBatchFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [editRow, setEditRow] = useState(null)
  const [pendingEdit,setPendingEdit]=useState(null)
  const [editForm, setEditForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const navigate = useNavigate()
  const [pending,setPending] = useState([])
  const [selectedRows,setSelectedRows]=useState([])
  const [repeatCount,setRepeatCount] = useState(1)
  const [pendingMode, setPendingMode] = useState("STACK") 
const displayPending =
  pendingMode === "QUEUE"
    ? [...pending]
    : [...pending].reverse()

async function deleteSelected(){


await supabase
.from('field_orders')
.delete()
.in('id',selectedRows)



setSelectedRows([])

fetchRecords()


}
function toggleRow(id){

setSelectedRows(prev=>

prev.includes(id)

?
prev.filter(x=>x!==id)

:

[...prev,id]

)

}

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    let q = supabase
      .from('field_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (search) {
      q = q.or(
        `field_order_no.ilike.%${search}%,service_number.ilike.%${search}%,crew_name.ilike.%${search}%,location.ilike.%${search}%,remove_meter.ilike.%${search}%,ins_meter.ilike.%${search}%`
      )
    }
    if (statusFilter !== 'All') {
      q = statusFilter === 'FIELD COMPL.' ? q.ilike('status_crew', '%FIELD%') : q.ilike('status_crew', statusFilter)
    }
    if (foTypeFilter !== 'All') q = q.ilike('fo_type', foTypeFilter)
    if (batchFilter === 'ALREADY BATCH') {
      q = q.ilike('for_batch', '%ALREADY%')
    } else if (batchFilter === 'NOT BATCHED') {
      q = q.is('for_batch', null).or('for_batch.not.ilike.%ALREADY%', { referencedTable: 'field_orders' })
    }

    const { data, count, error } = await q
    if (!error) { setRecords(data); setTotal(count) }
    setLoading(false)
  }, [page, search, statusFilter, foTypeFilter, batchFilter])

useEffect(() => { 
  fetchRecords() 
}, [fetchRecords])


useEffect(() => { 
  setPage(0) 
}, [search, statusFilter, foTypeFilter, batchFilter])


// ADD THIS
useEffect(() => {

  const data = JSON.parse(
    localStorage.getItem("pendingOrders") || "[]"
  )


  setPending(data)


}, [])

  function openEdit(row) {
    setEditRow(row)
    const f = { ...EMPTY_FORM }
    for (const k of Object.keys(EMPTY_FORM)) f[k] = row[k] ?? EMPTY_FORM[k]
    setEditForm(f)
    setSaveError('')
  }

  function closeEdit() { setEditRow(null); setEditForm(null) }

  function sf(field, value) { setEditForm(prev => ({ ...prev, [field]: value })) }

  async function handleSave() {

  setSaving(true)
  setSaveError('')


  const payload = {

    ...editForm,

    aging: editForm.aging === ''
      ? null
      : parseInt(editForm.aging),

    billed_amount: editForm.billed_amount === ''
      ? null
      : parseFloat(editForm.billed_amount),

    crew_payrol: editForm.crew_payrol === ''
      ? null
      : parseFloat(editForm.crew_payrol),

    date_assign: editForm.date_assign || null,

    date_executed: editForm.date_executed || null,

    witness_date: editForm.witness_date || null,

    date_returned: editForm.date_returned || null,

  }



  // CHECK IF THIS RECORD IS FROM PENDING

const localPending =
  JSON.parse(localStorage.getItem("pendingOrders") || "[]")

const isPending =
  localPending.some(item => item.id === editRow.id)

  let error



  if(isPending){


    // SAVE PENDING TO DATABASE

    const result =
    await supabase
    .from('field_orders')
    .insert([payload])


    error = result.error



    if(!error){


      const updated =
      localPending.filter(
        item =>
        item.id !== editRow.id
      )


      localStorage.setItem(
        "pendingOrders",
        JSON.stringify(updated)
      )


      setPending(updated)

    }



  }
  else{


    // NORMAL EDIT RECORD

    const result =
    await supabase
    .from('field_orders')
    .update(payload)
    .eq(
      'id',
      editRow.id
    )


    error = result.error


  }





  setSaving(false)



  if(error){

    setSaveError(error.message)

  }
  else{

    closeEdit()

    fetchRecords()

  }

}

  async function handleDelete(id) {
    const { error } = await supabase.from('field_orders').delete().eq('id', id)
    if (!error) { setDeleteTarget(null); fetchRecords() }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)
  async function handleSavePending(item){


const savedItem = {
  ...item,

  status_crew: "",
  date_assign: null,
  date_executed: null
}


const {error}=await supabase
.from('field_orders')
.insert([savedItem])


if(error){

console.log(error)
return

}


const updated =
localPending.filter(
p=>p.id !== item.id
)


localStorage.setItem(
"pendingOrders",
JSON.stringify(updated)
)


setPending(updated)


fetchRecords()

}

function openPendingEdit(item){

setPendingEdit(item)

}

function removePending(id){

  const updated = pending.filter(
    p => p.id !== id
  )

  localStorage.setItem(
    "pendingOrders",
    JSON.stringify(updated)
  )

  setPending(updated)

}

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }} className="gap-4">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Field Orders</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total records</p>
        </div>
        <div className="flex items-center gap-3">

  <input
    type="number"
    min="1"
    value={repeatCount}
    onChange={
      e => setRepeatCount(Number(e.target.value))
    }
    className="
      px-3
      py-2
      border
      border-slate-200
      rounded-lg
      w-24
      text-sm
      focus:outline-none
      focus:ring-2
      focus:ring-blue-500
    "
    placeholder="Qty"
  />


<button
  onClick={() =>
    navigate('/field-orders/add',{
      state:{
        repeatCount,
        currentRepeat:1
      }
    })
  }
  className="
    flex
    items-center
    gap-2
    bg-blue-600
    hover:bg-blue-700
    text-white
    px-4
    py-2
    rounded-lg
    text-sm
    font-medium
    transition-colors
  "
>

<Plus size={16}/>

Add Record

</button>


</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 shrink-0">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search FO#, service no, crew, location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={foTypeFilter} onChange={e => setFoTypeFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {FO_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <select value={batchFilter} onChange={e => setBatchFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {BATCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

        {/* Pending Records */}
     {/* Pending Spreadsheet */}

<div className="
flex-1
min-h-0
bg-white
rounded-xl
shadow-sm
border
border-slate-200
flex
flex-col
overflow-hidden
mt-4
">

<div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
  <h2 className="font-semibold text-slate-800">
    Pending Records
  </h2>
  <select
    value={pendingMode}
    onChange={(e) => setPendingMode(e.target.value)}
    className="px-2 py-1 border rounded text-xs"
  >
    <option value="STACK">STACK</option>
    <option value="QUEUE">QUEUE</option>
  </select>

</div>

<div className="overflow-auto">
<table 
className="text-xs border-collapse"
style={{
minWidth:'max-content',
width:'100%'
}}
>

<thead className="sticky top-0 z-10">

<tr style={{background:'#1e293b'}}>


<th className="
px-3
py-2
text-left
text-slate-300
">

#

</th>


<th className="
px-3
py-2
text-left
text-slate-300
">

FIELD ORDER

</th>


<th className="
px-3
py-2
text-left
text-slate-300
">

INSTALLED METER

</th>


<th className="
px-3
py-2
text-left
text-slate-300
">

STATUS

</th>


<th className="
px-3
py-2
text-left
text-slate-300
">

ACTION

</th>


</tr>

</thead>



<tbody>


{displayPending.map((row,index)=>(


<tr

key={row.id}

onClick={()=>openEdit(row)}

className="
cursor-pointer
border-b
border-slate-100
hover:bg-slate-50
"


>


<td className="px-3 py-2">

{index+1}

</td>


<td className="px-3 py-2">

{row.field_order_no}

</td>


<td className="px-3 py-2">

{row.ins_meter}

</td>


<td className="
px-3
py-2
text-orange-500
font-medium
">

PENDING

</td>


<td className="px-3 py-2">

<button

onClick={(e)=>{

e.stopPropagation()

removePending(row.id)

}}

className="
bg-red-600
text-white
px-3
py-1
rounded
"

>

Remove

</button>

</td>


</tr>


))

}


</tbody>


</table>


</div>


</div>
{/* Bulk Delete */}
{
  selectedRows.length > 0 && (

    <div className="flex justify-end">
      <button

        onClick={deleteSelected}

        className="
        bg-red-600
        hover:bg-red-700
        text-white
        px-4
        py-2
        rounded-lg
        text-sm
        font-medium
        "

      >

        Delete Selected ({selectedRows.length})

      </button>
    </div>

  )
}
      {/* Spreadsheet */}
      <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="text-xs border-collapse" style={{ minWidth: 'max-content', width: '100%' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ background: '#1e293b' }}>
                <th
style={{ width:40, minWidth:40, background:'#1e293b' }}
className="px-2 py-2.5 text-center font-medium text-slate-300 border-r border-slate-700"
>
<input

type="checkbox"

checked={
selectedRows.length === records.length &&
records.length > 0
}

onChange={(e)=>{


if(e.target.checked){


setSelectedRows(
records.map(row=>row.id)
)


}
else{


setSelectedRows([])


}


}}

/>
</th>
                {COLS.map(col => (
                  <th
                    key={col.key}
                    style={{ minWidth: col.w, maxWidth: col.w, background: '#1e293b' }}
                    className="px-3 py-2.5 text-left font-medium text-slate-300 whitespace-nowrap border-r border-slate-700 last:border-0"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={COLS.length + 1} className="px-4 py-16 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length + 1} className="px-4 py-16 text-center text-slate-400">No records found.</td>
                </tr>
              ) : (
                records.map((row, idx) => {
                  const sel = editRow?.id === row.id
                  return (
                    <tr
  key={row.id}
  onClick={() => sel ? closeEdit() : openEdit(row)}
  style={{ background: sel ? '#eff6ff' : undefined }}
  className={`cursor-pointer border-b border-slate-100 transition-colors group ${sel ? 'outline outline-2 outline-blue-400 outline-offset-[-2px]' : 'hover:bg-slate-50'}`}
>
  <td className="px-2 py-2 text-center">
  <input
  type="checkbox"
  checked={selectedRows.includes(row.id)}
  onClick={(e) => e.stopPropagation()}
  onChange={() => toggleRow(row.id)}
/>
</td>
                      <td
                        style={{ width: 40, minWidth: 40, background: sel ? '#eff6ff' : 'white' }}
                        className="sticky left-0 z-[5] px-2 py-2 text-center text-slate-400 border-r border-slate-100 group-hover:bg-slate-50"
                      >
                        {page * PAGE_SIZE + idx + 1}
                      </td>
                      {COLS.map(col => (
                        <td
                          key={col.key}
                          style={{ minWidth: col.w, maxWidth: col.w }}
                          className={`px-3 py-2 border-r border-slate-100 last:border-0 text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis${col.mono ? ' font-mono' : ''}`}
                        >
                          {col.render(row)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50 text-sm text-slate-500">
          <p>Showing {total === 0 ? 0 : page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} records • Click a row to edit</p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 text-xs">Page {page + 1} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
{
pendingEdit && (

<div className="
fixed
right-0
top-0
h-full
w-[500px]
bg-white
shadow-xl
z-50
p-5
">


<h2 className="
font-bold
text-lg
mb-4
">

Edit Pending Record

</h2>



<label>
Field Order
</label>

<input

value={pendingEdit.field_order_no}

onChange={
e=>

setPendingEdit({

...pendingEdit,

field_order_no:e.target.value

})

}

className={iCls}

/>



<label className="block mt-3">

Installed Meter

</label>


<input

value={pendingEdit.ins_meter}

onChange={
e=>

setPendingEdit({

...pendingEdit,

ins_meter:e.target.value

})

}

className={iCls}

/>



<button

onClick={()=>{

const updated =
pending.map(
p=>
p.id===pendingEdit.id
?
pendingEdit
:
p
)


localStorage.setItem(
"pendingOrders",
JSON.stringify(updated)
)


setPending(updated)

setPendingEdit(null)


}}

className="
mt-5
bg-blue-600
text-white
px-4
py-2
rounded
"

>

Update Pending

</button>



</div>

)
}
      {/* Edit Drawer */}
      {editRow && editForm && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={closeEdit} />
          <div className="fixed right-0 top-0 h-full w-[500px] bg-white shadow-2xl z-50 flex flex-col">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Editing Record</p>
                <h2 className="font-mono font-bold text-slate-800 text-lg">{editRow.field_order_no || `ID #${editRow.id}`}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Save size={14} />
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={closeEdit} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {saveError && (
              <div className="mx-5 mt-3 shrink-0 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">{saveError}</div>
            )}

            {/* Drawer Body */}
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-6">

              <PS title="Main Information">
                <PF label="Field Order No.">
                  <input value={editForm.field_order_no} onChange={e => sf('field_order_no', e.target.value)} className={iCls} />
                </PF>
                <PF label="Service Number">
                  <input value={editForm.service_number} onChange={e => sf('service_number', e.target.value)} className={iCls} />
                </PF>
                <PF label="Status Crew">
                  <select value={editForm.status_crew} onChange={e => sf('status_crew', e.target.value)} className={iCls}>
                    <option value="">— Select —</option>
                    <option>FIELD COMPL.</option>
                    <option>CANCEL</option>
                  </select>
                </PF>
                <PF label="Date Assign">
                  <input type="date" value={editForm.date_assign} onChange={e => sf('date_assign', e.target.value)} className={iCls} />
                </PF>
                <PF label="Date Executed">
                  <input type="date" value={editForm.date_executed} onChange={e => sf('date_executed', e.target.value)} className={iCls} />
                </PF>
                <PF label="Type of Meter">
                  <select value={editForm.type_of_meter} onChange={e => sf('type_of_meter', e.target.value)} className={iCls}>
                    <option value="">— Select —</option>
                    <option>2S PLAIN METER</option>
                    <option>1S PLAIN METER</option>
                    <option>3S PLAIN METER</option>
                  </select>
                </PF>
                <PF label="Job Description">
                  <select value={editForm.job_description} onChange={e => sf('job_description', e.target.value)} className={iCls}>
                    <option value="">— Select —</option>
                    <option>REPLACE</option>
                    <option>RETIRE</option>
                    <option>REMOVE</option>
                  </select>
                </PF>
                <PF label="Crew Name">
                  <input value={editForm.crew_name} onChange={e => sf('crew_name', e.target.value)} className={iCls} />
                </PF>
                <PF label="Location" span2>
                  <input value={editForm.location} onChange={e => sf('location', e.target.value)} className={iCls} />
                </PF>
                <PF label="For Check">
                  <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                    <input type="checkbox" checked={!!editForm.for_check} onChange={e => sf('for_check', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600">Checked</span>
                  </label>
                </PF>
              </PS>

              <PS title="Remove Meter">
                <PF label="Remove Meter No.">
                  <input value={editForm.remove_meter} onChange={e => sf('remove_meter', e.target.value)} className={iCls} />
                </PF>
                <PF label="R. Serial Number">
                  <input value={editForm.r_serial_number} onChange={e => sf('r_serial_number', e.target.value)} className={iCls} />
                </PF>
                <PF label="Demand Seal Aerolock">
                  <input value={editForm.demand_seal_aerolock} onChange={e => sf('demand_seal_aerolock', e.target.value)} className={iCls} />
                </PF>
                <PF label="Removed Seal">
                  <input value={editForm.removed_seal} onChange={e => sf('removed_seal', e.target.value)} className={iCls} />
                </PF>
                <PF label="Cabinet Seal (Remove)">
                  <input value={editForm.cabinet_seal_remove} onChange={e => sf('cabinet_seal_remove', e.target.value)} className={iCls} />
                </PF>
                <PF label="Reading (kWh)">
                  <input value={editForm.reading_kwh} onChange={e => sf('reading_kwh', e.target.value)} className={iCls} />
                </PF>
              </PS>

              <PS title="New Installed Meter">
                <PF label="Installed Meter No.">
                  <input value={editForm.ins_meter} onChange={e => sf('ins_meter', e.target.value)} className={iCls} />
                </PF>
                <PF label="Serial Number">
                  <input value={editForm.ins_serial_number} onChange={e => sf('ins_serial_number', e.target.value)} className={iCls} />
                </PF>
                <PF label="Demand Seal (5)">
                  <input value={editForm.demand_seal_installed} onChange={e => sf('demand_seal_installed', e.target.value)} className={iCls} />
                </PF>
                <PF label="Installed Seal (1)">
                  <input value={editForm.installed_seal} onChange={e => sf('installed_seal', e.target.value)} className={iCls} />
                </PF>
                <PF label="Cabinet Seal (2)">
                  <input value={editForm.cabinet_seal_installed} onChange={e => sf('cabinet_seal_installed', e.target.value)} className={iCls} />
                </PF>
                <PF label="TLN Tag">
                  <input value={editForm.tln_tag} onChange={e => sf('tln_tag', e.target.value)} className={iCls} />
                </PF>
                <PF label="Pole Tag">
                  <input value={editForm.pole_tag} onChange={e => sf('pole_tag', e.target.value)} className={iCls} />
                </PF>
                <PF label="Booba Number">
                  <input value={editForm.booba_number} onChange={e => sf('booba_number', e.target.value)} className={iCls} />
                </PF>
                <PF label="MDLTR No.">
                  <input value={editForm.mdltr_no} onChange={e => sf('mdltr_no', e.target.value)} className={iCls} />
                </PF>
                <PF label="Aging (days)">
                  <input type="number" value={editForm.aging} onChange={e => sf('aging', e.target.value)} className={iCls} />
                </PF>
                <PF label="Witness Date">
                  <input type="date" value={editForm.witness_date} onChange={e => sf('witness_date', e.target.value)} className={iCls} />
                </PF>
              </PS>

              <PS title="Remarks & Batch">
                <PF label="FO Type">
                  <select value={editForm.fo_type} onChange={e => sf('fo_type', e.target.value)} className={iCls}>
                    <option value="">— Select —</option>
                    <option>REPLACE</option>
                    <option>RETIRE</option>
                    <option>REMOVE</option>
                    <option>CANCEL</option>
                  </select>
                </PF>
                <PF label="Billed Amount (₱)">
                  <input type="number" step="0.01" value={editForm.billed_amount} onChange={e => sf('billed_amount', e.target.value)} className={iCls} />
                </PF>
                <PF label="For Batch">
                  <select value={editForm.for_batch} onChange={e => sf('for_batch', e.target.value)} className={iCls}>
                    <option value="">— Select —</option>
                    <option>ALREADY BATCH</option>
                  </select>
                </PF>
                <PF label="Date Returned">
                  <input type="date" value={editForm.date_returned} onChange={e => sf('date_returned', e.target.value)} className={iCls} />
                </PF>
                <PF label="Crew Payrol (₱)">
                  <input type="number" step="0.01" value={editForm.crew_payrol} onChange={e => sf('crew_payrol', e.target.value)} className={iCls} />
                </PF>
                <PF label="Percentage (%)">
                  <input value={editForm.percentage} onChange={e => sf('percentage', e.target.value)} className={iCls} />
                </PF>
                <PF label="Plus Code">
                  <input value={editForm.pluscode} onChange={e => sf('pluscode', e.target.value)} className={iCls} />
                </PF>
                <PF label="MFLT Checklist">
                  <label className="flex items-center gap-2 mt-1 cursor-pointer select-none">
                    <input type="checkbox" checked={!!editForm.mflt_checklist} onChange={e => sf('mflt_checklist', e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="text-sm text-slate-600">Checked</span>
                  </label>
                </PF>
                <PF label="Remarks" span2>
                  <textarea value={editForm.remarks} onChange={e => sf('remarks', e.target.value)} rows={3} className={`${iCls} resize-none`} />
                </PF>
              </PS>

              <div className="pt-1 border-t border-slate-100">

<button

onClick={() => {

  const localPending =
    JSON.parse(
      localStorage.getItem("pendingOrders") || "[]"
    )


  const isPending =
    localPending.some(
      item => item.id === editRow.id
    )


  if(isPending){

    const updated =
      localPending.filter(
        item => item.id !== editRow.id
      )


    localStorage.setItem(
      "pendingOrders",
      JSON.stringify(updated)
    )


    setPending(updated)

    closeEdit()

  }
  else{

    closeEdit()
    setDeleteTarget(editRow)

  }


}}

className="
w-full
px-4
py-2
border
border-red-200
text-red-600
hover:bg-red-50
rounded-lg
text-sm
font-medium
"

>

Delete this record

</button>

</div>
            </div>
          </div>
        </>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-slate-800 text-lg">Delete Record?</h3>
            <p className="text-slate-500 text-sm mt-2">
              Field order <span className="font-mono font-semibold text-slate-700">{deleteTarget.field_order_no || deleteTarget.id}</span> will be permanently deleted.
            </p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteTarget.id)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
