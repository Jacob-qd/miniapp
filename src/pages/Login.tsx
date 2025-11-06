import React from 'react'
import { Form, Input, Button, Card, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import './Login.css'

// API配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api'

interface LoginForm {
  username: string
  password: string
}

/**
 * @description 登录页面组件，提供用户登录功能。
 * @returns {React.ReactElement} 登录页面。
 */
const Login: React.FC = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  /**
   * @description 处理登录表单提交。
   * @param {LoginForm} values - 表单提交的值。
   */
  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    
    try {
      // 调用真实的登录API
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // 保存token和用户信息
        localStorage.setItem('token', data.token)
        localStorage.setItem('userInfo', JSON.stringify(data.user))
        
        message.success('登录成功！')
        navigate('/dashboard')
      } else {
        message.error(data.message || '登录失败！')
      }
    } catch (error) {
      console.error('登录错误:', error)
      
      // 如果API调用失败，使用默认账号进行验证
      if (values.username === 'admin' && values.password === 'admin123') {
        // 保存默认token和用户信息
        localStorage.setItem('token', 'mock-jwt-token')
        localStorage.setItem('userInfo', JSON.stringify({
          id: 1,
          username: 'admin',
          name: '管理员',
          role: 'admin'
        }))
        
        message.success('登录成功！')
        navigate('/dashboard')
      } else {
        message.error('网络错误或用户名密码错误，请重试！')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <Card className="login-card" title="商务管理后台" bordered={false}>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名！' },
              { min: 3, message: '用户名至少3个字符！' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码！' },
              { min: 6, message: '密码至少6个字符！' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        
        <div className="login-tips">
          <p>默认账号：admin</p>
          <p>默认密码：admin123</p>
        </div>
      </Card>
    </div>
  )
}

export default Login