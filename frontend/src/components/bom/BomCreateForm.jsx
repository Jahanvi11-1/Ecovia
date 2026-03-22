import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5"/></svg>
)
const SaveIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
)
const PlusIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
)
const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
)

export default function BomCreateForm() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({
    product_version_id: '',
    quantity: '1',
    unit_of_measure: 'Units',
    reference: '',
  })
  const [selectedProductId, setSelectedProductId] = useState('')
  const [versions, setVersions] = useState([])
  const [tab, setTab] = useState('components')
  const [components, setComponents] = useState([])
  const [operations, setOperations] = useState([])
  const [newComp, setNewComp] = useState({ product_id: '', quantity: '', unit_of_measure: 'Units' })
  const [newOp, setNewOp] = useState({ work_center: '', operation_time_mins: '', sequence_order: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/products/').then((res) => setProducts(res.data))
  }, [])

  useEffect(() => {
    if (!selectedProductId) { setVersions([]); return }
    api.get(`/products/${selectedProductId}/versions`).then((res) => {
      const active = res.data.filter((v) => v.status === 'Active')
      setVersions(active)
      if (active.length > 0) setForm((f) => ({ ...f, product_version_id: String(active[0].version_id) }))
    })
  }, [selectedProductId])

  const autoRef = `BOM-${String(Date.now()).slice(-5)}`

  const addComponent = () => {
    if (!newComp.product_id || !newComp.quantity) return
    setComponents((c) => [...c, { ...newComp, quantity: parseFloat(newComp.quantity) }])
    setNewComp({ product_id: '', quantity: '', unit_of_measure: 'Units' })
  }

  const removeComponent = (i) => setComponents((c) => c.filter((_, idx) => idx !== i))

  const addOperation = () => {
    if (!newOp.work_center || !newOp.operation_time_mins) return
    const seq = operations.length + 1
    setOperations((o) => [...o, { ...newOp, operation_time_mins: parseInt(newOp.operation_time_mins), sequence_order: parseInt(newOp.sequence_order) || seq }])
    setNewOp({ work_center: '', operation_time_mins: '', sequence_order: '' })
  }

  const removeOperation = (i) => setOperations((o) => o.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    if (!form.product_version_id) { setError('Select a product first'); return }
    setError('')
    setSaving(true)
    try {
      const res = await api.post('/boms/', {
        product_version_id: parseInt(form.product_version_id),
        reference: form.reference || autoRef,
        quantity: parseFloat(form.quantity) || 1,
        unit_of_measure: form.unit_of_measure,
      })
      const bomId = res.data.bom_id
      for (const c of components) { await api.post(`/boms/${bomId}/components`, c) }
      for (const op of operations) { await api.post(`/boms/${bomId}/operations`, op) }
      navigate(`/boms/${bomId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save BoM')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header Block */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              New Bill of Materials
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
              Define components and work operations for production
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/boms')}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ArrowLeftIcon /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: saving ? 0.6 : 1 }}
            >
              <SaveIcon /> {saving ? 'Saving...' : 'Create BOM'}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 14 }}>
          {/* Reference Badge */}
          <div style={{ display: 'inline-block', background: 'var(--bg-muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 8px', fontSize: 11, fontWeight: 600, fontFamily: 'monospace', color: 'var(--text-secondary)', marginBottom: 20 }}>
            {form.reference || autoRef}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Finished Product */}
            <div style={{ gridColumn: '1/-1' }}>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Finished Product</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
              >
                <option value="">Select a product to manufacture...</option>
                {products.map((p) => (
                  <option key={p.product_id} value={p.product_id}>
                    {p.active_version?.product_name || p.product_code}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Quantity to Produce</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                  style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
                />
                <input
                  value={form.unit_of_measure}
                  onChange={(e) => setForm((f) => ({ ...f, unit_of_measure: e.target.value }))}
                  placeholder="Units"
                  style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, color: 'var(--text-primary)', width: 100, outline: 'none' }}
                />
              </div>
            </div>

            {/* Reference */}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Internal Reference</label>
              <input
                maxLength={8}
                value={form.reference}
                onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
                placeholder="e.g. BOM-PROD"
                style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, color: 'var(--text-primary)', width: '100%', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Tabs & Details Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
            <button
              onClick={() => setTab('components')}
              style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: tab === 'components' ? '2px solid var(--punch-red)' : '2px solid transparent', background: 'transparent', color: tab === 'components' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Components
            </button>
            <button
              onClick={() => setTab('operations')}
              style={{ padding: '12px 24px', fontSize: 13, fontWeight: 600, border: 'none', borderBottom: tab === 'operations' ? '2px solid var(--punch-red)' : '2px solid transparent', background: 'transparent', color: tab === 'operations' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Operations
            </button>
          </div>

          <div style={{ padding: '20px 24px' }}>
            {tab === 'components' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Component Item</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>UoM</th>
                    <th style={{ padding: '9px 16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c, i) => {
                    const p = products.find((x) => String(x.product_id) === String(c.product_id))
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{p?.active_version?.product_name || p?.product_code || c.product_id}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{c.quantity}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{c.unit_of_measure}</td>
                        <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                          <button onClick={() => removeComponent(i)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><TrashIcon /></button>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Add Row */}
                  <tr>
                    <td style={{ padding: '12px 8px' }}>
                      <select
                        value={newComp.product_id}
                        onChange={(e) => setNewComp((c) => ({ ...c, product_id: e.target.value }))}
                        style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: '100%', outline: 'none' }}
                      >
                        <option value="">Select component...</option>
                        {products.map((p) => <option key={p.product_id} value={p.product_id}>{p.active_version?.product_name || p.product_code}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input type="number" value={newComp.quantity} onChange={(e) => setNewComp((c) => ({ ...c, quantity: e.target.value }))} placeholder="0.00" style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 80, outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input value={newComp.unit_of_measure} onChange={(e) => setNewComp((c) => ({ ...c, unit_of_measure: e.target.value }))} placeholder="Units" style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 80, outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button onClick={addComponent} style={{ background: 'var(--cerulean-light)', color: 'var(--cerulean)', border: '1px solid var(--cerulean-border)', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon /> Add</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seq</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Center</th>
                    <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration (min)</th>
                    <th style={{ padding: '9px 16px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{op.sequence_order}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{op.work_center}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-primary)' }}>{op.operation_time_mins} mins</td>
                      <td style={{ padding: '11px 16px', textAlign: 'right' }}>
                        <button onClick={() => removeOperation(i)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}><TrashIcon /></button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: '12px 8px' }}>
                      <input type="number" value={newOp.sequence_order} onChange={(e) => setNewOp((o) => ({ ...o, sequence_order: e.target.value }))} placeholder="#" style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 50, outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input value={newOp.work_center} onChange={(e) => setNewOp((o) => ({ ...o, work_center: e.target.value }))} placeholder="Center name..." style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: '100%', outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <input type="number" value={newOp.operation_time_mins} onChange={(e) => setNewOp((o) => ({ ...o, operation_time_mins: e.target.value }))} placeholder="Mins" style={{ height: 32, padding: '0 8px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 12, width: 80, outline: 'none' }} />
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      <button onClick={addOperation} style={{ background: 'var(--cerulean-light)', color: 'var(--cerulean)', border: '1px solid var(--cerulean-border)', padding: '4px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><PlusIcon /> Add</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}