# 正式部署检查清单

- 确认 `NEXT_PUBLIC_SITE_URL` 使用正式 HTTPS 域名。
- 确认 `NEXT_PUBLIC_TAOBAO_STORE_URL` 是正式淘宝店地址。
- 复核所有产品图片、版本描述、营养表述、过敏原和售后文字。
- 确认网站没有购物车、站内支付或私下转账入口。
- 确认 `.env`、SQLite 数据库、私有素材索引和隐私文件没有进入 Git。
- 执行 `npm run lint`、`npm run test`、`npm run build`。
- 验收 sitemap、robots、favicon、404、Open Graph 和手机端布局。
- 如果以后启用会员与后台，先迁移持久数据库、正式短信、生产鉴权、共享限流和审计日志，再开放相关入口。
- 完成适用的备案、经营资质、隐私政策和平台合规准备。
