import { useEffect, useState } from 'react'
import api from '../../api/client'

const emptyComponent = { product_id: '', quantity: 1, unit_of_measure: 'Units' }
const emptyOperation = { work_center: '', operation_time_mins: 1, sequence_order: 1 }

export default function BomProposalEditor({ eco, onSaved }) {
  const [products, setProducts] = useState([])
  const [components, setComponents] = useState([])
  const [operations, setOperations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([
      api.get(`/boms/${eco.target_bom_id}`),
      api.get('/products/?limit=10000'),
    ]).then(([bomResponse, productsResponse]) => {
      if (!active) return
      const changes = eco.proposed_changes || {}
      setComponents(changes.proposed_components || bomResponse.data.components || [])
      setOperations(changes.proposed_operations || bomResponse.data.operations || [])
      setProducts(productsResponse.data.items || [])
    }).catch(() => active && setError('Could not load the active BoM proposal.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [eco.eco_id, eco.target_bom_id])

  const updateComponent = (index, field, value) => setComponents((items) => items.map((item, i) => i === index ? { ...item, [field]: value } : item))
  const updateOperation = (index, field, value) => setOperations((items) => items.map((item, i) => i === index ? { ...item, [field]: value } : item))

  const save = async () => {
    setSaving(true); setError('')
    try {
      const proposed_components = components.map(({ component_id, ...item }) => ({ ...item, product_id: Number(item.product_id), quantity: Number(item.quantity) }))
      const proposed_operations = operations.map(({ operation_id, ...item }) => ({ ...item, operation_time_mins: Number(item.operation_time_mins), sequence_order: Number(item.sequence_order) }))
      await api.put(`/ecos/${eco.eco_id}`, {
        proposed_changes: { ...(eco.proposed_changes || {}), proposed_components, proposed_operations },
      })
      onSaved()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not save the BoM proposal.')
    } finally { setSaving(false) }
  }

  if (loading) return <div style={{ padding: 16, color: 'var(--text-muted)' }}>Loading BoM proposal…</div>
  return <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', marginBottom: 14 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 14 }}>
      <div><strong>Proposed BoM changes</strong><div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>These changes remain a draft until the ECO is approved and applied.</div></div>
      <button onClick={save} disabled={saving} style={buttonStyle}>{saving ? 'Saving…' : 'Save proposal'}</button>
    </div>
    {error && <div style={errorStyle}>{error}</div>}
    <h3 style={headingStyle}>Components</h3>
    <div style={{ overflowX: 'auto' }}><table style={tableStyle}><thead><tr><th>Product</th><th>Quantity</th><th>Unit</th><th /></tr></thead><tbody>
      {components.map((component, index) => <tr key={index}><td><select value={component.product_id} onChange={(e) => updateComponent(index, 'product_id', e.target.value)}>{products.map((p) => <option key={p.product_id} value={p.product_id}>{p.active_version?.product_name || p.product_code}</option>)}</select></td><td><input type="number" min="0.0001" value={component.quantity} onChange={(e) => updateComponent(index, 'quantity', e.target.value)} /></td><td><input value={component.unit_of_measure} onChange={(e) => updateComponent(index, 'unit_of_measure', e.target.value)} /></td><td><button onClick={() => setComponents((items) => items.filter((_, i) => i !== index))}>Remove</button></td></tr>)}
    </tbody></table></div>
    <button onClick={() => setComponents((items) => [...items, emptyComponent])} style={secondaryButtonStyle}>Add component</button>
    <h3 style={headingStyle}>Operations</h3>
    <div style={{ overflowX: 'auto' }}><table style={tableStyle}><thead><tr><th>Work center</th><th>Minutes</th><th>Sequence</th><th /></tr></thead><tbody>
      {operations.map((operation, index) => <tr key={index}><td><input value={operation.work_center} onChange={(e) => updateOperation(index, 'work_center', e.target.value)} /></td><td><input type="number" min="1" value={operation.operation_time_mins} onChange={(e) => updateOperation(index, 'operation_time_mins', e.target.value)} /></td><td><input type="number" min="1" value={operation.sequence_order} onChange={(e) => updateOperation(index, 'sequence_order', e.target.value)} /></td><td><button onClick={() => setOperations((items) => items.filter((_, i) => i !== index))}>Remove</button></td></tr>)}
    </tbody></table></div>
    <button onClick={() => setOperations((items) => [...items, { ...emptyOperation, sequence_order: items.length + 1 }])} style={secondaryButtonStyle}>Add operation</button>
  </section>
}

const buttonStyle = { background: 'var(--punch-red)', color: '#fff', border: 0, borderRadius: 7, padding: '8px 12px', cursor: 'pointer' }
const secondaryButtonStyle = { background: 'var(--bg-subtle)', color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', cursor: 'pointer', marginTop: 8 }
const errorStyle = { color: 'var(--punch-red)', fontSize: 12, marginBottom: 10 }
const headingStyle = { fontSize: 13, margin: '18px 0 8px' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', fontSize: 12 }
