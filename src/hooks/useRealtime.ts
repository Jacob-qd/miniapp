import { useEffect, useState } from 'react'
import { supabase } from '../../supabase/config'
import { RealtimeChannel } from '@supabase/supabase-js'

// 实时数据同步Hook
interface UseRealtimeOptions {
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
}

/**
 * @description
 * @template T
 * @param {string} tableName - 要订阅的 Supabase 表名。
 * @param {T[]} [initialData=[]] - 初始数据状态。
 * @param {UseRealtimeOptions} [options={}] - 包含 onInsert、onUpdate、onDelete 回调的可选对象。
 * @returns {{ data: T[], loading: boolean }} - 返回包含实时数据和加载状态的对象。
 */
export function useRealtime<T>(tableName: string, initialData: T[] = [], options: UseRealtimeOptions = {}) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tableName) return

    setLoading(true)
    
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        (payload) => {
          console.log('Insert received!', payload)
          setData(current => [payload.new as T, ...current])
          options.onInsert?.(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName },
        (payload) => {
          console.log('Update received!', payload)
          setData(current => 
            current.map(item => 
              (item as any).id === (payload.new as any).id ? payload.new as T : item
            )
          )
          options.onUpdate?.(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName },
        (payload) => {
          console.log('Delete received!', payload)
          setData(current => 
            current.filter(item => (item as any).id !== (payload.old as any).id)
          )
          options.onDelete?.(payload)
        }
      )
      .subscribe()

    setLoading(false)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, options.onInsert, options.onUpdate, options.onDelete])

  return { data, loading }
}

/**
 * @description 用于批量订阅多个 Supabase 表的实时更新。
 * @returns {{
 *   isConnected: boolean,
 *   subscribeToTables: (tableNames: string[], callbacks: Record<string, (payload: any) => void>) => void,
 *   unsubscribeAll: () => void
 * }} - 返回包含连接状态、订阅和取消订阅功能的对象。
 */
export function useBatchRealtime() {
  const [isConnected, setIsConnected] = useState(false)
  const [channels, setChannels] = useState<RealtimeChannel[]>([])

  const subscribeToTables = (tableNames: string[], callbacks: Record<string, (payload: any) => void>) => {
    const newChannels: RealtimeChannel[] = []

    tableNames.forEach(tableName => {
      const channel = supabase
        .channel(`public:${tableName}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
          },
          (payload) => {
            if (callbacks[tableName]) {
              callbacks[tableName](payload)
            }
          }
        )
        .subscribe((status) => {
          console.log(`Batch realtime status for ${tableName}:`, status)
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
          }
        })

      newChannels.push(channel)
    })

    setChannels(prev => [...prev, ...newChannels])
  }

  const unsubscribeAll = () => {
    channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    setChannels([])
    setIsConnected(false)
  }

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [])

  return {
    isConnected,
    subscribeToTables,
    unsubscribeAll
  }
}

/**
 * @description 用于跟踪数据同步的状态，包括最后同步时间、同步次数和错误。
 * @returns {{
 *   lastSync: Date | null,
 *   syncCount: number,
 *   errors: string[],
 *   recordSync: () => void,
 *   recordError: (error: string) => void,
 *   clearErrors: () => void
 * }} - 返回包含同步状态和管理功能的对象。
 */
export function useSyncStatus() {
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncCount, setSyncCount] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const recordSync = () => {
    setLastSync(new Date())
    setSyncCount(prev => prev + 1)
  }

  const recordError = (error: string) => {
    setErrors(prev => [...prev.slice(-4), error]) // 保留最近5个错误
  }

  const clearErrors = () => {
    setErrors([])
  }

  return {
    lastSync,
    syncCount,
    errors,
    recordSync,
    recordError,
    clearErrors
  }
}