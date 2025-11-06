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
  InputNumber,
  message,
  Popconfirm,
  Image
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

interface Banner {
  key: string
  id: string
  title: string
  description: string
  image: string
  link: string
  order: number
  status: 'active' | 'inactive'
  createTime: string
  updateTime: string
}

/**
 * @description 轮播图管理页面组件，用于显示、创建、编辑和删除轮播图。
 * @returns {React.ReactElement} 轮播图管理页面。
 */
const Banners: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  
  // 实时监听轮播图数据变化
  const { data: realtimeBanners } = useRealtime('banners', [], {
    onInsert: (payload) => {
      message.success('新轮播图已添加')
      loadBanners()
    },
    onUpdate: (payload) => {
      message.info('轮播图信息已更新')
      loadBanners()
    },
    onDelete: (payload) => {
      message.warning('轮播图已删除')
      loadBanners()
    }
  })

  useEffect(() => {
    loadBanners()
  }, [])
  
  // 当实时数据更新时，同步本地状态
  useEffect(() => {
    if (realtimeBanners && realtimeBanners.length > 0) {
      const formattedData = realtimeBanners.map((item: any, index: number) => ({
        key: item.id || index.toString(),
        id: item.id,
        title: item.title,
        description: item.description,
        image: item.image || generateBannerImage(item.title),
        link: item.link,
        order: item.order,
        status: item.status,
        createTime: new Date(item.created_at).toLocaleString('zh-CN'),
        updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
      }))
      setBanners(formattedData)
    }
  }, [realtimeBanners])

  /**
   * @description 从 API 加载轮播图数据。
   */
  const loadBanners = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/banners`, {
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
          image: item.image || generateBannerImage(item.title),
          link: item.link,
          order: item.order,
          status: item.status,
          createTime: new Date(item.created_at).toLocaleString('zh-CN'),
          updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
        }))
        setBanners(formattedData)
      } else {
        throw new Error('Failed to fetch banners')
      }
    } catch (error) {
      console.error('加载轮播图失败:', error)
      // 使用默认数据作为后备
      loadDefaultBanners()
    }
    setLoading(false)
  }

  /**
   * @description 加载默认的轮播图数据，用于 API 请求失败时的后备。
   */
  const loadDefaultBanners = () => {
    const mockData: Banner[] = [
      {
        key: '1',
        id: 'B001',
        title: '数字化转型解决方案',
        description: '助力企业数字化升级，提升核心竞争力',
        image: generateBannerImage('数字化转型解决方案'),
        link: '/solutions/digital',
        order: 1,
        status: 'active',
        createTime: '2024-01-10 10:00:00',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        key: '2',
        id: 'B002',
        title: '云服务平台',
        description: '稳定可靠的云计算服务，降低IT成本',
        image: generateBannerImage('云服务平台'),
        link: '/solutions/cloud',
        order: 2,
        status: 'active',
        createTime: '2024-01-08 09:15:00',
        updateTime: '2024-01-12 16:45:00'
      },
      {
        key: '3',
        id: 'B003',
        title: '智能数据分析',
        description: '深度挖掘数据价值，为决策提供科学依据',
        image: generateBannerImage('智能数据分析'),
        link: '/solutions/data',
        order: 3,
        status: 'inactive',
        createTime: '2024-01-05 11:20:00',
        updateTime: '2024-01-10 13:10:00'
      }
    ]
    setBanners(mockData)
  }

  /**
   * @description 根据标题生成一个占位图 URL。
   * @param {string} title - 轮播图标题。
   * @returns {string} 生成的图片 URL。
   */
  const generateBannerImage = (title: string) => {
    const prompt = encodeURIComponent(`business banner ${title}, professional corporate design, modern technology theme, clean layout`)
    return `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=landscape_16_9`
  }

  const columns: ColumnsType<Banner> = [
    {
      title: '轮播图',
      dataIndex: 'image',
      key: 'image',
      width: 120,
      render: (image: string) => (
        <Image
          width={100}
          height={60}
          src={image}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '标题',
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
      title: '链接',
      dataIndex: 'link',
      key: 'link',
      ellipsis: true,
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order',
      sorter: (a, b) => a.order - b.order,
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
            title="确定要删除这个轮播图吗？"
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

  /**
   * @description 处理新增轮播图操作，打开模态框并重置表单。
   */
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * @description 处理编辑轮播图操作，打开模态框并填充表单。
   * @param {Banner} record - 要编辑的轮播图记录。
   */
  const handleEdit = (record: Banner) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * @description 处理删除轮播图操作。
   * @param {string} id - 要删除的轮播图 ID。
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        message.success('删除成功')
        loadBanners()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除轮播图失败:', error)
      message.error('删除失败，请重试')
    }
  }

  /**
   * @description 处理表单提交操作，用于创建或更新轮播图。
   * @param {any} values - 表单提交的值。
   */
  const handleSubmit = async (values: any) => {
    try {
      const url = editingId 
        ? `${API_BASE_URL}/banners/${editingId}`
        : `${API_BASE_URL}/banners`
      
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
          link: values.link,
          order: values.order,
          status: values.status,
          image: values.image || generateBannerImage(values.title)
        })
      })
      
      if (response.ok) {
        message.success(editingId ? '更新成功' : '创建成功')
        setModalVisible(false)
        loadBanners()
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存轮播图失败:', error)
      message.error('操作失败，请重试')
    }
  }

  return (
    <div>
      <Card 
        title="轮播图管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增轮播图
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={banners}
          loading={loading}
          pagination={{
            total: banners.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑轮播图' : '新增轮播图'}
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
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="link"
            label="跳转链接"
            rules={[{ required: true, message: '请输入跳转链接' }]}
          >
            <Input placeholder="请输入跳转链接" />
          </Form.Item>

          <Form.Item
            name="order"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入排序"
              min={1}
            />
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
            name="image"
            label="轮播图片"
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

export default Banners