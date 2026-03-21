import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function BomDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [bom, setBom] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('components')

  useEffect(() => {
    api.get(`/boms/${id}`).then((res) => setBom(res.data)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>
  if (!bom) return <div className="text-red-500 py-8 text-center">BoM not found</div>

  const isArchived = bom.status === 'Archived'
  const ref = bom.reference || `BOM-${String(bom.bom_id).padStart(5, '0')}`

  return (
    <div className="max-w-2xl">
      <h2 className="text-base font-semibold text-gray-700 mb-2">Bill of Materials</h2>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => navigate('/boms')}
          className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1.5 rounded transition"
        >
          Back
        </button>
        {isArchived && (
          <span className="text-xs text-gray-400 italic self-center">Read-only (Archived)</span>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {/* Reference badge */}
        <div className="inline-block border border-gray-300 rounded px-2 py-0.5 text-xs font-mono text-gray-600 mb-4">
          {ref}
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div className="col-span-2">
            <label className="block text-xs text-gray-500 mb-1">Finished product</label>
            <span className="text-sm text-gray-700">{bom.product_version_id || '—'}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Quantity</label>
            <span className="text-sm text-gray-700">{bom.quantity ?? 1} {bom.unit_of_measure || 'Units'}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Reference</label>
            <span className="text-sm text-gray-700">{bom.reference || '—'}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Version</label>
            <span className="text-sm text-gray-700">{bom.bom_version}</span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Status</label>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${isArchived ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-700'}`}>
              {bom.status}
            </span>
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

          {tab === 'components' && (
            <div className="pt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-500 font-medium">Components</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">To consume</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.components.length === 0 && (
                    <tr><td colSpan={3} className="py-4 text-center text-gray-400">No components</td></tr>
                  )}
                  {bom.components.map((c) => (
                    <tr key={c.component_id} className="border-b border-gray-100">
                      <td className="py-1.5 text-gray-700">{c.product_id}</td>
                      <td className="py-1.5">{c.quantity}</td>
                      <td className="py-1.5">{c.unit_of_measure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'operations' && (
            <div className="pt-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-1.5 text-gray-500 font-medium">Seq</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Work Center</th>
                    <th className="text-left py-1.5 text-gray-500 font-medium">Expected Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {bom.operations.length === 0 && (
                    <tr><td colSpan={3} className="py-4 text-center text-gray-400">No operations</td></tr>
                  )}
                  {bom.operations.sort((a, b) => a.sequence_order - b.sequence_order).map((op) => (
                    <tr key={op.operation_id} className="border-b border-gray-100">
                      <td className="py-1.5">{op.sequence_order}</td>
                      <td className="py-1.5">{op.work_center}</td>
                      <td className="py-1.5">{op.operation_time_mins} mins</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
