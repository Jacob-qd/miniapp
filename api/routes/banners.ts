/**
 * 轮播图管理API路由
 */
import { Router, type Request, type Response } from 'express';
import { supabaseAdmin, TABLES, type Banner } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { mockBanners } from '../data/mockData.js';

const router = Router();

/**
 * 获取所有轮播图（公开接口）
 * GET /api/banners
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: banners, error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('Supabase连接失败，使用模拟数据:', error.message);
      // 使用模拟数据作为备用方案
      res.json({
        success: true,
        data: mockBanners.filter(banner => banner.is_active)
      });
      return;
    }

    res.json({
      success: true,
      data: banners || []
    });
  } catch (error) {
    console.error('获取轮播图失败:', error);
    // 发生错误时使用模拟数据
    res.json({
      success: true,
      data: mockBanners.filter(banner => banner.is_active)
    });
  }
});

/**
 * 获取单个轮播图
 * GET /api/banners/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { data: banner, error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !banner) {
      res.status(404).json({ success: false, message: '轮播图不存在' });
      return;
    }

    res.json({
      success: true,
      data: banner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error });
  }
});

/**
 * 创建轮播图（需要认证）
 * POST /api/banners
 */
router.post('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, image_url, link_url, sort_order } = req.body;

    if (!title || !image_url) {
      res.status(400).json({ success: false, message: '标题和图片URL不能为空' });
      return;
    }

    const { data: banner, error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .insert({
        title,
        image_url,
        link_url,
        sort_order: sort_order || 0,
        is_active: true
      })
      .select('*')
      .single();

    if (error) {
      res.status(500).json({ success: false, message: '创建轮播图失败', error: error.message });
      return;
    }

    res.status(201).json({
      success: true,
      message: '轮播图创建成功',
      data: banner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error });
  }
});

/**
 * 更新轮播图（需要认证）
 * PUT /api/banners/:id
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, image_url, link_url, sort_order, is_active } = req.body;

    const updateData: Partial<Banner> = {
      updated_at: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (image_url !== undefined) updateData.image_url = image_url;
    if (link_url !== undefined) updateData.link_url = link_url;
    if (sort_order !== undefined) updateData.sort_order = sort_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: banner, error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      res.status(500).json({ success: false, message: '更新轮播图失败', error: error.message });
      return;
    }

    if (!banner) {
      res.status(404).json({ success: false, message: '轮播图不存在' });
      return;
    }

    res.json({
      success: true,
      message: '轮播图更新成功',
      data: banner
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error });
  }
});

/**
 * 删除轮播图（需要认证）
 * DELETE /api/banners/:id
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ success: false, message: '删除轮播图失败', error: error.message });
      return;
    }

    res.json({
      success: true,
      message: '轮播图删除成功'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error });
  }
});

/**
 * 获取所有轮播图（管理后台，包含未激活的）
 * GET /api/banners/admin/all
 */
router.get('/admin/all', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { data: banners, error } = await supabaseAdmin
      .from(TABLES.BANNERS)
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      res.status(500).json({ success: false, message: '获取轮播图失败', error: error.message });
      return;
    }

    res.json({
      success: true,
      data: banners || []
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误', error });
  }
});

export default router;