import React, { useEffect, useState } from 'react'
import api from '../../api/client'

export default function AuditLogReport() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ eco_id: '', user_id: '', from_date: '', to_date: '' })

  const fetchLogs = () => {
    setLoading(true)
    const params = {}
    if (filters.eco_id) params.eco_id = filters.eco_id
    if (filters.user_id) params.user_id = filters.user_id
    if (filters.from_date) params.from_date = new Date(filters.from_date).toISOString()
    if (filters.to_date) params.to_date = new Date(filters.to_date).toISOString()

    api.get('/reports/audit-logs', { params })
      .then((res) => setLogs(res.data))
      .catch((err) => setError(err.response?.data?.detail || 'Failed to load audit logs'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLogs() }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    fetchLogs()
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-4">Audit Logs</h1>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex gap-3 flex-wrap items-end">
        <div>
          <label className="block text-xs text-gray-500 mb-1">ECO ID</label>
          <input type="number" value={filters.eco_id} onChange={(e) => setFilters({ ...filters, eco_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">User ID</label>
          <input type="number" value={filters.user_id} onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">From</label>
          <input type="date" value={filters.from_date} onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">To</label>
          <input type="date" value={filters.to_date} onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg">
          Filter
        </button>
      </form>

      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

      {loading ? (
        <div className="text-gray-400 text-sm py-8 text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Log ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ECO</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">By User</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">No logs found</td></tr>
              )}
              {logs.map((log) => (
                <tr key={log.log_id} className="border-b border-gray-100">
                  <td className="px-4 py-3 font-mono text-gray-500">{log.log_id}</td>
                  <td className="px-4 py-3 font-mono text-blue-600">ECO-{log.eco_id}</td>
                  <td className="px-4 py-3 font-medium">{log.action_taken}</td>
                  <td className="px-4 py-3 text-gray-500">{log.action_by}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
