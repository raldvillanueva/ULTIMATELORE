import { useCallback, useEffect, useState } from 'react'
import { ArchiveRestore, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ArchivedWorkOrders() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    setError('')
    let query = supabase
      .from('field_orders')
      .select('*')
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })

    if (search) {
      query = query.or(`field_order_no.ilike.%${search}%,service_number.ilike.%${search}%,crew_name.ilike.%${search}%,ins_meter.ilike.%${search}%`)
    }

    const { data, error: fetchError } = await query
    if (fetchError) {
      setError('We could not load archived work orders. Please try again.')
    } else {
      setRecords(data || [])
    }
    setLoading(false)
  }, [search])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  async function restoreRecord(id) {
    const { error: restoreError } = await supabase
      .from('field_orders')
      .update({ archived_at: null })
      .eq('id', id)

    if (restoreError) {
      setError('We could not restore this work order. Please try again.')
      return
    }
    fetchRecords()
    
  }
    
  return (
    <div className="flex h-[calc(100vh-64px)] flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Archived Work Orders</h1>
        <p className="mt-0.5 text-sm text-slate-500">Completed work orders kept for reference.</p>
      </div>

      <div className="relative shrink-0">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search FO#, service no., crew, or meter..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-800 text-xs text-slate-300">
            <tr>
              <th className="px-4 py-3 text-left font-medium">FIELD ORDER</th>
              <th className="px-4 py-3 text-left font-medium">INSTALLED METER</th>
              <th className="px-4 py-3 text-left font-medium">CREW NAME</th>
              <th className="px-4 py-3 text-left font-medium">SERVICE NUMBER</th>
              <th className="px-4 py-3 text-left font-medium">ARCHIVED ON</th>
              <th className="px-4 py-3 text-right font-medium">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">Loading archived work orders...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center text-slate-400">No archived work orders.</td></tr>
            ) : records.map(record => (
              <tr key={record.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-blue-600">{record.field_order_no || '—'}</td>
                <td className="px-4 py-3">{record.ins_meter || '—'}</td>
                <td className="px-4 py-3">{record.crew_name || '—'}</td>
                <td className="px-4 py-3">{record.service_number || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{record.archived_at ? new Date(record.archived_at).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => restoreRecord(record.id)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700">
                    <ArchiveRestore size={14} /> Restore
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
