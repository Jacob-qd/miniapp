import { Router } from 'express';
import { randomUUID } from 'crypto';
import { authenticateToken } from './auth.js';
import { mockUserMenus, mockRoles as seedRoles, mockUserAccounts as seedUsers } from '../data/mockData.js';

const router = Router();

const cloneMenus = menus =>
    menus.map(menu => ({
        ...menu,
        children: menu.children ? cloneMenus(menu.children) : undefined
    }));

const state = {
    menus: cloneMenus(mockUserMenus),
    roles: seedRoles.map(role => ({ ...role })),
    users: seedUsers.map(user => ({ ...user }))
};

const flattenMenuIds = menus => {
    const result = [];
    menus.forEach(menu => {
        result.push(menu.id);
        if (menu.children?.length) {
            result.push(...flattenMenuIds(menu.children));
        }
    });
    return result;
};

const findMenuNode = (menus, id, parent = null) => {
    for (const menu of menus) {
        if (menu.id === id) {
            return { node: menu, parent };
        }
        if (menu.children) {
            const found = findMenuNode(menu.children, id, menu);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

const removeMenuNode = (menus, id) => {
    const index = menus.findIndex(menu => menu.id === id);
    if (index >= 0) {
        menus.splice(index, 1);
        return true;
    }
    for (const menu of menus) {
        if (menu.children && removeMenuNode(menu.children, id)) {
            if (!menu.children.length) {
                delete menu.children;
            }
            return true;
        }
    }
    return false;
};

const ensureRoleActionConsistency = (menuId, allowedActions = []) => {
    state.roles = state.roles.map(role => {
        const next = { ...role };
        if (!allowedActions.length) {
            delete next.action_permissions[menuId];
            next.menu_ids = next.menu_ids.filter(id => id !== menuId);
        } else if (next.action_permissions[menuId]) {
            next.action_permissions[menuId] = next.action_permissions[menuId].filter(action => allowedActions.includes(action));
        }
        return next;
    });
};

const recalcRoleMenuCoverage = () => {
    const validMenuIds = new Set(flattenMenuIds(state.menus));
    state.roles = state.roles.map(role => ({
        ...role,
        menu_ids: role.menu_ids.filter(menuId => validMenuIds.has(menuId)),
        action_permissions: Object.fromEntries(Object.entries(role.action_permissions).filter(([menuId]) => validMenuIds.has(menuId)))
    }));
};

const findRoleById = roleId => state.roles.find(role => role.id === roleId);

const roleUserCount = roleId => state.users.filter(user => user.role_id === roleId).length;

const buildOverview = () => {
    const totalUsers = state.users.length;
    const activeUsers = state.users.filter(user => user.status === 'active').length;
    const pendingUsers = state.users.filter(user => user.status === 'inactive').length;
    const lockedUsers = state.users.filter(user => user.status === 'locked').length;
    const roleCount = state.roles.length;
    const menuCount = flattenMenuIds(state.menus).length;
    const roleDistribution = state.roles.map(role => ({
        roleId: role.id,
        roleName: role.name,
        users: roleUserCount(role.id),
        status: role.status
    }));
    const recentUsers = [...state.users]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 6)
        .map(user => ({
        id: user.id,
        username: user.username,
        created_at: user.created_at,
        role_id: user.role_id,
        status: user.status
    }));

    return {
        totalUsers,
        activeUsers,
        pendingUsers,
        lockedUsers,
        roleCount,
        menuCount,
        lastSyncAt: new Date().toISOString(),
        roleDistribution,
        recentUsers
    };
};

const sanitizeUserResponse = user => ({
    ...user,
    tags: user.tags ?? [],
    login_count: user.login_count ?? 0
});

router.get('/overview', (req, res) => {
    res.json({
        success: true,
        data: buildOverview()
    });
});

router.get('/users', (req, res) => {
    res.json({
        success: true,
        data: state.users.map(user => sanitizeUserResponse(user))
    });
});

router.post('/users', authenticateToken, (req, res) => {
    const { username, email, role_id, status = 'active', mobile, department, position, remark, tags } = req.body;

    if (!username || !email || !role_id) {
        res.status(400).json({ success: false, message: '用户名、邮箱和角色为必填项' });
        return;
    }

    if (!findRoleById(role_id)) {
        res.status(400).json({ success: false, message: '角色不存在' });
        return;
    }

    const duplicated = state.users.find(user => user.username === username || user.email === email);
    if (duplicated) {
        res.status(409).json({ success: false, message: '用户名或邮箱已存在' });
        return;
    }

    const now = new Date().toISOString();
    const newUser = {
        id: randomUUID(),
        username,
        email,
        role_id,
        status,
        department,
        position,
        mobile,
        login_count: 0,
        last_login_at: undefined,
        created_at: now,
        remark,
        tags: Array.isArray(tags) ? tags : []
    };

    state.users.push(newUser);

    res.status(201).json({
        success: true,
        message: '用户创建成功',
        data: sanitizeUserResponse(newUser),
        overview: buildOverview()
    });
});

router.put('/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const target = state.users.find(user => user.id === id);

    if (!target) {
        res.status(404).json({ success: false, message: '用户不存在' });
        return;
    }

    const { username, email, role_id, status, department, position, mobile, remark, tags } = req.body;

    if (role_id && !findRoleById(role_id)) {
        res.status(400).json({ success: false, message: '角色不存在' });
        return;
    }

    if (username && username !== target.username) {
        const exists = state.users.find(user => user.username === username);
        if (exists) {
            res.status(409).json({ success: false, message: '用户名已存在' });
            return;
        }
        target.username = username;
    }

    if (email && email !== target.email) {
        const exists = state.users.find(user => user.email === email);
        if (exists) {
            res.status(409).json({ success: false, message: '邮箱已存在' });
            return;
        }
        target.email = email;
    }

    if (role_id) target.role_id = role_id;
    if (status) target.status = status;
    if (department !== undefined) target.department = department;
    if (position !== undefined) target.position = position;
    if (mobile !== undefined) target.mobile = mobile;
    if (remark !== undefined) target.remark = remark;
    if (tags) target.tags = tags;

    res.json({
        success: true,
        message: '用户更新成功',
        data: sanitizeUserResponse(target),
        overview: buildOverview()
    });
});

router.patch('/users/:id/status', authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const target = state.users.find(user => user.id === id);
    if (!target) {
        res.status(404).json({ success: false, message: '用户不存在' });
        return;
    }

    if (!['active', 'inactive', 'locked'].includes(status)) {
        res.status(400).json({ success: false, message: '无效的状态' });
        return;
    }

    target.status = status;

    res.json({
        success: true,
        message: '状态更新成功',
        data: sanitizeUserResponse(target),
        overview: buildOverview()
    });
});

router.patch('/users/:id/reset-password', authenticateToken, (req, res) => {
    const { id } = req.params;
    const target = state.users.find(user => user.id === id);

    if (!target) {
        res.status(404).json({ success: false, message: '用户不存在' });
        return;
    }

    const temporaryPassword = `Reset@${Math.random().toString(36).slice(-6)}`;

    res.json({
        success: true,
        message: '密码已重置',
        data: {
            userId: target.id,
            temporaryPassword
        }
    });
});

router.delete('/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const index = state.users.findIndex(user => user.id === id);

    if (index === -1) {
        res.status(404).json({ success: false, message: '用户不存在' });
        return;
    }

    state.users.splice(index, 1);

    res.json({
        success: true,
        message: '用户删除成功',
        overview: buildOverview()
    });
});

router.get('/roles', (req, res) => {
    const roles = state.roles.map(role => ({
        ...role,
        user_count: roleUserCount(role.id)
    }));

    res.json({
        success: true,
        data: roles
    });
});

router.post('/roles', authenticateToken, (req, res) => {
    const { name, description, data_scope = 'self', status = 'active', menu_ids = [], action_permissions = {}, default_landing = '/dashboard', remark } = req.body;

    if (!name || !description) {
        res.status(400).json({ success: false, message: '角色名称和描述不能为空' });
        return;
    }

    if (state.roles.some(role => role.name === name)) {
        res.status(409).json({ success: false, message: '角色名称已存在' });
        return;
    }

    const validMenuIds = new Set(flattenMenuIds(state.menus));
    const filteredMenuIds = (menu_ids || []).filter(id => validMenuIds.has(id));
    const filteredActions = Object.fromEntries(Object.entries(action_permissions || {}).filter(([menuId]) => validMenuIds.has(menuId)));

    const now = new Date().toISOString();
    const role = {
        id: randomUUID(),
        name,
        description,
        status,
        data_scope,
        default_landing,
        menu_ids: filteredMenuIds,
        action_permissions: filteredActions,
        created_at: now,
        updated_at: now,
        remark
    };

    state.roles.push(role);

    res.status(201).json({
        success: true,
        message: '角色创建成功',
        data: { ...role, user_count: 0 },
        overview: buildOverview()
    });
});

router.put('/roles/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const role = state.roles.find(item => item.id === id);

    if (!role) {
        res.status(404).json({ success: false, message: '角色不存在' });
        return;
    }

    const { name, description, status, data_scope, default_landing, remark, menu_ids, action_permissions } = req.body;

    if (name && name !== role.name) {
        if (state.roles.some(item => item.name === name)) {
            res.status(409).json({ success: false, message: '角色名称已存在' });
            return;
        }
        role.name = name;
    }

    if (description !== undefined) role.description = description;
    if (status) role.status = status;
    if (data_scope) role.data_scope = data_scope;
    if (default_landing) role.default_landing = default_landing;
    if (remark !== undefined) role.remark = remark;

    if (menu_ids) {
        const validMenuIds = new Set(flattenMenuIds(state.menus));
        role.menu_ids = menu_ids.filter(menuId => validMenuIds.has(menuId));
    }

    if (action_permissions) {
        const validMenuIds = new Set(flattenMenuIds(state.menus));
        role.action_permissions = Object.fromEntries(Object.entries(action_permissions).filter(([menuId]) => validMenuIds.has(menuId)));
    }

    role.updated_at = new Date().toISOString();

    res.json({
        success: true,
        message: '角色更新成功',
        data: { ...role, user_count: roleUserCount(role.id) }
    });
});

router.delete('/roles/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const role = state.roles.find(item => item.id === id);

    if (!role) {
        res.status(404).json({ success: false, message: '角色不存在' });
        return;
    }

    if (roleUserCount(id) > 0) {
        res.status(400).json({ success: false, message: '请先解除与用户的关联后再删除角色' });
        return;
    }

    state.roles = state.roles.filter(item => item.id !== id);

    res.json({
        success: true,
        message: '角色删除成功',
        overview: buildOverview()
    });
});

router.get('/menus', (req, res) => {
    res.json({
        success: true,
        data: state.menus
    });
});

router.post('/menus', authenticateToken, (req, res) => {
    const { parent_id, name, path, icon, description, order = 99, actions = [] } = req.body;

    if (!name || !path || !icon) {
        res.status(400).json({ success: false, message: '菜单名称、路径和图标不能为空' });
        return;
    }

    const newMenu = {
        id: randomUUID(),
        name,
        path,
        icon,
        description,
        order,
        actions,
        children: undefined
    };

    if (parent_id) {
        const parentInfo = findMenuNode(state.menus, parent_id);
        if (!parentInfo) {
            res.status(404).json({ success: false, message: '父级菜单不存在' });
            return;
        }
        if (!parentInfo.node.children) {
            parentInfo.node.children = [];
        }
        parentInfo.node.children.push(newMenu);
    } else {
        state.menus.push(newMenu);
    }

    recalcRoleMenuCoverage();

    res.status(201).json({
        success: true,
        message: '菜单创建成功',
        data: newMenu
    });
});

router.put('/menus/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const info = findMenuNode(state.menus, id);

    if (!info) {
        res.status(404).json({ success: false, message: '菜单不存在' });
        return;
    }

    const { name, path, icon, description, order, actions } = req.body;

    if (name !== undefined) info.node.name = name;
    if (path !== undefined) info.node.path = path;
    if (icon !== undefined) info.node.icon = icon;
    if (description !== undefined) info.node.description = description;
    if (order !== undefined) info.node.order = order;
    if (actions) {
        info.node.actions = actions;
        ensureRoleActionConsistency(id, actions);
    }

    res.json({
        success: true,
        message: '菜单更新成功',
        data: info.node
    });
});

router.delete('/menus/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const info = findMenuNode(state.menus, id);

    if (!info) {
        res.status(404).json({ success: false, message: '菜单不存在' });
        return;
    }

    if (info.node.children?.length) {
        res.status(400).json({ success: false, message: '请先删除子菜单' });
        return;
    }

    removeMenuNode(state.menus, id);
    ensureRoleActionConsistency(id, []);
    recalcRoleMenuCoverage();

    res.json({
        success: true,
        message: '菜单删除成功',
        data: state.menus
    });
});

export default router;
