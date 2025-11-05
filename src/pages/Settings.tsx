import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  message,
  Row,
  Col,
  Divider,
  Tabs,
  Table,
  Space,
  Modal,
  Popconfirm
} from 'antd'
import {
  SaveOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'

// API配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api'

const { Option } = Select
const { TabPane } = Tabs

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactPhone: string
  contactEmail: string
  enableRegistration: boolean
  enableNotification: boolean
  maxUploadSize: number
  sessionTimeout: number
  defaultLanguage: string
}

interface User {
  key: string
  id: string
  username: string
  email: string
  role: string
  status: 'active' | 'inactive'
  createTime: string
  lastLogin: string
}

const Settings: React.FC = () => {
  const [systemForm] = Form.useForm()
  const [userForm] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [userModalVisible, setUserModalVisible] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)

  useEffect(() => {
    loadSystemSettings()
    loadUsers()
  }, [])

  const loadSystemSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const settings = await response.json()
        systemForm.setFieldsValue(settings)
      } else {
        throw new Error('Failed to load settings')
      }
    } catch (error) {
      console.error('Load settings error:', error)
      // 加载默认设置
      loadDefaultSettings()
    } finally {
      setLoading(false)
    }
  }

  const loadDefaultSettings = () => {
    const mockSettings: SystemSettings = {
      siteName: '商务管理系统',
      siteDescription: '专业的企业商务管理平台',
      contactPhone: '400-123-4567',
      contactEmail: 'admin@company.com',
      enableRegistration: true,
      enableNotification: true,
      maxUploadSize: 10,
      sessionTimeout: 30,
      defaultLanguage: 'zh-CN'
    }
    systemForm.setFieldsValue(mockSettings)
  }

  const loadUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user-management/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const usersData = Array.isArray(data) ? data : data.data
        const formattedUsers = usersData.map((user: any, index: number) => ({
          key: user.id || index.toString(),
          id: user.id || `U${String(index + 1).padStart(3, '0')}`,
          username: user.username,
          email: user.email,
          role: user.role || user.role_id || '未分配',
          status: user.status,
          createTime: user.created_at || new Date().toLocaleString(),
          lastLogin: user.last_login || new Date().toLocaleString()
        }))
        setUsers(formattedUsers)
      } else {
        throw new Error('Failed to load users')
      }
    } catch (error) {
      console.error('Load users error:', error)
      // 加载默认用户数据
      loadDefaultUsers()
    }
  }

  const loadDefaultUsers = () => {
    const mockUsers: User[] = [
      {
        key: '1',
        id: 'U001',
        username: 'admin',
        email: 'admin@company.com',
        role: 'admin',
        status: 'active',
        createTime: '2024-01-01 10:00:00',
        lastLogin: '2024-01-15 14:30:00'
      },
      {
        key: '2',
        id: 'U002',
        username: 'manager',
        email: 'manager@company.com',
        role: 'manager',
        status: 'active',
        createTime: '2024-01-05 09:15:00',
        lastLogin: '2024-01-15 11:20:00'
      },
      {
        key: '3',
        id: 'U003',
        username: 'operator',
        email: 'operator@company.com',
        role: 'operator',
        status: 'inactive',
        createTime: '2024-01-10 16:45:00',
        lastLogin: '2024-01-12 10:30:00'
      }
    ]
    setUsers(mockUsers)
  }

  const handleSystemSubmit = async (values: SystemSettings) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        message.success('系统设置保存成功')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Save settings error:', error)
      message.error('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const userColumns: ColumnsType<User> = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const roleMap = {
          admin: '管理员',
          manager: '经理',
          operator: '操作员'
        }
        return roleMap[role as keyof typeof roleMap] || role
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Switch 
          checked={status === 'active'} 
          checkedChildren="启用" 
          unCheckedChildren="禁用"
          onChange={(checked) => handleUserStatusChange(checked, record.id)}
        />
      )
    },
    {
      title: '最后登录',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" icon={<DeleteOutlined />} size="small" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const handleAddUser = () => {
    setEditingUserId(null)
    userForm.resetFields()
    setUserModalVisible(true)
  }

  const handleEditUser = (record: User) => {
    setEditingUserId(record.id)
    userForm.setFieldsValue(record)
    setUserModalVisible(true)
  }

  const handleDeleteUser = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        message.success('删除成功')
        loadUsers()
      } else {
        throw new Error('Failed to delete user')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      message.error('删除失败，请重试')
    }
  }

  const handleUserStatusChange = async (checked: boolean, userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: checked ? 'active' : 'inactive' })
      })
      
      if (response.ok) {
        message.success(`用户状态已${checked ? '启用' : '禁用'}`)
        loadUsers()
      } else {
        throw new Error('Failed to update user status')
      }
    } catch (error) {
      console.error('Update user status error:', error)
      message.error('状态更新失败')
    }
  }

  const handleUserSubmit = async (values: any) => {
    try {
      const url = editingUserId 
        ? `${API_BASE_URL}/users/${editingUserId}`
        : `${API_BASE_URL}/users`
      
      const response = await fetch(url, {
        method: editingUserId ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      })
      
      if (response.ok) {
        message.success(editingUserId ? '用户更新成功' : '用户创建成功')
        setUserModalVisible(false)
        loadUsers()
      } else {
        throw new Error('Failed to save user')
      }
    } catch (error) {
      console.error('Save user error:', error)
      message.error('操作失败，请重试')
    }
  }

  return (
    <div>
      <Card title="系统设置">
        <Tabs defaultActiveKey="system">
          <TabPane tab="系统配置" key="system">
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSystemSubmit}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="siteName"
                    label="网站名称"
                    rules={[{ required: true, message: '请输入网站名称' }]}
                  >
                    <Input placeholder="请输入网站名称" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="defaultLanguage"
                    label="默认语言"
                    rules={[{ required: true, message: '请选择默认语言' }]}
                  >
                    <Select placeholder="请选择默认语言">
                      <Option value="zh-CN">简体中文</Option>
                      <Option value="en-US">English</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="siteDescription"
                label="网站描述"
              >
                <Input.TextArea rows={3} placeholder="请输入网站描述" />
              </Form.Item>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="contactPhone"
                    label="联系电话"
                    rules={[{ required: true, message: '请输入联系电话' }]}
                  >
                    <Input placeholder="请输入联系电话" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="contactEmail"
                    label="联系邮箱"
                    rules={[
                      { required: true, message: '请输入联系邮箱' },
                      { type: 'email', message: '请输入正确的邮箱格式' }
                    ]}
                  >
                    <Input placeholder="请输入联系邮箱" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>功能设置</Divider>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="enableRegistration"
                    label="允许用户注册"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="enableNotification"
                    label="系统通知"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="开启" unCheckedChildren="关闭" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    name="maxUploadSize"
                    label="最大上传文件大小(MB)"
                    rules={[{ required: true, message: '请输入最大上传文件大小' }]}
                  >
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="sessionTimeout"
                    label="会话超时时间(分钟)"
                    rules={[{ required: true, message: '请输入会话超时时间' }]}
                  >
                    <InputNumber min={5} max={120} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  保存设置
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="用户管理" key="users">
            <div style={{ marginBottom: 16 }}>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                新增用户
              </Button>
            </div>
            
            <Table
              columns={userColumns}
              dataSource={users}
              pagination={{
                total: users.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 用户编辑模态框 */}
      <Modal
        title={editingUserId ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserSubmit}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          {!editingUserId && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">启用</Option>
              <Option value="inactive">禁用</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUserId ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Settings