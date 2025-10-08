import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'
import { useBatchRealtime, useSyncStatus, type RealtimePayload } from '../hooks/useRealtime'
import { message, Tooltip } from 'antd'

interface RealtimeContextType {
  isConnected: boolean
  lastSync: Date | null
  syncCount: number
  errors: string[]
  startSync: () => void
  stopSync: () => void
  clearErrors: () => void
  activeTables: string[]
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

interface RealtimeProviderProps {
  children: ReactNode
}

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const { isConnected, subscribeToTables, unsubscribeAll, activeTables } = useBatchRealtime()
  const { lastSync, syncCount, errors, recordSync, recordError, clearErrors } = useSyncStatus()
  const [isActive, setIsActive] = useState(false)

  const startSync = useCallback(() => {
    if (isActive) return

    try {
      const tableCallbacks: Record<string, (payload: RealtimePayload<Record<string, unknown>>) => void> = {
        banners: (payload) => {
          console.log('Banners updated:', payload)
          recordSync()
          message.success('轮播图数据已更新')
          window.dispatchEvent(new CustomEvent('banners-updated', { detail: payload }))
        },
        solutions: (payload) => {
          console.log('Solutions updated:', payload)
          recordSync()
          message.success('解决方案数据已更新')
          window.dispatchEvent(new CustomEvent('solutions-updated', { detail: payload }))
        },
        products: (payload) => {
          console.log('Products updated:', payload)
          recordSync()
          message.success('产品数据已更新')
          window.dispatchEvent(new CustomEvent('products-updated', { detail: payload }))
        },
        admins: (payload) => {
          console.log('Admins updated:', payload)
          recordSync()
          window.dispatchEvent(new CustomEvent('admins-updated', { detail: payload }))
        },
        visit_analytics: (payload) => {
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
  }, [isActive, recordError, recordSync, subscribeToTables])

  const stopSync = useCallback(() => {
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
  }, [isActive, recordError, unsubscribeAll])

  // 自动启动实时同步
  useEffect(() => {
    const timer = setTimeout(() => {
      startSync()
    }, 2000)

    return () => {
      clearTimeout(timer)
      stopSync()
    }
  }, [startSync, stopSync])

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
  }, [isActive, isConnected, startSync, stopSync])

  const contextValue = useMemo<RealtimeContextType>(() => ({
    isConnected,
    lastSync,
    syncCount,
    errors,
    startSync,
    stopSync,
    clearErrors,
    activeTables,
  }), [isConnected, lastSync, syncCount, errors, startSync, stopSync, clearErrors, activeTables])

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
  const { isConnected, lastSync, syncCount, errors, activeTables } = useRealtimeContext()
  const latestError = errors[errors.length - 1]
  const title = isConnected ? '实时同步已连接' : '实时同步已断开'

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
      <Tooltip
        title={
          <div>
            <div>{title}</div>
            {activeTables.length > 0 && (
              <div>订阅表：{activeTables.join(', ')}</div>
            )}
            {latestError && <div>最近错误：{latestError}</div>}
          </div>
        }
      >
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
      </Tooltip>
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