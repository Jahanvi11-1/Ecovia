import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/client'

// Inline SVG Icons to avoid lucide-react dependency
const UserPlusIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="16" x2="22" y1="11" y2="11" />
  </svg>
)

const LoaderIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    aria-hidden="true"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
)

const ROLES = [
  'Engineering User',
  'Approver',
  'Operations User',
  'Admin',
]

export default function SignupPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    login_id: '',
    email: '',
    password: '',
    role: 'Engineering User',
  })

  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setErrors({})
    setLoading(true)

    try {
      await api.post('/auth/signup', form)

      setSuccess(true)

      setTimeout(() => {
        navigate('/login')
      }, 1500)
    } catch (err) {
      const detail = err.response?.data?.detail

      if (Array.isArray(detail)) {
        const fieldErrors = {}

        detail.forEach((d) => {
          const field =
            d.loc?.[d.loc.length - 1] || 'general'

          fieldErrors[field] = d.msg
        })

        setErrors(fieldErrors)
      } else {
        setErrors({
          general: detail || 'Signup failed',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        background: 'var(--bg-page)',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '28px 32px',
          width: '100%',
          maxWidth: 400,
          boxSizing: 'border-box',
          boxShadow: '0 4px 12px rgba(29,53,87,0.04)',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.4px',
              margin: 0,
            }}
          >
            Ecovia PLM
          </h1>

          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginTop: 4,
              marginBottom: 0,
              fontWeight: 400,
            }}
          >
            Create Account
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div
            style={{
              background: 'var(--status-done-bg)',
              border: '1px solid var(--status-done-dot)',
              color: 'var(--status-done-text)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          >
            Account created! Redirecting to login...
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div
            style={{
              background: 'var(--punch-red-light)',
              border: '1px solid var(--punch-red-border)',
              color: 'var(--punch-red)',
              borderRadius: 8,
              padding: '10px 14px',
              marginBottom: 16,
              fontSize: 12,
              fontWeight: 500,
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          >
            {errors.general}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            width: '100%',
          }}
        >
          {/* Login ID */}
          <div style={{ width: '100%' }}>
            <label
              htmlFor="signup-login-id"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 5,
              }}
            >
              Login ID{' '}
              <span
                style={{
                  color: 'var(--text-muted)',
                  fontWeight: 400,
                }}
              >
                (6–12 chars)
              </span>{' '}
              <span style={{ color: 'var(--punch-red)' }}>
                *
              </span>
            </label>

            <input
              id="signup-login-id"
              name="login_id"
              value={form.login_id}
              onChange={handleChange}
              required
              autoComplete="username"
              style={{
                height: 36,
                padding: '0 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                display: 'block',
              }}
            />

            {errors.login_id && (
              <p
                style={{
                  color: 'var(--punch-red)',
                  fontSize: 11,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {errors.login_id}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ width: '100%' }}>
            <label
              htmlFor="signup-email"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 5,
              }}
            >
              Email{' '}
              <span style={{ color: 'var(--punch-red)' }}>
                *
              </span>
            </label>

            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{
                height: 36,
                padding: '0 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                display: 'block',
              }}
            />

            {errors.email && (
              <p
                style={{
                  color: 'var(--punch-red)',
                  fontSize: 11,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ width: '100%' }}>
            <label
              htmlFor="signup-password"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 5,
              }}
            >
              Password{' '}
              <span style={{ color: 'var(--punch-red)' }}>
                *
              </span>
            </label>

            <input
              id="signup-password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              style={{
                height: 36,
                padding: '0 12px',
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--bg-subtle)',
                fontSize: 13,
                color: 'var(--text-primary)',
                width: '100%',
                boxSizing: 'border-box',
                outline: 'none',
                display: 'block',
              }}
            />

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 11,
                marginTop: 5,
                marginBottom: 0,
              }}
            >
              8+ chars, uppercase, lowercase, special character
            </p>

            {errors.password && (
              <p
                style={{
                  color: 'var(--punch-red)',
                  fontSize: 11,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* Role */}
          <div style={{ width: '100%' }}>
            <label
              htmlFor="signup-role"
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: 5,
              }}
            >
              Role{' '}
              <span style={{ color: 'var(--punch-red)' }}>
                *
              </span>
            </label>

            <select
              id="signup-role"
              name="role"
              value={form.role}
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
                boxSizing: 'border-box',
                outline: 'none',
                display: 'block',
                cursor: 'pointer',
              }}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {errors.role && (
              <p
                style={{
                  color: 'var(--punch-red)',
                  fontSize: 11,
                  marginTop: 4,
                  marginBottom: 0,
                }}
              >
                {errors.role}
              </p>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              minWidth: 0,
              height: 40,
              marginTop: 10,
              padding: '0 16px',

              background: loading
                ? 'var(--text-muted)'
                : 'var(--punch-red)',

              color: '#ffffff',

              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",

              border: 'none',
              borderRadius: 8,

              appearance: 'none',
              WebkitAppearance: 'none',

              cursor: loading
                ? 'not-allowed'
                : 'pointer',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,

              opacity: loading ? 0.7 : 1,
              visibility: 'visible',
              boxSizing: 'border-box',

              transition:
                'opacity 0.15s ease, transform 0.1s ease',
            }}
          >
            {loading ? <LoaderIcon /> : <UserPlusIcon />}

            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p
          style={{
            marginTop: 20,
            marginBottom: 0,
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          Already have an account?{' '}

          <Link
            to="/login"
            style={{
              color: 'var(--cerulean)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}