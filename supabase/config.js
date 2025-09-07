import { createClient } from '@supabase/supabase-js';
// Supabase配置
// 前端使用 import.meta.env，后端使用 process.env
const supabaseUrl = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_URL : process.env.SUPABASE_URL) || 'https://demo.supabase.co';
const supabaseAnonKey = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_ANON_KEY : process.env.SUPABASE_ANON_KEY) || 'demo-anon-key';
const supabaseServiceKey = (typeof window !== 'undefined' ? import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY : process.env.SUPABASE_SERVICE_ROLE_KEY) || 'demo-service-key';
// 客户端实例（用于前端）
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
// 服务端实例（用于后端API，具有管理员权限）
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
// 数据库表名常量
export const TABLES = {
    BANNERS: 'banners',
    SOLUTIONS: 'solutions',
    PRODUCTS: 'products',
    ADMINS: 'admins',
    VISIT_ANALYTICS: 'visit_analytics'
};
