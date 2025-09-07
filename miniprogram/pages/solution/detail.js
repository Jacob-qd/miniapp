// solution/detail.js
const app = getApp()
const { API } = require('../../utils/api')

Page({
  data: {
    solutionId: '',
    solution: {},
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.setData({
        solutionId: id
      })
      this.loadSolutionDetail(id)
      this.trackPageView(id)
    }
  },

  // 加载解决方案详情
  async loadSolutionDetail(id) {
    try {
      const res = await API.solutions.getDetail(id)
      if (res.data) {
        this.setData({
          solution: res.data,
          loading: false
        })
        // 设置页面标题
        wx.setNavigationBarTitle({
          title: res.data.title
        })
      } else {
        this.loadDefaultSolution(id)
      }
    } catch (error) {
      console.error('加载解决方案详情失败:', error)
      this.loadDefaultSolution(id)
    }
  },

  // 加载默认解决方案数据
  loadDefaultSolution(id) {
    // 默认数据，当API不可用时使用
    const mockSolutions = {
      '1': {
        id: '1',
        title: '数字化转型解决方案',
        description: '帮助企业实现全面数字化升级，提升运营效率和竞争力',
        content: '数字化转型是企业在数字经济时代保持竞争优势的关键。我们的数字化转型解决方案涵盖业务流程优化、数据管理、云计算迁移、人工智能应用等多个方面。\n\n通过深入分析企业现状，我们制定个性化的转型路径，确保转型过程平稳有序。我们的专业团队将全程陪伴，从战略规划到具体实施，为企业提供全方位的技术支持和咨询服务。',
        banner_url: '/images/solution-digital-banner.jpg',
        features: [
          '全面的业务流程数字化改造',
          '先进的数据分析和可视化平台',
          '灵活的云计算基础设施',
          '智能化的决策支持系统',
          '完善的安全保障体系'
        ],
        scenarios: [
          {
            title: '制造业',
            description: '智能制造、供应链优化'
          },
          {
            title: '零售业',
            description: '全渠道营销、库存管理'
          },
          {
            title: '金融业',
            description: '风险控制、客户服务'
          },
          {
            title: '教育行业',
            description: '在线教学、学习管理'
          }
        ],
        case_images: [
          '/images/case1.jpg',
          '/images/case2.jpg',
          '/images/case3.jpg',
          '/images/case4.jpg'
        ]
      },
      '2': {
        id: '2',
        title: '云服务解决方案',
        description: '提供稳定可靠的云计算服务，降低IT成本',
        content: '云服务解决方案为企业提供弹性、安全、高效的云计算环境。我们支持公有云、私有云和混合云部署模式，满足不同企业的个性化需求。\n\n我们的云服务包括计算资源、存储服务、网络服务、数据库服务等基础设施，以及应用托管、容器服务、微服务架构等平台服务。通过自动化运维和智能监控，确保服务的高可用性和稳定性。',
        banner_url: '/images/solution-cloud-banner.jpg',
        features: [
          '弹性伸缩的计算资源',
          '高可用的存储服务',
          '安全可靠的网络架构',
          '自动化运维管理',
          '7x24小时技术支持'
        ],
        scenarios: [
          {
            title: '初创企业',
            description: '快速部署、成本控制'
          },
          {
            title: '成长型企业',
            description: '业务扩展、资源优化'
          },
          {
            title: '大型企业',
            description: '混合云、多云管理'
          },
          {
            title: '政府机构',
            description: '数据安全、合规要求'
          }
        ],
        case_images: [
          '/images/cloud-case1.jpg',
          '/images/cloud-case2.jpg'
        ]
      },
      '3': {
        id: '3',
        title: '数据分析解决方案',
        description: '深度挖掘数据价值，为业务决策提供科学依据',
        content: '数据分析解决方案帮助企业从海量数据中提取有价值的信息，支持科学决策。我们提供完整的数据处理链路，从数据采集、清洗、存储到分析、可视化和应用。\n\n通过先进的机器学习算法和人工智能技术，我们能够发现数据中的隐藏模式，预测业务趋势，优化运营策略。我们的解决方案支持实时分析和批量处理，满足不同场景的数据分析需求。',
        banner_url: '/images/solution-data-banner.jpg',
        features: [
          '多源数据整合能力',
          '实时数据处理引擎',
          '智能分析算法',
          '直观的可视化界面',
          '灵活的报表定制'
        ],
        scenarios: [
          {
            title: '电商平台',
            description: '用户行为分析、推荐系统'
          },
          {
            title: '金融机构',
            description: '风险评估、反欺诈'
          },
          {
            title: '医疗健康',
            description: '诊断辅助、药物研发'
          },
          {
            title: '智慧城市',
            description: '交通优化、环境监测'
          }
        ],
        case_images: [
          '/images/data-case1.jpg',
          '/images/data-case2.jpg',
          '/images/data-case3.jpg'
        ]
      }
    }

    const solution = mockSolutions[id]
    if (solution) {
      // 更新图片URL为动态生成的图片
      solution.banner_url = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(solution.title + ' business solution banner')}&image_size=landscape_16_9`
      solution.case_images = solution.case_images.map((_, index) => 
        `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(solution.title + ' case study ' + (index + 1))}&image_size=landscape_4_3`
      )
      
      this.setData({
        solution: solution,
        loading: false
      })
      // 设置页面标题
      wx.setNavigationBarTitle({
        title: solution.title
      })
    } else {
      this.setData({ loading: false })
      wx.showToast({
        title: '方案不存在',
        icon: 'error'
      })
    }
  },

  // 记录页面访问统计
  trackPageView(solutionId) {
    try {
      API.analytics.track({
        page: 'solution_detail',
        action: 'page_view',
        target: solutionId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
  },

  // 预览图片
  previewImage(e) {
    const current = e.currentTarget.dataset.current
    const urls = e.currentTarget.dataset.urls
    wx.previewImage({
      current: current,
      urls: urls
    })
  },

  // 电话咨询
  onCallTap() {
    // 记录咨询统计
    try {
      API.analytics.track({
        page: 'solution_detail',
        action: 'phone_consultation',
        target: this.data.solutionId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.makePhoneCall({
      phoneNumber: '400-123-4567'
    })
  },

  // 微信咨询
  onWechatTap() {
    // 记录咨询统计
    try {
      API.analytics.track({
        page: 'solution_detail',
        action: 'wechat_consultation',
        target: this.data.solutionId,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.log('统计记录失败:', error)
    }
    
    wx.setClipboardData({
      data: 'business-wechat-2024',
      success: () => {
        wx.showModal({
          title: '微信号已复制',
          content: '请打开微信添加好友，我们的专业顾问将为您提供详细咨询',
          showCancel: false,
          confirmText: '知道了'
        })
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadSolutionDetail(this.data.solutionId)
    wx.stopPullDownRefresh()
  },

  onShareAppMessage() {
    return {
      title: `${this.data.solution.title} - 商务小程序`,
      path: `/pages/solution/detail?id=${this.data.solutionId}`
    }
  }
})