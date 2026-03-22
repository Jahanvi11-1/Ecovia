import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
)
const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
)

export default function ProductCreateForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    product_name: '',
    sale_price: '',
    cost_price: '',
    attachments_url: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const slug = form.product_name.trim().toUpperCase().replace(/\s+/g, '-').slice(0, 20)
      const code = `${slug}-${Date.now().toString().slice(-5)}`
      const payload = {
        product_code: code,
        product_name: form.product_name.trim(),
        sale_price: form.sale_price !== '' ? parseFloat(form.sale_price) : null,
        cost_price: form.cost_price !== '' ? parseFloat(form.cost_price) : null,
        attachments_url: form.attachments_url || null,
      }
      const res = await api.post('/products/', payload)
      navigate(`/products/${res.data.product_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create product')
    } finally {
      setSaving(false)
    }
  }

  // Common input style from §5.4
  const inputStyle = {
    height: 36,
    padding: '0 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg-subtle)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--text-primary)',
    width: '100%',
    outline: 'none',
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
            justifyContent: 'space-between',
            background: 'var(--surface)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
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
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--surface)'}
              >
                <ArrowLeftIcon /> Back
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>New Product</span>
            </div>

            <button
              type="submit"
              form="product-form"
              disabled={saving}
              style={{
                background: 'var(--punch-red)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                height: 32,
                padding: '0 16px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                opacity: saving ? 0.6 : 1
              }}
              onMouseEnter={(e) => !saving && (e.currentTarget.style.background = 'var(--punch-red-hover)')}
              onMouseLeave={(e) => !saving && (e.currentTarget.style.background = 'var(--punch-red)')}
            >
              <SaveIcon /> {saving ? 'Saving...' : 'Save Product'}
            </button>
          </div>

          <form id="product-form" onSubmit={handleSubmit} style={{ padding: '24px' }}>
            {error && (
              <div style={{ 
                fontSize: 13, 
                color: 'var(--punch-red)', 
                background: 'var(--punch-red-light)', 
                border: '1px solid var(--punch-red-border)', 
                borderRadius: 8, 
                padding: '10px 14px', 
                marginBottom: 20 
              }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Product Name <span style={{ color: 'var(--punch-red)' }}>*</span></label>
              <input
                required
                maxLength={255}
                value={form.product_name}
                onChange={set('product_name')}
                style={inputStyle}
                placeholder="Enter formal product name"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Sales Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sale_price}
                  onChange={set('sale_price')}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Cost Price</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price}
                  onChange={set('cost_price')}
                  style={inputStyle}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Attachments (URL or Filename)</label>
              <input
                type="text"
                value={form.attachments_url}
                onChange={set('attachments_url')}
                style={inputStyle}
                placeholder="e.g. documentation-v1.pdf"
              />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                Accepts engineering specs, PDF drawings, or spreadsheet links.
              </p>
            </div>

            <div>
              <label style={labelStyle}>Initial Version</label>
              <input
                readOnly
                value="v1 (System Generated)"
                style={{ ...inputStyle, background: 'var(--bg-muted)', color: 'var(--text-muted)', cursor: 'not-allowed', borderStyle: 'dashed' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>
                Revision control starts automatically upon creation.
              </p>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}