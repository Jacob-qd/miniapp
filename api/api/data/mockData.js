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
