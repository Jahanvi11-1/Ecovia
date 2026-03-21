import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import GlobalNav from './GlobalNav'
import ProfilePanel from './ProfilePanel'
import MasterMenuSidebar from './MasterMenuSidebar'


import ProductList from '../products/ProductList'
import ProductDetail from '../products/ProductDetail'
import BomDetail from '../bom/BomDetail'
import EcoList from '../eco/EcoList'
import EcoDetail from '../eco/EcoDetail'
import EcoCreateForm from '../eco/EcoCreateForm'
import EcoStageSettings from '../settings/EcoStageSettings'
import ApprovalRuleSettings from '../settings/ApprovalRuleSettings'
import AuditLogReport from '../reports/AuditLogReport'
import VersionHistoryReport from '../reports/VersionHistoryReport'


export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNav />
      <ProfilePanel />
      <MasterMenuSidebar />


      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/ecos" replace />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/boms/:id" element={<BomDetail />} />
          <Route path="/ecos" element={<EcoList />} />
          <Route path="/ecos/new" element={<EcoCreateForm />} />
          <Route path="/ecos/:id" element={<EcoDetail />} />
          <Route path="/settings/stages" element={<EcoStageSettings />} />
          <Route path="/settings/approval-rules" element={<ApprovalRuleSettings />} />
          <Route path="/reports/audit-logs" element={<AuditLogReport />} />
          <Route path="/reports/version-history" element={<VersionHistoryReport />} />
        </Routes>
      </main>
    </div>
  )
}


