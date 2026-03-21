import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

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
      // Auto-generate a product_code from name + timestamp
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

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-gray-700">New Product</span>
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <form id="product-form" onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
            <input
              required
              maxLength={255}
              value={form.product_name}
              onChange={set('product_name')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Widget A"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sales Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sale_price}
                onChange={set('sale_price')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.cost_price}
                onChange={set('cost_price')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Attachments (URL or filename)</label>
            <input
              type="text"
              value={form.attachments_url}
              onChange={set('attachments_url')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. spec-sheet.pdf"
            />
            <p className="text-xs text-gray-400 mt-1">Accepts Excel, PDF, or image filenames/URLs</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
            <input
              readOnly
              value="v1 (auto)"
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Version updates only when an ECO is applied</p>
          </div>
        </form>
      </div>
    </div>
  )
}
