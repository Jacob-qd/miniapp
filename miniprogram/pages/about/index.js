// about/index.js
const app = getApp()
const { API } = require('../../utils/api')

Page({
  data: {
    companyInfo: {
      name: '科技创新有限公司',
      slogan: '科技引领未来，创新驱动发展',
      introduction: '我们是一家专注于企业数字化转型的科技公司，成立于2015年，总部位于北京。公司致力于为企业提供全方位的数字化解决方案，包括软件开发、系统集成、云服务、数据分析等服务。\n\n经过多年的发展，我们已经为超过500家企业提供了专业的技术服务，涵盖制造业、金融业、教育行业、医疗健康等多个领域。我们拥有一支经验丰富的技术团队，秉承"客户至上、技术领先、服务专业"的理念，为客户创造更大的商业价值。',
      address: '北京市海淀区中关村科技园区创新大厦A座15层',
      longitude: 116.3074,
      latitude: 39.9776
    },
    advantages: [
      {
        id: 1,
        icon: '/images/advantage-tech.png',
        title: '技术领先',
        description: '拥有自主知识产权的核心技术，持续投入研发创新'
      },
      {
        id: 2,
        icon: '/images/advantage-team.png',
        title: '专业团队',
        description: '汇聚行业精英，平均从业经验超过8年'
      },
      {
        id: 3,
        icon: '/images/advantage-service.png',
        title: '优质服务',
        description: '7x24小时技术支持，快速响应客户需求'
      },
      {
        id: 4,
        icon: '/images/advantage-solution.png',
        title: '定制方案',
        description: '深度理解业务需求，提供个性化解决方案'
      }
    ],
    timeline: [
      {
        year: '2015',
        title: '公司成立',
        description: '在北京中关村成立，专注企业信息化服务'
      },
      {
        year: '2017',
        title: '业务拓展',
        description: '业务范围扩展至云计算和大数据领域'
      },
      {
        year: '2019',
        title: '技术突破',
        description: '自主研发的核心产品获得多项技术专利'
      },
      {
        year: '2021',
        title: '规模扩大',
        description: '员工规模突破200人，服务客户超过300家'
      },
      {
        year: '2023',
        title: '战略升级',
        description: '全面转向数字化转型服务，客户满意度达98%'
      }
    ],
    teamMembers: [
      {
        id: 1,
        name: '张总',
        position: '创始人兼CEO',
        avatar: '/images/team-ceo.jpg',
        description: '15年IT行业经验，曾任职于知名互联网公司，专注企业数字化转型'
      },
      {
        id: 2,
        name: '李总',
        position: '技术总监',
        avatar: '/images/team-cto.jpg',
        description: '12年技术研发经验，主导多个大型项目，在云计算领域有深入研究'
      },
      {
        id: 3,
        name: '王总',
        position: '市场总监',
        avatar: '/images/team-cmo.jpg',
        description: '10年市场营销经验，深谙B2B市场运作，成功拓展多个行业客户'
      }
    ],
    culture: [
      {
        type: '企业使命',
        icon: '/images/culture-mission.png',
        content: '通过技术创新，帮助企业实现数字化转型，提升竞争力'
      },
      {
        type: '企业愿景',
        icon: '/images/culture-vision.png',
        content: '成为国内领先的企业数字化转型服务提供商'
      },
      {
        type: '核心价值观',
        icon: '/images/culture-values.png',
        content: '客户至上、技术领先、团队协作、持续创新、诚信负责'
      }
    ],
    honors: [
      {
        id: 1,
        title: '高新技术企业',
        image: '/images/honor-hightech.jpg'
      },
      {
        id: 2,
        title: 'ISO9001认证',
        image: '/images/honor-iso9001.jpg'
      },
      {
        id: 3,
        title: '软件企业认定',
        image: '/images/honor-software.jpg'
      },
      {
        id: 4,
        title: '优秀服务商',
        image: '/images/honor-service.jpg'
      },
      {
        id: 5,
        title: '技术创新奖',
        image: '/images/honor-innovation.jpg'
      },
      {
        id: 6,
        title: '诚信企业',
        image: '/images/honor-integrity.jpg'
      }
    ],
    contactInfo: [
      {
        type: 'phone',
        icon: 'success',
        label: '联系电话',
        value: '400-123-4567'
      },
      {
        type: 'email',
        icon: 'info',
        label: '邮箱地址',
        value: 'contact@company.com'
      },
      {
        type: 'wechat',
        icon: 'waiting',
        label: '微信客服',
        value: 'company-service'
      },
      {
        type: 'website',
        icon: 'search',
        label: '官方网站',
        value: 'www.company.com'
      }
    ],
    mapMarkers: []
  },

  onLoad() {
    this.initMapMarkers()
    this.loadCompanyInfo()
    this.trackPageView()
  },

  // 加载企业信息
  async loadCompanyInfo() {
    try {
      const res = await API.company.getInfo()
      if (res.data) {
        this.setData({
          companyInfo: {
            ...this.data.companyInfo,
            ...res.data
          }
        })
        this.initMapMarkers()
      }
    } catch (error) {
      console.error('加载企业信息失败:', error)
    }
    
    // 更新图片为动态生成的图片
    this.updateImages()
  },

  // 更新图片
  updateImages() {
    const updatedAdvantages = this.data.advantages.map(item => ({
      ...item,
      icon: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.title + ' business advantage icon')}&image_size=square`
    }))
    
    const updatedTeamMembers = this.data.teamMembers.map(item => ({
      ...item,
      avatar: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('professional business person ' + item.position)}&image_size=square`
    }))
    
    const updatedCulture = this.data.culture.map(item => ({
      ...item,
      icon: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.type + ' corporate culture icon')}&image_size=square`
    }))
    
    const updatedHonors = this.data.honors.map(item => ({
      ...item,
      image: `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(item.title + ' certificate award')}&image_size=portrait_4_3`
    }))
    
    this.setData({
      advantages: updatedAdvantages,
      teamMembers: updatedTeamMembers,
      culture: updatedCulture,
      honors: updatedHonors
    })
  },

  // 记录页面访问统计
  trackPageView() {
    try {
      API.analytics.track({
        page: 'about',
        action: 'page_view',
        target: 'company_info',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
  },

  // 初始化地图标记
  initMapMarkers() {
    const markers = [{
      id: 1,
      longitude: this.data.companyInfo.longitude,
      latitude: this.data.companyInfo.latitude,
      title: this.data.companyInfo.name,
      iconPath: '/images/map-marker.png',
      width: 30,
      height: 30,
      callout: {
        content: this.data.companyInfo.name,
        color: '#333333',
        fontSize: 14,
        borderRadius: 8,
        bgColor: '#ffffff',
        padding: 8,
        display: 'ALWAYS'
      }
    }]
    
    this.setData({ mapMarkers: markers })
  },

  // 预览荣誉证书
  previewHonor(e) {
    const index = e.currentTarget.dataset.index
    const current = this.data.honors[index].image
    const urls = this.data.honors.map(honor => honor.image)
    
    // 记录荣誉查看统计
    try {
      API.analytics.track({
        page: 'about',
        action: 'honor_view',
        target: this.data.honors[index].title,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 联系方式点击
  onContactTap(e) {
    const type = e.currentTarget.dataset.type
    const value = e.currentTarget.dataset.value
    
    // 记录联系方式点击统计
    try {
      API.analytics.track({
        page: 'about',
        action: 'contact_click',
        target: type,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    switch (type) {
      case 'phone':
        wx.makePhoneCall({
          phoneNumber: value
        })
        break
      case 'email':
        wx.setClipboardData({
          data: value,
          success: () => {
            wx.showToast({
              title: '邮箱已复制',
              icon: 'success'
            })
          }
        })
        break
      case 'wechat':
        wx.setClipboardData({
          data: 'business-wechat-2024',
          success: () => {
            wx.showModal({
              title: '微信号已复制',
              content: '请打开微信添加好友，我们的客服将为您提供专业服务',
              showCancel: false,
              confirmText: '知道了'
            })
          }
        })
        break
      case 'website':
        wx.setClipboardData({
          data: `https://${value}`,
          success: () => {
            wx.showToast({
              title: '网址已复制',
              icon: 'success'
            })
          }
        })
        break
    }
  },

  // 地图标记点击
  onMarkerTap(e) {
    const markerId = e.detail.markerId
    wx.showModal({
      title: '导航提示',
      content: '是否打开地图导航到公司地址？',
      success: (res) => {
        if (res.confirm) {
          this.onNavigationTap()
        }
      }
    })
  },

  // 导航
  onNavigationTap() {
    const { latitude, longitude, name, address } = this.data.companyInfo
    
    // 记录导航统计
    try {
      API.analytics.track({
        page: 'about',
        action: 'navigation_click',
        target: 'company_location',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.openLocation({
      latitude: latitude,
      longitude: longitude,
      name: name,
      address: address,
      scale: 18
    })
  },

  // 电话咨询
  onCallTap() {
    // 记录电话咨询统计
    try {
      API.analytics.track({
        page: 'about',
        action: 'phone_call',
        target: 'company_phone',
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    // 模拟刷新数据
    setTimeout(() => {
      wx.stopPullDownRefresh()
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      })
    }, 1000)
  },

  onShareAppMessage() {
    return {
      title: `${this.data.companyInfo.name} - 关于我们`,
      path: '/pages/about/index',
      imageUrl: '/images/share-about.jpg'
    }
  }
})