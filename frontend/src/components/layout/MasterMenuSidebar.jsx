import { useLocation, useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons with dark strokes for light background
const CloseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const ChevronRight = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6"></path>
  </svg>
)

function NavItem({ to, children, onClick }) {
  const navigate = useNavigate()
  const location = useLocation()
  const active = location.pathname.startsWith(to)

  return (
    <button
      onClick={() => { navigate(to); onClick?.() }}
      style={{
        width: 'calc(100% - 16px)',
        margin: '1px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 12px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        fontSize: '12.5px',
        fontWeight: active ? 600 : 500,
        textAlign: 'left',
        position: 'relative',
        background: active ? 'var(--bg-muted)' : 'transparent',
        color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
        fontFamily: 'inherit',
        transition: 'all 0.15s ease'
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-subtle)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {/* Active Indicator Bar */}
      {active && (
        <span style={{
          position: 'absolute', left: 0, top: '50%',
          transform: 'translateY(-50%)',
          width: '3px', height: '18px',
          background: 'var(--punch-red)',
          borderRadius: '0 2px 2px 0',
        }}/>
      )}

      <span style={{ flex: 1 }}>{children}</span>
      
      <span style={{ opacity: active ? 0.6 : 0.25, display: 'flex' }}>
        <ChevronRight />
      </span>
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{
        padding: '20px 14px 6px',
        fontSize: '9.5px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
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
        <div 
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(29,53,87,0.2)',
            backdropFilter: 'blur(2px)',
          }} 
        />
      )}

      {/* Light Sidebar Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100%',
          width: '260px',
          background: 'var(--surface)',
          boxShadow: '4px 0 24px rgba(29,53,87,0.1)',
          zIndex: 50,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '16px 20px', 
          borderBottom: '1px solid var(--border)' 
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
            MASTER MENU
          </span>
          <button 
            onClick={close} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation Area */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingTop: '8px' }}>
          
          <NavItem to="/ecos" onClick={close}>Change Orders (ECO)</NavItem>

          <Section title="Master Data">
            <NavItem to="/boms" onClick={close}>Bill of Materials</NavItem>
            <NavItem to="/products" onClick={close}>Product Catalog</NavItem>
          </Section>

          <Section title="Reporting">
            <NavItem to="/reports/audit-logs" onClick={close}>Audit Logs</NavItem>
            <NavItem to="/reports/version-history" onClick={close}>Version History</NavItem>
          </Section>

          <Section title="System">
            <NavItem to="/settings/stages" onClick={close}>Lifecycle Stages</NavItem>
            {isAdmin && <NavItem to="/settings/approval-rules" onClick={close}>Approval Rules</NavItem>}
          </Section>
        </div>
      </div>
    </>
  )
}