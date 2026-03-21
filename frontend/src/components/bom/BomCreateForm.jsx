import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

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
  const [components, setComponents] = useState([]) // { product_id, quantity, unit_of_measure }
  const [operations, setOperations] = useState([]) // { work_center, operation_time_mins, sequence_order }
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
      // Add components
      for (const c of components) {
        await api.post(`/boms/${bomId}/components`, c)
      }
      // Add operations
      for (const op of operations) {
        await api.post(`/boms/${bomId}/operations`, op)
      }
      navigate(`/boms/${bomId}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save BoM')
    } finally {
      setSaving(false)
    }
  }

  const selectedProduct = products.find((p) => String(p.product_id) === String(selectedProductId))

  return (
    <div className="max-w-2xl">
      <h2 className="text-base font-semibold text-gray-700 mb-2">Bill of Materials</h2>

      {/* Action buttons */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => navigate('/boms')}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Auto reference */}
        <div className="inline-block border border-gray-300 rounded px-2 py-0.5 text-xs font-mono text-gray-600 mb-4">
          {form.reference || autoRef}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          {/* Finished Product */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Finished product</label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-blue-400 bg-transparent"
            >
              <option value="">Select product...</option>
              {products.map((p) => (
                <option key={p.product_id} value={p.product_id}>
                  {p.active_version?.product_name || p.product_code}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity + Units */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                className="w-20 border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-blue-400 bg-transparent"
              />
              <input
                value={form.unit_of_measure}
                onChange={(e) => setForm((f) => ({ ...f, unit_of_measure: e.target.value }))}
                className="w-20 border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-blue-400 bg-transparent"
                placeholder="Units"
              />
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Reference <span className="text-gray-400">(max 8 chars)</span></label>
            <input
              maxLength={8}
              value={form.reference}
              onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
              className="w-full border-b border-gray-300 text-sm py-1 focus:outline-none focus:border-blue-400 bg-transparent"
              placeholder="e.g. REF-001"
            />
          </div>

          {/* Version (readonly, auto) */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Version</label>
            <span className="text-xs text-gray-400 italic">Auto-generated on save</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t border-gray-200 mt-2">
          <div className="flex">
            <button
              onClick={() => setTab('components')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${tab === 'components' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Components
            </button>
            <button
              onClick={() => setTab('operations')}
              className={`px-4 py-2 text-xs font-semibold border-b-2 transition ${tab === 'operations' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              Work Orders
            </button>
          </div>

          {/* Components tab */}
          {tab === 'components' && (
            <div className="pt-3">
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-500 font-medium">Components</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">To consume</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Units</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {components.map((c, i) => {
                    const p = products.find((x) => String(x.product_id) === String(c.product_id))
                    return (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="py-1.5 text-gray-700">{p?.active_version?.product_name || p?.product_code || c.product_id}</td>
                        <td className="py-1.5">{c.quantity}</td>
                        <td className="py-1.5">{c.unit_of_measure}</td>
                        <td className="py-1.5 text-right">
                          <button onClick={() => removeComponent(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                        </td>
                      </tr>
                    )
                  })}
                  {/* Add a line row */}
                  <tr>
                    <td className="py-1.5">
                      <select
                        value={newComp.product_id}
                        onChange={(e) => setNewComp((c) => ({ ...c, product_id: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-full focus:outline-none bg-transparent"
                      >
                        <option value="">Add a product...</option>
                        {products.map((p) => (
                          <option key={p.product_id} value={p.product_id}>
                            {p.active_version?.product_name || p.product_code}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newComp.quantity}
                        onChange={(e) => setNewComp((c) => ({ ...c, quantity: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-16 focus:outline-none bg-transparent"
                        placeholder="Qty"
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        value={newComp.unit_of_measure}
                        onChange={(e) => setNewComp((c) => ({ ...c, unit_of_measure: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-16 focus:outline-none bg-transparent"
                        placeholder="Units"
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <button onClick={addComponent} className="text-blue-500 hover:text-blue-700 text-xs font-medium">+ Add</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Work Orders tab */}
          {tab === 'operations' && (
            <div className="pt-3">
              <table className="w-full text-xs mb-2">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-500 font-medium">Operation</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Work Center</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Expected Duration</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-700">{op.sequence_order}</td>
                      <td className="py-1.5">{op.work_center}</td>
                      <td className="py-1.5">{op.operation_time_mins} mins</td>
                      <td className="py-1.5 text-right">
                        <button onClick={() => removeOperation(i)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                      </td>
                    </tr>
                  ))}
                  {/* Add a line row */}
                  <tr>
                    <td className="py-1.5">
                      <input
                        type="number"
                        value={newOp.sequence_order}
                        onChange={(e) => setNewOp((o) => ({ ...o, sequence_order: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-12 focus:outline-none bg-transparent"
                        placeholder="Seq"
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        value={newOp.work_center}
                        onChange={(e) => setNewOp((o) => ({ ...o, work_center: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-full focus:outline-none bg-transparent"
                        placeholder="Work center..."
                      />
                    </td>
                    <td className="py-1.5">
                      <input
                        type="number"
                        value={newOp.operation_time_mins}
                        onChange={(e) => setNewOp((o) => ({ ...o, operation_time_mins: e.target.value }))}
                        className="border-b border-gray-300 text-xs py-0.5 w-16 focus:outline-none bg-transparent"
                        placeholder="mins"
                      />
                    </td>
                    <td className="py-1.5 text-right">
                      <button onClick={addOperation} className="text-blue-500 hover:text-blue-700 text-xs font-medium">+ Add</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
