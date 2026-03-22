import React from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const ShieldAlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
)
const ArrowRightIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
)

export default function ApprovalRuleSettings() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  // Access Denied State — Using Danger Variant §5.3
  if (user?.role !== 'Admin') {
    return (
      <div style={{ background: 'var(--bg-page)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 32px' }}>
        <div style={{ 
          maxWidth: 400,
          background: 'var(--punch-red-light)', 
          border: '1px solid var(--punch-red-border)', 
          color: 'var(--punch-red)', 
          borderRadius: 12, 
          padding: '20px 24px', 
          fontSize: 13,
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <ShieldAlertIcon />
          <span>Access Denied — Admin privileges are required to modify approval logic.</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-page)', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        
        {/* Page Header §5.2 */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
              Approval Configurations
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4, fontWeight: 400 }}>
              Define sign-off requirements and reviewer hierarchies per ECO stage
            </p>
          </div>
        </div>

        {/* Surface Card §5.5 */}
        <div style={{ 
          maxWidth: 600, 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 12, 
          overflow: 'hidden'
        }}>
          {/* Card Header Row */}
          <div style={{ 
            padding: '12px 16px', 
            borderBottom: '1px solid var(--border)', 
            display: 'flex', 
            alignItems: 'center', 
            background: 'var(--bg-subtle)' 
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              Governance Rules
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--text-primary)', margin: 0 }}>
              Approval rules are managed within individual **ECO Stages**. Select a stage to assign designated reviewers and set their respective authority levels.
            </p>

            <div style={{ 
              background: 'var(--bg-subtle)', 
              borderRadius: 8, 
              padding: '16px', 
              border: '1px solid var(--border)' 
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', 
                    color: 'var(--status-review-text)', background: 'var(--status-review-bg)',
                    padding: '2px 6px', borderRadius: 4, marginTop: 1
                  }}>
                    Required
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Mandatory sign-off. The ECO is blocked from advancing until this user provides electronic approval.
                  </span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', 
                    color: 'var(--text-muted)', background: 'var(--bg-muted)',
                    padding: '2px 6px', borderRadius: 4, marginTop: 1
                  }}>
                    Optional
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    Informational review only. These users are notified of changes but do not block the workflow progression.
                  </span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/settings/stages')}
              style={{
                marginTop: 8,
                background: 'var(--punch-red)',
                color: '#ffffff',
                fontSize: 12.5,
                fontWeight: 600,
                height: 38,
                padding: '0 20px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: 'fit-content'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--punch-red-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--punch-red)'}
            >
              Configure ECO Stages <ArrowRightIcon />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}