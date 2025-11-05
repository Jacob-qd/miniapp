// 模拟数据，用于在Supabase连接问题时提供基础功能
export const mockBanners = [
    {
        id: '1',
        title: '智能解决方案',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20business%20technology%20banner%20with%20blue%20gradient&image_size=landscape_16_9',
        link_url: '/solutions',
        sort_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        title: '产品服务',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20services%20banner%20with%20corporate%20style&image_size=landscape_16_9',
        link_url: '/products',
        sort_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        title: '企业合作',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20partnership%20handshake%20banner&image_size=landscape_16_9',
        link_url: '/about',
        sort_order: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
export const mockSolutions = [
    {
        id: '1',
        title: '数字化转型',
        description: '帮助企业实现全面数字化升级',
        content: '我们提供完整的数字化转型解决方案，包括系统集成、流程优化、数据分析等服务。通过先进的技术手段，帮助企业提升运营效率，降低成本，增强竞争力。',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20transformation%20icon%20modern%20style&image_size=square',
        case_images: [
            'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=digital%20transformation%20case%20study%20dashboard&image_size=landscape_4_3',
            'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=business%20process%20optimization%20workflow&image_size=landscape_4_3'
        ],
        sort_order: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        title: '云计算服务',
        description: '提供稳定可靠的云基础设施',
        content: '基于先进的云计算技术，为企业提供弹性、安全、高效的云服务平台。支持多种部署模式，满足不同规模企业的需求。',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20computing%20icon%20modern%20style&image_size=square',
        case_images: [
            'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=cloud%20infrastructure%20architecture%20diagram&image_size=landscape_4_3'
        ],
        sort_order: 2,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        title: '人工智能',
        description: '智能化业务流程优化',
        content: '运用AI技术优化业务流程，提升企业运营效率和决策质量。包括机器学习、自然语言处理、计算机视觉等技术应用。',
        icon_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=artificial%20intelligence%20icon%20modern%20style&image_size=square',
        case_images: [
            'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=AI%20analytics%20dashboard%20interface&image_size=landscape_4_3'
        ],
        sort_order: 3,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
export const mockProducts = [
    {
        id: '1',
        name: '企业管理系统',
        description: '全面的企业资源管理解决方案，集成人事、财务、项目管理等多个模块。',
        category: '软件产品',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=enterprise%20management%20system%20interface&image_size=landscape_4_3',
        features: ['用户管理', '权限控制', '数据分析', '报表生成'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '2',
        name: '移动应用开发',
        description: '专业的移动端应用开发服务，支持iOS、Android等多平台。',
        category: '开发服务',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=mobile%20app%20development%20mockup&image_size=landscape_4_3',
        features: ['iOS开发', 'Android开发', '跨平台开发', 'UI/UX设计'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: '3',
        name: '数据分析平台',
        description: '强大的数据处理和分析工具，支持实时数据处理和可视化展示。',
        category: '软件产品',
        image_url: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=data%20analytics%20dashboard%20charts&image_size=landscape_4_3',
        features: ['实时分析', '可视化报表', '预测模型', 'API集成'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];
export const mockAnalytics = {
    totalVisits: 1250,
    todayVisits: 45,
    pageViews: 3200,
    bounceRate: 0.35,
    avgSessionDuration: 180,
    topPages: [
        { path: '/', visits: 450, title: '首页' },
        { path: '/solutions', visits: 320, title: '解决方案' },
        { path: '/products', visits: 280, title: '产品服务' },
        { path: '/about', visits: 200, title: '关于我们' }
    ],
    visitTrend: [
        { date: '2024-01-01', visits: 120 },
        { date: '2024-01-02', visits: 135 },
        { date: '2024-01-03', visits: 98 },
        { date: '2024-01-04', visits: 156 },
        { date: '2024-01-05', visits: 142 },
        { date: '2024-01-06', visits: 178 },
        { date: '2024-01-07', visits: 165 }
    ]
};
export const mockUserMenus = [
    {
        id: 'dashboard',
        name: '仪表盘',
        path: '/dashboard',
        icon: 'DashboardOutlined',
        order: 1,
        description: '业务指标与运营概览',
        actions: ['view', 'export'],
        children: [
            {
                id: 'dashboard-realtime',
                name: '实时监控',
                path: '/dashboard/realtime',
                icon: 'AreaChartOutlined',
                order: 1,
                description: '实时监控关键业务指标，支持异常预警和通知',
                actions: ['view', 'export', 'subscribe']
            },
            {
                id: 'dashboard-analysis',
                name: '运营分析',
                path: '/dashboard/analysis',
                icon: 'FundOutlined',
                order: 2,
                description: '多维度分析平台表现，支持历史数据对比',
                actions: ['view', 'export']
            }
        ]
    },
    {
        id: 'content-center',
        name: '内容中心',
        path: '/content',
        icon: 'AppstoreOutlined',
        order: 2,
        description: '统一管理业务线内容与资源',
        actions: ['view'],
        children: [
            {
                id: 'solutions',
                name: '解决方案',
                path: '/solutions',
                icon: 'SolutionOutlined',
                order: 1,
                description: '管理解决方案条目、案例与排序',
                actions: ['view', 'create', 'update', 'publish']
            },
            {
                id: 'products',
                name: '产品服务',
                path: '/products',
                icon: 'ShoppingOutlined',
                order: 2,
                description: '维护产品信息、功能亮点与价格策略',
                actions: ['view', 'create', 'update']
            },
            {
                id: 'banners',
                name: '轮播图',
                path: '/banners',
                icon: 'PictureOutlined',
                order: 3,
                description: '管理首页轮播图、投放计划与曝光数据',
                actions: ['view', 'create', 'update', 'delete']
            },
            {
                id: 'consultations',
                name: '线索管理',
                path: '/consultations',
                icon: 'MessageOutlined',
                order: 4,
                description: '处理用户咨询与销售线索流转',
                actions: ['view', 'assign', 'close']
            }
        ]
    },
    {
        id: 'system-admin',
        name: '系统管理',
        path: '/system',
        icon: 'SettingOutlined',
        order: 3,
        description: '账号、权限、参数配置等系统功能',
        actions: ['view'],
        children: [
            {
                id: 'user-management',
                name: '用户管理',
                path: '/user-management',
                icon: 'TeamOutlined',
                order: 1,
                description: '维护后台用户、角色权限与功能分配',
                actions: ['view', 'create', 'update', 'delete', 'reset-password']
            },
            {
                id: 'role-management',
                name: '角色权限',
                path: '/user-management/roles',
                icon: 'SafetyCertificateOutlined',
                order: 2,
                description: '配置角色权限范围、菜单与操作能力',
                actions: ['view', 'create', 'update', 'delete']
            },
            {
                id: 'settings',
                name: '系统设置',
                path: '/settings',
                icon: 'ToolOutlined',
                order: 3,
                description: '站点信息、业务参数与安全策略配置',
                actions: ['view', 'update']
            }
        ]
    }
];
export const mockRoles = [
    {
        id: 'role-admin',
        name: '超级管理员',
        description: '系统最高权限，可访问和配置所有功能模块。',
        status: 'active',
        data_scope: 'all',
        default_landing: '/dashboard',
        menu_ids: mockUserMenus.flatMap(menu => [menu.id, ...(menu.children?.map(child => child.id) || [])]),
        action_permissions: mockUserMenus.reduce((acc, menu) => {
            acc[menu.id] = menu.actions || [];
            menu.children?.forEach(child => {
                acc[child.id] = child.actions || [];
            });
            return acc;
        }, {}),
        created_at: new Date('2023-12-01T08:00:00Z').toISOString(),
        updated_at: new Date('2024-01-15T02:30:00Z').toISOString(),
        remark: '系统默认内置角色'
    },
    {
        id: 'role-ops',
        name: '运营经理',
        description: '负责内容与线索运营，可管理内容中心与线索模块。',
        status: 'active',
        data_scope: 'department',
        default_landing: '/solutions',
        menu_ids: [
            'dashboard',
            'dashboard-analysis',
            'content-center',
            'solutions',
            'products',
            'banners',
            'consultations'
        ],
        action_permissions: {
            dashboard: ['view'],
            'dashboard-analysis': ['view', 'export'],
            solutions: ['view', 'create', 'update', 'publish'],
            products: ['view', 'update'],
            banners: ['view', 'create', 'update'],
            consultations: ['view', 'assign']
        },
        created_at: new Date('2023-12-15T10:12:00Z').toISOString(),
        updated_at: new Date('2024-01-10T05:00:00Z').toISOString(),
        remark: '内容与营销负责人'
    },
    {
        id: 'role-analyst',
        name: '数据分析师',
        description: '关注运营数据分析，可查看仪表盘及导出报表。',
        status: 'active',
        data_scope: 'department',
        default_landing: '/dashboard',
        menu_ids: ['dashboard', 'dashboard-realtime', 'dashboard-analysis'],
        action_permissions: {
            dashboard: ['view'],
            'dashboard-realtime': ['view', 'subscribe'],
            'dashboard-analysis': ['view', 'export']
        },
        created_at: new Date('2024-01-05T07:00:00Z').toISOString(),
        updated_at: new Date('2024-01-20T03:45:00Z').toISOString(),
        remark: '数据团队专用角色'
    },
    {
        id: 'role-support',
        name: '客服专员',
        description: '负责客户咨询跟进与反馈收集，仅访问线索模块。',
        status: 'active',
        data_scope: 'self',
        default_landing: '/consultations',
        menu_ids: ['content-center', 'consultations'],
        action_permissions: {
            consultations: ['view', 'close']
        },
        created_at: new Date('2024-01-08T09:30:00Z').toISOString(),
        updated_at: new Date('2024-01-18T01:10:00Z').toISOString(),
        remark: '售前客服角色'
    },
    {
        id: 'role-guest',
        name: '访客',
        description: '仅用于临时访问，拥有最小化权限。',
        status: 'inactive',
        data_scope: 'self',
        default_landing: '/dashboard',
        menu_ids: ['dashboard'],
        action_permissions: {
            dashboard: ['view']
        },
        created_at: new Date('2024-01-12T11:25:00Z').toISOString(),
        updated_at: new Date('2024-01-12T11:25:00Z').toISOString(),
        remark: '临时访问控制'
    }
];
export const mockUserAccounts = [
    {
        id: 'user-admin',
        username: 'admin',
        email: 'admin@company.com',
        mobile: '13800000001',
        role_id: 'role-admin',
        status: 'active',
        department: '运营中心',
        position: '平台管理员',
        login_count: 156,
        last_login_at: new Date('2024-01-25T02:30:00Z').toISOString(),
        created_at: new Date('2023-12-01T08:00:00Z').toISOString(),
        remark: '系统内置超级管理员账号',
        tags: ['核心账号', '安全']
    },
    {
        id: 'user-ops-01',
        username: 'operation.lead',
        email: 'operation.lead@company.com',
        mobile: '13800000012',
        role_id: 'role-ops',
        status: 'active',
        department: '市场运营部',
        position: '运营经理',
        login_count: 98,
        last_login_at: new Date('2024-01-24T12:15:00Z').toISOString(),
        created_at: new Date('2023-12-20T03:20:00Z').toISOString(),
        remark: '负责全站内容排期与投放',
        tags: ['内容', '增长']
    },
    {
        id: 'user-analyst-01',
        username: 'data.analyst',
        email: 'data.analyst@company.com',
        mobile: '13900000045',
        role_id: 'role-analyst',
        status: 'active',
        department: '数据中心',
        position: '高级数据分析师',
        login_count: 123,
        last_login_at: new Date('2024-01-23T09:40:00Z').toISOString(),
        created_at: new Date('2024-01-02T05:18:00Z').toISOString(),
        remark: '负责监控运营指标与产出周报',
        tags: ['分析', '报表']
    },
    {
        id: 'user-support-01',
        username: 'support.kelly',
        email: 'support.kelly@company.com',
        mobile: '13700000321',
        role_id: 'role-support',
        status: 'active',
        department: '客户成功部',
        position: '资深客服',
        login_count: 67,
        last_login_at: new Date('2024-01-25T04:05:00Z').toISOString(),
        created_at: new Date('2024-01-08T11:08:00Z').toISOString(),
        remark: '重点客户跟进负责人',
        tags: ['客户', '跟进']
    },
    {
        id: 'user-support-02',
        username: 'support.liang',
        email: 'support.liang@company.com',
        mobile: '13700000322',
        role_id: 'role-support',
        status: 'inactive',
        department: '客户成功部',
        position: '客服专员',
        login_count: 21,
        last_login_at: new Date('2024-01-14T01:32:00Z').toISOString(),
        created_at: new Date('2024-01-10T07:35:00Z').toISOString(),
        remark: '待重新授权的账号',
        tags: ['审批中']
    },
    {
        id: 'user-guest-01',
        username: 'guest.viewer',
        email: 'guest.viewer@company.com',
        mobile: '13600000678',
        role_id: 'role-guest',
        status: 'inactive',
        department: '外部合作方',
        position: '临时访客',
        login_count: 3,
        last_login_at: new Date('2024-01-05T06:00:00Z').toISOString(),
        created_at: new Date('2024-01-05T05:45:00Z').toISOString(),
        remark: '项目协同短期账号',
        tags: ['临时']
    }
];
