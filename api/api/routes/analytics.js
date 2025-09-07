/**
 * 数据统计分析API路由
 */
import { Router } from 'express';
import { supabaseAdmin, TABLES } from '../../supabase/config.js';
import { authenticateToken } from './auth.js';
const router = Router();
/**
 * 记录访问统计（公开接口）
 * POST /api/analytics/visit
 */
router.post('/visit', async (req, res) => {
    try {
        const { page_path, user_region, device_type, session_duration } = req.body;
        if (!page_path) {
            res.status(400).json({ success: false, message: '页面路径不能为空' });
            return;
        }
        const { data: analytics, error } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .insert({
            page_path,
            user_region,
            device_type,
            session_duration: session_duration || 0
        })
            .select('*')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '记录访问统计失败', error: error.message });
            return;
        }
        res.status(201).json({
            success: true,
            message: '访问统计记录成功',
            data: analytics
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取访问统计概览（需要认证）
 * GET /api/analytics/overview
 */
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(days));
        // 总访问量
        const { count: totalVisits, error: totalError } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('*', { count: 'exact', head: true })
            .gte('visit_time', daysAgo.toISOString());
        if (totalError) {
            res.status(500).json({ success: false, message: '获取总访问量失败', error: totalError.message });
            return;
        }
        // 今日访问量
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count: todayVisits, error: todayError } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('*', { count: 'exact', head: true })
            .gte('visit_time', today.toISOString());
        if (todayError) {
            res.status(500).json({ success: false, message: '获取今日访问量失败', error: todayError.message });
            return;
        }
        // 热门页面
        const { data: popularPages, error: pagesError } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('page_path')
            .gte('visit_time', daysAgo.toISOString());
        if (pagesError) {
            res.status(500).json({ success: false, message: '获取热门页面失败', error: pagesError.message });
            return;
        }
        // 统计页面访问次数
        const pageStats = popularPages?.reduce((acc, item) => {
            acc[item.page_path] = (acc[item.page_path] || 0) + 1;
            return acc;
        }, {}) || {};
        const topPages = Object.entries(pageStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([page, count]) => ({ page, count }));
        // 地区分布
        const { data: regionData, error: regionError } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('user_region')
            .gte('visit_time', daysAgo.toISOString())
            .not('user_region', 'is', null);
        if (regionError) {
            res.status(500).json({ success: false, message: '获取地区分布失败', error: regionError.message });
            return;
        }
        const regionStats = regionData?.reduce((acc, item) => {
            if (item.user_region) {
                acc[item.user_region] = (acc[item.user_region] || 0) + 1;
            }
            return acc;
        }, {}) || {};
        const topRegions = Object.entries(regionStats)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([region, count]) => ({ region, count }));
        res.json({
            success: true,
            data: {
                totalVisits: totalVisits || 0,
                todayVisits: todayVisits || 0,
                popularPages: topPages,
                regionDistribution: topRegions
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取访问趋势数据（需要认证）
 * GET /api/analytics/trends
 */
router.get('/trends', authenticateToken, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(days));
        const { data: visits, error } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('visit_time')
            .gte('visit_time', daysAgo.toISOString())
            .order('visit_time', { ascending: true });
        if (error) {
            res.status(500).json({ success: false, message: '获取访问趋势失败', error: error.message });
            return;
        }
        // 按日期分组统计
        const dailyStats = {};
        visits?.forEach(visit => {
            const date = new Date(visit.visit_time).toISOString().split('T')[0];
            dailyStats[date] = (dailyStats[date] || 0) + 1;
        });
        // 生成完整的日期序列
        const trends = [];
        for (let i = Number(days) - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trends.push({
                date: dateStr,
                visits: dailyStats[dateStr] || 0
            });
        }
        res.json({
            success: true,
            data: trends
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取设备类型统计（需要认证）
 * GET /api/analytics/devices
 */
router.get('/devices', authenticateToken, async (req, res) => {
    try {
        const { days = 7 } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - Number(days));
        const { data: devices, error } = await supabaseAdmin
            .from(TABLES.VISIT_ANALYTICS)
            .select('device_type')
            .gte('visit_time', daysAgo.toISOString())
            .not('device_type', 'is', null);
        if (error) {
            res.status(500).json({ success: false, message: '获取设备统计失败', error: error.message });
            return;
        }
        const deviceStats = devices?.reduce((acc, item) => {
            if (item.device_type) {
                acc[item.device_type] = (acc[item.device_type] || 0) + 1;
            }
            return acc;
        }, {}) || {};
        const deviceList = Object.entries(deviceStats)
            .map(([device, count]) => ({ device, count }))
            .sort((a, b) => b.count - a.count);
        res.json({
            success: true,
            data: deviceList
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取内容统计（需要认证）
 * GET /api/analytics/content
 */
router.get('/content', authenticateToken, async (req, res) => {
    try {
        // 轮播图数量
        const { count: bannersCount, error: bannersError } = await supabaseAdmin
            .from(TABLES.BANNERS)
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        if (bannersError) {
            res.status(500).json({ success: false, message: '获取轮播图统计失败', error: bannersError.message });
            return;
        }
        // 解决方案数量
        const { count: solutionsCount, error: solutionsError } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        if (solutionsError) {
            res.status(500).json({ success: false, message: '获取解决方案统计失败', error: solutionsError.message });
            return;
        }
        // 产品数量
        const { count: productsCount, error: productsError } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        if (productsError) {
            res.status(500).json({ success: false, message: '获取产品统计失败', error: productsError.message });
            return;
        }
        // 管理员数量
        const { count: adminsCount, error: adminsError } = await supabaseAdmin
            .from(TABLES.ADMINS)
            .select('*', { count: 'exact', head: true });
        if (adminsError) {
            res.status(500).json({ success: false, message: '获取管理员统计失败', error: adminsError.message });
            return;
        }
        res.json({
            success: true,
            data: {
                banners: bannersCount || 0,
                solutions: solutionsCount || 0,
                products: productsCount || 0,
                admins: adminsCount || 0
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
export default router;
