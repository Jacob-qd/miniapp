import React, { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  theme,
  Breadcrumb
} from 'antd'
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
  HomeOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons'

const { Header, Sider, Content } = AntLayout

/**
 * @description 后台管理界面的主布局组件，包含侧边栏、头部和内容区域。
 * @returns {React.ReactElement} 主布局组件。
 */
const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  /**
   * @description 侧边栏菜单项的配置数组。
   * @type {Array<Object>}
   */
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
      key: '/user-management',
      icon: <SafetyCertificateOutlined />,
      label: '用户与权限',
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

  /**
   * @description 面包屑导航的路径与名称映射。
   * @type {Record<string, string>}
   */
  const breadcrumbMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/solutions': '解决方案管理',
    '/products': '产品管理',
    '/banners': '轮播图管理',
    '/consultations': '咨询管理',
    '/user-management': '用户与权限',
    '/company': '企业信息管理',
    '/settings': '系统设置',
  }

  /**
   * @description 根据当前路径生成面包屑导航项。
   * @returns {Array<Object>} 面包屑导航项的数组。
   */
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

  /**
   * @description 处理侧边栏菜单的点击事件。
   * @param {{ key: string }} params - 点击事件的参数。
   * @param {string} params.key - 被点击菜单项的 key。
   */
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  /**
   * @description 用户下拉菜单的配置数组。
   * @type {Array<Object>}
   */
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

  /**
   * @description 处理用户下拉菜单的点击事件。
   * @param {{ key: string }} params - 点击事件的参数。
   * @param {string} params.key - 被点击菜单项的 key。
   */
  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
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
                <span>管理员</span>
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