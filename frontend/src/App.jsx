import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'
import api from './api/client'


import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import Dashboard from './components/layout/Dashboard'


function ProtectedRoute({ children }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}


function App() {
  const { token, setUser } = useAuthStore()


  useEffect(() => {
    if (token) {
      api.get('/auth/me').then((res) => setUser(res.data)).catch(() => {})
    }
  }, [token])


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}


export default App
