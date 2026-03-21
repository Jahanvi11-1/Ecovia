import { Outlet } from 'react-router-dom'
import GlobalNav from './GlobalNav'
import ProfilePanel from './ProfilePanel'
import MasterMenuSidebar from './MasterMenuSidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNav />
      <ProfilePanel />
      <MasterMenuSidebar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
