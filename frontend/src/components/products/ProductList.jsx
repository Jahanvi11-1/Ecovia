import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons §1.4/5.12
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

export default function ProductList() {
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // default view §5.12
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const pageSize = 50
  const navigate = useNavigate()

  useEffect(() => {
    fetchProducts()
  }, [currentPage, search])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: pageSize,
      })
      const response = await api.get(`/products/?${params}`)
      setProducts(response.data.items)
      setTotalCount(response.data.total)
      setTotalPages(response.data.pages)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    if (!search) return true
    const name = p.active_version?.product_name || ''
    return name.toLowerCase().includes(search.toLowerCase())
  })

  // Kanban Grouping Logic §5.5 (Stat Cards pattern applied to columns)
  const activeProducts = filtered.filter(p => p.active_version?.status === 'Active')
  const archivedProducts = filtered.filter(p => p.active_version?.status !== 'Active') // assuming everything else is archived/draft

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Loading master data...</div>

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* SINGLE UNIFIED CARD §5.5 & §5.12 Pattern */}
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 12, 
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          
          {/* TOPBAR / HEADER SECTION (Sticky §5.12) */}
          <div style={{ 
            padding: '14px 20px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 16, 
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface)',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.3px', flexShrink: 0 }}>
              Product Master
            </span>

            <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

            {/* Search Input §5.4 */}
            <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', pointerEvents: 'none' }}>
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder="Search products..."
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

            {/* View Toggle Layout §5.12 */}
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
              onClick={() => navigate('/products/new')}
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
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--punch-red-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--punch-red)'}
            >
              <PlusIcon /> New Product
            </button>
          </div>

          {/* CONTENT SECTION (Switches view mode) */}
          {viewMode === 'list' ? (
            /* TABLE VIEW §5.6 */
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product Identity</th>
                  <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revision</th>
                  <th style={{ padding: '9px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lifecycle Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No matching products found.</td>
                  </tr>
                ) : (
                  filtered.map((p, idx) => (
                    <tr 
                      key={p.product_id} 
                      onClick={() => navigate(`/products/${p.product_id}`)}
                      style={{ 
                        borderBottom: idx === filtered.length - 1 ? 'none' : '1px solid #f1f5f9', 
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.active_version?.product_name || p.product_code}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                        {p.active_version ? `v${p.active_version.version_number}` : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                        <StatusPill status={p.active_version?.status || 'No Version'} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* KANBAN VIEW §5.5 (Grid layout) */
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: 20, 
              padding: '24px',
              background: 'var(--bg-subtle)' // Subtle background for kanban lanes
            }}>
              
              {/* Active Column (Using Status Green §5.7) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ 
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--status-done-text)', background: 'var(--status-done-bg)',
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-done-dot)' }} />
                  Active Products ({activeProducts.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {activeProducts.map(p => (
                    <ProductKanbanCard key={p.product_id} product={p} onClick={() => navigate(`/products/${p.product_id}`)} />
                  ))}
                  {activeProducts.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 20 }}>No active products.</p>}
                </div>
              </div>

              {/* Archived/Other Column (Using Status Muted §5.7) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ 
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
                  color: 'var(--text-secondary)', background: 'var(--bg-muted)',
                  padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)' }} />
                  Archived / Draft ({archivedProducts.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {archivedProducts.map(p => (
                    <ProductKanbanCard key={p.product_id} product={p} onClick={() => navigate(`/products/${p.product_id}`)} />
                  ))}
                  {archivedProducts.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', paddingTop: 20 }}>No archived items.</p>}
                </div>
              </div>

            </div>
          )}

        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: 8, 
            marginTop: 20,
            padding: '12px 0'
          }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: currentPage === 1 ? 'var(--bg-muted)' : 'var(--surface)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: 13,
              }}
            >
              Previous
            </button>
            
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid var(--border)',
                borderRadius: 6,
                background: currentPage === totalPages ? 'var(--bg-muted)' : 'var(--surface)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: 13,
              }}
            >
              Next
            </button>
          </div>
        )}
        
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          Showing {products.length} of {totalCount} products
        </p>
      </main>
    </div>
  )
}

/** * Product Kanban Card Pattern §5.5 (Stat/Kanban Card Variant)
 */
function ProductKanbanCard({ product, onClick }) {
  const v = product.active_version
  return (
    <div 
      onClick={onClick}
      style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border)', 
        borderRadius: 10, 
        padding: 16, 
        cursor: 'pointer', 
        transition: 'all 0.15s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(69,123,157,0.08)';
        e.currentTarget.style.borderColor = 'var(--cerulean-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
    >
      {/* Decorative colored bar at bottom per §5.5 */}
      <div style={{ 
        position: 'absolute', bottom: 0, left: 0, width: '100%', height: 3, 
        background: v?.status === 'Active' ? 'var(--status-done-dot)' : 'var(--text-muted)' 
      }} />

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'monospace' }}>
        {product.product_code}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
        {v?.product_name || product.product_code}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: 4 }}>
          {v ? `Rev ${v.version_number}` : 'No Rev'}
        </span>
        <StatusPill status={v?.status || 'No Version'} compact />
      </div>
    </div>
  )
}

/** * Reusable Status Pill §5.7 
 */
function StatusPill({ status, compact = false }) {
  const isActive = status === 'Active'
  
  // Custom config mapping based on status §5.7
  const cfg = isActive 
    ? { dot:'var(--status-done-dot)', text:'var(--status-done-text)', bg:'var(--status-done-bg)' }
    : { dot:'var(--text-muted)', text:'var(--text-secondary)', bg:'var(--bg-muted)' }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: compact ? '2px 8px' : '3px 10px',
      borderRadius: 20, 
      background: cfg.bg,
      color: cfg.text,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap'
    }}>
      <span style={{ 
        width: compact ? 5 : 6, 
        height: compact ? 5 : 6, 
        borderRadius: '50%', 
        background: cfg.dot,
        flexShrink: 0
      }} />
      {status}
    </span>
  )
}