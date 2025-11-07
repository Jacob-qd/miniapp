import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
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
import UserManagement from './pages/UserManagement'
import { RealtimeProvider, RealtimeIndicator } from './contexts/RealtimeContext'
import './App.css'

/**
 * @description 检查用户是否已登录。
 * @returns {boolean} 如果用户已登录，则返回 true；否则返回 false。
 */
const isAuthenticated = () => {
  return localStorage.getItem('token') !== null
}

/**
 * @description 受保护的路由组件，用于验证用户是否登录。
 * @param {{ children: React.ReactNode }} props - 组件属性。
 * @param {React.ReactNode} props.children - 要渲染的子组件。
 * @returns {React.ReactElement} 如果用户已登录，则渲染子组件；否则重定向到登录页面。
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />
}

/**
 * @description 应用程序的主组件，负责设置路由和全局配置。
 * @returns {React.ReactElement} 应用程序的根组件。
 */
function App() {
  return (
    <ConfigProvider locale={zhCN}>
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
              <Route path="user-management" element={<UserManagement />} />
              <Route path="company" element={<Company />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <RealtimeIndicator />
        </Router>
      </RealtimeProvider>
    </ConfigProvider>
  )
}

export default App
