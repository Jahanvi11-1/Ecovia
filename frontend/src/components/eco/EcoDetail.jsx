import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'
import EcoDiffView from '../eco/EcoDiffView'

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

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>
  if (!eco) return <div className="text-red-500 py-8 text-center">ECO not found</div>

  const stage = eco.current_stage
  const requiresApproval = stage?.requires_approval
  const isBom = eco.eco_type === 'BoM'

  // Status dot color
  const dotColor = eco.status === 'Applied'
    ? 'bg-green-500'
    : eco.status === 'Rejected'
    ? 'bg-red-500'
    : 'bg-white border-2 border-gray-400'

  return (
    <div className="max-w-3xl">
      <button onClick={() => navigate('/ecos')} className="text-blue-600 hover:underline text-sm mb-3 inline-block">
        ← Back
      </button>

      {/* Top action bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* Approval button — only if stage requires approval and user is approver */}
        {!isTerminal && requiresApproval && isApprover && (
          <button
            onClick={() => doAction('approve')}
            disabled={actionLoading}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            Approval
          </button>
        )}

        {/* Open BoM / Open Product */}
        {isBom && eco.target_bom_id && (
          <button
            onClick={() => navigate(`/boms/${eco.target_bom_id}`)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition"
          >
            Open Bill of Materials
          </button>
        )}
        {!isBom && eco.target_product_id && (
          <button
            onClick={() => navigate(`/products/${eco.target_product_id}`)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition"
          >
            Open Product Form
          </button>
        )}

        {/* Changes button — scrolls to diff */}
        <button
          onClick={() => document.getElementById('eco-diff')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition"
        >
          Changes
        </button>

        {/* Validate / Apply */}
        {!isTerminal && !requiresApproval && (eco.status === 'Open') && (
          <button
            onClick={() => doAction('validate')}
            disabled={actionLoading}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            Validate
          </button>
        )}
        {!isTerminal && eco.status === 'Validated' && isApprover && (
          <button
            onClick={() => doAction('apply')}
            disabled={actionLoading}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            Apply
          </button>
        )}

        {/* Reject */}
        {!isTerminal && isApprover && (
          <button
            onClick={() => doAction('reject')}
            disabled={actionLoading}
            className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-sm font-medium px-4 py-1.5 rounded transition disabled:opacity-50"
          >
            Reject
          </button>
        )}

        {/* Status dot + label */}
        <div className="ml-auto flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${dotColor}`} />
          <span className="text-xs text-gray-500">{eco.status}</span>
          {stage && <span className="text-xs text-gray-400">· {stage.stage_name}</span>}
        </div>
      </div>

      {error && (
        <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}

      {/* Readonly form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mb-6">
        <Field label="Title*" value={eco.title} />
        <Field label="ECO Type*" value={eco.eco_type === 'BoM' ? 'Bill of Materials' : 'Product'} />
        <Field label="Product*" value={eco.target_product?.product_code || eco.target_product_id || '—'} />
        {isBom && (
          <Field label="Bill of Materials*" value={eco.target_bom?.bom_version || eco.target_bom_id || '—'} />
        )}
        <Field label="User*" value={eco.created_by || '—'} />
        <Field
          label="Effective Date"
          value={eco.effective_date ? new Date(eco.effective_date).toLocaleString() : '—'}
        />
        <div className="flex items-center gap-4">
          <span className="w-36 text-sm text-gray-600 flex-shrink-0">Version Update</span>
          <input type="checkbox" checked={eco.version_update_toggle} readOnly className="w-4 h-4" />
        </div>
      </div>

      {/* Proposed changes editor — Product ECO only, before Applied */}
      {!isBom && eco.status !== 'Applied' && eco.status !== 'Rejected' && (
        <ProposedChangesEditor eco={eco} onSaved={fetchEco} />
      )}

      {/* BoM editor — BoM ECO only, before Applied */}
      {isBom && eco.target_bom_id && eco.status !== 'Applied' && eco.status !== 'Rejected' && (
        <BomChangesEditor bomId={eco.target_bom_id} />
      )}

      {/* Diff / Changes section */}
      <div id="eco-diff">
        <EcoDiffView ecoId={id} ecoType={eco.eco_type} targetBomId={eco.target_bom_id} snapshot={eco.proposed_changes} />
      </div>
    </div>
  )
}

function Field({ label, value }) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-36 text-sm text-gray-600 flex-shrink-0">{label}</span>
      <span className="flex-1 border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700">
        {value}
      </span>
    </div>
  )
}

function ProposedChangesEditor({ eco, onSaved }) {
  const changes = eco.proposed_changes || {}
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
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-700">Proposed Changes</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
      {error && <div className="text-sm text-red-600 mb-3">{error}</div>}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">New Sales Price</label>
            <input type="number" step="0.01" value={form.sale_price} onChange={set('sale_price')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">New Cost Price</label>
            <input type="number" step="0.01" value={form.cost_price} onChange={set('cost_price')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">New Attachments URL</label>
          <input type="text" value={form.attachments_url} onChange={set('attachments_url')}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-3">These values will be applied to the product when the ECO is Applied.</p>
    </div>
  )
}

function BomChangesEditor({ bomId }) {
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New component row
  const [newComp, setNewComp] = useState({ product_id: '', quantity: '', unit_of_measure: 'Units' })
  // New operation row
  const [newOp, setNewOp] = useState({ work_center: '', operation_time_mins: '', sequence_order: '' })

  const [products, setProducts] = useState([])

  const fetchBom = () =>
    api.get(`/boms/${bomId}`).then((res) => setBom(res.data)).finally(() => setLoading(false))

  useEffect(() => {
    fetchBom()
    api.get('/products/').then((res) => setProducts(res.data))
  }, [bomId])

  const addComponent = async () => {
    if (!newComp.product_id || !newComp.quantity) return
    setError('')
    try {
      await api.post(`/boms/${bomId}/components`, {
        product_id: parseInt(newComp.product_id),
        quantity: parseFloat(newComp.quantity),
        unit_of_measure: newComp.unit_of_measure || 'Units',
      })
      setNewComp({ product_id: '', quantity: '', unit_of_measure: 'Units' })
      fetchBom()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add component')
    }
  }

  const removeComponent = async (componentId) => {
    try {
      await api.delete(`/boms/${bomId}/components/${componentId}`)
      fetchBom()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove component')
    }
  }

  const addOperation = async () => {
    if (!newOp.work_center || !newOp.operation_time_mins) return
    setError('')
    try {
      await api.post(`/boms/${bomId}/operations`, {
        work_center: newOp.work_center,
        operation_time_mins: parseInt(newOp.operation_time_mins),
        sequence_order: parseInt(newOp.sequence_order) || (bom?.operations?.length || 0) + 1,
      })
      setNewOp({ work_center: '', operation_time_mins: '', sequence_order: '' })
      fetchBom()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add operation')
    }
  }

  const removeOperation = async (operationId) => {
    try {
      await api.delete(`/boms/${bomId}/operations/${operationId}`)
      fetchBom()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to remove operation')
    }
  }

  if (loading) return <div className="text-gray-400 text-sm py-4">Loading BoM...</div>
  if (!bom) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-6 space-y-5">
      <span className="text-sm font-semibold text-gray-700">BoM Changes</span>
      {error && <div className="text-sm text-red-600">{error}</div>}

      {/* Components */}
      <div>
        <div className="text-xs font-semibold text-gray-600 mb-2">Components</div>
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Product</th>
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Qty</th>
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">UoM</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(bom.components || []).map((c) => (
              <tr key={c.component_id} className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">
                  {products.find((p) => p.product_id === c.product_id)?.active_version?.product_name || `Product #${c.product_id}`}
                </td>
                <td className="py-1.5 text-gray-700">{c.quantity}</td>
                <td className="py-1.5 text-gray-500">{c.unit_of_measure}</td>
                <td className="py-1.5">
                  <button onClick={() => removeComponent(c.component_id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add component row */}
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <select
              value={newComp.product_id}
              onChange={(e) => setNewComp((f) => ({ ...f, product_id: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.active_version?.product_name || p.product_code}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number" min="0" step="0.01" placeholder="Qty"
            value={newComp.quantity}
            onChange={(e) => setNewComp((f) => ({ ...f, quantity: e.target.value }))}
            className="w-20 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="text" placeholder="UoM"
            value={newComp.unit_of_measure}
            onChange={(e) => setNewComp((f) => ({ ...f, unit_of_measure: e.target.value }))}
            className="w-20 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={addComponent}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
          >
            Add
          </button>
        </div>
      </div>

      {/* Operations */}
      <div>
        <div className="text-xs font-semibold text-gray-600 mb-2">Work Orders</div>
        <table className="w-full text-sm mb-2">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Work Center</th>
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Time (mins)</th>
              <th className="text-left py-1.5 text-xs text-gray-500 font-medium">Seq</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(bom.operations || []).sort((a, b) => a.sequence_order - b.sequence_order).map((op) => (
              <tr key={op.operation_id} className="border-b border-gray-50">
                <td className="py-1.5 text-gray-700">{op.work_center}</td>
                <td className="py-1.5 text-gray-700">{op.operation_time_mins}</td>
                <td className="py-1.5 text-gray-500">{op.sequence_order}</td>
                <td className="py-1.5">
                  <button onClick={() => removeOperation(op.operation_id)} className="text-red-400 hover:text-red-600 text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add operation row */}
        <div className="flex gap-2 items-end">
          <input
            type="text" placeholder="Work Center"
            value={newOp.work_center}
            onChange={(e) => setNewOp((f) => ({ ...f, work_center: e.target.value }))}
            className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="number" min="1" placeholder="Mins"
            value={newOp.operation_time_mins}
            onChange={(e) => setNewOp((f) => ({ ...f, operation_time_mins: e.target.value }))}
            className="w-20 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <input
            type="number" min="1" placeholder="Seq"
            value={newOp.sequence_order}
            onChange={(e) => setNewOp((f) => ({ ...f, sequence_order: e.target.value }))}
            className="w-16 border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={addOperation}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
