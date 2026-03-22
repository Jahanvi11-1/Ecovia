import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
)
const PlusIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
)
const KanbanIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
)

export default function BomList() {
  const [boms, setBoms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list')
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/boms/').then((res) => setBoms(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = boms.filter((b) => {
    const q = search.toLowerCase()
    return !search || 
      (b.product_name || '').toLowerCase().includes(q) || 
      (b.reference || '').toLowerCase().includes(q)
  })

  // Grouping for Kanban columns
  const activeBoms = filtered.filter(b => b.status === 'Active')
  const archivedBoms = filtered.filter(b => b.status === 'Archived')

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Loading...</div>

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* SINGLE UNIFIED CARD */}
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 12, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* HEADER SECTION (Inside the card) */}
          <div style={{ 
            padding: '14px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)' 
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px', flexShrink: 0 }}>
              Bills of Materials
            </span>

            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search BOMs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  height: 36,
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

            <div style={{ flex: 1 }} />

            {/* View Toggles */}
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button 
                onClick={() => setViewMode('list')}
                style={{ 
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', 
                  background: viewMode === 'list' ? 'var(--oxford-navy)' : 'var(--surface)', 
                  color: viewMode === 'list' ? '#ffffff' : 'var(--text-secondary)', cursor: 'pointer' 
                }}
              >
                <ListIcon />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                style={{ 
                  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderLeft: '1px solid var(--border)', 
                  background: viewMode === 'kanban' ? 'var(--oxford-navy)' : 'var(--surface)', 
                  color: viewMode === 'kanban' ? '#ffffff' : 'var(--text-secondary)', cursor: 'pointer' 
                }}
              >
                <KanbanIcon />
              </button>
            </div>

            <button
              onClick={() => navigate('/boms/new')}
              style={{
                background: 'var(--punch-red)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                height: 36,
                padding: '0 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <PlusIcon /> New BOM
            </button>
          </div>

          {/* CONTENT SECTION (Directly follows header) */}
          <div style={{ padding: viewMode === 'kanban' ? '20px' : '0' }}>
            {viewMode === 'list' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Finished Product</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reference</th>
                    <th style={{ padding: '9px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, idx) => (
                    <tr key={b.bom_id} onClick={() => navigate(`/boms/${b.bom_id}`)}
                      style={{ borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid var(--bg-muted)', cursor: 'pointer' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{b.product_name}</td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{b.reference}</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                        <StatusPill status={b.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              /* KANBAN VIEW BY STATUS */
              <div style={{ display: 'flex', gap: 20 }}>
                {/* Active Column */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-done-dot)' }} />
                    Active ({activeBoms.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {activeBoms.map(b => <BomKanbanCard key={b.bom_id} bom={b} onClick={() => navigate(`/boms/${b.bom_id}`)} />)}
                  </div>
                </div>

                {/* Archived Column */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 12, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                    Archived ({archivedBoms.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {archivedBoms.map(b => <BomKanbanCard key={b.bom_id} bom={b} onClick={() => navigate(`/boms/${b.bom_id}`)} />)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>Showing {filtered.length} of {boms.length} Bills of Materials</p>
      </main>
    </div>
  )
}

// Sub-component for Status Pills
function StatusPill({ status }) {
  const isActive = status === 'Active'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 20, 
      background: isActive ? 'var(--status-done-bg)' : 'var(--bg-muted)',
      color: isActive ? 'var(--status-done-text)' : 'var(--text-secondary)',
      fontSize: 11,
      fontWeight: 600,
      border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: isActive ? 'var(--status-done-dot)' : 'var(--text-muted)' }} />
      {status}
    </span>
  )
}

// Sub-component for Kanban Cards
// Sub-component for Kanban Cards
function BomKanbanCard({ bom, onClick }) {
  return (
    <div 
      onClick={onClick}
      style={{ 
        background: 'var(--bg-subtle)', 
        border: '1px solid var(--border)', 
        borderRadius: 10, 
        padding: 14, 
        cursor: 'pointer', 
        transition: 'all 0.15s ease' 
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,53,87,0.06)';
        e.currentTarget.style.borderColor = 'var(--cerulean-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'monospace' }}>
        {bom.reference}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
        {bom.product_name}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>V{bom.bom_version}</span>
        <StatusPill status={bom.status} />
      </div>
    </div>
  )
}