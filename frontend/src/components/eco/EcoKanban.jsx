import React from 'react'
import { useNavigate } from 'react-router-dom'

// Zero-install SVG Icons
const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.5}}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
)
const ArchiveIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{opacity: 0.5}}><polyline points="21 8 21 21 3 21 3 8"/><rect width="22" height="5" x="1" y="3" rx="2"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
)

const STATUS_COLORS = {
  Open: 'var(--cerulean)',
  Validated: 'var(--status-review-dot)',
  Applied: 'var(--status-done-dot)',
  Rejected: 'var(--punch-red)',
}

export default function EcoKanban({ ecos, stages }) {
  const navigate = useNavigate()

  // Group ECOs by current_stage_id (Logic preserved)
  const grouped = {}
  stages.forEach((s) => { grouped[s.stage_id] = [] })
  
  const terminal = ecos.filter((e) => e.status === 'Applied' || e.status === 'Rejected')
  const active = ecos.filter((e) => e.status !== 'Applied' && e.status !== 'Rejected')
  
  active.forEach((e) => {
    if (e.current_stage_id && grouped[e.current_stage_id] !== undefined) {
      grouped[e.current_stage_id].push(e)
    }
  })

  return (
    <div className="hide-scrollbar" style={{ 
      display: 'flex', 
      gap: 14, 
      overflowX: 'auto', 
      paddingBottom: 20,
      paddingTop: 4 
    }}>
      {stages.map((stage) => (
        <div key={stage.stage_id} style={{ flexShrink: 0, width: 280 }}>
          {/* Column Header */}
          <div style={{
            padding: '0 12px 10px',
            fontSize: 9.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <ClockIcon />
              {stage.stage_name}
            </div>
            <span style={{ color: 'var(--text-muted)' }}>{grouped[stage.stage_id]?.length || 0}</span>
          </div>

          {/* Column Surface */}
          <div style={{
            background: 'var(--bg-muted)',
            borderRadius: 12,
            minHeight: 400,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            border: '1px solid var(--border)'
          }}>
            {(grouped[stage.stage_id] || []).map((e) => (
              <div
                key={e.eco_id}
                onClick={() => navigate(`/ecos/${e.eco_id}`)}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(29,53,87,0.12)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(29,53,87,0.04)'}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${STATUS_COLORS[e.status] || 'var(--border-strong)'}`,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 4px rgba(29,53,87,0.04)'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cerulean)', marginBottom: 4, fontFamily: 'monospace' }}>
                  ECO-{String(e.eco_id).padStart(4, '0')}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 8 }}>
                  {e.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                   <span style={{ 
                     fontSize: 11, 
                     fontWeight: 500, 
                     color: 'var(--text-muted)',
                     background: 'var(--bg-page)',
                     padding: '2px 6px',
                     borderRadius: 4
                   }}>
                     {e.eco_type}
                   </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Terminal column (Completed / Rejected) */}
      {terminal.length > 0 && (
        <div style={{ flexShrink: 0, width: 280 }}>
          <div style={{
            padding: '0 12px 10px',
            fontSize: 9.5,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <ArchiveIcon />
            Completed / Rejected
          </div>
          <div style={{
            background: 'var(--bg-subtle)',
            borderRadius: 12,
            minHeight: 400,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            border: '1px dotted var(--border-strong)'
          }}>
            {terminal.map((e) => (
              <div
                key={e.eco_id}
                onClick={() => navigate(`/ecos/${e.eco_id}`)}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 10,
                  border: '1px solid var(--border)',
                  borderLeft: `4px solid ${STATUS_COLORS[e.status]}`,
                  padding: '12px 14px',
                  cursor: 'pointer',
                  opacity: 0.7,
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'monospace' }}>
                  ECO-{String(e.eco_id).padStart(4, '0')}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
                  {e.title}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: e.status === 'Applied' ? 'var(--status-done-text)' : 'var(--punch-red)' }}>
                  {e.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}