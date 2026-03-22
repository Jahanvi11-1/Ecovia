import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const FileTextIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
)

export default function EcoChangesReport() {
  const [ecos, setEcos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/ecos/').then((res) => setEcos(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Generating report...</div>

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header §5.2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              Engineering Reports
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
              Review comprehensive history of Engineering Change Orders and modifications
            </p>
          </div>
        </div>

        {/* Unified Table Card §5.6 */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          
          {/* Internal Header Label §5.5 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
             <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
               Change Order History
             </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={tableHeaderStyle}>ECO Title</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>Impacted Product</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ecos.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No change orders found.</td>
                </tr>
              ) : (
                ecos.map((e, idx) => (
                  <tr 
                    key={e.eco_id}
                    style={{ 
                      borderBottom: idx === ecos.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tableCellStyle, fontWeight: 600 }}>{e.title}</td>
                    <td style={tableCellStyle}>
                      <TypePill type={e.eco_type} />
                    </td>
                    <td style={{ ...tableCellStyle, color: 'var(--text-secondary)' }}>
                      {e.target_product?.product_code || e.target_product_id || '—'}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                      <button
                        onClick={() => navigate(`/ecos/${e.eco_id}#eco-diff`)}
                        style={{
                          background: 'var(--surface)',
                          color: 'var(--text-primary)',
                          fontSize: 12,
                          fontWeight: 500,
                          height: 30,
                          padding: '0 12px',
                          borderRadius: 8,
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
                      >
                        <FileTextIcon /> View Changes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
          Total Change Records: {ecos.length}
        </p>
      </main>
    </div>
  )
}

/**
 * Reusable ECO Type Pill §5.8
 */
function TypePill({ type }) {
  const isBom = type === 'BoM' || type === 'Bill of Materials';
  const cfg = {
    label: isBom ? 'BoM' : 'Product',
    bg: isBom ? 'var(--type-bom-bg)' : 'var(--type-product-bg)',
    text: isBom ? 'var(--type-bom-text)' : 'var(--type-product-text)',
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 9px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.text,
      fontSize: 11,
      fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  )
}

// Internal table styles §5.6
const tableHeaderStyle = {
  padding: '11px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tableCellStyle = {
  padding: '11px 16px',
  fontSize: 13,
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
}