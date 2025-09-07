import jwt from 'jsonwebtoken';
// JWT认证中间件
export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        res.status(401).json({
            success: false,
            message: '访问令牌缺失'
        });
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            res.status(403).json({
                success: false,
                message: '无效的访问令牌'
            });
            return;
        }
        req.user = user;
        next();
    });
};
// 管理员权限验证中间件
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: '未认证用户'
        });
        return;
    }
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        res.status(403).json({
            success: false,
            message: '权限不足，需要管理员权限'
        });
        return;
    }
    next();
};
// 可选的认证中间件（不强制要求token）
export const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        next();
        return;
    }
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key';
    jwt.verify(token, jwtSecret, (err, user) => {
        if (!err) {
            req.user = user;
        }
        next();
    });
};
