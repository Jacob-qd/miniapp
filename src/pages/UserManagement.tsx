import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Tree,
  message
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { DataNode } from 'antd/es/tree'
import {
  DeleteOutlined,
  EditOutlined,
  KeyOutlined,
  PlusOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  UserAddOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-api-domain.com/api/user-management'
  : 'http://localhost:3001/api/user-management'

interface MenuNode {
  id: string
  name: string
  path: string
  icon: string
  order: number
  description?: string
  actions?: string[]
  children?: MenuNode[]
}

interface Role {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  data_scope: 'all' | 'department' | 'self'
  default_landing: string
  menu_ids: string[]
  action_permissions: Record<string, string[]>
  created_at: string
  updated_at: string
  remark?: string
  user_count: number
}

interface UserAccount {
  id: string
  username: string
  email: string
  mobile?: string
  role_id: string
  status: 'active' | 'inactive' | 'locked'
  department?: string
  position?: string
  login_count: number
  last_login_at?: string
  created_at: string
  remark?: string
  tags?: string[]
}

interface Overview {
  totalUsers: number
  activeUsers: number
  pendingUsers: number
  lockedUsers: number
  roleCount: number
  menuCount: number
  lastSyncAt: string
  roleDistribution: Array<{ roleId: string; roleName: string; users: number; status: Role['status'] }>
  recentUsers: Array<{ id: string; username: string; created_at: string; role_id: string; status: UserAccount['status'] }>
}

const statusColorMap: Record<UserAccount['status'], { text: string; color: string }> = {
  active: { text: '启用', color: 'success' },
  inactive: { text: '待启用', color: 'warning' },
  locked: { text: '锁定', color: 'error' }
}

const dataScopeText: Record<Role['data_scope'], string> = {
  all: '全量数据',
  department: '部门数据',
  self: '仅本人数据'
}

const buildTreeData = (menus: MenuNode[]): DataNode[] =>
  menus.map(menu => ({
    key: menu.id,
    title: menu.name,
    icon: <SafetyCertificateOutlined />,
    children: menu.children ? buildTreeData(menu.children) : undefined
  }))

const flattenMenus = (menus: MenuNode[]): MenuNode[] => {
  const result: MenuNode[] = []
  const traverse = (items: MenuNode[]) => {
    items.forEach(item => {
      result.push(item)
      if (item.children) {
        traverse(item.children)
      }
    })
  }
  traverse(menus)
  return result
}

const findMenuWithParent = (
  menus: MenuNode[],
  id: string,
  parentId: string | null = null
): { menu: MenuNode; parentId: string | null } | null => {
  for (const menu of menus) {
    if (menu.id === id) {
      return { menu, parentId }
    }
    if (menu.children) {
      const found = findMenuWithParent(menu.children, id, menu.id)
      if (found) {
        return found
      }
    }
  }
  return null
}

const UserManagement: React.FC = () => {
  const [overview, setOverview] = useState<Overview | null>(null)
  const [users, setUsers] = useState<UserAccount[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<MenuNode[]>([])
  const [loading, setLoading] = useState(false)
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [roleModalVisible, setRoleModalVisible] = useState(false)
  const [menuModalVisible, setMenuModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null)
  const [menuParentId, setMenuParentId] = useState<string | null>(null)
  const [userForm] = Form.useForm<UserAccount>()
  const [roleForm] = Form.useForm<Role>()
  const [menuForm] = Form.useForm<{ name: string; path: string; icon: string; order: number; description?: string; actions?: string[] }>()

  const roleMap = useMemo(() => {
    return new Map(roles.map(role => [role.id, role]))
  }, [roles])

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const request = async (input: RequestInfo, init?: RequestInit) => {
    const headers = new Headers(init?.headers || {})
    headers.set('Content-Type', 'application/json')
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    const response = await fetch(input, { ...init, headers })
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || '请求失败')
    }
    return response.json()
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [overviewRes, userRes, roleRes, menuRes] = await Promise.all([
        request(`${API_BASE_URL}/overview`, { method: 'GET' }),
        request(`${API_BASE_URL}/users`, { method: 'GET' }),
        request(`${API_BASE_URL}/roles`, { method: 'GET' }),
        request(`${API_BASE_URL}/menus`, { method: 'GET' })
      ])

      setOverview(overviewRes.data)
      setUsers(userRes.data)
      setRoles(roleRes.data)
      setMenus(menuRes.data)
      if (!selectedRoleId && roleRes.data.length > 0) {
        setSelectedRoleId(roleRes.data[0].id)
      }
    } catch (error) {
      console.error('加载用户管理数据失败:', error)
      message.error('加载用户管理数据失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const openUserModal = (user?: UserAccount) => {
    setEditingUser(user || null)
    setUserModalVisible(true)
    userForm.resetFields()
    if (user) {
      userForm.setFieldsValue({
        ...user,
        tags: user.tags || []
      })
    }
  }

  const handleUserSubmit = async () => {
    try {
      const values = await userForm.validateFields()
      const payload = {
        ...values,
        tags: values.tags || []
      }

      if (editingUser) {
        const res = await request(`${API_BASE_URL}/users/${editingUser.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        setUsers(prev => prev.map(item => (item.id === editingUser.id ? res.data : item)))
        if (res.overview) {
          setOverview(res.overview)
        }
        message.success('用户更新成功')
      } else {
        const res = await request(`${API_BASE_URL}/users`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setUsers(prev => [res.data, ...prev])
        if (res.overview) {
          setOverview(res.overview)
        }
        message.success('用户创建成功')
      }
      setUserModalVisible(false)
      setEditingUser(null)
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(error?.message || '操作失败')
    }
  }

  const handleDeleteUser = async (user: UserAccount) => {
    try {
      const res = await request(`${API_BASE_URL}/users/${user.id}`, {
        method: 'DELETE'
      })
      setUsers(prev => prev.filter(item => item.id !== user.id))
      if (res.overview) {
        setOverview(res.overview)
      }
      message.success('用户已删除')
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleResetPassword = async (user: UserAccount) => {
    try {
      const res = await request(`${API_BASE_URL}/users/${user.id}/reset-password`, {
        method: 'PATCH'
      })
      Modal.success({
        title: '密码重置成功',
        content: (
          <div>
            <p>临时密码：<strong>{res.data.temporaryPassword}</strong></p>
            <p>请通知用户尽快登录并修改密码。</p>
          </div>
        )
      })
    } catch (error: any) {
      message.error(error.message || '密码重置失败')
    }
  }

  const toggleUserStatus = async (user: UserAccount) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    try {
      const res = await request(`${API_BASE_URL}/users/${user.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      })
      setUsers(prev => prev.map(item => (item.id === user.id ? res.data : item)))
      if (res.overview) {
        setOverview(res.overview)
      }
      message.success('用户状态已更新')
    } catch (error: any) {
      message.error(error.message || '状态更新失败')
    }
  }

  const openRoleModal = (role?: Role) => {
    setEditingRole(role || null)
    setRoleModalVisible(true)
    roleForm.resetFields()
    if (role) {
      roleForm.setFieldsValue(role)
    }
  }

  const handleRoleSubmit = async () => {
    try {
      const values = await roleForm.validateFields()
      const payload = {
        ...values,
        menu_ids: editingRole ? editingRole.menu_ids : values.menu_ids || [],
        action_permissions: editingRole ? editingRole.action_permissions : {}
      }

      if (editingRole) {
        const res = await request(`${API_BASE_URL}/roles/${editingRole.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
        setRoles(prev => prev.map(item => (item.id === editingRole.id ? res.data : item)))
        message.success('角色更新成功')
      } else {
        const res = await request(`${API_BASE_URL}/roles`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
        setRoles(prev => [res.data, ...prev])
        setSelectedRoleId(res.data.id)
        if (res.overview) {
          setOverview(res.overview)
        }
        message.success('角色创建成功')
      }
      setRoleModalVisible(false)
      setEditingRole(null)
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(error?.message || '操作失败')
    }
  }

  const handleDeleteRole = async (role: Role) => {
    try {
      const res = await request(`${API_BASE_URL}/roles/${role.id}`, {
        method: 'DELETE'
      })
      setRoles(prev => prev.filter(item => item.id !== role.id))
      if (res.overview) {
        setOverview(res.overview)
      }
      if (selectedRoleId === role.id) {
        setSelectedRoleId(prev => {
          const remaining = roles.filter(item => item.id !== role.id)
          return remaining.length ? remaining[0].id : null
        })
      }
      message.success('角色已删除')
    } catch (error: any) {
      message.error(error.message || '删除失败')
    }
  }

  const handleRolePermissionChange = async (checkedKeys: React.Key[], info: any) => {
    const role = selectedRoleId ? roleMap.get(selectedRoleId) : undefined
    if (!role) return

    try {
      const res = await request(`${API_BASE_URL}/roles/${role.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          menu_ids: checkedKeys,
          action_permissions: role.action_permissions,
          name: role.name,
          description: role.description,
          status: role.status,
          data_scope: role.data_scope,
          default_landing: role.default_landing,
          remark: role.remark
        })
      })

      setRoles(prev => prev.map(item => (item.id === role.id ? res.data : item)))
      message.success('角色菜单权限已更新')
    } catch (error: any) {
      message.error(error.message || '更新角色权限失败')
    }
  }

  const openMenuModal = (parentId?: string, menu?: MenuNode) => {
    setMenuParentId(parentId || null)
    setSelectedMenuId(menu?.id || null)
    setMenuModalVisible(true)
    menuForm.resetFields()
    if (menu) {
      menuForm.setFieldsValue({
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        order: menu.order,
        description: menu.description,
        actions: menu.actions || []
      })
    } else {
      menuForm.setFieldsValue({ order: 99, actions: [] })
    }
  }

  const handleMenuSubmit = async () => {
    try {
      const values = await menuForm.validateFields()
      if (selectedMenuId) {
        const res = await request(`${API_BASE_URL}/menus/${selectedMenuId}`, {
          method: 'PUT',
          body: JSON.stringify(values)
        })
        const updateMenu = (items: MenuNode[]): MenuNode[] =>
          items.map(item => {
            if (item.id === selectedMenuId) {
              return { ...item, ...res.data }
            }
            if (item.children) {
              return { ...item, children: updateMenu(item.children) }
            }
            return item
          })
        setMenus(prev => updateMenu(prev))
        message.success('菜单更新成功')
      } else {
        const res = await request(`${API_BASE_URL}/menus`, {
          method: 'POST',
          body: JSON.stringify({
            ...values,
            parent_id: menuParentId || undefined
          })
        })
        if (menuParentId) {
          const appendChild = (items: MenuNode[]): MenuNode[] =>
            items.map(item => {
              if (item.id === menuParentId) {
                const children = item.children ? [...item.children, res.data] : [res.data]
                return { ...item, children }
              }
              if (item.children) {
                return { ...item, children: appendChild(item.children) }
              }
              return item
            })
          setMenus(prev => appendChild(prev))
        } else {
          setMenus(prev => [...prev, res.data])
        }
        message.success('菜单创建成功')
      }
      setMenuModalVisible(false)
      setSelectedMenuId(null)
      setMenuParentId(null)
    } catch (error: any) {
      if (error?.errorFields) {
        return
      }
      message.error(error?.message || '操作失败')
    }
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      const res = await request(`${API_BASE_URL}/menus/${menuId}`, {
        method: 'DELETE'
      })
      setMenus(res.data)
      message.success('菜单已删除')
    } catch (error: any) {
      message.error(error.message || '删除菜单失败')
    }
  }

  const columns: ColumnsType<UserAccount> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <span>{text}</span>
            <Tag color={statusColorMap[record.status].color}>{statusColorMap[record.status].text}</Tag>
          </Space>
          <span style={{ color: '#999' }}>{record.email}</span>
        </Space>
      )
    },
    {
      title: '角色',
      dataIndex: 'role_id',
      key: 'role',
      render: (roleId: string) => {
        const role = roleMap.get(roleId)
        return role ? <Badge status={role.status === 'active' ? 'success' : 'default'} text={role.name} /> : <Tag>未知角色</Tag>
      }
    },
    {
      title: '组织信息',
      key: 'org',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>{record.department || '-'}</span>
          <span style={{ color: '#999' }}>{record.position || '-'}</span>
        </Space>
      )
    },
    {
      title: '联系方式',
      dataIndex: 'mobile',
      key: 'mobile',
      render: (mobile: string | undefined) => mobile || '-'
    },
    {
      title: '登录统计',
      key: 'login',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <span>累计登录：{record.login_count}</span>
          <span style={{ color: '#999' }}>最近登录：{record.last_login_at ? dayjs(record.last_login_at).format('YYYY-MM-DD HH:mm') : '未登录'}</span>
        </Space>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '状态控制',
      key: 'status',
      render: (_, record) => (
        <Switch
          checkedChildren="启用"
          unCheckedChildren="停用"
          checked={record.status === 'active'}
          onChange={() => toggleUserStatus(record)}
        />
      )
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} type="link" onClick={() => openUserModal(record)}>编辑</Button>
          <Button icon={<KeyOutlined />} type="link" onClick={() => handleResetPassword(record)}>重置密码</Button>
          <Popconfirm title="确认删除该用户？" onConfirm={() => handleDeleteUser(record)}>
            <Button icon={<DeleteOutlined />} type="link" danger>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const roleColumns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <span>{text}</span>
          <Tag color={record.status === 'active' ? 'success' : 'default'}>{record.status === 'active' ? '启用' : '停用'}</Tag>
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: '数据范围',
      dataIndex: 'data_scope',
      key: 'data_scope',
      render: (value: Role['data_scope']) => dataScopeText[value]
    },
    {
      title: '关联用户',
      dataIndex: 'user_count',
      key: 'user_count',
      render: (count: number) => <Badge count={count} showZero />
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => openRoleModal(record)} icon={<EditOutlined />}>编辑</Button>
          <Popconfirm title="确认删除该角色？" onConfirm={() => handleDeleteRole(record)} disabled={record.user_count > 0}>
            <Button type="link" danger icon={<DeleteOutlined />} disabled={record.user_count > 0}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ]

  const selectedRole = selectedRoleId ? roleMap.get(selectedRoleId) : null
  const selectedMenu = selectedMenuId ? flattenMenus(menus).find(menu => menu.id === selectedMenuId) : null

  const overviewCards = overview ? (
    <Row gutter={16} style={{ marginBottom: 16 }}>
      <Col span={6}>
        <Card>
          <Statistic title="用户总数" value={overview.totalUsers} prefix={<TeamOutlined />} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="活跃用户" value={overview.activeUsers} prefix={<RadarChartOutlined />} valueStyle={{ color: '#52c41a' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="待启用用户" value={overview.pendingUsers} prefix={<UserAddOutlined />} valueStyle={{ color: '#faad14' }} />
        </Card>
      </Col>
      <Col span={6}>
        <Card>
          <Statistic title="角色数量" value={overview.roleCount} prefix={<ProfileOutlined />} />
        </Card>
      </Col>
    </Row>
  ) : null

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      {overviewCards}

      <Card
        title="用户管理中心"
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>刷新</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openUserModal()}>新增用户</Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="users"
          items={[
            {
              key: 'users',
              label: '用户列表',
              children: (
                <Table
                  rowKey="id"
                  columns={columns}
                  dataSource={users}
                  loading={loading}
                  scroll={{ x: 1200 }}
                />
              )
            },
            {
              key: 'roles',
              label: '角色权限',
              children: (
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      title="角色列表"
                      extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => openRoleModal()}>新建角色</Button>}
                    >
                      <Table
                        rowKey="id"
                        columns={roleColumns}
                        dataSource={roles}
                        pagination={false}
                        rowClassName={record => (record.id === selectedRoleId ? 'ant-table-row-selected' : '')}
                        onRow={record => ({
                          onClick: () => setSelectedRoleId(record.id)
                        })}
                      />
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card title="角色详情">
                      {selectedRole ? (
                        <Space direction="vertical" style={{ width: '100%' }} size="large">
                          <Descriptions column={1} size="small" bordered>
                            <Descriptions.Item label="角色名称">{selectedRole.name}</Descriptions.Item>
                            <Descriptions.Item label="状态">{selectedRole.status === 'active' ? '启用' : '停用'}</Descriptions.Item>
                            <Descriptions.Item label="数据范围">{dataScopeText[selectedRole.data_scope]}</Descriptions.Item>
                            <Descriptions.Item label="默认首页">{selectedRole.default_landing}</Descriptions.Item>
                            <Descriptions.Item label="创建时间">{dayjs(selectedRole.created_at).format('YYYY-MM-DD HH:mm')}</Descriptions.Item>
                            <Descriptions.Item label="备注">{selectedRole.remark || '-'}</Descriptions.Item>
                          </Descriptions>
                          <Divider orientation="left">菜单权限</Divider>
                          <Alert type="info" showIcon message="选中菜单即可同步更新角色权限" />
                          <Tree
                            checkable
                            selectable={false}
                            treeData={buildTreeData(menus)}
                            checkedKeys={selectedRole.menu_ids}
                            onCheck={(keys, info) => handleRolePermissionChange(keys as string[], info)}
                          />
                        </Space>
                      ) : (
                        <Alert type="info" message="请选择角色查看详细信息" showIcon />
                      )}
                    </Card>
                  </Col>
                </Row>
              )
            },
            {
              key: 'menus',
              label: '菜单配置',
              children: (
                <Row gutter={16}>
                  <Col span={10}>
                    <Card
                      title="菜单树"
                      extra={
                        <Space>
                          <Button icon={<PlusOutlined />} onClick={() => openMenuModal()}>新增一级菜单</Button>
                        </Space>
                      }
                    >
                      <Tree
                        showIcon
                        treeData={buildTreeData(menus)}
                        onSelect={keys => {
                          const key = (keys[0] as string) || null
                          setSelectedMenuId(key)
                          if (key) {
                            const found = findMenuWithParent(menus, key)
                            setMenuParentId(found?.parentId ?? null)
                          } else {
                            setMenuParentId(null)
                          }
                        }}
                        selectedKeys={selectedMenuId ? [selectedMenuId] : []}
                      />
                    </Card>
                  </Col>
                  <Col span={14}>
                    <Card
                      title="菜单详情"
                      extra={selectedMenu ? (
                        <Space>
                          <Button icon={<EditOutlined />} onClick={() => openMenuModal(menuParentId || undefined, selectedMenu)}>编辑</Button>
                          <Popconfirm title="确认删除该菜单？" onConfirm={() => handleDeleteMenu(selectedMenu.id)}>
                            <Button danger icon={<DeleteOutlined />}>删除</Button>
                          </Popconfirm>
                          <Button icon={<PlusOutlined />} type="primary" onClick={() => openMenuModal(selectedMenu.id)}>新增子菜单</Button>
                        </Space>
                      ) : null}
                    >
                      {selectedMenu ? (
                        <Space direction="vertical" style={{ width: '100%' }} size="middle">
                          <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="菜单名称">{selectedMenu.name}</Descriptions.Item>
                            <Descriptions.Item label="路径">{selectedMenu.path}</Descriptions.Item>
                            <Descriptions.Item label="图标标识">{selectedMenu.icon}</Descriptions.Item>
                            <Descriptions.Item label="排序值">{selectedMenu.order}</Descriptions.Item>
                            <Descriptions.Item label="描述">{selectedMenu.description || '-'}</Descriptions.Item>
                          </Descriptions>
                          <Divider orientation="left">操作权限</Divider>
                          <Space wrap>
                            {(selectedMenu.actions || []).length ? (
                              (selectedMenu.actions || []).map(action => (
                                <Tag key={action} color="blue">{action}</Tag>
                              ))
                            ) : (
                              <Tag>无操作权限配置</Tag>
                            )}
                          </Space>
                        </Space>
                      ) : (
                        <Alert type="info" message="选择菜单以查看详细信息" showIcon />
                      )}
                    </Card>
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Card>

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onOk={handleUserSubmit}
        onCancel={() => {
          setUserModalVisible(false)
          setEditingUser(null)
        }}
        destroyOnClose
        width={600}
      >
        <Form form={userForm} layout="vertical" initialValues={{ status: 'active', tags: [] }}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
                <Input placeholder="name@example.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="mobile" label="手机号">
                <Input placeholder="可选填写联系方式" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="role_id" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
                <Select placeholder="请选择用户角色">
                  {roles.map(role => (
                    <Select.Option key={role.id} value={role.id}>
                      {role.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}> 
                <Select>
                  <Select.Option value="active">启用</Select.Option>
                  <Select.Option value="inactive">停用</Select.Option>
                  <Select.Option value="locked">锁定</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="所属部门">
                <Input placeholder="如：市场运营部" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="岗位角色">
                <Input placeholder="如：运营经理" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="tags" label="标签">
            <Select mode="tags" style={{ width: '100%' }} placeholder="输入后回车可创建标签" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="补充用户信息说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingRole ? '编辑角色' : '新建角色'}
        open={roleModalVisible}
        onOk={handleRoleSubmit}
        onCancel={() => {
          setRoleModalVisible(false)
          setEditingRole(null)
        }}
        destroyOnClose
      >
        <Form form={roleForm} layout="vertical" initialValues={{ status: 'active', data_scope: 'self', default_landing: '/dashboard' }}>
          <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item name="description" label="角色描述" rules={[{ required: true, message: '请输入角色描述' }]}>
            <Input.TextArea rows={3} placeholder="说明角色职责与权限范围" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="状态" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="active">启用</Select.Option>
                  <Select.Option value="inactive">停用</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="data_scope" label="数据范围" rules={[{ required: true }]}>
                <Select>
                  <Select.Option value="all">全量数据</Select.Option>
                  <Select.Option value="department">部门数据</Select.Option>
                  <Select.Option value="self">仅本人数据</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="default_landing" label="默认首页" rules={[{ required: true }]}>
            <Input placeholder="例如 /dashboard" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={2} placeholder="可补充角色说明" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={selectedMenuId ? '编辑菜单' : '新增菜单'}
        open={menuModalVisible}
        onOk={handleMenuSubmit}
        onCancel={() => {
          setMenuModalVisible(false)
          setSelectedMenuId(null)
          setMenuParentId(null)
        }}
        destroyOnClose
      >
        <Form form={menuForm} layout="vertical" initialValues={{ order: 99, actions: [] }}>
          <Form.Item name="name" label="菜单名称" rules={[{ required: true, message: '请输入菜单名称' }]}>
            <Input placeholder="菜单展示名称" />
          </Form.Item>
          <Form.Item name="path" label="访问路径" rules={[{ required: true, message: '请输入菜单路径' }]}>
            <Input placeholder="例如 /user-management" />
          </Form.Item>
          <Form.Item name="icon" label="图标标识" rules={[{ required: true, message: '请输入图标标识' }]}>
            <Input placeholder="例如 TeamOutlined" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="order" label="排序值" rules={[{ required: true }]}> 
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="actions" label="操作权限">
                <Select mode="tags" placeholder="输入操作名称后回车添加" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="description" label="功能描述">
            <Input.TextArea rows={3} placeholder="用于说明菜单功能与用途" />
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  )
}

export default UserManagement
