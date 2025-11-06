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

interface Product {
  key: string
  id: string
  name: string
  description: string
  category: string
  price: number
  status: 'active' | 'inactive'
  image: string
  createTime: string
  updateTime: string
}

/**
 * @description 产品管理页面组件，用于展示、添加、编辑和删除产品信息。
 * @returns {React.ReactElement} 产品管理页面。
 */
const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  
  // 实时监听产品数据变化
  const { data: realtimeProducts } = useRealtime('products', [], {
    onInsert: (payload) => {
      message.success('新产品已添加')
      loadProducts()
    },
    onUpdate: (payload) => {
      message.info('产品信息已更新')
      loadProducts()
    },
    onDelete: (payload) => {
      message.warning('产品已删除')
      loadProducts()
    }
  })

  useEffect(() => {
    loadProducts()
  }, [])
  
  // 当实时数据更新时，同步本地状态
  useEffect(() => {
    if (realtimeProducts && realtimeProducts.length > 0) {
      const formattedData = realtimeProducts.map((item: any, index: number) => ({
        key: item.id || index.toString(),
        id: item.id,
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price,
        status: item.status,
        image: item.image || generateProductImage(item.name),
        createTime: new Date(item.created_at).toLocaleString('zh-CN'),
        updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
      }))
      setProducts(formattedData)
    }
  }, [realtimeProducts])

  /**
   * @description 从 API 加载产品数据。
   */
  const loadProducts = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
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
          name: item.name,
          description: item.description,
          category: item.category,
          price: item.price,
          status: item.status,
          image: item.image || generateProductImage(item.name),
          createTime: new Date(item.created_at).toLocaleString('zh-CN'),
          updateTime: new Date(item.updated_at).toLocaleString('zh-CN')
        }))
        setProducts(formattedData)
      } else {
        throw new Error('Failed to fetch products')
      }
    } catch (error) {
      console.error('加载产品失败:', error)
      // 使用默认数据作为后备
      loadDefaultProducts()
    }
    setLoading(false)
  }

  /**
   * @description 加载默认的产品数据，用于 API 请求失败时的后备。
   */
  const loadDefaultProducts = () => {
    const mockData: Product[] = [
      {
        key: '1',
        id: 'P001',
        name: '企业管理系统',
        description: '全面的企业资源规划和管理解决方案',
        category: 'software',
        price: 50000,
        status: 'active',
        image: generateProductImage('企业管理系统'),
        createTime: '2024-01-10 10:00:00',
        updateTime: '2024-01-15 14:30:00'
      },
      {
        key: '2',
        id: 'P002',
        name: '数据分析平台',
        description: '智能数据分析和可视化平台',
        category: 'platform',
        price: 80000,
        status: 'active',
        image: generateProductImage('数据分析平台'),
        createTime: '2024-01-08 09:15:00',
        updateTime: '2024-01-12 16:45:00'
      },
      {
        key: '3',
        id: 'P003',
        name: '移动办公应用',
        description: '便捷的移动端办公协作工具',
        category: 'mobile',
        price: 30000,
        status: 'inactive',
        image: generateProductImage('移动办公应用'),
        createTime: '2024-01-05 11:20:00',
        updateTime: '2024-01-10 13:10:00'
      }
    ]
    setProducts(mockData)
  }

  /**
   * @description 根据产品名称生成一个占位图 URL。
   * @param {string} productName - 产品名称。
   * @returns {string} 生成的图片 URL。
   */
  const generateProductImage = (productName: string) => {
    const prompt = encodeURIComponent(`modern business product ${productName}, professional software interface, clean design, technology theme`)
    return `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`
  }

  const columns: ColumnsType<Product> = [
    {
      title: '产品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) => (
        <Image
          width={60}
          height={60}
          src={image}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          style={{ objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: '产品编号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '产品名称',
      dataIndex: 'name',
      key: 'name',
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
          software: { color: 'blue', text: '软件产品' },
          platform: { color: 'green', text: '平台服务' },
          mobile: { color: 'purple', text: '移动应用' },
          hardware: { color: 'orange', text: '硬件设备' }
        }
        const { color, text } = categoryMap[category as keyof typeof categoryMap] || { color: 'default', text: category }
        return <Tag color={color}>{text}</Tag>
      }
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price.toLocaleString()}`
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '上架' : '下架'}
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
            title="确定要删除这个产品吗？"
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
   * @description 处理新增产品操作。
   */
  const handleAdd = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  /**
   * @description 处理编辑产品操作。
   * @param {Product} record - 要编辑的产品记录。
   */
  const handleEdit = (record: Product) => {
    setEditingId(record.id)
    form.setFieldsValue(record)
    setModalVisible(true)
  }

  /**
   * @description 处理删除产品操作。
   * @param {string} id - 要删除的产品 ID。
   */
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        message.success('删除成功')
        loadProducts()
      } else {
        throw new Error('删除失败')
      }
    } catch (error) {
      console.error('删除产品失败:', error)
      message.error('删除失败，请重试')
    }
  }

  /**
   * @description 处理表单提交，用于创建或更新产品。
   * @param {any} values - 表单提交的值。
   */
  const handleSubmit = async (values: any) => {
    try {
      const url = editingId 
        ? `${API_BASE_URL}/products/${editingId}`
        : `${API_BASE_URL}/products`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: values.name,
          description: values.description,
          category: values.category,
          price: values.price,
          status: values.status,
          image: values.image || generateProductImage(values.name)
        })
      })
      
      if (response.ok) {
        message.success(editingId ? '更新成功' : '创建成功')
        setModalVisible(false)
        loadProducts()
      } else {
        throw new Error('保存失败')
      }
    } catch (error) {
      console.error('保存产品失败:', error)
      message.error('操作失败，请重试')
    }
  }

  return (
    <div>
      <Card 
        title="产品管理" 
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增产品
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={products}
          loading={loading}
          pagination={{
            total: products.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingId ? '编辑产品' : '新增产品'}
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
            name="name"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>

          <Form.Item
            name="category"
            label="产品分类"
            rules={[{ required: true, message: '请选择产品分类' }]}
          >
            <Select placeholder="请选择产品分类">
              <Option value="software">软件产品</Option>
              <Option value="platform">平台服务</Option>
              <Option value="mobile">移动应用</Option>
              <Option value="hardware">硬件设备</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="price"
            label="产品价格"
            rules={[{ required: true, message: '请输入产品价格' }]}
          >
            <InputNumber<number>
              style={{ width: '100%' }}
              min={0}
              formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => {
                const num = parseFloat(value?.replace(/\¥\s?|(,*)/g, '') || '0');
                return isNaN(num) ? 0 : num;
              }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="产品描述"
            rules={[{ required: true, message: '请输入产品描述' }]}
          >
            <TextArea rows={4} placeholder="请输入产品描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="active">上架</Option>
              <Option value="inactive">下架</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="image"
            label="产品图片"
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

export default Products