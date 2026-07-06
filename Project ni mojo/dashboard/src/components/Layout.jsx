import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F4F4F4]">
      <Sidebar />
      <main className="ml-64 flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
