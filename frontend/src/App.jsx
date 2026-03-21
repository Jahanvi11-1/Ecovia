import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import useAuthStore from './store/authStore'
import api from './api/client'

import LoginPage from './components/auth/LoginPage'
import SignupPage from './components/auth/SignupPage'
import ForgotPasswordPage from './components/auth/ForgotPasswordPage'
import AppLayout from './components/layout/AppLayout'

import ProductList from './components/products/ProductList'
import ProductDetail from './components/products/ProductDetail'
import ProductCreateForm from './components/products/ProductCreateForm'
import BomList from './components/bom/BomList'
import BomDetail from './components/bom/BomDetail'
import BomCreateForm from './components/bom/BomCreateForm'
import EcoList from './components/eco/EcoList'
import EcoDetail from './components/eco/EcoDetail'
import EcoCreateForm from './components/eco/EcoCreateForm'
import EcoStageSettings from './components/settings/EcoStageSettings'
import ApprovalRuleSettings from './components/settings/ApprovalRuleSettings'
import AuditLogReport from './components/reports/AuditLogReport'
import VersionHistoryReport from './components/reports/VersionHistoryReport'
import EcoChangesReport from './components/reports/EcoChangesReport'

// Redirects to /login if not authenticated, otherwise renders child routes via Outlet
function RequireAuth() {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
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
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Auth guard */}
        <Route element={<RequireAuth />}>
          {/* Layout shell */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/ecos" replace />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductCreateForm />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/boms" element={<BomList />} />
            <Route path="/boms/new" element={<BomCreateForm />} />
            <Route path="/boms/:id" element={<BomDetail />} />
            <Route path="/ecos" element={<EcoList />} />
            <Route path="/ecos/new" element={<EcoCreateForm />} />
            <Route path="/ecos/:id" element={<EcoDetail />} />
            <Route path="/settings/stages" element={<EcoStageSettings />} />
            <Route path="/settings/approval-rules" element={<ApprovalRuleSettings />} />
            <Route path="/reports/audit-logs" element={<AuditLogReport />} />
            <Route path="/reports/version-history" element={<VersionHistoryReport />} />
            <Route path="/reports/eco-changes" element={<EcoChangesReport />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
