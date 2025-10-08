import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Solutions from './pages/Solutions'
import Products from './pages/Products'
import Banners from './pages/Banners'
import Consultations from './pages/Consultations'
import Company from './pages/Company'
import Settings from './pages/Settings'
import { RealtimeProvider, RealtimeIndicator } from './contexts/RealtimeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import './App.css'

// 受保护的路由组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status } = useAuth()

  if (status === 'checking') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Spin tip="正在验证登录状态" size="large" />
      </div>
    )
  }

  return status === 'authenticated' ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <RealtimeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="solutions" element={<Solutions />} />
                <Route path="products" element={<Products />} />
                <Route path="banners" element={<Banners />} />
                <Route path="consultations" element={<Consultations />} />
                <Route path="company" element={<Company />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            <RealtimeIndicator />
          </Router>
        </RealtimeProvider>
      </AuthProvider>
    </ConfigProvider>
  )
}

export default App
