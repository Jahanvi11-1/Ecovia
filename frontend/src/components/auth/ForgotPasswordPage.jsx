import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/client'

// Zero-install SVG Icons
const MailIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
)

const LoaderIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/forgot-password', { email })
      setMessage(res.data.message)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
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
            Reset Password
          </p>
        </div>

        {/* Semantic Status Messages */}
        {message && (
          <div style={{ 
            background: 'var(--status-done-bg)', 
            border: '1px solid var(--status-done-dot)', 
            color: 'var(--status-done-text)', 
            borderRadius: 8, 
            padding: '10px 14px', 
            marginBottom: 16, 
            fontSize: 12, 
            fontWeight: 500 
          }}>
            {message}
          </div>
        )}

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
          {/* Email Field */}
          <div>
            <label style={{ 
              fontSize: 12, 
              fontWeight: 500, 
              color: 'var(--text-secondary)', 
              display: 'block', 
              marginBottom: 5 
            }}>
              Email address <span style={{ color: 'var(--punch-red)' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="e.g. john@company.com"
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

          {/* Primary CTA Button */}
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
            {loading ? <LoaderIcon /> : <MailIcon />}
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Back Link */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <Link to="/login" style={{ 
            fontSize: 13, 
            color: 'var(--cerulean)', 
            fontWeight: 500, 
            textDecoration: 'none' 
          }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}