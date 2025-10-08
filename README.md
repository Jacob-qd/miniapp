# 微信小程序商务系统

一个完整的商务管理系统，包含微信小程序端和管理后台两个部分。

## 项目结构

```
商务小程序/
├── miniprogram/          # 微信小程序端
│   ├── pages/           # 页面文件
│   │   ├── index/       # 首页
│   │   ├── solution/    # 解决方案
│   │   ├── products/    # 产品展示
│   │   └── about/       # 关于我们
│   ├── utils/           # 工具函数
│   ├── app.js          # 小程序入口文件
│   ├── app.json        # 小程序配置文件
│   └── app.wxss        # 全局样式文件
├── src/                 # 管理后台 (React + TypeScript)
│   ├── components/      # 公共组件
│   ├── pages/          # 页面组件
│   │   ├── Login.tsx   # 登录页
│   │   ├── Dashboard.tsx # 仪表盘
│   │   ├── Solutions.tsx # 解决方案管理
│   │   ├── Products.tsx  # 产品管理
│   │   ├── Consultations.tsx # 咨询管理
│   │   ├── Company.tsx   # 企业信息管理
│   │   └── Settings.tsx  # 系统设置
│   ├── App.tsx         # 应用入口
│   └── main.tsx        # 主入口文件
├── package.json        # 项目依赖配置
└── README.md          # 项目说明文档
```

## 技术栈

### 微信小程序端
- **框架**: 微信小程序原生开发
- **语言**: JavaScript
- **样式**: WXSS
- **组件**: 微信小程序原生组件

### 管理后台
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI组件库**: Ant Design
- **路由**: React Router DOM
- **状态管理**: React Hooks
- **HTTP客户端**: Fetch API
- **日期处理**: Day.js

## 功能特性

### 微信小程序端
- 🏠 **首页展示**: 企业介绍、核心业务、成功案例
- 💡 **解决方案**: 详细的解决方案展示和介绍
- 📱 **产品展示**: 产品列表、筛选、详情查看
- 🏢 **关于我们**: 企业信息、团队介绍、联系方式
- 📞 **在线咨询**: 一键拨打电话、微信咨询
- 🔄 **下拉刷新**: 支持页面数据刷新
- 📤 **分享功能**: 支持页面分享

### 管理后台
- 🔐 **用户认证**: 登录/登出功能
- 📊 **数据仪表盘**: 业务数据统计和可视化
- 💼 **解决方案管理**: 增删改查解决方案
- 🛍️ **产品管理**: 产品信息维护
- 💬 **咨询管理**: 客户咨询处理和回复
- 🏢 **企业信息管理**: 企业基本信息维护
- ⚙️ **系统设置**: 系统配置和用户管理

## 开发环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0 (推荐) 或 npm >= 8.0.0
- 微信开发者工具 (用于小程序开发)

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd 商务小程序
```

### 2. 安装依赖
```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install
```

### 3. 启动管理后台开发服务器
```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

### 4. 微信小程序开发
1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. 配置 AppID (测试可使用测试号)
4. 开始开发调试

## 构建部署

### 管理后台构建
```bash
# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 微信小程序发布
1. 在微信开发者工具中点击「上传」
2. 填写版本号和项目备注
3. 在微信公众平台提交审核
4. 审核通过后发布

## 项目配置

### 环境变量
创建 `.env.local` 文件配置环境变量：
```env
# API 基础地址（前端）
VITE_API_BASE_URL=https://api.example.com

# 后端安全配置
JWT_SECRET=super-secure-secret
CORS_ORIGINS=https://admin.example.com,https://miniapp.example.com

# 其他配置...
```

### 微信小程序配置
在 `miniprogram/app.json` 中配置：
- 页面路径
- 窗口表现
- 底部导航
- 网络超时时间
- 权限设置

## API 接口

项目中的 API 接口目前使用模拟数据，实际开发中需要：

1. 替换 `src/utils/api.ts` 中的模拟接口
2. 配置真实的后端 API 地址
3. 处理认证和权限验证
4. 添加错误处理和重试机制

## 开发规范

### 代码规范
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 进行代码格式化
- 组件和函数使用驼峰命名
- 常量使用大写下划线命名

### 提交规范
```bash
# 功能开发
git commit -m "feat: 添加用户管理功能"

# 问题修复
git commit -m "fix: 修复登录状态异常问题"

# 文档更新
git commit -m "docs: 更新 README 文档"

# 样式调整
git commit -m "style: 调整按钮样式"
```

## 常见问题

### Q: 微信小程序真机预览白屏？
A: 检查以下几点：
1. 确认 AppID 配置正确
2. 检查网络请求域名是否已配置
3. 查看调试器中的错误信息

### Q: 管理后台登录失败？
A: 部署环境下需要确保后端 `JWT_SECRET`、`CORS_ORIGINS` 已正确配置，并提供有效的管理员账号。开发阶段可使用默认账号 `admin/admin123`，同时后端会在应用启动时自动校验已有令牌的有效性。

### Q: 如何添加新的页面？
A: 
1. 在对应目录创建页面文件
2. 更新路由配置
3. 添加菜单项（如需要）

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱: contact@example.com
- 电话: 400-123-4567
- 官网: https://www.example.com

---

**注意**: 本项目为演示项目，包含模拟数据。在生产环境使用前，请确保：
1. 替换所有模拟数据为真实 API
2. 配置正确的服务器地址
3. 实现完整的用户认证和权限控制
4. 添加适当的错误处理和日志记录
5. 进行充分的测试