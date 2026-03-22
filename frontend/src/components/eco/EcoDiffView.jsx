import { useEffect, useState } from 'react'
import api from '../../api/client'

// Component for Product Change Diff
function ProductDiff({ diff }) {
  const fields = ['sale_price', 'cost_price', 'attachments_url']
  const labels = { sale_price: 'Sales Price', cost_price: 'Cost Price', attachments_url: 'Attachments' }
  
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Product Specification Changes</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Field</th>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proposed (V2)</th>
            <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current (V1)</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => {
            const d = diff.find((x) => x.field === f)
            const changed = d && d.change_type !== 'unchanged'
            return (
              <tr key={f} style={{ borderBottom: '1px solid var(--bg-muted)' }}>
                <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{labels[f]}</td>
                <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: changed ? 600 : 400, color: changed ? 'var(--status-done-text)' : 'var(--text-primary)', background: changed ? 'var(--status-done-bg)' : 'transparent' }}>
                  {d?.new_value != null ? String(d.new_value) : '\u2014'}
                </td>
                <td style={{ padding: '11px 16px', fontSize: 13, color: changed ? 'var(--punch-red)' : 'var(--text-muted)', background: changed ? 'var(--punch-red-light)' : 'transparent' }}>
                  {d?.old_value != null ? String(d.old_value) : '\u2014'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Component for BoM Redlining Diff
function BomDiff({ bomId, snapshot }) {
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    api.get('/products/').then((res) => setProducts(res.data))
  }, [])

  useEffect(() => {
    if (!bomId) { setLoading(false); return }
    api.get(`/boms/${bomId}`).then((res) => setBom(res.data)).finally(() => setLoading(false))
  }, [bomId])

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>Loading BoM comparison...</div>
  if (!bom) return <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>No BoM data available.</div>

  const snapComponents = snapshot?.snapshot_components || []
  const snapOperations = snapshot?.snapshot_operations || []
  const oldCompMapById = {}; snapComponents.forEach((c) => { oldCompMapById[c.component_id] = c })
  const oldCompMapByProduct = {}; snapComponents.forEach((c) => {
    if (c.product_id !== undefined && c.product_id !== null) {
      if (!oldCompMapByProduct[c.product_id]) oldCompMapByProduct[c.product_id] = c
    }
  })
  const oldOpMap = {}; snapOperations.forEach((op) => { oldOpMap[op.operation_id] = op })

  const headerStyle = { padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }
  const cellStyle = { padding: '11px 16px', fontSize: 13, borderBottom: '1px solid var(--bg-muted)' }

  const findProductName = (productId) => {
    const product = products.find((p) => p.product_id === productId)
    return product?.active_version?.product_name || `Product ${productId}`
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>BoM Comparison: V{bom.bom_version} vs Snapshot</span>
      </div>
      
      <div style={{ padding: '20px 24px' }}>
        {/* Components Section */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Components</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...headerStyle, width: '40%' }}>Item</th>
              <th style={headerStyle}>Proposed Qty</th>
              <th style={headerStyle}>Original Qty</th>
            </tr>
          </thead>
          <tbody>
            {(bom.components || []).map((c) => {
              const oldById = oldCompMapById[c.component_id]
              const oldByProduct = c.product_id ? oldCompMapByProduct[c.product_id] : null
              const old = oldById || oldByProduct
              const changed = old && parseFloat(old.quantity) !== parseFloat(c.quantity)
              const isNew = !old;
              return (
                <tr key={c.component_id}>
                  <td style={{ ...cellStyle, color: isNew ? 'var(--status-done-text)' : 'var(--text-primary)', fontWeight: isNew ? 600 : 400 }}>
                    {c.product_id ? findProductName(c.product_id) : `Component ${c.component_id}`} {isNew && <span style={{ fontSize: 10, marginLeft: 8, padding: '2px 6px', background: 'var(--status-done-bg)', borderRadius: 4 }}>NEW</span>}
                  </td>
                  <td style={{ ...cellStyle, color: changed || isNew ? 'var(--status-done-text)' : 'var(--text-primary)', background: (changed || isNew) ? 'var(--status-done-bg)' : 'transparent' }}>
                    {c.quantity} {c.unit_of_measure}
                  </td>
                  <td style={{ ...cellStyle, color: changed ? 'var(--punch-red)' : 'var(--text-muted)', background: changed ? 'var(--punch-red-light)' : 'transparent' }}>
                    {old ? `${old.quantity} ${old.unit_of_measure}` : '\u2014'}
                  </td>
                </tr>
              )
            })}
            {snapComponents.filter((sc) => !(bom.components || []).find((c) => c.product_id === sc.product_id)).map((sc) => (
              <tr key={`rem-${sc.component_id}`}>
                <td style={{ ...cellStyle, color: 'var(--punch-red)', textDecoration: 'line-through' }}>{sc.product_id ? findProductName(sc.product_id) : `Component ${sc.component_id}`}</td>
                <td style={{ ...cellStyle, color: 'var(--punch-red)', background: 'var(--punch-red-light)', fontSize: 11, fontWeight: 600 }}>REMOVED</td>
                <td style={{ ...cellStyle, color: 'var(--text-secondary)' }}>{sc.quantity} {sc.unit_of_measure}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Operations Section */}
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Work Operations</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...headerStyle, width: '40%' }}>Work Center</th>
              <th style={headerStyle}>Proposed Time</th>
              <th style={headerStyle}>Original Time</th>
            </tr>
          </thead>
          <tbody>
            {(bom.operations || []).sort((a, b) => a.sequence_order - b.sequence_order).map((op) => {
              const old = oldOpMap[op.operation_id]
              const changed = old && old.operation_time_mins !== op.operation_time_mins
              const isNew = !old;
              return (
                <tr key={op.operation_id}>
                  <td style={{ ...cellStyle, color: isNew ? 'var(--status-done-text)' : 'var(--text-primary)', fontWeight: isNew ? 600 : 400 }}>
                    {op.work_center} {isNew && <span style={{ fontSize: 10, marginLeft: 8, padding: '2px 6px', background: 'var(--status-done-bg)', borderRadius: 4 }}>NEW</span>}
                  </td>
                  <td style={{ ...cellStyle, color: changed || isNew ? 'var(--status-done-text)' : 'var(--text-primary)', background: (changed || isNew) ? 'var(--status-done-bg)' : 'transparent' }}>
                    {op.operation_time_mins} mins
                  </td>
                  <td style={{ ...cellStyle, color: changed ? 'var(--punch-red)' : 'var(--text-muted)', background: changed ? 'var(--punch-red-light)' : 'transparent' }}>
                    {old ? `${old.operation_time_mins} mins` : '\u2014'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EcoDiffView({ ecoId, ecoType, targetBomId, snapshot }) {
  const [diff, setDiff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/ecos/${ecoId}/diff`)
      .then((res) => setDiff(res.data))
      .catch(() => setError('Could not load comparison data'))
      .finally(() => setLoading(false))
  }, [ecoId])

  if (loading) return <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '24px 0', textAlign: 'center' }}>Generating diff view...</div>
  if (error) return <div style={{ color: 'var(--punch-red)', fontSize: 13, padding: '24px 0' }}>{error}</div>

  const isBom = ecoType === 'BoM'

  return (
    <div style={{ marginTop: 12 }}>
      {isBom
        ? <BomDiff bomId={targetBomId} snapshot={snapshot} />
        : diff.length === 0
          ? <div style={{ padding: '32px', textAlign: 'center', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-muted)', fontSize: 13 }}>No specification changes detected.</div>
          : <ProductDiff diff={diff} />
      }
    </div>
  )
}

export default EcoDiffView;