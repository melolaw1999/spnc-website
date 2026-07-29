# GitHub 与 Vercel 生产部署指南

## 一、部署前确认

1. 安装 Node.js 20 或更高版本。
2. 在项目目录执行 `npm install`、`npm run lint`、`npm run test`、`npm run build`。
3. 打开 `.env.example`，确认正式淘宝店地址。
4. 确认网站没有提交 `.env`、本地数据库、扫描索引或用户隐私文件。

公开官网商品使用静态目录数据，不依赖数据库，也不包含会员、积分、模拟订单或后台测试功能。

## 二、上传到 GitHub

先在 GitHub 新建一个空仓库，不要勾选自动创建 README。然后在项目目录执行：

```bash
git init
git add .
git status
git commit -m "Prepare SPNC website for production"
git branch -M main
git remote add origin https://github.com/你的账号/你的仓库名.git
git push -u origin main
```

执行 `git status` 时重点确认没有以下内容：`.env`、`prisma/dev.db`、`work/local-asset-index.*`、Playwright 浏览器文件、身份证件、订单、客户资料或其他隐私文件。

如果 GitHub 要求登录，使用 GitHub 官方登录流程或 Personal Access Token，不要把 Token 写进项目文件。

## 三、在 Vercel 部署

1. 登录 Vercel，选择 **Add New → Project**。
2. 连接 GitHub，并导入刚刚上传的仓库。
3. Framework Preset 保持 **Next.js**；Build Command 保持 `npm run build`，不需要填写 Output Directory。
4. 添加环境变量：
   - `NEXT_PUBLIC_SITE_URL`：`https://www.spnc.cn`
   - `NEXT_PUBLIC_TAOBAO_STORE_URL`：`https://spnc.taobao.com`
5. 点击 **Deploy**。
6. 部署完成后检查首页、全部公开页面、商品详情、购买跳转、`/sitemap.xml`、`/robots.txt` 和一个不存在的地址。

Vercel 会自动识别 Next.js。连接 GitHub 后，后续推送通常会自动产生新部署；分支或 Pull Request 可获得预览地址。

官方参考：

- [Vercel：Next.js 部署](https://vercel.com/docs/frameworks/full-stack/nextjs)
- [Vercel：Git 部署概览](https://vercel.com/docs/deployments/overview)
- [Next.js：Metadata 与 OG 图片](https://nextjs.org/docs/app/getting-started/metadata-and-og-images)

## 四、绑定正式域名后

1. 在 Vercel 项目 Settings → Domains 添加域名并按提示配置 DNS。
2. 把 `NEXT_PUBLIC_SITE_URL` 更新为最终 HTTPS 域名，重新部署。
3. 打开 `https://正式域名/sitemap.xml`，确认其中所有链接均使用正式域名。
4. 将 sitemap 提交给需要使用的搜索引擎站长平台。
5. 复核 Open Graph 分享图、favicon、404 页面和手机端菜单。

## 五、上线验收清单

- 首页及 7 个主要信息页均可访问。
- 所有公开商品均使用真实素材；未确认素材不进入商品目录。
- 所有“购买”按钮均打开正式淘宝店；站内没有购物车或支付入口。
- 页面 title、description、canonical、Open Graph 正确。
- `/sitemap.xml` 与 `/robots.txt` 正常返回。
- favicon 和 404 页面正常。
- 手机端没有横向溢出，菜单、商品卡与按钮可操作。
- `.env`、本地数据库、素材私有索引与隐私文件未上传 GitHub。
