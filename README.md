# 理想营养官网

理想营养生产版官网，使用 Next.js App Router、TypeScript 与真实品牌/商品素材构建。官网不依赖数据库；购买、付款和订单售后统一在淘宝店完成。

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

环境变量只有两个：

- `NEXT_PUBLIC_SITE_URL`：canonical、Open Graph、sitemap 和 robots 使用的正式域名。
- `NEXT_PUBLIC_TAOBAO_STORE_URL`：所有淘宝购买与咨询按钮的唯一跳转来源。

## 公开页面

- `/`：首页
- `/products`：商品矩阵
- `/on`：ON 商品专区
- `/authenticity`：正品说明与防伪溯源
- `/versions`：版本说明
- `/faq`：售后 FAQ
- `/about`：关于我们
- `/contact`：联系我们
- `/products/[slug]`：商品详情

## 素材与商品数据

- 原始项目复制件：`public/assets/brand/`、`public/assets/products/`
- 网页压缩版本：`public/assets/optimized/`
- 公开商品数据：`src/data/catalog.ts`

原始素材复制件不会被网页压缩流程覆盖。商品图保持原始宽高比并使用 `object-fit: contain`。

## 质量检查

```bash
npm run lint
npm run test
npm run build
```

> 膳食补充剂不能替代均衡饮食。商品信息以实物包装标签及淘宝订单页面为准。
