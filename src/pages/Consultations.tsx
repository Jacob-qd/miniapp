import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Descriptions,
  Drawer
} from 'antd'
import {
  EyeOutlined,
  EditOutlined,
  PhoneOutlined,
  MessageOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

interface Consultation {
  key: string
  id: string
  customerName: string
  phone: string
  email: string
  company: string
  subject: string
  content: string
  status: 'pending' | 'processing' | 'completed' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  createTime: string
  updateTime: string
  response?: string
}

const Consultations: React.FC = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([])
  const [loading, setLoading] = useState(false)
  const [detailVisible, setDetailVisible] = useState(false)
  const [responseVisible, setResponseVisible] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Consultation | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadConsultations()
  }, [])

  const loadConsultations = async () => {
    setLoading(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockData: Consultation[] = [
      {
        key: '1',
        id: 'C001',
        customerName: '张三',
        phone: '13800138000',
        email: 'zhangsan@example.com',
        company: '科技有限公司',
        subject: '数字化转型咨询',
        content: '我们公司希望进行数字化转型，想了解相关的解决方案和实施方案。',
        status: 'pending',
        priority: 'high',
        assignedTo: '李经理',
        createTime: '2024-01-15 10:30:00',
        updateTime: '2024-01-15 10:30:00'
      },
      {
        key: '2',
        id: 'C002',
        customerName: '王丽',
        phone: '13900139000',
        email: 'wangli@example.com',
        company: '制造集团',
        subject: '云服务部署',
        content: '需要了解云服务的部署方案，包括成本和技术支持。',
        status: 'processing',
        priority: 'medium',
        assignedTo: '陈工程师',
        createTime: '2024-01-14 14:20:00',
        updateTime: '2024-01-15 09:15:00',
        response: '已安排技术团队进行需求分析，预计本周内提供初步方案。'
      },
      {
        key: '3',
        id: 'C003',
        customerName: '刘强',
        phone: '13700137000',
        email: 'liuqiang@example.com',
        company: '贸易公司',
        subject: '数据分析平台',
        content: '希望建立数据分析平台，提升业务决策效率。',
        status: 'completed',
        priority: 'low',
        assignedTo: '赵顾问',
        createTime: '2024-01-10 16:45:00',
        updateTime: '2024-01-13 11:30:00',
        response: '已完成需求分析和方案设计，客户已确认实施计划。'
      }
    ]
    
    setConsultations(mockData)
    setLoading(false)
  }

  const columns: ColumnsType<Consultation> = [
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
      title: '公司',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '咨询主题',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const priorityMap = {
          low: { color: 'default', text: '低' },
          medium: { color: 'blue', text: '中' },
          high: { color: 'orange', text: '高' },
          urgent: { color: 'red', text: '紧急' }
        }
        const { color, text } = priorityMap[priority as keyof typeof priorityMap]
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap = {
          pending: { color: 'orange', text: '待处理' },
          processing: { color: 'blue', text: '处理中' },
          completed: { color: 'green', text: '已完成' },
          closed: { color: 'default', text: '已关闭' }
        }
        const { color, text } = statusMap[status as keyof typeof statusMap]
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
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
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<MessageOutlined />} 
            size="small"
            onClick={() => handleResponse(record)}
          >
            回复
          </Button>
          <Button 
            type="link" 
            icon={<PhoneOutlined />} 
            size="small"
            onClick={() => handleCall(record.phone)}
          >
            拨打
          </Button>
        </Space>
      ),
    },
  ]

  const handleViewDetail = (record: Consultation) => {
    setSelectedRecord(record)
    setDetailVisible(true)
  }

  const handleResponse = (record: Consultation) => {
    setSelectedRecord(record)
    form.setFieldsValue({
      status: record.status,
      assignedTo: record.assignedTo,
      response: record.response || ''
    })
    setResponseVisible(true)
  }

  const handleCall = (phone: string) => {
    message.info(`拨打电话：${phone}`)
  }

  const handleSubmitResponse = async (values: any) => {
    try {
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      message.success('回复成功')
      setResponseVisible(false)
      loadConsultations()
    } catch (error) {
      message.error('操作失败')
    }
  }

  return (
    <div>
      <Card title="咨询管理">
        <Table
          columns={columns}
          dataSource={consultations}
          loading={loading}
          pagination={{
            total: consultations.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      {/* 详情抽屉 */}
      <Drawer
        title="咨询详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {selectedRecord && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="咨询编号">{selectedRecord.id}</Descriptions.Item>
            <Descriptions.Item label="客户姓名">{selectedRecord.customerName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedRecord.phone}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selectedRecord.email}</Descriptions.Item>
            <Descriptions.Item label="公司">{selectedRecord.company}</Descriptions.Item>
            <Descriptions.Item label="咨询主题">{selectedRecord.subject}</Descriptions.Item>
            <Descriptions.Item label="咨询内容">
              <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.content}</div>
            </Descriptions.Item>
            <Descriptions.Item label="优先级">
              <Tag color={selectedRecord.priority === 'urgent' ? 'red' : selectedRecord.priority === 'high' ? 'orange' : selectedRecord.priority === 'medium' ? 'blue' : 'default'}>
                {selectedRecord.priority === 'urgent' ? '紧急' : selectedRecord.priority === 'high' ? '高' : selectedRecord.priority === 'medium' ? '中' : '低'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selectedRecord.status === 'completed' ? 'green' : selectedRecord.status === 'processing' ? 'blue' : selectedRecord.status === 'pending' ? 'orange' : 'default'}>
                {selectedRecord.status === 'completed' ? '已完成' : selectedRecord.status === 'processing' ? '处理中' : selectedRecord.status === 'pending' ? '待处理' : '已关闭'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="负责人">{selectedRecord.assignedTo}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedRecord.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{selectedRecord.updateTime}</Descriptions.Item>
            {selectedRecord.response && (
              <Descriptions.Item label="回复内容">
                <div style={{ whiteSpace: 'pre-wrap' }}>{selectedRecord.response}</div>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Drawer>

      {/* 回复模态框 */}
      <Modal
        title="回复咨询"
        open={responseVisible}
        onCancel={() => setResponseVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitResponse}
        >
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="completed">已完成</Option>
              <Option value="closed">已关闭</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assignedTo"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              <Option value="李经理">李经理</Option>
              <Option value="陈工程师">陈工程师</Option>
              <Option value="赵顾问">赵顾问</Option>
              <Option value="王专家">王专家</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="response"
            label="回复内容"
            rules={[{ required: true, message: '请输入回复内容' }]}
          >
            <TextArea rows={6} placeholder="请输入回复内容" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交回复
              </Button>
              <Button onClick={() => setResponseVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Consultations