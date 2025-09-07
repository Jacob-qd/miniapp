/**
 * This is a user authentication API route demo.
 * Handle user registration, login, token management, etc.
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin, TABLES } from '../../supabase/config.js';
const router = Router();
// JWT中间件
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, message: '访问令牌缺失' });
    }
    jwt.verify(token, process.env.JWT_SECRET || 'default-secret', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: '令牌无效' });
        }
        req.user = user;
        next();
    });
};
/**
 * Admin Register
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        if (!username || !password || !email) {
            res.status(400).json({ success: false, message: '用户名、密码和邮箱不能为空' });
            return;
        }
        // 检查用户是否已存在
        const { data: existingUser } = await supabaseAdmin
            .from(TABLES.ADMINS)
            .select('id')
            .or(`username.eq.${username},email.eq.${email}`)
            .single();
        if (existingUser) {
            res.status(400).json({ success: false, message: '用户名或邮箱已存在' });
            return;
        }
        // 加密密码
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        // 创建新用户
        const { data, error } = await supabaseAdmin
            .from(TABLES.ADMINS)
            .insert({
            username,
            password_hash: passwordHash,
            email,
            role: 'admin'
        })
            .select('id, username, email, role, created_at')
            .single();
        if (error) {
            res.status(500).json({ success: false, message: '注册失败', error: error.message });
            return;
        }
        res.status(201).json({
            success: true,
            message: '注册成功',
            data: data
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * Admin Login
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, message: '用户名和密码不能为空' });
            return;
        }
        // 查找用户
        const { data: admin, error } = await supabaseAdmin
            .from(TABLES.ADMINS)
            .select('*')
            .eq('username', username)
            .single();
        if (error || !admin) {
            res.status(401).json({ success: false, message: '用户名或密码错误' });
            return;
        }
        // 验证密码
        const isValidPassword = await bcrypt.compare(password, admin.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ success: false, message: '用户名或密码错误' });
            return;
        }
        // 更新最后登录时间
        await supabaseAdmin
            .from(TABLES.ADMINS)
            .update({ last_login: new Date().toISOString() })
            .eq('id', admin.id);
        // 生成JWT令牌
        const token = jwt.sign({
            id: admin.id,
            username: admin.username,
            role: admin.role
        }, process.env.JWT_SECRET || 'default-secret', { expiresIn: '24h' });
        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email,
                    role: admin.role
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
/**
 * Admin Logout
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
    // 由于使用JWT，logout主要在前端处理（删除token）
    res.json({
        success: true,
        message: '退出登录成功'
    });
});
/**
 * Verify Token
 * GET /api/auth/verify
 */
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: admin, error } = await supabaseAdmin
            .from(TABLES.ADMINS)
            .select('id, username, email, role')
            .eq('id', userId)
            .single();
        if (error || !admin) {
            res.status(401).json({ success: false, message: '用户不存在' });
            return;
        }
        res.json({
            success: true,
            data: admin
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error });
    }
});
export default router;
