import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/products/${id}`).then((res) => setProduct(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>
  if (!product) return <div className="text-red-500 py-8 text-center">Product not found</div>

  const v = product.active_version

  return (
    <div className="max-w-lg">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => navigate('/products')}
            className="text-gray-500 hover:text-gray-700 text-xs px-2 py-1 rounded border border-gray-300 bg-white hover:bg-gray-50 transition"
          >
            ← Back
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-gray-700">
            {v?.product_name || product.product_code}
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Product Name</label>
            <input
              readOnly
              value={v?.product_name || '—'}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sales Price</label>
              <input
                readOnly
                value={v?.sale_price != null ? v.sale_price : '—'}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost Price</label>
              <input
                readOnly
                value={v?.cost_price != null ? v.cost_price : '—'}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Attachments</label>
            <input
              readOnly
              value={v?.attachments_url || '—'}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Version</label>
            <input
              readOnly
              value={v ? `v${v.version_number}` : '—'}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Version updates only when an ECO is applied</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
              v?.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {v?.status || 'No version'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
