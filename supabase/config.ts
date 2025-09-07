import { createClient } from '@supabase/supabase-js'

// Supabase配置
// 前端使用 import.meta.env，后端使用 process.env
const supabaseUrl = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.SUPABASE_URL) || 'https://demo.supabase.co'
const supabaseAnonKey = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.SUPABASE_ANON_KEY) || 'demo-anon-key'
const supabaseServiceKey = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY) || 'demo-service-key'

// 客户端实例（用于前端）
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端实例（用于后端API，具有管理员权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// 数据库表名常量
export const TABLES = {
  BANNERS: 'banners',
  SOLUTIONS: 'solutions',
  PRODUCTS: 'products',
  ADMINS: 'admins',
  VISIT_ANALYTICS: 'visit_analytics'
} as const

// 数据类型定义
export interface Banner {
  id: string
  title: string
  image_url: string
  link_url?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Solution {
  id: string
  title: string
  description: string
  content: string
  icon_url?: string
  case_images?: string[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Product {
  id: string
  name: string
  description?: string
  category?: string
  image_url?: string
  features?: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Admin {
  id: string
  username: string
  password_hash: string
  email: string
  role: string
  last_login?: string
  created_at: string
}

export interface VisitAnalytics {
  id: string
  page_path: string
  user_region?: string
  device_type?: string
  visit_time: string
  session_duration: number
}