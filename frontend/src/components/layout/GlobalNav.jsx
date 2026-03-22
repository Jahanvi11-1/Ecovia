import { useNavigate, useLocation } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
)
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
)
const KanbanIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)

const PAGE_TITLES = {
  '/ecos': "Engineering Change Orders (ECO's)",
  '/products': 'Products',
  '/boms': 'Bills of Materials',
  '/reports/eco-changes': 'Reporting',
  '/reports/audit-logs': 'Audit Logs',
  '/reports/version-history': 'Version History',
  '/settings/stages': "ECO's Stages",
  '/settings/approval-rules': 'Approvals',
}

export default function GlobalNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { viewMode, searchQuery, setSidebarOpen, setViewMode, setSearchQuery } = useUiStore()
  const user = useAuthStore((s) => s.user)

  const isEcoList = location.pathname === '/ecos'
  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || "Engineering Change Orders (ECO's)"

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      height: 56,
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Sidebar Trigger */}
      <button
        onClick={() => setSidebarOpen(true)}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          flexShrink: 0
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
      >
        <MenuIcon />
      </button>

      {/* Page Title */}
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.3px',
          flexShrink: 0,
          cursor: 'pointer',
          userSelect: 'none'
        }}
        onClick={() => navigate('/ecos')}
      >
        {title}
      </span>

      {/* Contextual ECO Controls */}
      {isEcoList && (
        <>
          <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
          
          <button
            onClick={() => navigate('/ecos/new')}
            style={{
              background: 'var(--punch-red)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              height: 34,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0
            }}
          >
            <PlusIcon /> New ECO
          </button>

          {/* Standard Search Pattern */}
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <span style={{ 
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', 
              color: 'var(--text-muted)', pointerEvents: 'none', display: 'flex' 
            }}>
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Search ECOs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: 34,
                padding: '0 12px 0 32px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                width: '100%',
                outline: 'none',
              }}
            />
          </div>

          {/* View Toggle Pattern */}
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                background: viewMode === 'list' ? 'var(--oxford-navy)' : 'var(--surface)',
                color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)',
                borderRight: '1px solid var(--border)'
              }}
            >
              <ListIcon />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                background: viewMode === 'kanban' ? 'var(--oxford-navy)' : 'var(--surface)',
                color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <KanbanIcon />
            </button>
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* Profile Trigger */}
      <button
        onClick={() => navigate('/profile')}
        style={{
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--oxford-navy)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          boxShadow: '0 2px 4px rgba(29,53,87,0.1)'
        }}
        title={user?.login_id || 'Profile'}
      >
        {user?.login_id?.[0]?.toUpperCase() || 'U'}
      </button>
    </nav>
  )
}