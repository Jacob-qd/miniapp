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
};
