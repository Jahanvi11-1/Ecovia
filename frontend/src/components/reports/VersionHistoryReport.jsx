import React, { useEffect, useState } from 'react'
import api from '../../api/client'

export default function VersionHistoryReport() {
  const [data, setData] = useState({ product_versions: [], bom_versions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/reports/version-history').then((res) => setData(res.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Version History</h1>

      {/* Product Versions */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">Product Versions</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Product ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Version</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Name</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Latest</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.product_versions.length === 0 && (
              <tr><td colSpan={6} className="text-center py-6 text-gray-400">No product versions</td></tr>
            )}
            {data.product_versions.map((v) => (
              <tr key={v.version_id} className={`border-b border-gray-100 ${v.status === 'Archived' ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">{v.product_id}</td>
                <td className="px-4 py-3 font-mono">v{v.version_number}</td>
                <td className="px-4 py-3">{v.product_name}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {v.status}
                  </span>
                </td>
                <td className="px-4 py-3">{v.is_latest ? '✓' : ''}</td>
                <td className="px-4 py-3 text-gray-500">{v.created_at ? new Date(v.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BoM Versions */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3">BoM Versions</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">BoM ID</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Finished Product</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">BoM Version</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody>
            {data.bom_versions.length === 0 && (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400">No BoM versions</td></tr>
            )}
            {data.bom_versions.map((b) => (
              <tr key={b.bom_id} className={`border-b border-gray-100 ${b.status === 'Archived' ? 'opacity-60' : ''}`}>
                <td className="px-4 py-3">{b.bom_id}</td>
                <td className="px-4 py-3">{b.product_name || `Version ${b.product_version_id}`}</td>
                <td className="px-4 py-3 font-mono">{b.bom_version}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{b.created_at ? new Date(b.created_at).toLocaleDateString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
