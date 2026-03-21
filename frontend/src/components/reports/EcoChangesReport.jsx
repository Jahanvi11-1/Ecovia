import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function EcoChangesReport() {
  const [ecos, setEcos] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/ecos/').then((res) => setEcos(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Reporting</h1>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-center text-sm font-semibold text-gray-700">
          Engineering Change Orders
        </div>
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ECO Title</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">ECO Type</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Product Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Changes</th>
            </tr>
          </thead>
          <tbody>
            {ecos.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">No ECOs found</td>
              </tr>
            )}
            {ecos.map((e) => (
              <tr key={e.eco_id} className="border-b border-gray-100">
                <td className="px-4 py-3 text-gray-800">{e.title}</td>
                <td className="px-4 py-3 text-gray-600">
                  {e.eco_type === 'BoM' ? 'Bill of Materials' : e.eco_type}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {e.target_product?.product_code || e.target_product_id || '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => navigate(`/ecos/${e.eco_id}#eco-diff`)}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-medium px-3 py-1 rounded transition"
                  >
                    Changes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
