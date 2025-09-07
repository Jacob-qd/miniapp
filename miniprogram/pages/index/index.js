// index.js
const app = getApp()
const { API } = require('../../utils/api')

Page({
  data: {
    banners: [],
    solutions: []
  },

  onLoad() {
    this.loadBanners()
    this.loadSolutions()
    this.trackPageView()
  },

  // 加载轮播图数据
  async loadBanners() {
    try {
      const res = await API.banners.getList()
      if (res.data && res.data.length > 0) {
        this.setData({
          banners: res.data
        })
      } else {
        // 如果没有数据，使用默认轮播图
        this.setDefaultBanners()
      }
    } catch (error) {
      console.error('加载轮播图失败:', error)
      // 加载失败时使用默认轮播图
      this.setDefaultBanners()
    }
  },

  // 设置默认轮播图
  setDefaultBanners() {
    const defaultBanners = [
      {
        id: '1',
        title: '欢迎使用我们的商务解决方案',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20solution%20banner%20with%20professional%20office%20environment&image_size=landscape_16_9',
        link_url: '/pages/solution/detail?id=1'
      },
      {
        id: '2',
        title: '专业团队为您服务',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20business%20team%20working%20together%20in%20modern%20office&image_size=landscape_16_9',
        link_url: '/pages/about/index'
      },
      {
        id: '3',
        title: '联系我们获取更多信息',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20contact%20and%20communication%20concept%20with%20modern%20technology&image_size=landscape_16_9',
        link_url: '/pages/about/index'
      }
    ]
    
    this.setData({
      banners: defaultBanners
    })
  },

  // 加载解决方案数据
  async loadSolutions() {
    try {
      const res = await API.solutions.getList({ limit: 3 })
      if (res.data && res.data.length > 0) {
        this.setData({
          solutions: res.data
        })
      } else {
        // 如果没有数据，使用默认解决方案
        this.setDefaultSolutions()
      }
    } catch (error) {
      console.error('加载解决方案失败:', error)
      // 加载失败时使用默认解决方案
      this.setDefaultSolutions()
    }
  },

  // 设置默认解决方案
  setDefaultSolutions() {
    const defaultSolutions = [
      {
        id: '1',
        title: '数字化转型解决方案',
        description: '帮助企业实现全面数字化升级，提升运营效率和竞争力',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20transformation%20icon%20modern%20technology&image_size=square'
      },
      {
        id: '2',
        title: '云服务解决方案',
        description: '提供稳定可靠的云计算服务，降低IT成本',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20computing%20services%20icon%20technology&image_size=square'
      },
      {
        id: '3',
        title: '数据分析解决方案',
        description: '深度挖掘数据价值，为业务决策提供科学依据',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=data%20analytics%20dashboard%20charts%20graphs&image_size=square'
      }
    ]
    
    this.setData({
      solutions: defaultSolutions
    })
  },

  // 记录页面访问统计
  trackPageView() {
    try {
      API.analytics.track({
        page: 'index',
        action: 'page_view',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
  },

  // 轮播图点击事件
  onBannerTap(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      // 记录轮播图点击统计
      try {
        API.analytics.track({
          page: 'index',
          action: 'banner_click',
          target: url,
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.log('统计记录失败:', error)
      }
      
      wx.navigateTo({
        url: url
      })
    }
  },

  // 导航点击事件
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  },

  // 解决方案点击事件
  onSolutionTap(e) {
    const id = e.currentTarget.dataset.id
    
    // 记录解决方案点击统计
    try {
      API.analytics.track({
        page: 'index',
        action: 'solution_click',
        target: id,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.navigateTo({
      url: `/pages/solution/detail?id=${id}`
    })
  },

  // 联系我们点击事件
  onContactTap() {
    wx.showActionSheet({
      itemList: ['拨打电话', '复制微信号'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 拨打电话
          wx.makePhoneCall({
            phoneNumber: '400-123-4567'
          })
        } else if (res.tapIndex === 1) {
          // 复制微信号
          wx.setClipboardData({
            data: 'your-wechat-id',
            success: () => {
              wx.showToast({
                title: '微信号已复制',
                icon: 'success'
              })
            }
          })
        }
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '商务小程序 - 专业的商务解决方案',
      path: '/pages/index/index'
    }
  }
})