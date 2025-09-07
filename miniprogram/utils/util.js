// utils/util.js

/**
 * 格式化时间
 * @param {Date} date 日期对象
 * @param {String} format 格式化字符串
 */
function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  const formatNumber = (n) => {
    n = n.toString()
    return n[1] ? n : '0' + n
  }

  return format
    .replace('YYYY', year)
    .replace('MM', formatNumber(month))
    .replace('DD', formatNumber(day))
    .replace('HH', formatNumber(hour))
    .replace('mm', formatNumber(minute))
    .replace('ss', formatNumber(second))
}

/**
 * 获取相对时间
 * @param {Date|String} date 日期
 */
function getRelativeTime(date) {
  const now = new Date()
  const target = new Date(date)
  const diff = now.getTime() - target.getTime()
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const week = 7 * day
  const month = 30 * day
  const year = 365 * day
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return Math.floor(diff / minute) + '分钟前'
  } else if (diff < day) {
    return Math.floor(diff / hour) + '小时前'
  } else if (diff < week) {
    return Math.floor(diff / day) + '天前'
  } else if (diff < month) {
    return Math.floor(diff / week) + '周前'
  } else if (diff < year) {
    return Math.floor(diff / month) + '个月前'
  } else {
    return Math.floor(diff / year) + '年前'
  }
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {Number} wait 等待时间
 */
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {Number} limit 时间间隔
 */
function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj 要拷贝的对象
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item))
  }
  
  if (typeof obj === 'object') {
    const clonedObj = {}
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成唯一ID
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 验证手机号
 * @param {String} phone 手机号
 */
function validatePhone(phone) {
  const reg = /^1[3-9]\d{9}$/
  return reg.test(phone)
}

/**
 * 验证邮箱
 * @param {String} email 邮箱
 */
function validateEmail(email) {
  const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return reg.test(email)
}

/**
 * 格式化文件大小
 * @param {Number} bytes 字节数
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 格式化数字（添加千分位分隔符）
 * @param {Number} num 数字
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 获取URL参数
 * @param {String} url URL字符串
 */
function getUrlParams(url) {
  const params = {}
  const urlObj = new URL(url)
  
  for (let [key, value] of urlObj.searchParams) {
    params[key] = value
  }
  
  return params
}

/**
 * 存储数据到本地
 * @param {String} key 键名
 * @param {*} data 数据
 */
function setStorage(key, data) {
  try {
    wx.setStorageSync(key, data)
    return true
  } catch (e) {
    console.error('存储数据失败:', e)
    return false
  }
}

/**
 * 从本地获取数据
 * @param {String} key 键名
 * @param {*} defaultValue 默认值
 */
function getStorage(key, defaultValue = null) {
  try {
    const data = wx.getStorageSync(key)
    return data !== '' ? data : defaultValue
  } catch (e) {
    console.error('获取数据失败:', e)
    return defaultValue
  }
}

/**
 * 删除本地数据
 * @param {String} key 键名
 */
function removeStorage(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    console.error('删除数据失败:', e)
    return false
  }
}

/**
 * 显示提示信息
 * @param {String} title 提示内容
 * @param {String} icon 图标类型
 * @param {Number} duration 显示时长
 */
function showToast(title, icon = 'none', duration = 2000) {
  wx.showToast({
    title: title,
    icon: icon,
    duration: duration
  })
}

/**
 * 显示确认对话框
 * @param {String} content 内容
 * @param {String} title 标题
 */
function showConfirm(content, title = '提示') {
  return new Promise((resolve) => {
    wx.showModal({
      title: title,
      content: content,
      success: (res) => {
        resolve(res.confirm)
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

/**
 * 复制文本到剪贴板
 * @param {String} text 要复制的文本
 * @param {String} successMsg 成功提示
 */
function copyText(text, successMsg = '复制成功') {
  wx.setClipboardData({
    data: text,
    success: () => {
      showToast(successMsg, 'success')
    },
    fail: () => {
      showToast('复制失败', 'error')
    }
  })
}

/**
 * 拨打电话
 * @param {String} phoneNumber 电话号码
 */
function makePhoneCall(phoneNumber) {
  wx.makePhoneCall({
    phoneNumber: phoneNumber,
    fail: () => {
      showToast('拨打失败', 'error')
    }
  })
}

/**
 * 预览图片
 * @param {String} current 当前图片
 * @param {Array} urls 图片列表
 */
function previewImage(current, urls) {
  wx.previewImage({
    current: current,
    urls: urls
  })
}

/**
 * 获取系统信息
 */
function getSystemInfo() {
  return new Promise((resolve) => {
    wx.getSystemInfo({
      success: (res) => {
        resolve(res)
      },
      fail: () => {
        resolve(null)
      }
    })
  })
}

/**
 * 检查网络状态
 */
function checkNetworkStatus() {
  return new Promise((resolve) => {
    wx.getNetworkType({
      success: (res) => {
        resolve({
          isConnected: res.networkType !== 'none',
          networkType: res.networkType
        })
      },
      fail: () => {
        resolve({
          isConnected: false,
          networkType: 'unknown'
        })
      }
    })
  })
}

module.exports = {
  formatTime,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  generateId,
  validatePhone,
  validateEmail,
  formatFileSize,
  formatNumber,
  getUrlParams,
  setStorage,
  getStorage,
  removeStorage,
  showToast,
  showConfirm,
  copyText,
  makePhoneCall,
  previewImage,
  getSystemInfo,
  checkNetworkStatus
}