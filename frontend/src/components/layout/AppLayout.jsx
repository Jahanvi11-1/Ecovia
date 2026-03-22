import { Outlet } from 'react-router-dom'
import GlobalNav from './GlobalNav'
import ProfilePanel from './ProfilePanel'
import MasterMenuSidebar from './MasterMenuSidebar'

export default function AppLayout() {
  return (
    <div style={{ 
      background: 'var(--bg-page)', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Global Navigation (Topbar) - Fixed at 56px height */}
      <GlobalNav />
      
      {/* Slide-in Overlays */}
      <ProfilePanel />
      
      {/* Sidebar - Positioned via internal logic or fixed at 260px */}
      <MasterMenuSidebar />
      
      {/* Main Content Area */}
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '28px 32px',
        width: '100%',
        flex: 1 
      }}>
        {/* Rendered Page Content */}
        <Outlet />
      </main>

      {/* Global Transition Overlay (Optional Backdrop logic usually lives in ProfilePanel) */}
    </div>
  )
}