# 理想营养官网

理想营养（Ideal Performance Nutrition）生产版官网，使用 Next.js App Router、TypeScript 与真实品牌/产品素材构建。公开官网不依赖本地数据库，可直接部署至 Vercel；购买、付款和退款统一跳转淘宝店完成。

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

## 环境变量

- `NEXT_PUBLIC_SITE_URL`：正式域名，例如 `https://www.example.com`，用于 canonical、Open Graph、sitemap 和 robots。
- `NEXT_PUBLIC_TAOBAO_STORE_URL`：理想营养淘宝店地址；所有购买按钮统一读取该变量。
- `DATABASE_URL`、`SESSION_SECRET`：仅供本地会员/后台演示模块使用。公开官网部署不需要。

## 公开页面

- `/`：首页
- `/products`：商品矩阵
- `/on`：ON 专区
- `/authenticity`：防伪溯源
- `/versions`：版本说明
- `/faq`：售后 FAQ
- `/about`：关于我们
- `/contact`：联系我们
- `/products/[slug]`：商品详情

## 素材与商品数据

- 原始项目复制件：`public/assets/brand/`、`public/assets/products/`
- 网页压缩版本：`public/assets/optimized/`
- 公开商品数据：`src/data/catalog.ts`

原始素材复制件不会被网页压缩流程覆盖。产品图保持原始宽高比并使用 `object-fit: contain`；除首屏关键图片外，图片均采用延迟加载。

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

GitHub 上传与 Vercel 部署步骤见 [生产部署指南](docs/production-deployment.md)。

> 膳食补充剂不能替代均衡饮食。产品信息以实物包装标签为准。
