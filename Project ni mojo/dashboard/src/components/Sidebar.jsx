import { NavLink } from 'react-router-dom'
import { ClipboardList, Clock } from 'lucide-react'
import logo from '../assets/mb-logo.jpg'

const navItems = [
  
  { to: '/field-orders', icon: ClipboardList, label: 'Field Orders' },
  { to: '/pending-records', icon: Clock, label: 'Pending Records' },
]

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-30 flex min-h-screen w-64 flex-col bg-[#2E2E2E] text-white shadow-xl">

      {/* Gold Accent */}
      <div className="h-2 bg-[#D89B00]" />

      {/* Logo */}
      <div className="flex flex-col items-center border-b border-[#444] px-6 py-6">

        <img
          src={logo}
          alt="MB Development"
          className="mb-4 h-20 w-20 rounded-xl object-cover shadow-lg"
        />

        <h1 className="text-center text-lg font-bold tracking-wide">
          MB Development
        </h1>

        <p className="mt-1 text-center text-xs text-gray-400">
          Field Order Management
        </p>

      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-5">

        <div className="space-y-2">

          {navItems.map(({ to, icon: Icon, label }) => (

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

              {label}

            </NavLink>

          ))}

        </div>

      </nav>

      {/* Footer */}

      <div className="border-t border-[#444] px-5 py-4">

        <p className="text-xs text-gray-400">
          MB Development Corporation
        </p>

        <p className="mt-1 text-[11px] text-gray-500">
          Field Order System v1.0
        </p>

      </div>

    </aside>
  )
}