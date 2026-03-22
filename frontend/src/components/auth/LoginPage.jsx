import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/client'
import useAuthStore from '../../store/authStore'

// Zero-install SVG Icons
const LogInIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/>
  </svg>
)

const LoaderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState({ login_id: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      login(res.data.access_token, null)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      background: 'var(--bg-page)', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <div style={{ 
        background: 'var(--surface)', 
        border: '1px solid var(--border)', 
        borderRadius: 12, 
        padding: '28px 32px', 
        width: '100%', 
        maxWidth: 400, 
        boxShadow: '0 4px 12px rgba(29,53,87,0.04)' 
      }}>
        
        {/* Page Header Block */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ 
            fontSize: 20, 
            fontWeight: 700, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.4px', 
            margin: 0 
          }}>
            Ecovia PLM
          </h1>
          <p style={{ 
            fontSize: 13, 
            color: 'var(--text-secondary)', 
            marginTop: 4, 
            fontWeight: 400 
          }}>
            Sign In
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div style={{ 
            background: 'var(--punch-red-light)', 
            border: '1px solid var(--punch-red-border)', 
            color: 'var(--punch-red)', 
            borderRadius: 8, 
            padding: '10px 14px', 
            marginBottom: 16, 
            fontSize: 12, 
            fontWeight: 500 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Login ID Field */}
          <div>
            <label style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: 'var(--text-secondary)', 
              display: 'block', 
              marginBottom: 5 
            }}>
              Login ID <span style={{ color: 'var(--punch-red)' }}>*</span>
            </label>
            <input
              name="login_id"
              value={form.login_id}
              onChange={handleChange}
              required
              style={{ 
                height: 36, 
                padding: '0 12px', 
                border: '1px solid var(--border)', 
                borderRadius: 8, 
                background: 'var(--bg-subtle)', 
                fontSize: 13, 
                color: 'var(--text-primary)', 
                width: '100%', 
                outline: 'none' 
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: 'var(--text-secondary)', 
              display: 'block', 
              marginBottom: 5 
            }}>
              Password <span style={{ color: 'var(--punch-red)' }}>*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              style={{ 
                height: 36, 
                padding: '0 12px', 
                border: '1px solid var(--border)', 
                borderRadius: 8, 
                background: 'var(--bg-subtle)', 
                fontSize: 13, 
                color: 'var(--text-primary)', 
                width: '100%', 
                outline: 'none' 
              }}
            />
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? 'var(--text-muted)' : 'var(--punch-red)',
              color: '#ffffff',
              fontSize: 12.5,
              fontWeight: 600,
              height: 36,
              padding: '0 16px',
              borderRadius: 8,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              marginTop: 10
            }}
          >
            {loading ? <LoaderIcon /> : <LogInIcon />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Navigation Links */}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13 }}>
          <p style={{ margin: '4px 0' }}>
            <Link to="/forgot-password" style={{ color: 'var(--cerulean)', fontWeight: 500, textDecoration: 'none' }}>
              Forgot password?
            </Link>
          </p>
          <p style={{ margin: '4px 0', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--cerulean)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}