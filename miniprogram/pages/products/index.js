// products/index.js
const app = getApp()
const { API } = require('../../utils/api')

Page({
  data: {
    searchKeyword: '',
    showFilter: false,
    selectedCategory: '',
    selectedPrice: '',
    categories: [
      { key: 'software', name: '软件产品' },
      { key: 'hardware', name: '硬件设备' },
      { key: 'service', name: '技术服务' },
      { key: 'consulting', name: '咨询服务' }
    ],
    priceRanges: [
      { key: 'low', name: '1万以下' },
      { key: 'medium', name: '1-10万' },
      { key: 'high', name: '10万以上' }
    ],
    products: [],
    filteredProducts: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  // 加载默认产品数据
  loadDefaultProducts(refresh, mockProducts) {
    // 更新图片URL为动态生成的图片
    const productsWithImages = mockProducts.map(product => ({
      ...product,
      image_url: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(product.name + ' business product')}&image_size=square_hd`
    }))
    
    // 模拟网络延迟
    setTimeout(() => {
      if (refresh) {
        this.setData({
          products: productsWithImages,
          page: 1,
          hasMore: true
        })
      } else {
        const newProducts = [...this.data.products, ...productsWithImages]
        this.setData({
          products: newProducts,
          hasMore: productsWithImages.length === this.data.pageSize
        })
      }
      
      this.filterProducts()
      this.setData({ loading: false })
    }, 1000)
  },

  // 记录页面访问统计
  trackPageView() {
    try {
      API.analytics.track({
        page: 'products',
        action: 'page_view',
        target: 'products_list',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
  },

  onLoad() {
    this.loadProducts()
    this.trackPageView()
  },

  // 加载产品列表
  async loadProducts(refresh = false) {
    if (this.data.loading) return
    
    this.setData({ loading: true })

    try {
      const params = {
        page: refresh ? 1 : this.data.page,
        pageSize: this.data.pageSize,
        keyword: this.data.searchKeyword,
        category: this.data.selectedCategory,
        priceRange: this.data.selectedPrice
      }
      
      const res = await API.products.getList(params)
      if (res.data && res.data.list) {
        const products = refresh ? res.data.list : [...this.data.products, ...res.data.list]
        this.setData({
          products: products,
          hasMore: res.data.hasMore,
          page: refresh ? 2 : this.data.page + 1
        })
        this.filterProducts()
        this.setData({ loading: false })
        return
      }
    } catch (error) {
      console.error('加载产品列表失败:', error)
    }
    
    // 使用默认数据
    const mockProducts = [
      {
        id: '1',
        name: '企业级ERP系统',
        description: '全面的企业资源规划系统，涵盖财务、人事、供应链等各个业务模块',
        image_url: '/images/product-erp.jpg',
        category: 'software',
        price: 5000,
        features: ['模块化设计', '云端部署', '移动办公'],
        is_hot: true
      },
      {
        id: '2',
        name: 'CRM客户管理系统',
        description: '专业的客户关系管理平台，提升销售效率和客户满意度',
        image_url: '/images/product-crm.jpg',
        category: 'software',
        price: 3000,
        features: ['销售漏斗', '客户画像', '自动化营销'],
        is_hot: false
      },
      {
        id: '3',
        name: '智能服务器',
        description: '高性能企业级服务器，支持虚拟化和云计算部署',
        image_url: '/images/product-server.jpg',
        category: 'hardware',
        price: 15000,
        features: ['高可用性', '节能环保', '易于维护'],
        is_hot: false
      },
      {
        id: '4',
        name: '网络安全设备',
        description: '企业级防火墙和入侵检测系统，保障网络安全',
        image_url: '/images/product-security.jpg',
        category: 'hardware',
        price: 8000,
        features: ['实时监控', '威胁检测', '访问控制'],
        is_hot: true
      },
      {
        id: '5',
        name: '系统集成服务',
        description: '专业的IT系统集成和实施服务，确保项目成功交付',
        image_url: '/images/service-integration.jpg',
        category: 'service',
        price: 2000,
        features: ['需求分析', '方案设计', '实施部署'],
        is_hot: false
      },
      {
        id: '6',
        name: '技术培训服务',
        description: '专业的技术培训和认证服务，提升团队技术能力',
        image_url: '/images/service-training.jpg',
        category: 'service',
        price: 1500,
        features: ['定制课程', '实战演练', '认证考试'],
        is_hot: false
      },
      {
        id: '7',
        name: '数字化转型咨询',
        description: '专业的数字化转型咨询服务，制定个性化转型方案',
        image_url: '/images/consulting-digital.jpg',
        category: 'consulting',
        price: 10000,
        features: ['现状评估', '战略规划', '实施指导'],
        is_hot: true
      },
      {
        id: '8',
        name: 'IT架构咨询',
        description: '企业IT架构设计和优化咨询，提升系统性能和稳定性',
        image_url: '/images/consulting-architecture.jpg',
        category: 'consulting',
        price: 8000,
        features: ['架构评估', '性能优化', '技术选型'],
        is_hot: false
      }
    ]

    this.loadDefaultProducts(refresh, mockProducts)
  },

  // 筛选产品
  filterProducts() {
    let filtered = [...this.data.products]
    
    // 关键词搜索
    if (this.data.searchKeyword) {
      const keyword = this.data.searchKeyword.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
      )
    }
    
    // 分类筛选
    if (this.data.selectedCategory) {
      filtered = filtered.filter(product => product.category === this.data.selectedCategory)
    }
    
    // 价格筛选
    if (this.data.selectedPrice) {
      filtered = filtered.filter(product => {
        const price = product.price
        switch (this.data.selectedPrice) {
          case 'low':
            return price < 10000
          case 'medium':
            return price >= 10000 && price <= 100000
          case 'high':
            return price > 100000
          default:
            return true
        }
      })
    }
    
    this.setData({ filteredProducts: filtered })
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // 搜索确认
  onSearch() {
    this.filterProducts()
  },

  // 切换筛选面板
  onFilterTap() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  // 选择分类
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ selectedCategory: category })
    this.filterProducts()
  },

  // 选择价格区间
  onPriceTap(e) {
    const price = e.currentTarget.dataset.price
    this.setData({ selectedPrice: price })
    this.filterProducts()
  },

  // 产品详情
  onProductTap(e) {
    const id = e.currentTarget.dataset.id
    
    // 记录产品点击统计
    try {
      API.analytics.track({
        page: 'products',
        action: 'product_click',
        target: id,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.navigateTo({
      url: `/pages/products/detail?id=${id}`
    })
  },

  // 咨询产品
  onConsultTap(e) {
    const id = e.currentTarget.dataset.id
    const product = this.data.products.find(p => p.id === id)
    
    // 记录咨询统计
    try {
      API.analytics.track({
        page: 'products',
        action: 'product_consult',
        target: id,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.showModal({
      title: '产品咨询',
      content: `您想了解「${product.name}」的详细信息吗？`,
      confirmText: '立即咨询',
      success: (res) => {
        if (res.confirm) {
          this.onContactTap()
        }
      }
    })
  },

  // 联系咨询
  onContactTap() {
    wx.showActionSheet({
      itemList: ['电话咨询', '微信咨询', '在线客服'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            wx.makePhoneCall({
              phoneNumber: '400-123-4567'
            })
            break
          case 1:
            wx.setClipboardData({
              data: 'business-wechat-2024',
              success: () => {
                wx.showToast({
                  title: '微信号已复制',
                  icon: 'success'
                })
              }
            })
            break
          case 2:
            wx.navigateTo({
              url: '/pages/contact/index'
            })
            break
        }
      }
    })
  },

  // 刷新
  onRefresh() {
    this.setData({
      searchKeyword: '',
      selectedCategory: '',
      selectedPrice: '',
      showFilter: false
    })
    this.loadProducts(true)
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({ page: this.data.page + 1 })
      this.loadProducts()
    }
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.onRefresh()
    wx.stopPullDownRefresh()
  },

  // 上拉加载
  onReachBottom() {
    this.onLoadMore()
  },

  onShareAppMessage() {
    return {
      title: '产品展示 - 商务小程序',
      path: '/pages/products/index'
    }
  }
})