# 项目优化建议概览

本文档在梳理现有代码后，整理了若干可以优先考虑的优化方向，涵盖前端体验、实时同步、后端接口与工程化等方面，供后续迭代时参考。

## 1. 认证与前端状态管理

- **集中管理认证状态，避免单纯依赖 `localStorage`**：目前的受保护路由仅通过检查 `localStorage` 中的 token 来决定是否允许访问，这在用户在其他标签页退出登录、或 token 已失效时无法及时响应。【F:src/App.tsx†L17-L46】建议引入统一的认证上下文或 Zustand/Redux store，结合令牌有效期验证接口，在应用启动时拉取用户状态并驱动路由守卫。
- **复用后端的 token 校验逻辑**：前端的 `ProtectedRoute` 无法区分 token 是否过期，可在布局加载时调用 `/api/auth/verify` 之类的接口，并在 401/403 时集中处理跳转与提示，减少各页面重复代码。

## 2. 实时同步策略

- **稳定回调引用，避免重复订阅**：`useRealtime` Hook 将 `options.onInsert` 等回调放入依赖数组，但调用方（如 Dashboard 页面）每次渲染都会创建新的箭头函数，导致 Supabase 频道被频繁移除再订阅，增加资源消耗。【F:src/hooks/useRealtime.ts†L12-L71】【F:src/pages/Dashboard.tsx†L41-L83】可以在 Hook 内使用 `useRef` 缓存回调或要求调用方通过 `useCallback` 传入，保证订阅只在必要时重建。
- **利用推送数据而非重新拉取列表**：Dashboard 在收到任一实时事件时都会重新调用 `loadDashboardData` 并发起三次请求，这会放大 Supabase 和 API 的压力。【F:src/pages/Dashboard.tsx†L55-L116】建议直接使用推送数据增量更新本地 state，并为表格与统计定义去重逻辑，从而降低延迟并提升用户体验。
- **统一的频道管理与清理**：`useBatchRealtime` 会在每次 `startSync` 时累积频道引用，但 `unsubscribeAll` 仅在组件卸载时调用一次。【F:src/hooks/useRealtime.ts†L73-L119】建议在 `startSync` 之前先清理已有频道，或使用 `useRef` 存储频道集合，避免重复订阅导致的冗余消息。

## 3. 后端接口与安全性

- **合并重复的认证中间件实现**：`api/routes/auth.ts` 与 `api/middleware/auth.ts` 同时维护 `authenticateToken` 逻辑，长期来看易出现行为不一致。【F:api/routes/auth.ts†L19-L56】【F:api/middleware/auth.ts†L12-L53】建议保留 middleware 版本并在各路由统一引用，或抽取成独立模块减少维护成本。
- **改进 CORS 与环境配置**：当前 CORS 白名单写死了示例域名和本地端口，生产部署时需要根据环境变量动态生成允许来源，避免忘记更新导致跨域问题。【F:api/app.ts†L24-L41】同时可将 JWT 秘钥等敏感信息都搬到 `.env`，并在 README 中提示配置方式。
- **为统计接口添加聚合优化**：访问统计 API 通过多次 `select` 后在 Node.js 层做聚合，随着数据量增长会增加内存压力。【F:api/routes/analytics.ts†L30-L195】可以改用 Supabase 的 `select` + `group` 或 `rpc` 调用，让数据库完成聚合，并对 `visit_time`、`page_path` 等字段建立索引。

## 4. UI 与交互体验

- **抽离重复的请求与提示逻辑**：Dashboard 页面内手工处理 `fetch`、错误提示和兜底数据，随着页面增多容易散落在各处。【F:src/pages/Dashboard.tsx†L91-L166】建议封装统一的请求客户端（例如使用 `fetch` 封装或引入 `axios`），内置 token 附带与错误处理，并结合 `antd` 的 `notification` 组件减少重复代码。
- **实时状态提示可支持更丰富的信息**：`RealtimeIndicator` 组件目前只显示同步次数和错误数量，可以进一步展示当前订阅的表、最近一次错误详情或提供重试按钮，帮助运维排查。【F:src/contexts/RealtimeContext.tsx†L20-L129】

## 5. 工程化与可维护性

- **整理 Mock 数据与真实服务之间的切换**：多处 API 在 Supabase 出错时直接返回内置 mock 数据，建议通过配置切换或服务层封装，让 mock 只在开发环境启用，避免生产环境误返回静态数据。【F:api/routes/banners.ts†L12-L84】【F:api/routes/solutions.ts†L12-L84】
- **补充类型定义与共享接口**：前后端都定义了 `Banner`、`Solution` 等类型，可将公共类型放到 `supabase` 配置目录下供 API 与前端共享，减少字段差异风险。

上述建议优先关注可见的性能、安全与维护成本，后续可以根据业务需求逐步落地实现。
