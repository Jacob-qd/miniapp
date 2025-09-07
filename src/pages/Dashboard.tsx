import React, { useState, useEffect } from 'react'
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Progress,
  List,
  Avatar,
  Space,
  Button,
  DatePicker,
  Select,
  message
} from 'antd'
import {
  UserOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  MessageOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  EyeOutlined,
  EditOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useRealtimeContext } from '../contexts/RealtimeContext'
import { useRealtime } from '../hooks/useRealtime'

// API配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api'

const { RangePicker } = DatePicker
const { Option } = Select

interface ConsultationRecord {
  key: string
  id: string
  customerName: string
  phone: string
  product: string
  status: 'pending' | 'processing' | 'completed'
  createTime: string
}

interface RecentActivity {
  id: string
  type: 'consultation' | 'product' | 'solution'
  title: string
  description: string
  time: string
  avatar?: string
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [consultations, setConsultations] = useState<ConsultationRecord[]>([])
  const [activities, setActivities] = useState<RecentActivity[]>([])
  const [statistics, setStatistics] = useState({
    totalConsultations: 0,
    totalProducts: 0,
    totalSolutions: 0,
    activeUsers: 0,
    consultationGrowth: 0,
    productGrowth: 0,
    solutionGrowth: 0,
    userGrowth: 0
  })
  
  const { isConnected } = useRealtimeContext()
  
  // 实时监听咨询数据变化
  const { data: realtimeConsultations } = useRealtime('consultations', [], {
    onInsert: (payload) => {
      message.success('收到新的咨询请求')
      loadDashboardData() // 重新加载数据
    },
    onUpdate: (payload) => {
      message.info('咨询状态已更新')
      loadDashboardData()
    },
    onDelete: (payload) => {
      message.warning('咨询记录已删除')
      loadDashboardData()
    }
  })
  
  // 实时监听产品数据变化
  const { data: realtimeProducts } = useRealtime('products', [], {
    onInsert: () => loadDashboardData(),
    onUpdate: () => loadDashboardData(),
    onDelete: () => loadDashboardData()
  })
  
  // 实时监听解决方案数据变化
  const { data: realtimeSolutions } = useRealtime('solutions', [], {
    onInsert: () => loadDashboardData(),
    onUpdate: () => loadDashboardData(),
    onDelete: () => loadDashboardData()
  })

  // 模拟数据加载
  useEffect(() => {
    loadDashboardData()
  }, [])
  
  // 监听实时连接状态
  useEffect(() => {
    if (isConnected) {
      message.success('实时数据同步已连接')
    } else {
      message.warning('实时数据同步已断开')
    }
  }, [isConnected])

  const loadDashboardData = async () => {
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
      
      // 并行加载所有数据
      const [statsRes, consultationsRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/analytics/dashboard-stats`, { headers }),
        fetch(`${API_BASE_URL}/analytics/recent-consultations`, { headers }),
        fetch(`${API_BASE_URL}/analytics/recent-activities`, { headers })
      ])
      
      // 处理统计数据
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        if (statsData.success) {
          setStatistics(statsData.data)
        }
      }
      
      // 处理咨询数据
      if (consultationsRes.ok) {
        const consultationsData = await consultationsRes.json()
        if (consultationsData.success) {
          setConsultations(consultationsData.data.map((item: any, index: number) => ({
            ...item,
            key: item.id || index.toString()
          })))
        }
      }
      
      // 处理活动数据
      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        if (activitiesData.success) {
          setActivities(activitiesData.data)
        }
      }
      
    } catch (error) {
      console.error('加载仪表盘数据失败:', error)
      message.error('加载数据失败，显示默认数据')
      
      // 使用默认数据
      loadDefaultData()
    } finally {
      setLoading(false)
    }
  }
  
  const loadDefaultData = () => {
    // 默认统计数据
    setStatistics({
      totalConsultations: 1128,
      totalProducts: 24,
      totalSolutions: 12,
      activeUsers: 892,
      consultationGrowth: 12,
      productGrowth: 8,
      solutionGrowth: -2,
      userGrowth: 15
    })
    
    // 默认咨询记录数据
    const mockConsultations: ConsultationRecord[] = [
      {
        key: '1',
        id: 'C001',
        customerName: '张先生',
        phone: '138****8888',
        product: '企业级ERP系统',
        status: 'pending',
        createTime: '2024-01-15 10:30:00'
      },
      {
        key: '2',
        id: 'C002',
        customerName: '李女士',
        phone: '139****9999',
        product: 'CRM客户管理系统',
        status: 'processing',
        createTime: '2024-01-15 09:15:00'
      },
      {
        key: '3',
        id: 'C003',
        customerName: '王总',
        phone: '137****7777',
        product: '数字化转型解决方案',
        status: 'completed',
        createTime: '2024-01-14 16:45:00'
      }
    ]

    // 默认最近活动数据
    const mockActivities: RecentActivity[] = [
      {
        id: '1',
        type: 'consultation',
        title: '新的咨询请求',
        description: '张先生咨询企业级ERP系统',
        time: '2小时前'
      },
      {
        id: '2',
        type: 'product',
        title: '产品更新',
        description: 'CRM系统新增客户画像功能',
        time: '4小时前'
      },
      {
        id: '3',
        type: 'solution',
        title: '方案发布',
        description: '发布了新的云服务解决方案',
        time: '1天前'
      }
    ]

    setConsultations(mockConsultations)
    setActivities(mockActivities)
  }

  // 咨询记录表格列配置
  const consultationColumns: ColumnsType<ConsultationRecord> = [
    {
      title: '咨询编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '客户姓名',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '咨询产品',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' }
        }
        const { color, text } = statusMap[status as keyof typeof statusMap]
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} size="small">
            处理
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总咨询量"
              value={statistics.totalConsultations}
              prefix={<MessageOutlined />}
              suffix={
                <span style={{ 
                  fontSize: 14, 
                  color: statistics.consultationGrowth >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  {statistics.consultationGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  {Math.abs(statistics.consultationGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="产品数量"
              value={statistics.totalProducts}
              prefix={<ShoppingOutlined />}
              suffix={
                <span style={{ 
                  fontSize: 14, 
                  color: statistics.productGrowth >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  {statistics.productGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  {Math.abs(statistics.productGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="解决方案"
              value={statistics.totalSolutions}
              prefix={<SolutionOutlined />}
              suffix={
                <span style={{ 
                  fontSize: 14, 
                  color: statistics.solutionGrowth >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  {statistics.solutionGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  {Math.abs(statistics.solutionGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="活跃用户"
              value={statistics.activeUsers}
              prefix={<UserOutlined />}
              suffix={
                <span style={{ 
                  fontSize: 14, 
                  color: statistics.userGrowth >= 0 ? '#52c41a' : '#ff4d4f' 
                }}>
                  {statistics.userGrowth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} 
                  {Math.abs(statistics.userGrowth)}%
                </span>
              }
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和进度 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={16}>
          <Card title="数据趋势" extra={
            <Space>
              <RangePicker size="small" />
              <Select defaultValue="week" size="small" style={{ width: 80 }}>
                <Option value="week">本周</Option>
                <Option value="month">本月</Option>
                <Option value="year">本年</Option>
              </Select>
            </Space>
          }>
            <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              图表组件占位（可集成 ECharts 或 Chart.js）
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="完成进度">
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>咨询处理率</div>
              <Progress percent={85} status="active" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>产品上线率</div>
              <Progress percent={92} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>客户满意度</div>
              <Progress percent={96} strokeColor="#52c41a" />
            </div>
            <div>
              <div style={{ marginBottom: 8 }}>系统稳定性</div>
              <Progress percent={99} strokeColor="#1890ff" />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最近咨询和活动 */}
      <Row gutter={16}>
        <Col span={16}>
          <Card 
            title="最近咨询" 
            extra={
              <Button type="link" href="#/consultations">
                查看全部
              </Button>
            }
          >
            <Table
              columns={consultationColumns}
              dataSource={consultations}
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="最近活动">
            <List
              itemLayout="horizontal"
              dataSource={activities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={
                          item.type === 'consultation' ? <MessageOutlined /> :
                          item.type === 'product' ? <ShoppingOutlined /> :
                          <SolutionOutlined />
                        }
                        style={{
                          backgroundColor: 
                            item.type === 'consultation' ? '#1890ff' :
                            item.type === 'product' ? '#52c41a' :
                            '#722ed1'
                        }}
                      />
                    }
                    title={item.title}
                    description={item.description}
                  />
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {item.time}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard