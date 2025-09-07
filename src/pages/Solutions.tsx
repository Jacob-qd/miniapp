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
  Upload,
  message,
  Popconfirm
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useRealtime } from '../hooks/useRealtime'

// API配置
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/api' 
  : 'http://localhost:3001/api'

const { TextArea } = Input
const { Option } = Select

interface Solution {
  key: string
  id: string
  title: string
  description: string
  category: string
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

const Solutions: React.FC = () => {
  const [solutions, setSolutions] = useState<Solution[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  
  // 实时监听解决方案数据变化
  const { data: realtimeSolutions } = useRealtime('solutions', [], {
    onInsert: (payload) => {
      message.success('新解决方案已添加')
      loadSolutions()
    },
    onUpdate: (payload) => {
      message.info('解决方案信息已更新')
      loadSolutions()
    },
    onDelete: (payload) => {
      message.warning('解决方案已删除')
      loadSolutions()
    }
  })

  useEffect(() => {
    loadSolutions()
  }, [])
  
  // 当实时数据更新时，同步本地状态
  useEffect(() => {
    if (realtimeSolutions && realtimeSolutions.length > 0) {
      const formattedData = realtimeSolutions.map((item: any, index: number) => ({
        key: item.id || index.toString(),
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        status: item.status,
        createTime: new Date(item.created_at).toLocaleString('zh-CN'),
        updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
      }))
      setSolutions(formattedData)
    }
  }, [realtimeSolutions])

  const loadSolutions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/solutions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const formattedData = data.map((item: any, index: number) => ({
          key: item.id || index.toString(),
          id: item.id,
          title: item.title,
          description: item.description,
          category: item.category,
          status: item.status,
          createTime: new Date(item.created_at).toLocaleString('zh-CN'),
          updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
        }))
        setSolutions(formattedData)
      } else {
        throw new Error('Failed to fetch solutions')
      }
    } catch (error) {
      console.error('加载解决方案失败:', error)
      // 使用默认数据作为后备
      loadDefaultSolutions()
    }
    setLoading(false)
  }

  const loadDefaultSolutions = () => {
    const mockData: Solution[] = [
      {
        key: '1',
        id: 'S001',
        title: '数字化转型解决方案',
        description: '帮助企业实现全面数字化升级，提升运营效率和竞争力',
        category: 'digital',
        status: 'active',
        createTime: '2024-01-10 10:00:00',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        key: '2',
        id: 'S002',
        title: '云服务解决方案',
        description: '提供稳定可靠的云计算服务，降低IT成本',
        category: 'cloud',
        status: 'active',
        createTime: '2024-01-08 09:15:00',
        updateTime: '2024-01-12 16:45:00'
      },
      {
        key: '3',
        id: 'S003',
        title: '数据分析解决方案',
        description: '深度挖掘数据价值，为业务决策提供科学依据',
        category: 'data',
        status: 'inactive',
        createTime: '2024-01-05 11:20:00',
        updateTime: '2024-01-10 13:10:00'
      }
    ]
    setSolutions(mockData)
  }

  const columns: ColumnsType<Solution> = [
    {
      title: '方案编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '方案标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => {
        const categoryMap = {
          digital: { color: 'blue', text: '数字化转型' },
          cloud: { color: 'green', text: '云服务' },
          data: { color: 'purple', text: '数据分析' }
        }
        const { color, text } = categoryMap[category as keyof typeof categoryMap] || { color: 'default', text: category }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '启用' : '禁用'}
        </Tag>
      )
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个解决方案吗？"
            onConfirm={() => handleDelete(record.id)}
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

  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: Solution) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/solutions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        message.success('删除成功')
        loadSolutions()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除解决方案失败:', error)
      message.error('删除失败，请重试')
    }
  }

  const handleSubmit = async (values: any) => {
    try {
      const url = editingId 
        ? `${API_BASE_URL}/solutions/${editingId}`
        : `${API_BASE_URL}/solutions`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          category: values.category,
          status: values.status,
          banner: values.banner
        })
      })
      
      if (response.ok) {
        message.success(editingId ? '更新成功' : '创建成功')
        setModalVisible(false)
        loadSolutions()
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存解决方案失败:', error)
      message.error('操作失败，请重试')
    }
  }

  return (
    <div>
      <Card 
        title="解决方案管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增方案
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={solutions}
          loading={loading}
          pagination={{
            total: solutions.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑解决方案' : '新增解决方案'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="方案标题"
            rules={[{ required: true, message: '请输入方案标题' }]}
          >
            <Input placeholder="请输入方案标题" />
          </Form.Item>

          <Form.Item
            name="category"
            label="方案分类"
            rules={[{ required: true, message: '请选择方案分类' }]}
          >
            <Select placeholder="请选择方案分类">
              <Option value="digital">数字化转型</Option>
              <Option value="cloud">云服务</Option>
              <Option value="data">数据分析</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="方案描述"
            rules={[{ required: true, message: '请输入方案描述' }]}
          >
            <TextArea rows={4} placeholder="请输入方案描述" />
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

          <Form.Item
            name="banner"
            label="方案图片"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传图片</div>
              </div>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingId ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Solutions