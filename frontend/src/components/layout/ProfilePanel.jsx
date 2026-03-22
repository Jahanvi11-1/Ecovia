import React from 'react'
import { useNavigate } from 'react-router-dom'
import useUiStore from '../../store/uiStore'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
)

const LogOutIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
)

export default function ProfilePanel() {
  const { profileOpen, setProfileOpen } = useUiStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop — Using specified rgba for backdropFilter support */}
      {profileOpen && (
        <div
          onClick={() => setProfileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            background: 'rgba(29,53,87,0.2)',
            backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Drawer — Always slides from the RIGHT per §5.13 */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100%',
          width: 280,
          background: 'var(--surface)',
          borderLeft: '1px solid var(--border)',
          boxShadow: '-4px 0 24px rgba(29,53,87,0.08)',
          zIndex: 50,
          transform: profileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif"
        }}
      >
        {/* Header Row */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            User Profile
          </span>
          <button
            onClick={() => setProfileOpen(false)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-muted)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <XIcon />
          </button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {user ? (
            <>
              {/* User Identity Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--oxford-navy)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 16
                }}>
                  {user.login_id?.[0]?.toUpperCase() || 'U'}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ 
                    fontSize: 14, 
                    fontWeight: 600, 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user.login_id}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Role Info Card */}
              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 8,
                padding: '10px 14px',
                border: '1px solid var(--border)'
              }}>
                <p style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: 'var(--text-muted)',
                  marginBottom: 4
                }}>
                  Assigned Role
                </p>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  {user.role}
                </p>
              </div>
            </>
          ) : (
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading account data...</p>
          )}

          {/* Danger Button — Following §5.3 Variant */}
          <button
            onClick={handleLogout}
            style={{
              background: 'var(--punch-red-light)',
              color: 'var(--punch-red)',
              fontSize: 12.5,
              fontWeight: 600,
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: '1px solid var(--punch-red-border)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--punch-red-light)'}
          >
            <LogOutIcon /> Sign Out
          </button>
        </div>
      </div>
    </>
  )
}