import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'
import EcoDiffView from '../eco/EcoDiffView'

// Zero-install SVG Icons
const ArrowLeftIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M19 12H5" /></svg>
)
const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
)
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)
const ExternalLinkIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" /></svg>
)

export default function EcoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const [eco, setEco] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const isApprover = user?.role === 'Admin' || user?.role === 'Approver'
  const isTerminal = eco?.status === 'Applied' || eco?.status === 'Rejected'

  const fetchEco = () => {
    setLoading(true)
    api.get(`/ecos/${id}`).then((res) => setEco(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchEco() }, [id])

  const doAction = async (action) => {
    setError('')
    setActionLoading(true)
    try {
      await api.post(`/ecos/${id}/${action}`)
      fetchEco()
    } catch (err) {
      setError(err.response?.data?.detail || `${action} failed`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div style={{ color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Loading ECO details...</div>
  if (!eco) return <div style={{ color: 'var(--punch-red)', padding: '40px 0', textAlign: 'center', fontSize: 13 }}>Engineering Change Order not found</div>

  const stage = eco.current_stage
  const requiresApproval = stage?.requires_approval
  const isBom = eco.eco_type === 'BoM'

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Navigation & Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <button
              onClick={() => navigate('/ecos')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: 'var(--cerulean)', fontSize: 13, fontWeight: 500, cursor: 'pointer', marginBottom: 8, padding: 0 }}
            >
              <ArrowLeftIcon /> Back to ECO List
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              {eco.title}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Status Pill Component Replacement */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 20,
              background: eco.status === 'Applied' ? 'var(--status-done-bg)' : eco.status === 'Rejected' ? 'var(--status-applied-bg)' : 'var(--bg-muted)',
              color: eco.status === 'Applied' ? 'var(--status-done-text)' : eco.status === 'Rejected' ? 'var(--status-applied-text)' : 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: eco.status === 'Applied' ? 'var(--status-done-dot)' : eco.status === 'Rejected' ? 'var(--status-applied-dot)' : 'var(--text-muted)'
              }} />
              {eco.status}
            </span>
          </div>
        </div>

        {/* Global Action Bar */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {!isTerminal && requiresApproval && isApprover && (
            <button onClick={() => doAction('approve')} disabled={actionLoading}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckIcon /> Approval
            </button>
          )}

          {isBom && eco.target_bom_id && (
            <button onClick={() => navigate(`/boms/${eco.target_bom_id}`)}
              style={{ background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 500, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <ExternalLinkIcon /> View BoM
            </button>
          )}

          {!isTerminal && !requiresApproval && (eco.status === 'Open') && (
            <button onClick={() => doAction('validate')} disabled={actionLoading}
              style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Validate
            </button>
          )}

          {!isTerminal && eco.status === 'Validated' && isApprover && (
            <button onClick={() => doAction('apply')} disabled={actionLoading}
              style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 12.5, fontWeight: 600, height: 36, padding: '0 16px', borderRadius: 8, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Apply Changes
            </button>
          )}

          {!isTerminal && isApprover && (
            <button onClick={() => doAction('reject')} disabled={actionLoading}
              style={{ background: 'var(--punch-red-light)', color: 'var(--punch-red)', fontSize: 12.5, fontWeight: 600, height: 36, padding: '0 16px', borderRadius: 8, border: '1px solid var(--punch-red-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <XIcon /> Reject
            </button>
          )}
        </div>

        {error && (
          <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 12, fontWeight: 500 }}>
            {error}
          </div>
        )}

        {/* Readonly Summary Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px', marginBottom: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px 40px' }}>
            <Field label="Title" value={eco.title} />
            <Field label="ECO Type" value={eco.eco_type === 'BoM' ? 'Bill of Materials' : 'Product'} />
            <Field label="Target Item" value={eco.target_product?.product_code || eco.target_product_id || '—'} />
            {isBom && <Field label="Version" value={eco.target_bom?.bom_version || eco.target_bom_id || '—'} />}
            <Field label="Originator" value={eco.created_by || '—'} />
            <Field label="Effective Date" value={eco.effective_date ? new Date(eco.effective_date).toLocaleString() : '—'} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ width: 140, fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>Auto-Update Version</span>
              <input type="checkbox" checked={eco.version_update_toggle} readOnly style={{ width: 16, height: 16, accentColor: 'var(--punch-red)' }} />
            </div>
          </div>
        </div>

        {/* Dynamic Editors */}
        {!isBom && !isTerminal && (
          <ProposedChangesEditor eco={eco} onSaved={fetchEco} />
        )}

        {isBom && eco.target_bom_id && !isTerminal && (
          <BomChangesEditor bomId={eco.target_bom_id} />
        )}

        {/* Comparison Section */}
        <div id="eco-diff" style={{ marginTop: 24 }}>
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Change Comparison</span>
            <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
          </div>
          <EcoDiffView ecoId={id} ecoType={eco.eco_type} targetBomId={eco.target_bom_id} snapshot={eco.proposed_changes} />
        </div>
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</span>
      <div style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-muted)', fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
        {value}
      </div>
    </div>
  )
}

function ProposedChangesEditor({ eco, onSaved }) {
  const changes = eco.proposed_changes || {}
  // Check if this is a newly created ECO with snapshots (indicating no edits yet)
  const hasSnapshots = changes.snapshot_sale_price !== undefined || changes.snapshot_cost_price !== undefined
  const [form, setForm] = useState({
    sale_price: changes.sale_price ?? '',
    cost_price: changes.cost_price ?? '',
    attachments_url: changes.attachments_url ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const proposed = {
        // Preserve snapshots if they exist
        ...(hasSnapshots && {
          snapshot_product_name: changes.snapshot_product_name,
          snapshot_sale_price: changes.snapshot_sale_price,
          snapshot_cost_price: changes.snapshot_cost_price,
          snapshot_attachments_url: changes.snapshot_attachments_url,
        }),
        // Add proposed changes
        sale_price: form.sale_price !== '' ? parseFloat(form.sale_price) : null,
        cost_price: form.cost_price !== '' ? parseFloat(form.cost_price) : null,
        attachments_url: form.attachments_url || null,
      }
      await api.put(`/ecos/${eco.eco_id}`, { proposed_changes: proposed })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Update Proposed Values</span>
        <button onClick={handleSave} disabled={saving}
          style={{ background: 'var(--punch-red)', color: '#ffffff', fontSize: 11, fontWeight: 600, height: 28, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
      </div>

      {/* Show current/snapshot values if available */}
      {hasSnapshots && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-subtle)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.05em' }}>Current Values</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Sales Price</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{changes.snapshot_sale_price != null ? changes.snapshot_sale_price : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Cost Price</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{changes.snapshot_cost_price != null ? changes.snapshot_cost_price : '—'}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Current Attachments URL</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{changes.snapshot_attachments_url ? changes.snapshot_attachments_url.substring(0, 40) + (changes.snapshot_attachments_url.length > 40 ? '...' : '') : '—'}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Proposed Sales Price</label>
          <input type="number" step="0.01" value={form.sale_price} onChange={set('sale_price')}
            style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, width: '100%', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Proposed Cost Price</label>
          <input type="number" step="0.01" value={form.cost_price} onChange={set('cost_price')}
            style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, width: '100%', outline: 'none' }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Proposed Attachments URL</label>
          <input type="text" value={form.attachments_url} onChange={set('attachments_url')}
            style={{ height: 36, padding: '0 12px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--bg-subtle)', fontSize: 13, width: '100%', outline: 'none' }} />
        </div>
      </div>
    </div>
  )
}

function BomChangesEditor({ bomId }) {
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComp, setNewComp] = useState({ product_id: '', quantity: '', unit_of_measure: 'Units' })
  const [newOp, setNewOp] = useState({ work_center: '', operation_time_mins: '', sequence_order: '' })
  const [products, setProducts] = useState([])

  // --- NEW STATE FOR INLINE EDITING ---
  const [editingCompId, setEditingCompId] = useState(null)
  const [editQty, setEditQty] = useState('')

  const fetchBom = () => api.get(`/boms/${bomId}`).then((res) => setBom(res.data)).finally(() => setLoading(false))

  useEffect(() => {
    fetchBom()
    api.get('/products/?limit=10000').then((res) => setProducts(res.data.items || res.data))
  }, [bomId])

  // --- NEW UPDATE QUANTITY FUNCTION ---
  const saveQuantity = async (componentId) => {
    try {
      // Logic assumes your backend has a PUT/PATCH endpoint for components
      await api.put(`/boms/${bomId}/components/${componentId}`, {
        quantity: parseFloat(editQty)
      })
      setEditingCompId(null)
      fetchBom()
    } catch (err) {
      setError('Failed to update quantity')
    }
  }

  // --- NEW EDIT STATE FOR OPERATIONS ---
  const [editingOpId, setEditingOpId] = useState(null)
  const [editOpForm, setEditOpForm] = useState({ work_center: '', operation_time_mins: '', sequence_order: '' })

  // --- NEW UPDATE OPERATION FUNCTION ---
  const saveOperation = async (opId) => {
    try {
      await api.put(`/boms/${bomId}/operations/${opId}`, {
        work_center: editOpForm.work_center,
        operation_time_mins: parseInt(editOpForm.operation_time_mins),
        sequence_order: parseInt(editOpForm.sequence_order)
      })
      setEditingOpId(null)
      fetchBom()
    } catch (err) {
      setError('Failed to update operation')
    }
  }

  const addComponent = async () => {
    if (!newComp.product_id || !newComp.quantity) return
    try {
      await api.post(`/boms/${bomId}/components`, {
        product_id: parseInt(newComp.product_id),
        quantity: parseFloat(newComp.quantity),
        unit_of_measure: newComp.unit_of_measure || 'Units',
      })
      setNewComp({ product_id: '', quantity: '', unit_of_measure: 'Units' })
      fetchBom()
    } catch (err) { setError('Failed to add component') }
  }

  const addOperation = async () => {
    if (!newOp.work_center || !newOp.operation_time_mins) return
    try {
      await api.post(`/boms/${bomId}/operations`, {
        work_center: newOp.work_center,
        operation_time_mins: parseInt(newOp.operation_time_mins),
        sequence_order: parseInt(newOp.sequence_order) || (bom?.operations?.length || 0) + 1,
      })
      setNewOp({ work_center: '', operation_time_mins: '', sequence_order: '' })
      fetchBom()
    } catch (err) { setError('Failed to add operation') }
  }

  if (loading) return null

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Live BoM Redlining</span>
      </div>

      <div style={{ padding: '20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Item</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Qty</th>
              <th style={{ padding: '8px 12px' }} />
            </tr>
          </thead>
          <tbody>
            {(bom.components || []).map((c) => (
              <tr key={c.component_id} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                <td style={{ padding: '8px 12px', fontSize: 13 }}>
                  {products.find((p) => p.product_id === c.product_id)?.active_version?.product_name || `ID #${c.product_id}`}
                </td>

                <td style={{ padding: '8px 12px', fontSize: 13 }}>
                  {/* --- CONDITIONAL RENDER FOR EDITING --- */}
                  {editingCompId === c.component_id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <input
                        type="number"
                        value={editQty}
                        onChange={(e) => setEditQty(e.target.value)}
                        style={{ width: 60, height: 24, border: '1px solid var(--cerulean)', borderRadius: 4, padding: '0 4px', fontSize: 12 }}
                      />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.unit_of_measure}</span>
                    </div>
                  ) : (
                    <span>{c.quantity} {c.unit_of_measure}</span>
                  )}
                </td>

                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  {/* --- EDIT / SAVE BUTTON TOGGLE --- */}
                  {editingCompId === c.component_id ? (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => saveQuantity(c.component_id)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--cerulean)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                        Save
                      </button>
                      <button onClick={() => setEditingCompId(null)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button onClick={() => { setEditingCompId(c.component_id); setEditQty(c.quantity); }}
                        style={{ border: 'none', background: 'transparent', color: 'var(--cerulean)', fontSize: 11, cursor: 'pointer' }}>
                        Edit Qty
                      </button>
                      <button onClick={() => api.delete(`/boms/${bomId}/components/${c.component_id}`).then(fetchBom)}
                        style={{ border: 'none', background: 'transparent', color: 'var(--punch-red)', fontSize: 11, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '12px 8px' }}>
                <select value={newComp.product_id} onChange={(e) => setNewComp({ ...newComp, product_id: e.target.value })}
                  style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, width: '100%', fontSize: 12 }}>
                  <option value="">Add item...</option>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_code}</option>)}
                </select>
              </td>
              <td style={{ padding: '12px 8px' }}>
                <input placeholder="Qty" value={newComp.quantity} onChange={(e) => setNewComp({ ...newComp, quantity: e.target.value })}
                  style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, width: 60, padding: '0 8px', fontSize: 12 }} />
              </td>
              <td style={{ padding: '12px 8px' }}>
                <button onClick={addComponent} style={{ background: 'var(--cerulean)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>Add</button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Operations Table Pattern */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Work Operations</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Work Center</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Time (mins)</th>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sequence</th>
                <th style={{ padding: '8px 12px' }} />
              </tr>
            </thead>
            <tbody>
              {(bom.operations || []).sort((a, b) => a.sequence_order - b.sequence_order).map((op) => (
                <tr key={op.operation_id} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                  {editingOpId === op.operation_id ? (
                    // --- EDIT MODE VIEW ---
                    <>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          value={editOpForm.work_center}
                          onChange={(e) => setEditOpForm({ ...editOpForm, work_center: e.target.value })}
                          style={{ height: 28, border: '1px solid var(--cerulean)', borderRadius: 4, width: '100%', padding: '0 8px', fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          value={editOpForm.operation_time_mins}
                          onChange={(e) => setEditOpForm({ ...editOpForm, operation_time_mins: e.target.value })}
                          style={{ height: 28, border: '1px solid var(--cerulean)', borderRadius: 4, width: 60, padding: '0 8px', fontSize: 12 }}
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          type="number"
                          value={editOpForm.sequence_order}
                          onChange={(e) => setEditOpForm({ ...editOpForm, sequence_order: e.target.value })}
                          style={{ height: 28, border: '1px solid var(--cerulean)', borderRadius: 4, width: 50, padding: '0 8px', fontSize: 12 }}
                        />
                      </td>
                    </>
                  ) : (
                    // --- READ MODE VIEW ---
                    <>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{op.work_center}</td>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{op.operation_time_mins} mins</td>
                      <td style={{ padding: '8px 12px', fontSize: 13 }}>{op.sequence_order}</td>
                    </>
                  )}

                  <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                    {editingOpId === op.operation_id ? (
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => saveOperation(op.operation_id)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--cerulean)', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
                          Save
                        </button>
                        <button onClick={() => setEditingOpId(null)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                        <button onClick={() => {
                          setEditingOpId(op.operation_id);
                          setEditOpForm({ work_center: op.work_center, operation_time_mins: op.operation_time_mins, sequence_order: op.sequence_order });
                        }}
                          style={{ border: 'none', background: 'transparent', color: 'var(--cerulean)', fontSize: 11, cursor: 'pointer' }}>
                          Edit
                        </button>
                        <button onClick={() => api.delete(`/boms/${bomId}/operations/${op.operation_id}`).then(fetchBom)}
                          style={{ border: 'none', background: 'transparent', color: 'var(--punch-red)', fontSize: 11, cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              <tr>

                <td style={{ padding: '12px 8px' }}>

                  <input placeholder="Work Center" value={newOp.work_center} onChange={(e) => setNewOp({ ...newOp, work_center: e.target.value })}

                    style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, width: '100%', padding: '0 8px', fontSize: 12 }} />

                </td>

                <td style={{ padding: '12px 8px' }}>

                  <input placeholder="Minutes" type="number" value={newOp.operation_time_mins} onChange={(e) => setNewOp({ ...newOp, operation_time_mins: e.target.value })}

                    style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, width: 80, padding: '0 8px', fontSize: 12 }} />

                </td>

                <td style={{ padding: '12px 8px' }}>

                  <input placeholder="Seq" type="number" value={newOp.sequence_order} onChange={(e) => setNewOp({ ...newOp, sequence_order: e.target.value })}

                    style={{ height: 32, border: '1px solid var(--border)', borderRadius: 6, width: 60, padding: '0 8px', fontSize: 12 }} />

                </td>

                <td style={{ padding: '12px 8px' }}>

                  <button onClick={addOperation} style={{ background: 'var(--cerulean)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 11, cursor: 'pointer' }}>Add</button>

                </td>

              </tr>
            </tbody>
          </table>
        </div>

        {error && (
          <div style={{ background: 'var(--punch-red-light)', border: '1px solid var(--punch-red-border)', color: 'var(--punch-red)', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginTop: 12 }}>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}