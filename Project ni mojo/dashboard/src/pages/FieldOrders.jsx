import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'

const PAGE_SIZE = 15

const STATUS_OPTIONS = ['All', 'FIELD COMPL.', 'CANCEL']
const FO_TYPE_OPTIONS = ['All', 'REPLACE', 'RETIRE', 'REMOVE', 'CANCEL']
const BATCH_OPTIONS = ['All', 'ALREADY BATCH', 'NOT BATCHED']

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
  const navigate = useNavigate()

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from('field_orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (search) {
      query = query.or(
        `field_order_no.ilike.%${search}%,service_number.ilike.%${search}%,crew_name.ilike.%${search}%,location.ilike.%${search}%,remove_meter.ilike.%${search}%,ins_meter.ilike.%${search}%`
      )
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'FIELD COMPL.') {
        query = query.ilike('status_crew', '%FIELD%')
      } else {
        query = query.ilike('status_crew', statusFilter)
      }
    }

    if (foTypeFilter !== 'All') {
      query = query.ilike('fo_type', foTypeFilter)
    }

    if (batchFilter === 'ALREADY BATCH') {
      query = query.ilike('for_batch', '%ALREADY%')
    } else if (batchFilter === 'NOT BATCHED') {
      query = query.is('for_batch', null).or('for_batch.not.ilike.%ALREADY%', { referencedTable: 'field_orders' })
    }

    const { data, count, error } = await query
    if (!error) {
      setRecords(data)
      setTotal(count)
    }
    setLoading(false)
  }, [page, search, statusFilter, foTypeFilter, batchFilter])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  useEffect(() => { setPage(0) }, [search, statusFilter, foTypeFilter, batchFilter])

  async function handleDelete(id) {
    const { error } = await supabase.from('field_orders').delete().eq('id', id)
    if (!error) {
      setDeleteTarget(null)
      fetchRecords()
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Field Orders</h1>
          <p className="text-slate-500 text-sm mt-1">{total.toLocaleString()} total records</p>
        </div>
        <button
          onClick={() => navigate('/field-orders/add')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Record
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
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

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {STATUS_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          <select
            value={foTypeFilter}
            onChange={e => setFoTypeFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {FO_TYPE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          <select
            value={batchFilter}
            onChange={e => setBatchFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {BATCH_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide border-b border-slate-200">
                <th className="px-4 py-3 text-left font-medium">Field Order</th>
                <th className="px-4 py-3 text-left font-medium">Service No.</th>
                <th className="px-4 py-3 text-left font-medium">Date Assign</th>
                <th className="px-4 py-3 text-left font-medium">Date Executed</th>
                <th className="px-4 py-3 text-left font-medium">Crew</th>
                <th className="px-4 py-3 text-left font-medium">Location</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">FO Type</th>
                <th className="px-4 py-3 text-left font-medium">Billed</th>
                <th className="px-4 py-3 text-left font-medium">Batch</th>
                <th className="px-4 py-3 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-slate-400">
                    No records found.
                  </td>
                </tr>
              ) : (
                records.map(row => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-700 whitespace-nowrap">{row.field_order_no || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.service_number || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.date_assign || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.date_executed || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.crew_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{row.location || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={row.status_crew} /></td>
                    <td className="px-4 py-3"><FoTypeBadge type={row.fo_type} /></td>
                    <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                      {row.billed_amount != null ? `₱${parseFloat(row.billed_amount).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {row.for_batch?.toUpperCase().includes('ALREADY') ? (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700">Batched</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/field-orders/edit/${row.id}`)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(row)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-slate-800 text-lg">Delete Record?</h3>
            <p className="text-slate-500 text-sm mt-2">
              Are you sure you want to delete field order{' '}
              <span className="font-mono font-semibold text-slate-700">{deleteTarget.field_order_no || deleteTarget.id}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget.id)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
