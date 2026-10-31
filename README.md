# 网络寻租

个人博客，基于 [AstroPaper](https://github.com/satnaing/astro-paper)（Astro 7 + Tailwind CSS 4）。
静态构建，产物托管在 GitHub Pages。

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Astro 7（静态输出，零客户端 JS） |
| 样式 | Tailwind CSS 4（`src/styles/` + `@theme` 变量） |
| 组件 | Astro 组件（`src/components/`） |
| 内容 | Content Collections + Zod schema（`src/content.config.ts`） |
| Markdown | remark / rehype，含 remark-toc、rehype-callouts、Shiki 高亮 |
| 搜索 | Pagefind（构建后索引，零 JS 静态搜索） |
| 评论 | Giscus（GitHub Discussions） |
| 订阅源 | 自建 Atom 1.0 生成器（`src/integrations/atom-feed.ts`） |
| 国际化 | `astro:i18n`，当前只启用 `zh`（`src/i18n/lang/zh.ts`） |
| 包管理 | npm，TypeScript 严格模式 |

## 目录结构

```
.
├── src/
│   ├── content/
│   │   ├── posts/          # 文章（Markdown + YAML front matter）
│   │   └── pages/about.md  # 关于页
│   ├── pages/              # 路由
│   │   ├── index.astro           → /
│   │   ├── about.astro           → /about/
│   │   ├── blog/
│   │   │   ├── index.astro         → /blog/
│   │   │   ├── page/[page].astro   → /blog/page/N/
│   │   │   ├── [...slug]/          → /blog/<slug>/
│   │   │   ├── categories/         → /blog/categories/<cat>/
│   │   │   └── archives/           → /blog/archives/
│   │   ├── search.astro        → /search/
│   │   └── robots.txt.ts
│   ├── components/         # 主题组件（Header/Card/Tag/Pagination…）
│   ├── layouts/            # 页面布局（Layout/PostLayout）
│   ├── integrations/
│   │   └── atom-feed.ts     # 构建后生成 Atom feed（全站 + 分类）
│   ├── i18n/lang/zh.ts     # 中文界面文案
│   ├── styles/             # 全局样式与主题变量
│   ├── utils/
│   │   ├── categories.ts   # 分类 slug ↔ 中文名映射
│   │   ├── getPostPaths.ts # 文章 URL 生成
│   │   ├── pagination.ts   # 分页 URL 生成
│   │   └── slugify.ts
│   └── content.config.ts   # 内容 schema
├── public/                 # images/ assets/ favicon.png CNAME（直接放行，不经构建）
├── scripts/
│   ├── publish.sh          # 构建并发布到 Pages 分支
│   ├── migrate-from-octopress.mjs
│   ├── verify-urls.py
│   └── verify-content.py
├── astro-paper.config.ts   # 站点配置（标题、作者、每页条数、时区、功能开关）
└── astro.config.ts         # 框架配置（集成、Markdown、i18n、字体）
```

## 密钥扫描

用 [git-leaks](https://github.com/gitleaks/gitleaks) 扫描仓库历史与工作区：

```bash
scripts/scan-secrets.sh
```

脚本会按需把 git-leaks 下载到 `.tools/`（已 gitignore），然后依次扫描：

1. Astro 仓库的**全部 git 历史**
2. Astro 仓库的**工作目录**（含未跟踪的 `.env`）
3. 旧 blog 仓库的**所有分支与历史**（880 个提交）

规则见 `.gitleaks.toml`：在 git-leaks 默认规则之外，额外覆盖本项目用到的三种凭据形态
（Disqus API key、GitHub token、Giscus 的 repo/category id）。
`.gitleaksignore` 目前只接受指纹，因此 `node_modules/` 等目录也会被扫到——它们没有密钥。

## 环境变量

私密值一律放在 `.env`（已被 `.gitignore` 排除，不会进仓库），模板见 `.env.example`：

```bash
cp .env.example .env
```

| 变量 | 用途 |
| --- | --- |
| `DISQUS_API_KEY` | 导出旧评论、列出历史线程 |
| `GITHUB_TOKEN` | 写入 GitHub Discussions（需 `repo` 权限） |
| `GISCUS_REPO_ID` / `GISCUS_CATEGORY_ID` | 构建时注入评论区；缺少时评论区不渲染 |

`.env` 会被 `astro`（构建）与两个脚本自动读取。脚本若检测到 `HTTPS_PROXY`
会自动以 `NODE_USE_ENV_PROXY=1` 重启自己，因此无需手动加代理参数。

**不要把真实值写进 `astro-paper.config.ts` 或任何被跟踪的文件。**

## 常用命令

```bash
npm install
npm run dev        # 本地开发 http://localhost:4321
npm run build      # 类型检查 + 构建 + 生成 Pagefind 索引
npm run preview    # 预览 dist/
npm run lint       # ESLint
npm run format     # Prettier
```

## 内容规范

文章 front matter（schema 见 `src/content.config.ts`）：

```yaml
---
title: "文章标题"                       # 必填
slug: "C-RAII"                          # 必填，URL 路径，保留原始大小写
pubDatetime: "2010-10-29T14:25:54+08:00"  # 必填
description: "摘要，用于卡片、meta 与订阅源"  # 必填
tags: ["bian-cheng"]                    # 分类 slug 数组，可为空
modDatetime: "..."                      # 可选
featured: false                         # 可选，首页精选区
draft: true                             # 可选，草稿不进入列表页
---
```

**slug 规则**：直接决定文章 URL，**必须保留原始大小写**（如 `C-RAII`、`why-I-use-linux`）。
`src/utils/getPostPaths.ts` 会优先取 front matter 的 `slug`，绕开 `slugify.ts` 的小写化，
以免历史链接失效。文件名建议与 `slug` 一致。

**分类规则**：`tags` 存的是分类 slug（如 `bian-cheng`、`ji-qi-xue-xi`），中文名放在
`src/utils/categories.ts` 的映射表里，只用于显示。新增分类时 slug 一旦发布就不要再改。

## 评论

用 **Giscus**（GitHub Discussions），配置在 `astro-paper.config.ts` 的 `comments` 字段。

选它的原因：实测国内直连 `giscus.app`、`api.github.com`、`github.com/login/oauth` 全部可达且很快
（0.3–1.2s），而 `disqus.com` 直连完全超时。

```ts
comments: {
  provider: "giscus",
  giscus: {
    repo: "halida/halida.github.com",
    repoId: "R_kgDO…",       // 来自 giscus.app 生成的脚本
    categoryId: "DIC_kwDO…",  // 同上
    category: "Comments",
    mapping: "pathname",      // 按路径匹配，域名/协议变了也不影响
    reactionsEnabled: true,
    inputPosition: "top",
    lang: "zh-CN",
  },
}
```

`repoId` 和 `categoryId` 两个数字 ID 在 <https://giscus.app> 配置后从生成的 `<script>` 里取。
仓库还需要开启 **Discussions**（Settings → General → Features → Discussions），
并在 Discussion 分类里加入一个 `Comments` 分类。

**匿名评论**：Giscus **不支持**。读者必须先登录 GitHub 并授权 giscus 应用才能留言
（官方设计如此：评论通过 GitHub OAuth 以读者身份发布）。若需要匿名留言，
得换成 Artalk / Waline 这类自建方案。

**匹配规则**：`mapping: "pathname"` 表示每篇文章对应一个 Discussion，标题就是文章路径
（如 `/blog/tdd/`）。文章 URL 必须保持稳定，否则会对应不上已有的 Discussion。

**旧评论**：Disqus 上的历史评论**不做迁移**，评论区从零开始。
配置里的 `disqus` 段和 `src/components/Disqus.astro` 仍然保留，
想换回去只要把 `comments.provider` 改回 `"disqus"`。

如果哪天想找回旧数据，`scripts/disqus-threads.mjs` 还能用（需要 Disqus 的 public key），
它会列出这个站点下的全部线程和评论数。

## URL 约定

| 路径 | 说明 |
| --- | --- |
| `/` | 首页，列出最新 10 篇 |
| `/blog/` | 文章列表第 1 页 |
| `/blog/page/N/` | 文章列表第 N 页（每页 10 篇） |
| `/blog/<slug>/` | 单篇文章 |
| `/blog/categories/<cat>/` | 分类页，列出该分类全部文章（不分页） |
| `/blog/categories/<cat>/atom.xml` | 分类订阅源（最近 5 篇） |
| `/blog/archives/` | 按年月分组的归档 |
| `/about/` | 关于页 |
| `/atom.xml` | 全站订阅源（Atom 1.0，最近 20 篇，`<content>` 含全文） |
| `/sitemap-index.xml` | sitemap |
| `/search/` | Pagefind 站内搜索 |
| `/images/`、`/assets/` | 静态资源，直接放行 `public/` |

所有路径都是「目录式」（`xxx/index.html`），服务器需把无尾斜杠请求 301 到带尾斜杠。

## 部署

仓库 `halida/halida.github.com` 的分支约定：

| 分支 | 内容 |
| --- | --- |
| `source` | 本项目源码 |
| `master` | 构建产物，GitHub Pages 从这里发布 |

本地一键发布（构建 → 替换 master 内容 → 强推）：

```bash
scripts/publish.sh            # 构建并推送
scripts/publish.sh --no-push  # 只构建并提交，不推送
```

工作区常驻 `source` 分支（源码）。发布时脚本用 `git worktree` 临时检出 `master`，
把 `dist/` 复制进去再强推——源码树不会被动过，两个分支的内容互不干扰。

Git over SSH 在本机会因系统级 `ssh_config` 权限异常而失败，脚本用
`GIT_SSH_COMMAND="ssh -F /dev/null"` 绕过。

## 校验脚本

```bash
python3 scripts/verify-urls.py     # 站点 URL 全量清单核对
python3 scripts/verify-content.py   # 文章正文与图片逐篇核对
```

两个脚本以仓库里保留的历史分支（`origin/pages-legacy` 存旧渲染产物，
`origin/octopress-legacy` 存旧 Markdown 源码）为基准，用于确认站点内容没有意外漂移。
基准分支可用环境变量 `BASELINE_BRANCH` / `SOURCE_BRANCH` 覆盖。

## 当前限制

- 动态 OG 图已关闭（逐篇生成 Satori 图片会显著拖慢构建），目前用站点默认图。
- 订阅源在构建后生成，`npm run dev` 期间没有 `/atom.xml`。
- Pagefind 对中文不做词干化，搜索不做同义词归并。
- Giscus 要求读者有 GitHub 账号：评论通过 OAuth 以读者身份发布，**不支持匿名留言**。
- 评论区不显示评论数：Giscus 没有可用的计数接口，卡片上只有「评论」链接。
