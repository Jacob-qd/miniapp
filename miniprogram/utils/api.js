// utils/api.js
const app = getApp()

// API基础配置
const API_CONFIG = {
  // 生产环境请替换为实际的部署地址
  baseUrl: 'https://your-domain.vercel.app/api',
  // 开发环境
  // baseUrl: 'http://localhost:3001/api',
  timeout: 10000,
  header: {
    'Content-Type': 'application/json'
  }
}

/**
 * 封装wx.request
 * @param {Object} options 请求参数
 */
function request(options) {
  return new Promise((resolve, reject) => {
    // 显示加载提示
    if (options.showLoading !== false) {
      wx.showLoading({
        title: options.loadingText || '加载中...',
        mask: true
      })
    }

    // 获取token
    const token = wx.getStorageSync('token')
    const header = {
      ...API_CONFIG.header,
      ...options.header
    }
    
    if (token) {
      header.Authorization = `Bearer ${token}`
    }

    wx.request({
      url: `${API_CONFIG.baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: header,
      timeout: options.timeout || API_CONFIG.timeout,
      success: (res) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading()
        }

        // 处理响应
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else {
            // 业务错误
            const message = res.data.message || '请求失败'
            if (options.showError !== false) {
              wx.showToast({
                title: message,
                icon: 'error'
              })
            }
            reject(new Error(message))
          }
        } else if (res.statusCode === 401) {
          // 未授权，清除token并跳转登录
          wx.removeStorageSync('token')
          wx.removeStorageSync('userInfo')
          wx.showToast({
            title: '请重新登录',
            icon: 'error'
          })
          // 可以在这里跳转到登录页面
          reject(new Error('未授权'))
        } else {
          // HTTP错误
          const message = `请求失败 (${res.statusCode})`
          if (options.showError !== false) {
            wx.showToast({
              title: message,
              icon: 'error'
            })
          }
          reject(new Error(message))
        }
      },
      fail: (err) => {
        // 隐藏加载提示
        if (options.showLoading !== false) {
          wx.hideLoading()
        }

        // 网络错误
        const message = '网络连接失败'
        if (options.showError !== false) {
          wx.showToast({
            title: message,
            icon: 'error'
          })
        }
        reject(err)
      }
    })
  })
}

// API接口定义
const API = {
  // 轮播图相关
  banners: {
    // 获取轮播图列表
    getList: () => request({
      url: '/banners',
      method: 'GET'
    })
  },

  // 用户相关
  user: {
    // 微信登录
    login: (data) => request({
      url: '/user/login',
      method: 'POST',
      data: data
    }),
    
    // 获取用户信息
    getInfo: () => request({
      url: '/user/info',
      method: 'GET'
    }),
    
    // 更新用户信息
    updateInfo: (data) => request({
      url: '/user/info',
      method: 'PUT',
      data: data
    })
  },

  // 解决方案相关
  solutions: {
    // 获取解决方案列表
    getList: (params) => request({
      url: '/solutions',
      method: 'GET',
      data: params
    }),
    
    // 获取解决方案详情
    getDetail: (id) => request({
      url: `/solutions/${id}`,
      method: 'GET'
    })
  },

  // 产品相关
  products: {
    // 获取产品列表
    getList: (params) => request({
      url: '/products',
      method: 'GET',
      data: params
    }),
    
    // 获取产品详情
    getDetail: (id) => request({
      url: `/products/${id}`,
      method: 'GET'
    }),
    
    // 获取产品分类
    getCategories: () => request({
      url: '/products/categories',
      method: 'GET'
    })
  },

  // 企业信息相关
  company: {
    // 获取企业信息
    getInfo: () => request({
      url: '/company/info',
      method: 'GET'
    }),
    
    // 获取团队信息
    getTeam: () => request({
      url: '/company/team',
      method: 'GET'
    }),
    
    // 获取企业荣誉
    getHonors: () => request({
      url: '/company/honors',
      method: 'GET'
    })
  },

  // 数据统计相关
  analytics: {
    // 记录访问统计
    track: (data) => request({
      url: '/analytics/track',
      method: 'POST',
      data: data,
      showLoading: false,
      showError: false
    })
  },

  // 文件上传
  upload: {
    // 上传图片
    image: (filePath) => {
      return new Promise((resolve, reject) => {
        const token = wx.getStorageSync('token')
        const header = {}
        
        if (token) {
          header.Authorization = `Bearer ${token}`
        }

        wx.uploadFile({
          url: `${API_CONFIG.baseUrl}/upload/image`,
          filePath: filePath,
          name: 'file',
          header: header,
          success: (res) => {
            try {
              const data = JSON.parse(res.data)
              if (data.code === 0) {
                resolve(data)
              } else {
                reject(new Error(data.message || '上传失败'))
              }
            } catch (e) {
              reject(new Error('上传失败'))
            }
          },
          fail: (err) => {
            reject(err)
          }
        })
      })
    }
  }
}

// 导出API
module.exports = {
  request,
  API,
  API_CONFIG
}