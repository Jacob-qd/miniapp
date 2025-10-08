import React, { useMemo, useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout as AntLayout, Menu, Button, Avatar, Dropdown, Space, theme, Breadcrumb } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  SolutionOutlined,
  ShoppingOutlined,
  PictureOutlined,
  MessageOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Sider, Content } = AntLayout

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  const { user, logout } = useAuth()
  const displayName = useMemo(() => user?.name || user?.username || '管理员', [user])

  // 菜单项配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/solutions',
      icon: <SolutionOutlined />,
      label: '解决方案管理',
    },
    {
      key: '/products',
      icon: <ShoppingOutlined />,
      label: '产品管理',
    },
    {
      key: '/banners',
      icon: <PictureOutlined />,
      label: '轮播图管理',
    },
    {
      key: '/consultations',
      icon: <MessageOutlined />,
      label: '咨询管理',
    },
    {
      key: '/company',
      icon: <TeamOutlined />,
      label: '企业信息管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ]

  // 面包屑映射
  const breadcrumbMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/solutions': '解决方案管理',
    '/products': '产品管理',
    '/banners': '轮播图管理',
    '/consultations': '咨询管理',
    '/company': '企业信息管理',
    '/settings': '系统设置',
  }

  // 生成面包屑
  const getBreadcrumbItems = () => {
    const pathSnippets = location.pathname.split('/').filter(i => i)
    const breadcrumbItems = [
      {
        title: (
          <span>
            <HomeOutlined />
            <span style={{ marginLeft: 8 }}>首页</span>
          </span>
        ),
      },
    ]

    pathSnippets.forEach((_, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`
      if (breadcrumbMap[url]) {
        breadcrumbItems.push({
          title: <span>{breadcrumbMap[url]}</span>,
        })
      }
    })

    return breadcrumbItems
  }

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  // 处理用户菜单点击
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      logout()
      navigate('/login')
    } else if (key === 'settings') {
      navigate('/settings')
    }
    // 其他菜单项可以在这里处理
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: collapsed ? 12 : 16
        }}>
          {collapsed ? '商务' : '商务管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </Sider>
      <AntLayout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 24
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <Space>
            <Dropdown
              menu={{
                items: userMenuItems,
                onClick: handleUserMenuClick,
              }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} />
                <span>{displayName}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        
        <div style={{ margin: '16px 16px 0', overflow: 'initial' }}>
          <Breadcrumb items={getBreadcrumbItems()} />
        </div>
        
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout