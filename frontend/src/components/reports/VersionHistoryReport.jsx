import React, { useEffect, useState } from 'react'
import api from '../../api/client'

export default function VersionHistoryReport() {
  const [data, setData] = useState({ product_versions: [], bom_versions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/version-history').then((res) => setData(res.data)).finally(() => setLoading(false))
  }, [])

  // Header and Cell styles §5.6
  const tableHeaderStyle = {
    padding: '9px 16px',
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

  if (loading) return (
    <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>
      Loading history...
    </div>
  )

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header §5.2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              Version History
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
              Audit trail for all Product and BoM revision cycles
            </p>
          </div>
        </div>

        {/* Product Versions Table §5.6 */}
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.3px' }}>
            Product Versions
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Revision</th>
                  <th style={tableHeaderStyle}>Identity</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Latest</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Released</th>
                </tr>
              </thead>
              <tbody>
                {data.product_versions.length === 0 ? (
                  <tr><td colSpan={6} style={{ ...tableCellStyle, textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No product versions logged</td></tr>
                ) : (
                  data.product_versions.map((v, idx) => (
                    <tr 
                      key={v.version_id} 
                      style={{ 
                        borderBottom: idx === data.product_versions.length - 1 ? 'none' : '1px solid #f1f5f9',
                        opacity: v.status === 'Archived' ? 0.65 : 1,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tableCellStyle, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{v.product_id}</td>
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>v{v.version_number}</td>
                      <td style={tableCellStyle}>{v.product_name}</td>
                      <td style={tableCellStyle}><StatusPill status={v.status} /></td>
                      <td style={tableCellStyle}>
                        {v.is_latest && (
                          <span style={{ color: 'var(--status-done-text)', fontWeight: 700 }}>✓</span>
                        )}
                      </td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* BoM Versions Table §5.6 */}
        <div style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.3px' }}>
            BoM Versions
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <th style={tableHeaderStyle}>BoM ID</th>
                  <th style={tableHeaderStyle}>Finished Product</th>
                  <th style={tableHeaderStyle}>Revision</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Released</th>
                </tr>
              </thead>
              <tbody>
                {data.bom_versions.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...tableCellStyle, textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No BoM versions logged</td></tr>
                ) : (
                  data.bom_versions.map((b, idx) => (
                    <tr 
                      key={b.bom_id}
                      style={{ 
                        borderBottom: idx === data.bom_versions.length - 1 ? 'none' : '1px solid #f1f5f9',
                        opacity: b.status === 'Archived' ? 0.65 : 1,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...tableCellStyle, color: 'var(--text-muted)', fontFamily: 'monospace' }}>#{b.bom_id}</td>
                      <td style={tableCellStyle}>{b.product_name || `Version ${b.product_version_id}`}</td>
                      <td style={{ ...tableCellStyle, fontWeight: 600 }}>v{b.bom_version}</td>
                      <td style={tableCellStyle}><StatusPill status={b.status} /></td>
                      <td style={{ ...tableCellStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                        {b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Reusable Status Pill Pattern §5.7
 */
function StatusPill({ status }) {
  const isActive = status === 'Active'
  const cfg = {
    bg: isActive ? 'var(--status-done-bg)' : 'var(--bg-muted)',
    text: isActive ? 'var(--status-done-text)' : 'var(--text-secondary)',
    dot: isActive ? 'var(--status-done-dot)' : 'var(--text-muted)',
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '3px 10px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.text,
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
      {status}
    </span>
  )
}