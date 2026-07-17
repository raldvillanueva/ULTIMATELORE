import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, ClipboardList, Clock, Archive, ShieldAlert, LogOut, Eye } from 'lucide-react'
import logo from '../assets/mb-logo.jpg'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Sidebar() {
  const { role, profile, session } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)
  const [deletionCount, setDeletionCount] = useState(0)
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  useEffect(() => {
    async function fetchPendingCount() {
      const { count } = await supabase.from('pending_orders').select('id', { count: 'exact', head: true })
      setPendingCount(count || 0)
    }
    fetchPendingCount()
    const channel = supabase
      .channel('sidebar_pending_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pending_orders' }, fetchPendingCount)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  useEffect(() => {
    if (role !== 'admin') { setDeletionCount(0); return }
    async function fetchDeletionCount() {
      const { count } = await supabase
        .from('deletion_requests')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
      setDeletionCount(count || 0)
    }
    fetchDeletionCount()
    const channel = supabase
      .channel('sidebar_deletion_count')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'deletion_requests' }, fetchDeletionCount)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [role])

  const navItems = [
    { to: '/summary', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/field-orders', icon: ClipboardList, label: 'Field Orders' },
    { to: '/pending-records', icon: Clock, label: 'Pending Records', badge: pendingCount },
    { to: '/new-work-orders', icon: ClipboardList, label: 'New Work Orders' },
    { to: '/archived-work-orders', icon: Archive, label: 'Archived Work Orders' },
    ...(role === 'admin'
      ? [{ to: '/deletion-requests', icon: ShieldAlert, label: 'Deletion Requests', badge: deletionCount }]
      : []),
  ]

  return (
    <aside className="fixed left-0 top-0 z-30 flex min-h-screen w-64 flex-col bg-[#2E2E2E] text-white shadow-xl">

      {/* Gold Accent */}
      <div className="h-2 bg-[#D89B00]" />

      {/* View-Only Indicator (staff only) */}
      {role === 'staff' && (
        <div className="flex items-center justify-center gap-2 bg-amber-500 px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#2E2E2E]">
          <Eye size={14} />
          View-Only Mode
        </div>
      )}

      {/* Logo */}
      <div className="flex flex-col items-center border-b border-[#444] px-6 py-6">

        <img
          src={logo}
          alt="MB Development"
          className="mb-4 h-20 w-20 rounded-xl object-cover shadow-lg"
        />

        <h1 className="text-center text-lg font-bold tracking-wide">
          Field Order Management
        </h1>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5">

        <div className="space-y-2">

          {navItems.map(({ to, icon: Icon, label, badge }) => (

            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#D89B00] text-white shadow-md'
                    : 'text-gray-300 hover:bg-[#3C3C3C] hover:text-white'
                }`
              }
            >

              <Icon size={19} />

              <span className="flex-1">{label}</span>

              {!!badge && (
                <span className="ml-auto min-w-[18px] rounded-full bg-red-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}

            </NavLink>

          ))}

        </div>

      </nav>

      {/* Footer */}

      <div className="border-t border-[#444] px-5 py-4">

        <p className="truncate text-xs text-gray-300" title={profile?.full_name || session?.user?.email}>
          {profile?.full_name || session?.user?.email}
        </p>

        <span
          className={`mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
            role === 'admin' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-[#2E2E2E]'
          }`}
        >
          {role}
        </span>

        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[#3C3C3C] hover:text-white disabled:opacity-60"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign Out'}
        </button>

        <p className="mt-3 text-[11px] text-gray-500">
          MB Development Corporation
        </p>

      </div>

    </aside>
  )
}
