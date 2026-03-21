import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'
import useUiStore from '../../store/uiStore'
import EcoKanban from './EcoKanban'

// Status dot: green=Applied/approved, white=Open/in-progress, red=Rejected/cancelled
function StatusDot({ status }) {
  const colors = {
    Applied: 'bg-green-500',
    Open: 'bg-white border-2 border-gray-400',
    Validated: 'bg-yellow-400',
    Rejected: 'bg-red-500',
  }
  return (
    <span className={`inline-block w-3 h-3 rounded-full ${colors[status] || 'bg-gray-300'}`} title={status} />
  )
}

export default function EcoList() {
  const navigate = useNavigate()
  const { viewMode, searchQuery } = useUiStore()
  const [ecos, setEcos] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ecos/').then((res) => setEcos(res.data)).finally(() => setLoading(false))
    api.get('/settings/stages').then((res) => setStages(res.data)).catch(() => {})
  }, [])

  const filtered = ecos.filter((e) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      e.title?.toLowerCase().includes(q) ||
      e.eco_type?.toLowerCase().includes(q) ||
      e.status?.toLowerCase().includes(q)
    )
  })

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>

  if (viewMode === 'kanban') {
    return <EcoKanban ecos={filtered} stages={stages} />
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 w-8"></th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">ECO Type</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Product</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={4} className="text-center py-10 text-gray-400">No ECOs found</td>
            </tr>
          )}
          {filtered.map((e) => (
            <tr
              key={e.eco_id}
              onClick={() => navigate(`/ecos/${e.eco_id}`)}
              className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
            >
              <td className="px-4 py-3">
                <StatusDot status={e.status} />
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">{e.title}</td>
              <td className="px-4 py-3 text-gray-600">{e.eco_type}</td>
              <td className="px-4 py-3 text-gray-600">
                {e.target_product?.product_code || e.target_product_id || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
