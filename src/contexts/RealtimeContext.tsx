import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useBatchRealtime, useSyncStatus } from '../hooks/useRealtime'
import { message } from 'antd'

interface RealtimeContextType {
  isConnected: boolean
  lastSync: Date | null
  syncCount: number
  errors: string[]
  startSync: () => void
  stopSync: () => void
  clearErrors: () => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { isConnected, subscribeToTables, unsubscribeAll } = useBatchRealtime()
  const { lastSync, syncCount, errors, recordSync, recordError, clearErrors } = useSyncStatus()
  const [isActive, setIsActive] = useState(false)

  const startSync = () => {
    if (isActive) return

    try {
      // 订阅所有需要实时同步的表
      const tableCallbacks = {
        banners: (payload: any) => {
          console.log('Banners updated:', payload)
          recordSync()
          message.success('轮播图数据已更新')
          // 触发自定义事件，通知相关组件更新
          window.dispatchEvent(new CustomEvent('banners-updated', { detail: payload }))
        },
        solutions: (payload: any) => {
          console.log('Solutions updated:', payload)
          recordSync()
          message.success('解决方案数据已更新')
          window.dispatchEvent(new CustomEvent('solutions-updated', { detail: payload }))
        },
        products: (payload: any) => {
          console.log('Products updated:', payload)
          recordSync()
          message.success('产品数据已更新')
          window.dispatchEvent(new CustomEvent('products-updated', { detail: payload }))
        },
        admins: (payload: any) => {
          console.log('Admins updated:', payload)
          recordSync()
          // 管理员数据更新不显示消息，避免干扰
          window.dispatchEvent(new CustomEvent('admins-updated', { detail: payload }))
        },
        visit_analytics: (payload: any) => {
          console.log('Analytics updated:', payload)
          recordSync()
          window.dispatchEvent(new CustomEvent('analytics-updated', { detail: payload }))
        }
      }

      subscribeToTables(Object.keys(tableCallbacks), tableCallbacks)
      setIsActive(true)
      message.success('实时数据同步已启动')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '启动实时同步失败'
      recordError(errorMsg)
      message.error(errorMsg)
    }
  }

  const stopSync = () => {
    if (!isActive) return

    try {
      unsubscribeAll()
      setIsActive(false)
      message.info('实时数据同步已停止')
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '停止实时同步失败'
      recordError(errorMsg)
      message.error(errorMsg)
    }
  }

  // 自动启动实时同步
  useEffect(() => {
    const timer = setTimeout(() => {
      startSync()
    }, 2000) // 延迟2秒启动，确保组件完全加载

    return () => {
      clearTimeout(timer)
      stopSync()
    }
  }, [])

  // 监听网络状态变化
  useEffect(() => {
    const handleOnline = () => {
      if (isActive && !isConnected) {
        message.info('网络已恢复，重新连接实时同步...')
        stopSync()
        setTimeout(startSync, 1000)
      }
    }

    const handleOffline = () => {
      message.warning('网络连接断开，实时同步已暂停')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isActive, isConnected])

  const contextValue: RealtimeContextType = {
    isConnected,
    lastSync,
    syncCount,
    errors,
    startSync,
    stopSync,
    clearErrors
  }

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtimeContext() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error('useRealtimeContext must be used within a RealtimeProvider')
  }
  return context
}

// 实时同步状态指示器组件
export function RealtimeIndicator() {
  const { isConnected, lastSync, syncCount, errors } = useRealtimeContext()

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      zIndex: 1000,
      background: 'rgba(255, 255, 255, 0.9)',
      padding: '8px 12px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      fontSize: '12px',
      color: '#666'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div 
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? '#52c41a' : '#ff4d4f'
          }}
        />
        <span>{isConnected ? '实时同步' : '连接断开'}</span>
      </div>
      {lastSync && (
        <div style={{ marginTop: '4px', fontSize: '11px', color: '#999' }}>
          最后同步: {lastSync.toLocaleTimeString()}
        </div>
      )}
      {syncCount > 0 && (
        <div style={{ fontSize: '11px', color: '#999' }}>
          同步次数: {syncCount}
        </div>
      )}
      {errors.length > 0 && (
        <div style={{ fontSize: '11px', color: '#ff4d4f' }}>
          错误: {errors.length}
        </div>
      )}
    </div>
  )
}