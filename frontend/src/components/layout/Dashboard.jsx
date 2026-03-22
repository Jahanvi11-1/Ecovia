import { Routes, Route, Navigate } from 'react-router-dom'
import GlobalNav from './GlobalNav'
import ProfilePanel from './ProfilePanel'
import MasterMenuSidebar from './MasterMenuSidebar'

import ProductList from '../products/ProductList'
import ProductDetail from '../products/ProductDetail'
import ProductCreateForm from '../products/ProductCreateForm'
import BomList from '../bom/BomList'
import BomDetail from '../bom/BomDetail'
import BomCreateForm from '../bom/BomCreateForm'
import EcoList from '../eco/EcoList'
import EcoDetail from '../eco/EcoDetail'
import EcoCreateForm from '../eco/EcoCreateForm'
import EcoStageSettings from '../settings/EcoStageSettings'
import ApprovalRuleSettings from '../settings/ApprovalRuleSettings'
import AuditLogReport from '../reports/AuditLogReport'
import VersionHistoryReport from '../reports/VersionHistoryReport'

export default function Dashboard() {
  return (
    <div style={{ 
      background: 'var(--bg-page)', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale'
    }}>
      {/* Fixed UI Components */}
      <GlobalNav />
      <ProfilePanel />
      <MasterMenuSidebar />

      {/* Primary Content Scroll Area */}
      <main style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '28px 32px',
        width: '100%'
      }}>
        <Routes>
          {/* Logical Routing - No Changes to Logic */}
          <Route index element={<Navigate to="/ecos" replace />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/new" element={<ProductCreateForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="boms" element={<BomList />} />
          <Route path="boms/new" element={<BomCreateForm />} />
          <Route path="boms/:id" element={<BomDetail />} />
          <Route path="ecos" element={<EcoList />} />
          <Route path="ecos/new" element={<EcoCreateForm />} />
          <Route path="ecos/:id" element={<EcoDetail />} />
          <Route path="settings/stages" element={<EcoStageSettings />} />
          <Route path="settings/approval-rules" element={<ApprovalRuleSettings />} />
          <Route path="reports/audit-logs" element={<AuditLogReport />} />
          <Route path="reports/version-history" element={<VersionHistoryReport />} />
        </Routes>
      </main>
    </div>
  )
}