import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 服务端配置，只使用process.env
const supabaseUrl = process.env.SUPABASE_URL || 'https://demo.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'demo-service-key';

// 创建管理员客户端（服务端使用）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 数据表名称常量
export const TABLES = {
  BANNERS: 'banners',
  SOLUTIONS: 'solutions', 
  PRODUCTS: 'products',
  VISIT_ANALYTICS: 'visit_analytics',
  USERS: 'users',
  ADMINS: 'admins'
} as const;

// 类型定义
export interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  link_url?: string;
  order_index: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Solution {
  id: string;
  title: string;
  description: string;
  content: string;
  image_url: string;
  icon_url?: string;
  case_images?: string[];
  category: string;
  tags: string[];
  is_featured: boolean;
  is_active: boolean;
  order_index: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface VisitAnalytics {
  id: string;
  page_path: string;
  user_agent?: string;
  ip_address?: string;
  referrer?: string;
  visit_time: string;
  session_id?: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin';
  created_at: string;
  updated_at: string;
}