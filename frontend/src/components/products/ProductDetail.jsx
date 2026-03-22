import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
)

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Loading product details...</div>
  if (!product) return <div style={{ color: 'var(--punch-red)', padding: '40px 0', textAlign: 'center', fontSize: 13, fontFamily: "'Inter', sans-serif" }}>Product not found</div>

  const v = product.active_version

  // Common read-only input style from §5.4
  const readOnlyInputStyle = {
    height: 36,
    padding: '0 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg-muted)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    cursor: 'not-allowed',
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 5
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Card Container §5.5 */}
        <div style={{ 
          maxWidth: 600, 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 12, 
          overflow: 'hidden',
          margin: '0 auto'
        }}>
          
          {/* Header Row §5.5 */}
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--surface)' 
          }}>
            <button
              onClick={() => navigate('/products')}
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontSize: 12.5,
                fontWeight: 500,
                height: 32,
                padding: '0 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginRight: 16
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
            >
              <ArrowLeftIcon /> Back
            </button>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              {v?.product_name || product.product_code}
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Field: Name */}
            <div>
              <label style={labelStyle}>Product Name</label>
              <input
                readOnly
                value={v?.product_name || '—'}
                style={readOnlyInputStyle}
              />
            </div>

            {/* Price Grid §7 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Sales Price</label>
                <input
                  readOnly
                  value={v?.sale_price != null ? `$${v.sale_price}` : '—'}
                  style={readOnlyInputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Cost Price</label>
                <input
                  readOnly
                  value={v?.cost_price != null ? `$${v.cost_price}` : '—'}
                  style={readOnlyInputStyle}
                />
              </div>
            </div>

            {/* Field: Attachments */}
            <div>
              <label style={labelStyle}>Technical Attachments</label>
              <input
                readOnly
                value={v?.attachments_url || 'No attachments linked'}
                style={readOnlyInputStyle}
              />
            </div>

            {/* Field: Version & Status Footer */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end',
              paddingTop: 8,
              borderTop: '1px solid var(--bg-muted)'
            }}>
              <div>
                <label style={labelStyle}>Revision</label>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {v ? `Version ${v.version_number}` : '—'}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Controlled via Engineering Change Orders
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <label style={{ ...labelStyle, textAlign: 'right' }}>Status</label>
                <StatusPill status={v?.status || 'Archived'} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/**
 * Reusable StatusPill Pattern §5.7
 * Optimized for Product Status (Active/Archived)
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
      padding: '4px 12px',
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.text,
      fontSize: 12,
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        display: 'block',
      }}/>
      {status}
    </span>
  )
}