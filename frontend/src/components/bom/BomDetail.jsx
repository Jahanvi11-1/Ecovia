import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>
)
const FileTextIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.5}}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
)

export default function BomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('components')

  useEffect(() => {
    api.get(`/boms/${id}`).then((res) => setBom(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Loading...</div>
  if (!bom) return <div style={{ color: 'var(--punch-red)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>BoM not found</div>

  const isArchived = bom.status === 'Archived'
  const ref = bom.reference || `BOM-${String(bom.bom_id).padStart(5, '0')}`

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header Block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <FileTextIcon />
              <span style={{ fontSize: 9.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Bill of Materials</span>
            </div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              {ref}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/boms')}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeftIcon /> Back to List
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{ padding: '20px 24px' }}>
            {/* Summary Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 20 }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Finished Product</label>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{bom.product_version_id || '—'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Quantity</label>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{bom.quantity ?? 1} {bom.unit_of_measure || 'Units'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Status</label>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '3px 10px',
                  borderRadius: 20,
                  background: isArchived ? 'var(--bg-muted)' : 'var(--cerulean-light)',
                  color: isArchived ? 'var(--text-secondary)' : 'var(--cerulean)',
                  fontSize: 11,
                  fontWeight: 600,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: isArchived ? 'var(--text-muted)' : 'var(--cerulean)', display: 'block' }} />
                  {bom.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, borderTop: '1px solid var(--bg-muted)', pt: 20, paddingTop: 20 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Reference</label>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{bom.reference || '—'}</span>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>BoM Version</label>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>V{bom.bom_version}</span>
              </div>
            </div>
          </div>

          {/* Detailed Tabs Area */}
          <div style={{ borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', background: 'var(--bg-subtle)' }}>
              <button
                onClick={() => setTab('components')}
                style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, border: 'none', borderBottom: tab === 'components' ? '2px solid var(--punch-red)' : '2px solid transparent', background: 'transparent', color: tab === 'components' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                Components
              </button>
              <button
                onClick={() => setTab('operations')}
                style={{ padding: '12px 24px', fontSize: 12, fontWeight: 600, border: 'none', borderBottom: tab === 'operations' ? '2px solid var(--punch-red)' : '2px solid transparent', background: 'transparent', color: tab === 'operations' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                Work Operations
              </button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              {tab === 'components' ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component ID</th>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To Consume</th>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Units</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.components.length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No components defined for this BoM.</td></tr>
                    ) : (
                      bom.components.map((c) => (
                        <tr key={c.component_id} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{c.product_id}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{c.quantity}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{c.unit_of_measure}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sequence</th>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Center</th>
                      <th style={{ padding: '16px 16px 11px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bom.operations.length === 0 ? (
                      <tr><td colSpan={3} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>No operations defined for this BoM.</td></tr>
                    ) : (
                      bom.operations.sort((a, b) => a.sequence_order - b.sequence_order).map((op) => (
                        <tr key={op.operation_id} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{String(op.sequence_order).padStart(2, '0')}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{op.work_center}</td>
                          <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{op.operation_time_mins} mins</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        {isArchived && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', marginTop: 12 }}>
            This Bill of Materials is archived and can no longer be edited.
          </p>
        )}
      </div>
    </div>
  )
}