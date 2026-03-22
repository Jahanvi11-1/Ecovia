import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useUiStore from '../../store/uiStore'
import EcoKanban from './EcoKanban'

// Standardized Stage Pill Pattern for ECOs
function StageBadge({ status }) {
  const configs = {
    Applied: { bg: 'var(--status-done-bg)', text: 'var(--status-done-text)', dot: 'var(--status-done-dot)' },
    Open: { bg: 'var(--status-new-bg)', text: 'var(--status-new-text)', dot: 'var(--status-new-dot)' },
    Validated: { bg: 'var(--status-validate-bg)', text: 'var(--status-validate-text)', dot: 'var(--status-validate-dot)' },
    Rejected: { bg: 'var(--status-applied-bg)', text: 'var(--status-applied-text)', dot: 'var(--status-applied-dot)' },
  }
  const cfg = configs[status] || configs['Open']

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
      whiteSpace: 'nowrap'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }}/>
      {status}
    </span>
  )
}

export default function EcoList() {
  const navigate = useNavigate()
  const { viewMode, searchQuery } = useUiStore()
  const [ecos, setEcos] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ecos/').then((res) => setEcos(res.data)).finally(() => setLoading(false))
    api.get('/settings/stages').then((res) => setStages(res.data)).catch(() => {})
  }, [])

  const filtered = ecos.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.title?.toLowerCase().includes(q) ||
      e.eco_type?.toLowerCase().includes(q) ||
      e.status?.toLowerCase().includes(q)
    )
  })

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Loading change orders...</div>

  if (viewMode === 'kanban') {
    return <EcoKanban ecos={filtered} stages={stages} />
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Title
            </th>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Type
            </th>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Target Product
            </th>
            <th style={{ padding: '9px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Current Status
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No Engineering Change Orders found.
              </td>
            </tr>
          ) : (
            filtered.map((e, index) => (
              <tr
                key={e.eco_id}
                onClick={() => navigate(`/ecos/${e.eco_id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                style={{ 
                  borderBottom: index === filtered.length - 1 ? 'none' : '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease'
                }}
              >
                <td style={{ padding: '11px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{e.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>ID: ECO-{e.eco_id}</div>
                </td>
                <td style={{ padding: '11px 16px' }}>
                   <span style={{ 
                     fontSize: 11, 
                     fontWeight: 600, 
                     padding: '2px 8px', 
                     borderRadius: 4, 
                     background: e.eco_type === 'BoM' ? 'var(--type-bom-bg)' : 'var(--type-product-bg)',
                     color: e.eco_type === 'BoM' ? 'var(--type-bom-text)' : 'var(--type-product-text)'
                   }}>
                     {e.eco_type}
                   </span>
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>
                  {e.target_product?.product_code || e.target_product_id || '—'}
                </td>
                <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                  <StageBadge status={e.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}