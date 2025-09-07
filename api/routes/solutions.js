/**
 * 解决方案管理API路由
 */
import { Router } from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { mockSolutions } from '../data/mockData.js';
const router = Router();
/**
 * 获取所有解决方案（公开接口）
 * GET /api/solutions
 */
router.get('/', async (req, res) => {
    try {
        const { data: solutions, error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
        if (error) {
            console.warn('Supabase连接失败，使用模拟数据:', error.message);
            res.json({
                success: true,
                data: mockSolutions.filter(solution => solution.is_active)
            });
            return;
        }
        res.json({
            success: true,
            data: solutions || []
        });
    }
    catch (error) {
        console.error('获取解决方案失败:', error);
        res.json({
            success: true,
            data: mockSolutions.filter(solution => solution.is_active)
        });
    }
});
/**
 * 获取单个解决方案
 * GET /api/solutions/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: solution, error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
        if (error || !solution) {
            res.status(404).json({ success: false, message: '解决方案不存在' });
            return;
        }
        res.json({
            success: true,
            data: solution
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 创建解决方案（需要认证）
 * POST /api/solutions
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, description, content, icon_url, case_images, sort_order } = req.body;
        if (!title || !description || !content) {
            res.status(400).json({ success: false, message: '标题、描述和内容不能为空' });
            return;
        }
        const { data: solution, error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .insert({
            title,
            description,
            content,
            icon_url,
            case_images,
            sort_order: sort_order || 0,
            is_active: true
        })
            .select('*')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '创建解决方案失败', error: error.message });
            return;
        }
        res.status(201).json({
            success: true,
            message: '解决方案创建成功',
            data: solution
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 更新解决方案（需要认证）
 * PUT /api/solutions/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, icon_url, case_images, sort_order, is_active } = req.body;
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (title !== undefined)
            updateData.title = title;
        if (description !== undefined)
            updateData.description = description;
        if (content !== undefined)
            updateData.content = content;
        if (icon_url !== undefined)
            updateData.icon_url = icon_url;
        if (case_images !== undefined)
            updateData.case_images = case_images;
        if (sort_order !== undefined)
            updateData.sort_order = sort_order;
        if (is_active !== undefined)
            updateData.is_active = is_active;
        const { data: solution, error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '更新解决方案失败', error: error.message });
            return;
        }
        if (!solution) {
            res.status(404).json({ success: false, message: '解决方案不存在' });
            return;
        }
        res.json({
            success: true,
            message: '解决方案更新成功',
            data: solution
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 删除解决方案（需要认证）
 * DELETE /api/solutions/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .delete()
            .eq('id', id);
        if (error) {
            res.status(500).json({ success: false, message: '删除解决方案失败', error: error.message });
            return;
        }
        res.json({
            success: true,
            message: '解决方案删除成功'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取所有解决方案（管理后台，包含未激活的）
 * GET /api/solutions/admin/all
 */
router.get('/admin/all', authenticateToken, async (req, res) => {
    try {
        const { data: solutions, error } = await supabaseAdmin
            .from(TABLES.SOLUTIONS)
            .select('*')
            .order('sort_order', { ascending: true });
        if (error) {
            res.status(500).json({ success: false, message: '获取解决方案失败', error: error.message });
            return;
        }
        res.json({
            success: true,
            data: solutions || []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
export default router;
