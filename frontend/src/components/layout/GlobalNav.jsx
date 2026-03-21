import { useNavigate, useLocation } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

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

  // Determine page title
  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || "Engineering Change Orders (ECO's)"

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-30">
      {/* Hamburger — opens Master Menu from left */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="flex flex-col gap-1 p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
        aria-label="Open menu"
      >
        <span className="block w-5 h-0.5 bg-gray-700" />
        <span className="block w-5 h-0.5 bg-gray-700" />
        <span className="block w-5 h-0.5 bg-gray-700" />
      </button>

      {/* Page title */}
      <span
        className="font-semibold text-gray-800 text-base cursor-pointer select-none flex-shrink-0"
        onClick={() => navigate('/ecos')}
      >
        {title}
      </span>

      {/* ECO list controls: New button + search + view toggles */}
      {isEcoList && (
        <>
          <button
            onClick={() => navigate('/ecos/new')}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition flex-shrink-0"
          >
            New
          </button>

          <div className="flex-1 max-w-sm">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* List / Kanban toggle icons */}
          <div className="flex border border-gray-300 rounded overflow-hidden text-xs flex-shrink-0">
            <button
              onClick={() => setViewMode('list')}
              title="List view"
              className={`px-2.5 py-1.5 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              ☰
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              title="Kanban view"
              className={`px-2.5 py-1.5 ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              ⊞
            </button>
          </div>
        </>
      )}

      <div className="flex-1" />

      {/* User login icon */}
      <button
        onClick={() => navigate('/profile')}
        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm hover:bg-blue-700 transition flex-shrink-0"
        aria-label="User profile"
        title={user?.login_id || 'Profile'}
      >
        {user?.login_id?.[0]?.toUpperCase() || 'U'}
      </button>
    </nav>
  )
}
