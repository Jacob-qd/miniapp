import React, { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Upload,
  message,
  Row,
  Col,
  Divider,
  Space,
  Image
} from 'antd'
import {
  UploadOutlined,
  SaveOutlined,
  PlusOutlined
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'

const { TextArea } = Input

interface CompanyInfo {
  name: string
  description: string
  address: string
  phone: string
  email: string
  website: string
  logo: string
  banner: string
  advantages: string[]
  culture: string
  history: string
  certificates: string[]
}

const Company: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [logoFileList, setLogoFileList] = useState<UploadFile[]>([])
  const [bannerFileList, setBannerFileList] = useState<UploadFile[]>([])
  const [certificateFileList, setCertificateFileList] = useState<UploadFile[]>([])

  useEffect(() => {
    loadCompanyInfo()
  }, [])

  const loadCompanyInfo = async () => {
    setLoading(true)
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockData: CompanyInfo = {
      name: '科技创新有限公司',
      description: '专注于为企业提供数字化转型解决方案的高新技术企业，致力于通过先进的技术和专业的服务，帮助客户实现业务增长和效率提升。',
      address: '北京市朝阳区科技园区创新大厦A座15层',
      phone: '400-123-4567',
      email: 'contact@techcompany.com',
      website: 'https://www.techcompany.com',
      logo: '/images/company-logo.png',
      banner: '/images/company-banner.jpg',
      advantages: [
        '10年行业经验，服务超过500家企业',
        '拥有50+专业技术团队',
        '获得ISO9001质量管理体系认证',
        '7x24小时技术支持服务'
      ],
      culture: '创新、专业、诚信、共赢',
      history: '公司成立于2014年，从最初的5人团队发展到现在的100+人规模，始终坚持技术创新和客户至上的理念。',
      certificates: [
        '/images/cert1.jpg',
        '/images/cert2.jpg',
        '/images/cert3.jpg'
      ]
    }
    
    setCompanyInfo(mockData)
    form.setFieldsValue(mockData)
    setLoading(false)
  }

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      // 模拟保存API调用
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      message.success('企业信息更新成功')
      loadCompanyInfo()
    } catch (error) {
      message.error('更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (info: any) => {
    setLogoFileList(info.fileList)
  }

  const handleBannerChange = (info: any) => {
    setBannerFileList(info.fileList)
  }

  const handleCertificateChange = (info: any) => {
    setCertificateFileList(info.fileList)
  }

  return (
    <div>
      <Card title="企业信息管理">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="企业名称"
                rules={[{ required: true, message: '请输入企业名称' }]}
              >
                <Input placeholder="请输入企业名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="website"
                label="官方网站"
                rules={[{ type: 'url', message: '请输入正确的网址格式' }]}
              >
                <Input placeholder="请输入官方网站" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="企业简介"
            rules={[{ required: true, message: '请输入企业简介' }]}
          >
            <TextArea rows={4} placeholder="请输入企业简介" />
          </Form.Item>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱地址"
                rules={[
                  { required: true, message: '请输入邮箱地址' },
                  { type: 'email', message: '请输入正确的邮箱格式' }
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="企业地址"
            rules={[{ required: true, message: '请输入企业地址' }]}
          >
            <Input placeholder="请输入企业地址" />
          </Form.Item>

          <Divider>企业形象</Divider>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item label="企业Logo">
                <Upload
                  listType="picture-card"
                  fileList={logoFileList}
                  onChange={handleLogoChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {logoFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传Logo</div>
                    </div>
                  )}
                </Upload>
                {companyInfo?.logo && logoFileList.length === 0 && (
                  <Image
                    width={100}
                    height={100}
                    src={companyInfo.logo}
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="企业横幅">
                <Upload
                  listType="picture-card"
                  fileList={bannerFileList}
                  onChange={handleBannerChange}
                  beforeUpload={() => false}
                  maxCount={1}
                >
                  {bannerFileList.length === 0 && (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>上传横幅</div>
                    </div>
                  )}
                </Upload>
                {companyInfo?.banner && bannerFileList.length === 0 && (
                  <Image
                    width={200}
                    height={100}
                    src={companyInfo.banner}
                    style={{ marginTop: 8 }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Divider>企业文化</Divider>

          <Form.Item
            name="culture"
            label="企业文化"
          >
            <Input placeholder="请输入企业文化理念" />
          </Form.Item>

          <Form.Item
            name="history"
            label="发展历程"
          >
            <TextArea rows={3} placeholder="请输入企业发展历程" />
          </Form.Item>

          <Form.Item label="核心优势">
            <Form.List name="advantages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="请输入核心优势" />
                      </Form.Item>
                      <Button type="link" onClick={() => remove(name)} danger>
                        删除
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加优势
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Divider>资质证书</Divider>

          <Form.Item label="资质证书">
            <Upload
              listType="picture-card"
              fileList={certificateFileList}
              onChange={handleCertificateChange}
              beforeUpload={() => false}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传证书</div>
              </div>
            </Upload>
            {companyInfo?.certificates && certificateFileList.length === 0 && (
              <div style={{ marginTop: 16 }}>
                <Row gutter={16}>
                  {companyInfo.certificates.map((cert, index) => (
                    <Col key={index} span={6}>
                      <Image
                        width={150}
                        height={200}
                        src={cert}
                        style={{ objectFit: 'cover' }}
                      />
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
            >
              保存企业信息
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default Company