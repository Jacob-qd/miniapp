import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabase/config'
import { RealtimeChannel } from '@supabase/supabase-js'

type IdentifiableRecord = { id?: string | number } & Record<string, unknown>

type RealtimePayload<T> = {
  new: T | null
  old: T | null
  [key: string]: unknown
}

interface UseRealtimeOptions<T> {
  onInsert?: (payload: RealtimePayload<T>) => void
  onUpdate?: (payload: RealtimePayload<T>) => void
  onDelete?: (payload: RealtimePayload<T>) => void
}

export function useRealtime<T extends IdentifiableRecord>(tableName: string, initialData: T[] = [], options: UseRealtimeOptions<T> = {}) {
  const [data, setData] = useState<T[]>(initialData)
  const [loading, setLoading] = useState(false)
  const insertRef = useRef(options.onInsert)
  const updateRef = useRef(options.onUpdate)
  const deleteRef = useRef(options.onDelete)

  useEffect(() => {
    insertRef.current = options.onInsert
  }, [options.onInsert])

  useEffect(() => {
    updateRef.current = options.onUpdate
  }, [options.onUpdate])

  useEffect(() => {
    deleteRef.current = options.onDelete
  }, [options.onDelete])

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  useEffect(() => {
    if (!tableName) return

    setLoading(true)

    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: tableName },
        (payload: RealtimePayload<T>) => {
          if (payload.new) {
            setData(current => [payload.new as T, ...current])
          }
          insertRef.current?.(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: tableName },
        (payload: RealtimePayload<T>) => {
          if (payload.new && payload.new.id !== undefined) {
            setData(current =>
              current.map(item =>
                item.id === payload.new?.id ? (payload.new as T) : item
              )
            )
          }
          updateRef.current?.(payload)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: tableName },
        (payload: RealtimePayload<T>) => {
          if (payload.old && payload.old.id !== undefined) {
            setData(current =>
              current.filter(item => item.id !== payload.old?.id)
            )
          }
          deleteRef.current?.(payload)
        }
      )
      .subscribe()

    setLoading(false)

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName])

  return { data, loading }
}

// 批量数据同步Hook
export function useBatchRealtime() {
  const [isConnected, setIsConnected] = useState(false)
  const channelsRef = useRef<RealtimeChannel[]>([])
  const [activeTables, setActiveTables] = useState<string[]>([])

  const unsubscribeAll = useCallback(() => {
    channelsRef.current.forEach(channel => {
      supabase.removeChannel(channel)
    })
    channelsRef.current = []
    setActiveTables([])
    setIsConnected(false)
  }, [])

  const subscribeToTables = useCallback((tableNames: string[], callbacks: Record<string, (payload: RealtimePayload<Record<string, unknown>>) => void>) => {
    unsubscribeAll()

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
          (payload: RealtimePayload<Record<string, unknown>>) => {
            const handler = callbacks[tableName]
            if (handler) {
              handler(payload)
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
          }
        })

      newChannels.push(channel)
    })

    channelsRef.current = newChannels
    setActiveTables(tableNames)
  }, [unsubscribeAll])

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return {
    isConnected,
    subscribeToTables,
    unsubscribeAll,
    activeTables,
  }
}

export type { RealtimePayload }

// 数据同步状态Hook
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