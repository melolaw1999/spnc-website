# 理想营养官网

SPNC 理想营养生产版官网，使用 Next.js App Router、TypeScript 与真实品牌/商品素材构建。当前公开商品库只展示 ON；购买、付款、退款与交易调整统一在淘宝店完成。

## 本地运行

需要 Node.js 20 或更高版本。

```bash
npm install
cp .env.example .env.local
npm run dev
```

浏览器打开 `http://localhost:3000`。

生产模式验证：

```bash
npm run build
npm run start
```

## 正式地址

- 官网：`https://www.spnc.cn`
- 淘宝店：`https://spnc.taobao.com`

基础环境变量：

- `NEXT_PUBLIC_SITE_URL`：canonical、Open Graph、sitemap 和 robots 使用的正式域名。
- `NEXT_PUBLIC_TAOBAO_STORE_URL`：所有淘宝购买与咨询按钮的唯一跳转来源。

售后工单需要额外配置：

- `BLOB_READ_WRITE_TOKEN`：Vercel Private Blob 自动生成的私密存储凭证。
- `TICKET_HASH_SALT`：用于防止重复提交与重复领取的随机长字符串。
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`、`TURNSTILE_SECRET_KEY`：Cloudflare Turnstile 站点与服务器密钥。
- `ADMIN_USERNAME`、`ADMIN_PASSWORD`：保护 `/admin/tickets` 的管理员凭证。
- `RESEND_API_KEY`、`TICKET_NOTIFICATION_FROM`：可选的新工单邮件提醒配置。

以上密钥不得提交到 Git，只填写在 `.env.local` 或 Vercel Environment Variables。

## 公开页面

- `/`：首页
- `/products`：商品矩阵
- `/on`：ON 商品专区
- `/authenticity`：正品说明与防伪溯源
- `/versions`：版本说明
- `/faq`：售后 FAQ
- `/support`：售后工单与活动权益登记
- `/about`：关于我们
- `/contact`：联系我们
- `/products/[slug]`：商品详情
- `/admin/tickets`：受权限保护的工单管理后台

## 素材与商品数据

- 原始项目复制件：`public/assets/brand/`、`public/assets/products/`
- 网页压缩版本：`public/assets/optimized/`
- 公开商品数据：`src/data/catalog.ts`

当前目录只保留已有真实白底图并完成身份核对的 ON 商品。跨境进口、国产版本与一般贸易的具体 SKU，待淘宝商品导出或卖家授权接口可用后再逐项绑定；不会根据图片或标题推测。

原始素材复制件不会被网页压缩流程覆盖。商品图保持原始宽高比并使用 `object-fit: contain`。

## 工单边界

- 官网收集订单号、一种联系方式、问题说明及最多三张必要图片。
- 上传图片进入 Private Blob，不进入 `public/assets`。
- 后台状态变更和内部备注均写入不可公开访问的审计记录。
- 活动权益登记按订单与活动代码防重复，不与好评、五星或评价内容挂钩。
- 退款、退货、付款及交易调整仍回到原淘宝订单处理。

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

> 膳食补充剂不能替代均衡饮食。商品信息以实物包装标签及淘宝订单页面为准。
