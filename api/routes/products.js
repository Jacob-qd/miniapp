/**
 * 产品管理API路由
 */
import { Router } from 'express';
import { supabaseAdmin, TABLES } from '../config/supabase.js';
import { authenticateToken } from './auth.js';
import { mockProducts } from '../data/mockData.js';
const router = Router();
/**
 * 获取所有产品（公开接口）
 * GET /api/products
 */
router.get('/', async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabaseAdmin
            .from(TABLES.PRODUCTS)
            .select('*')
            .eq('is_active', true);
        if (category) {
            query = query.eq('category', category);
        }
        const { data: products, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.warn('Supabase连接失败，使用模拟数据:', error.message);
            let filteredProducts = mockProducts.filter(product => product.is_active);
            if (category) {
                filteredProducts = filteredProducts.filter(product => product.category === category);
            }
            res.json({
                success: true,
                data: filteredProducts
            });
            return;
        }
        res.json({
            success: true,
            data: products || []
        });
    }
    catch (error) {
        console.error('获取产品失败:', error);
        let filteredProducts = mockProducts.filter(product => product.is_active);
        const { category } = req.query;
        if (category) {
            filteredProducts = filteredProducts.filter(product => product.category === category);
        }
        res.json({
            success: true,
            data: filteredProducts
        });
    }
});
/**
 * 获取产品分类列表
 * GET /api/products/categories
 */
router.get('/categories', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .select('category')
            .eq('is_active', true)
            .not('category', 'is', null);
        if (error) {
            res.status(500).json({ success: false, message: '获取产品分类失败', error: error.message });
            return;
        }
        // 去重并过滤空值
        const categories = [...new Set(products?.map(p => p.category).filter(Boolean))];
        res.json({
            success: true,
            data: categories
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取单个产品
 * GET /api/products/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data: product, error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .single();
        if (error || !product) {
            res.status(404).json({ success: false, message: '产品不存在' });
            return;
        }
        res.json({
            success: true,
            data: product
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 创建产品（需要认证）
 * POST /api/products
 */
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { name, description, category, image_url, features } = req.body;
        if (!name) {
            res.status(400).json({ success: false, message: '产品名称不能为空' });
            return;
        }
        const { data: product, error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .insert({
            name,
            description,
            category,
            image_url,
            features,
            is_active: true
        })
            .select('*')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '创建产品失败', error: error.message });
            return;
        }
        res.status(201).json({
            success: true,
            message: '产品创建成功',
            data: product
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 更新产品（需要认证）
 * PUT /api/products/:id
 */
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, image_url, features, is_active } = req.body;
        const updateData = {
            updated_at: new Date().toISOString()
        };
        if (name !== undefined)
            updateData.name = name;
        if (description !== undefined)
            updateData.description = description;
        if (category !== undefined)
            updateData.category = category;
        if (image_url !== undefined)
            updateData.image_url = image_url;
        if (features !== undefined)
            updateData.features = features;
        if (is_active !== undefined)
            updateData.is_active = is_active;
        const { data: product, error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '更新产品失败', error: error.message });
            return;
        }
        if (!product) {
            res.status(404).json({ success: false, message: '产品不存在' });
            return;
        }
        res.json({
            success: true,
            message: '产品更新成功',
            data: product
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 删除产品（需要认证）
 * DELETE /api/products/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .delete()
            .eq('id', id);
        if (error) {
            res.status(500).json({ success: false, message: '删除产品失败', error: error.message });
            return;
        }
        res.json({
            success: true,
            message: '产品删除成功'
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * 获取所有产品（管理后台，包含未激活的）
 * GET /api/products/admin/all
 */
router.get('/admin/all', authenticateToken, async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from(TABLES.PRODUCTS)
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            res.status(500).json({ success: false, message: '获取产品失败', error: error.message });
            return;
        }
        res.json({
            success: true,
            data: products || []
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
export default router;
