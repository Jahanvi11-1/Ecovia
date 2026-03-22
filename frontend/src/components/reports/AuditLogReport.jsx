import React, { useEffect, useState } from 'react'
import api from '../../api/client'

// Zero-install SVG Icons
const FilterIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
)

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

  // Common styles from §5.4
  const inputStyle = {
    height: 36,
    padding: '0 12px',
    border: '1px solid var(--border)',
    borderRadius: 8,
    background: 'var(--bg-subtle)',
    fontSize: 13,
    fontFamily: 'inherit',
    color: 'var(--text-primary)',
    outline: 'none',
  }

  const labelStyle = {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: 5
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header §5.2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              Audit Logs
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
              Track all system actions and Engineering Change history
            </p>
          </div>
        </div>

        {/* Filters Card §5.5 */}
        <form 
          onSubmit={handleFilter} 
          style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            borderRadius: 12, 
            padding: '20px 24px', 
            marginBottom: 14,
            display: 'flex',
            gap: 16,
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ width: 100 }}>
            <label style={labelStyle}>ECO ID</label>
            <input 
              type="number" 
              value={filters.eco_id} 
              onChange={(e) => setFilters({ ...filters, eco_id: e.target.value })}
              style={{ ...inputStyle, width: '100%' }}
              placeholder="000"
            />
          </div>
          <div style={{ width: 100 }}>
            <label style={labelStyle}>User ID</label>
            <input 
              type="number" 
              value={filters.user_id} 
              onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              style={{ ...inputStyle, width: '100%' }}
              placeholder="000"
            />
          </div>
          <div>
            <label style={labelStyle}>From Date</label>
            <input 
              type="date" 
              value={filters.from_date} 
              onChange={(e) => setFilters({ ...filters, from_date: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>To Date</label>
            <input 
              type="date" 
              value={filters.to_date} 
              onChange={(e) => setFilters({ ...filters, to_date: e.target.value })}
              style={inputStyle}
            />
          </div>
          <button 
            type="submit" 
            style={{
              background: 'var(--punch-red)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--punch-red-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--punch-red)'}
          >
            <FilterIcon /> Apply Filters
          </button>
        </form>

        {error && (
          <div style={{ 
            fontSize: 13, 
            color: 'var(--punch-red)', 
            background: 'var(--punch-red-light)', 
            border: '1px solid var(--punch-red-border)', 
            padding: '10px 14px', 
            borderRadius: 8, 
            marginBottom: 14 
          }}>
            {error}
          </div>
        )}

        {/* Table Container §5.6 */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                <th style={tableHeaderStyle}>Log ID</th>
                <th style={tableHeaderStyle}>Reference</th>
                <th style={tableHeaderStyle}>Action Performed</th>
                <th style={tableHeaderStyle}>By User</th>
                <th style={{ ...tableHeaderStyle, textAlign: 'right' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    Fetching logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                    No activity found for the selected criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr 
                    key={log.log_id}
                    style={{ 
                      borderBottom: idx === logs.length - 1 ? 'none' : '1px solid #f1f5f9',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafcff'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ ...tableCellStyle, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      #{log.log_id}
                    </td>
                    <td style={{ ...tableCellStyle, fontWeight: 600, color: 'var(--cerulean)' }}>
                      ECO-{log.eco_id}
                    </td>
                    <td style={tableCellStyle}>
                      {log.action_taken}
                    </td>
                    <td style={tableCellStyle}>
                      {log.action_by}
                    </td>
                    <td style={{ ...tableCellStyle, textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

// Internal styles for table consistency §5.6
const tableHeaderStyle = {
  padding: '11px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap',
}

const tableCellStyle = {
  padding: '11px 16px',
  fontSize: 13,
  color: 'var(--text-primary)',
  verticalAlign: 'middle',
}