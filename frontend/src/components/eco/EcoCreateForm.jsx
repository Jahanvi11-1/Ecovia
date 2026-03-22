import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const PlayIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
)
const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
)
const InfoIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity:0.6}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
)

export default function EcoCreateForm() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [products, setProducts] = useState([])
  const [boms, setBoms] = useState([])
  const [form, setForm] = useState({
    title: '',
    eco_type: 'Bill of Materials',
    target_product_id: '',
    target_bom_id: '',
    user_id: '',
    version_update_toggle: false,
    effective_date: '',
  })
  const [savedEco, setSavedEco] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [starting, setStarting] = useState(false)

  const canCreate = user?.role === 'Admin' || user?.role === 'Engineering User'
  const isStarted = savedEco?.is_started === true

  useEffect(() => {
    api.get('/products/?limit=10000').then((res) => setProducts(res.data.items || res.data))
    setForm((f) => ({ ...f, user_id: user?.user_id || '' }))
  }, [user])

  useEffect(() => {
    if (form.eco_type === 'Bill of Materials' && form.target_product_id) {
      api.get(`/products/${form.target_product_id}`).then((res) => {
        const av = res.data.active_version
        if (av) {
          api.get(`/boms/by-product-version/${av.version_id}`).then((r) => setBoms(r.data))
        } else {
          setBoms([])
        }
      })
    } else {
      setBoms([])
      setForm((f) => ({ ...f, target_bom_id: '' }))
    }
  }, [form.eco_type, form.target_product_id])

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [field]: val }))
  }

  const buildPayload = () => ({
    title: form.title,
    eco_type: form.eco_type === 'Bill of Materials' ? 'BoM' : 'Product',
    target_product_id: parseInt(form.target_product_id),
    target_bom_id: form.eco_type === 'Bill of Materials' && form.target_bom_id ? parseInt(form.target_bom_id) : null,
    version_update_toggle: form.version_update_toggle,
    effective_date: form.effective_date ? new Date(form.effective_date).toISOString() : new Date().toISOString(),
    proposed_changes: {},
  })

  const handleSave = async () => {
    setError('')
    setSaving(true)
    try {
      if (savedEco) {
        const res = await api.put(`/ecos/${savedEco.eco_id}`, {
          title: form.title,
          version_update_toggle: form.version_update_toggle,
          effective_date: form.effective_date ? new Date(form.effective_date).toISOString() : undefined,
        })
        setSavedEco(res.data)
      } else {
        const res = await api.post('/ecos/', buildPayload())
        setSavedEco(res.data)
      }
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setSaving(false)
    }
  }

  const handleStart = async () => {
    setError('')
    let eco = savedEco
    if (!eco) {
      setSaving(true)
      try {
        const res = await api.post('/ecos/', buildPayload())
        eco = res.data
        setSavedEco(eco)
      } catch (err) {
        const detail = err.response?.data?.detail
        setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
        setSaving(false)
        return
      }
      setSaving(false)
    }
    setStarting(true)
    try {
      await api.post(`/ecos/${eco.eco_id}/start`)
      navigate(`/ecos/${eco.eco_id}`)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : JSON.stringify(detail))
    } finally {
      setStarting(false)
    }
  }

  if (!canCreate) {
    return (
      <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 12, padding: '20px 24px', fontSize: 13, fontWeight: 500 }}>
        Access Denied — only Admin and Engineering Users can create ECOs.
      </div>
    )
  }

  const ro = isStarted
  const commonInputStyle = {
    height: 36,
    padding: '0 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: ro ? 'var(--bg-muted)' : 'var(--bg-subtle)',
    fontSize: 13,
    color: ro ? 'var(--text-secondary)' : 'var(--text-primary)',
    width: '100%',
    outline: 'none',
    cursor: ro ? 'not-allowed' : 'text',
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Header Block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              Create Engineering Change Order
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Define change parameters and target products
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {savedEco && (
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: 6, 
                padding: '3px 10px', 
                borderRadius: 20, 
                background: 'var(--bg-muted)', 
                color: 'var(--text-secondary)', 
                fontSize: 12, 
                fontWeight: 500,
                marginRight: 8
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', flexShrink: 0 }}/>
                Draft
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || starting || ro}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: (saving || starting || ro) ? 0.5 : 1 }}
            >
              <SaveIcon /> {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleStart}
              disabled={starting || saving || ro}
              style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: (starting || saving || ro) ? 0.5 : 1 }}
            >
              <PlayIcon /> {starting ? 'Starting...' : 'Start ECO'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Form Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', maxWidth: 600 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Title */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Title*</label>
              <input
                value={form.title}
                onChange={set('title')}
                disabled={ro}
                required
                placeholder="e.g. PCB Component Upgrade"
                style={commonInputStyle}
              />
            </div>

            {/* ECO Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>ECO Type*</label>
              <select
                value={form.eco_type}
                onChange={set('eco_type')}
                disabled={ro || !!savedEco}
                style={{ ...commonInputStyle, cursor: (ro || !!savedEco) ? 'not-allowed' : 'pointer' }}
              >
                <option value="Bill of Materials">Bill of Materials</option>
                <option value="Product">Product</option>
              </select>
            </div>

            {/* Product */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Target Product*</label>
              <select
                value={form.target_product_id}
                onChange={set('target_product_id')}
                disabled={ro || !!savedEco}
                required
                style={{ ...commonInputStyle, cursor: (ro || !!savedEco) ? 'not-allowed' : 'pointer' }}
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.active_version?.product_name || p.product_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Bill of Materials — conditional */}
            {form.eco_type === 'Bill of Materials' && (
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Bill of Materials*</label>
                <select
                  value={form.target_bom_id}
                  onChange={set('target_bom_id')}
                  disabled={ro || !!savedEco}
                  required
                  style={{ ...commonInputStyle, cursor: (ro || !!savedEco) ? 'not-allowed' : 'pointer' }}
                >
                  <option value="">Select BoM...</option>
                  {boms.map((b) => (
                    <option key={b.bom_id} value={b.bom_id}>
                      {b.product_name || b.bom_version}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Effective Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Effective Date</label>
              <input
                type="datetime-local"
                value={form.effective_date}
                onChange={set('effective_date')}
                disabled={ro}
                style={commonInputStyle}
                min={new Date().toISOString().slice(0,16)}
                
              />
            </div>

            {/* Version Update Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Increment Version</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={form.version_update_toggle}
                  onChange={set('version_update_toggle')}
                  disabled={ro}
                  style={{ width: 16, height: 16, cursor: ro ? 'not-allowed' : 'pointer', accentColor: 'var(--punch-red)' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Automatically update version on approval</span>
              </div>
            </div>

            <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

            {/* User Info - Personalization Invisible per Stage 6 */}
            <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', gap: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Originator</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)' }}>
                   {user?.login_id?.substring(0,2).toUpperCase() || '??'}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.login_id}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 20, color: 'var(--text-muted)' }}>
          <InfoIcon />
          <p style={{ fontSize: 12, margin: 0 }}>
            Save draft to preserve changes. Once the ECO is <strong>Started</strong>, core parameters become permanent.
          </p>
        </div>
      </div>
    </div>
  )
}