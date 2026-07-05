import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, Zap, Clock } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/field-orders', icon: ClipboardList, label: 'Field Orders' },
  { to: '/pending-records', icon: Clock, label: 'Pending Records' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col fixed top-0 left-0 z-30">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="bg-blue-500 rounded-lg p-2">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-sm leading-none">Meter Works</p>
          <p className="text-slate-400 text-xs mt-0.5">Field Order System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs">Field Order Management v1.0</p>
      </div>
    </aside>
  )
}
