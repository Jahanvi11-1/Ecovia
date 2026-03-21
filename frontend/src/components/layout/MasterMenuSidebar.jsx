import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

function NavItem({ to, children, onClick }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { navigate(to); onClick?.() }}
      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 border-b border-gray-100 transition"
    >
      {children}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-200">
        {title}
      </div>
      {children}
    </div>
  )
}

export default function MasterMenuSidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'Admin'
  const close = () => setSidebarOpen(false)

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={close} />
      )}

      {/* Drawer — slides from LEFT */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <span className="font-semibold text-gray-800 text-sm">Master Menu</span>
          <button onClick={close} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="overflow-y-auto h-[calc(100%-52px)]">
          {/* ECOs */}
          <NavItem to="/ecos" onClick={close}>Engineering Change Orders (ECO's)</NavItem>

          {/* Master Data */}
          <Section title="Master Data">
            <NavItem to="/boms" onClick={close}>Bill of Materials</NavItem>
            <NavItem to="/products" onClick={close}>Product</NavItem>
          </Section>

          {/* Reporting */}
          <Section title="Reporting">
            <NavItem to="/reports/eco-changes" onClick={close}>Engineering Change Orders</NavItem>
            <NavItem to="/reports/audit-logs" onClick={close}>Audit Logs</NavItem>
            <NavItem to="/reports/version-history" onClick={close}>Version History</NavItem>
          </Section>

          {/* Settings */}
          <Section title="Settings">
            <NavItem to="/settings/stages" onClick={close}>ECO's Stages</NavItem>
            {isAdmin && <NavItem to="/settings/approval-rules" onClick={close}>Approvals</NavItem>}
          </Section>
        </div>
      </div>
    </>
  )
}
