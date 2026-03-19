import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f3f4f6]">
      {/* Sidebar — fixed, never scrolls */}
      <Sidebar />

      {/* Main content — scrolls independently */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-8">
          <Outlet />
        </main>
        <footer className="py-3 px-8 text-center text-[12px] text-gray-400 border-t border-gray-200 bg-white shrink-0">
          © GSWMI Logistics Team
        </footer>
      </div>
    </div>
  )
}