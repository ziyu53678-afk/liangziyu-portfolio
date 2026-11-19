# 梁梓煜 · 个人作品数字展

深圳大学网络与新媒体 2028 届。以三个可滚动浏览的展厅，展示调研与报道、内容运营和交互实验。

在线作品集：https://ziyu53678-afk.github.io/liangziyu-portfolio/

## 展厅

- **观察与记录**：深圳夜市治理调研、瑞幸财务造假案报道复盘、跨境电商报道。两篇文章支持站内卡片阅读和全文展开。
- **内容与传播**：赛事鱼个人账号与黄金岛内容运营实习。
- **交互与实验**：热点显微镜、流年、微信年度报告、n8n 公众号草稿工作流、Unity《逃离后室》演示。

桌面端包含滚动叠放、横向展墙和按需加载的产品窗口；手机采用纵向浏览。支持系统减少动态效果设置，不设置联系方式。

## 本地运行

```sh
npm ci
npm run dev
```

浏览器打开 http://127.0.0.1:5173/ 。

```sh
npm run build
npm run preview
```

构建输出为 `dist/`，本地成品预览为 http://127.0.0.1:4173/ 。`BASE_PATH` 可配置发布路径，例如 `BASE_PATH=/liangziyu-portfolio/ npm run build`。

## GitHub Pages

仓库的 Pages 来源设置为 **GitHub Actions**。每次推送至 `main`，`.github/workflows/deploy-pages.yml` 自动安装依赖、构建并发布。正式首页与 `/flow-gallery.html` 均提供当前展馆。

## 维护

- 页面：`src/proposals/flow-gallery.tsx`
- 样式与字体：`src/proposals/flow-gallery.css`、`src/proposals/flow-type.css`
- 文章阅读：`src/proposals/ArticleReader.tsx`、`public/articles/`
- 图片、字体与视频：`public/`
- 正文字体本地托管；字体与 React Bits 许可证见 `licenses/`

文章图文来源、原始链接和处理说明见 `public/articles/SOURCES.md`。本地文章不是原平台的实时同步内容。比赛采用证书确认的“年度十强”；运营数据来自个人记录；团队项目保留共同署名。外部产品功能由其原服务提供。

## 验证

本机安装 Chrome 后，在预览服务运行时执行：

```sh
npm run check:site
```

可通过 `PORTFOLIO_URL` 指定公开网址或带子路径的预览。检查包括正式首页、文章与配图、产品窗口、视频、六种屏幕宽度和减少动态效果。

文章卡片的细节测试：在开发服务运行时执行 `npm run check:articles`。检查记录输出至本地 `artifacts/`，不上传仓库。
