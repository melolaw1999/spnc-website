# 系统架构

项目采用 Next.js App Router 单体全栈架构。页面与 API 共享 TypeScript 类型；Prisma 是数据访问边界，SQLite 用于第一阶段本地运行，将来可迁移 PostgreSQL。

核心边界：

- `src/lib/security.ts`：服务端 Session、角色校验、脱敏和基础限流。
- `src/lib/points.ts`：积分计算、待生效/可用状态与退款扣回；流水唯一约束承担幂等保护。
- `src/lib/order-provider.ts`：`OrderProvider` 统一接口、可运行的模拟提供方、待授权的真实淘宝骨架。
- `src/app/api`：服务端输入使用 Zod 校验；管理员操作在服务端重新验证角色并写审计日志。
- `prisma/schema.prisma`：订单号、订单认领和订单事件均有数据库唯一约束。

积分余额不存为可随意改写的用户字段，而是按 `PointLedger` 汇总。管理员调整也必须新增流水并记录原因。订单流水的 `metadata` 保存规则快照，后续规则修改不会改变历史值。

敏感数据原则：不保存完整收件手机号，只保存后四位哈希；日志不写验证码、完整手机号或第三方密钥；淘宝密钥只从环境变量读取。
