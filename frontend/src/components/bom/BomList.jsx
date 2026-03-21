import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/client'

export default function BomList() {
  const [boms, setBoms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/boms/').then((res) => setBoms(res.data)).finally(() => setLoading(false))
  }, [])

  const filtered = boms.filter((b) => {
    if (!search) return true
    const name = b.product_name || b.bom_version || ''
    return (
      name.toLowerCase().includes(search.toLowerCase()) ||
      b.reference?.toLowerCase().includes(search.toLowerCase())
    )
  })

  if (loading) return <div className="text-gray-500 py-8 text-center">Loading...</div>

  return (
    <div className="max-w-3xl">
      {/* Header bar matching wireframe */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          {/* Hamburger icon */}
          <div className="flex flex-col gap-0.5 mr-1">
            <span className="block w-4 h-0.5 bg-gray-500" />
            <span className="block w-4 h-0.5 bg-gray-500" />
            <span className="block w-4 h-0.5 bg-gray-500" />
          </div>
          <button
            onClick={() => navigate('/boms/new')}
            className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded transition"
          >
            New
          </button>
          <span className="flex-1 text-center text-sm font-semibold text-gray-700">Bills of Materials</span>
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-xs w-36 focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          {/* List/grid toggle icons */}
          <div className="flex gap-1 text-gray-400 text-xs">
            <span className="cursor-pointer hover:text-gray-600">☰</span>
            <span className="cursor-pointer hover:text-gray-600">⊞</span>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-white">
            <tr>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Finished Product</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Reference</th>
              <th className="text-right px-4 py-2.5 font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center py-10 text-gray-400">No BoMs found</td>
              </tr>
            )}
            {filtered.map((b) => (
              <tr
                key={b.bom_id}
                onClick={() => navigate(`/boms/${b.bom_id}`)}
                className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer"
              >
                <td className="px-4 py-2.5 text-gray-800">
                  {b.product_name || b.bom_version}
                </td>
                <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">
                  {b.reference ? `[${b.reference}]` : `[BOM-${String(b.bom_id).padStart(5, '0')}]`}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    b.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
