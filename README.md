# TJSC1213.github.io

个人博客主页 —— 纯手写 HTML / CSS / JavaScript，托管在 GitHub Pages。

- **线上地址**：<https://tjsc1213.github.io>
- **仓库地址**：<https://github.com/TJSC1213/TJSC1213.github.io>
- **零构建、零依赖**：没有静态站点生成器，没有 npm，不加载任何 CDN 或网络字体

---

## 目录结构

```
.
├── .nojekyll                     # 让 GitHub Pages 跳过 Jekyll 处理，必须有
├── .gitignore
├── index.html                    # 首页：整页只有一个大字红标题的展示页
├── 404.html                      # 自定义 404
├── about/index.html              # 关于
├── blog/
│   ├── index.html                # 文章列表
│   ├── hello-world/index.html            # 示例文章 1
│   └── static-site-i18n/index.html       # 示例文章 2（含代码高亮示例）
├── projects/index.html           # 项目
└── assets/
    ├── favicon.svg
    ├── og-cover.png              # 分享到 QQ / 微信时卡片右侧的缩略图（512×512）
    ├── css/style.css             # 全部样式 + 设计令牌（颜色 / 字体 / 尺寸）
    └── js/
        ├── i18n.js               # 中英双语切换
        ├── highlight.js          # 语法高亮
        └── main.js               # 主题切换、移动菜单、复制按钮等交互
```

除首页外的每个页面都是**独立完整的 HTML**（`head`、导航栏、页脚都各自带一份）。这是刻意的取舍：没有构建步骤，但新增页面时需要复制一份完整文件当模板。

### 关于首页

`index.html` 是个特例：整页只有一个居中的大字红标题 `♥我爱你许下愿♥`，**没有导航栏、没有页脚、也不加载任何脚本**。因此从首页出发点不进站内其它页面——请直接访问 `/blog/`、`/projects/`、`/about/`，或从这些页面顶部的导航栏走。

首页的样式写在它自己的 `<style>` 里（`.wish` 类），不受 `assets/css/style.css` 的主题变量影响：

- 字号 `clamp(2rem, 9vw, 8rem)`，随视口缩放
- 颜色固定为纯红 `#ff0000`，背景固定为白色
- 无论系统是深色还是浅色，首页都不跟随

想改文案就改 `<h1 class="wish">` 里的文字和 `<title>`；想改大小或颜色就改同一文件 `<style>` 里的 `font-size` / `color`。

---

## 本地预览

页面里所有链接都用了根路径（`/blog/`、`/assets/...`），所以**直接双击 HTML 文件打开是看不到样式的**，需要起一个本地静态服务器：

```bash
cd githubBlog
python -m http.server 8000
```

然后访问 <http://127.0.0.1:8000/>。

---

## 新增一篇文章

1. **建目录**：`blog/<文章slug>/index.html`（slug 建议用英文短横线，例如 `my-first-tool`）。
2. **复制模板**：把 `blog/hello-world/index.html` 整个复制过去。
3. **改这几处**：
   - `<title>` 的 `data-zh` / `data-en` 和默认文本
   - `<meta name="description">`
   - `.page-header` 里的标题、`<time datetime="...">` 日期、阅读时长、标签
   - `<article class="prose">` 里的正文
   - `<head>` 末尾的 Open Graph 标签（`og:title` / `og:description` / `og:url`，见下文「分享到 QQ / 微信时的卡片」）
4. **挂上链接**：在 `blog/index.html` 的文章列表里加一条（新的放最前面）。
5. **检查双语**：所有可见文案都要同时写 `data-zh` 和 `data-en`。

> 首页没有文章列表，所以新增文章时不用动 `index.html`。

### 双语写法

中文文本直接写在标签里，同时作为**禁用 JavaScript 时的默认显示**：

```html
<h1 data-zh="你好，世界" data-en="Hello, World">你好，世界</h1>
```

支持的三种形式：

| 写法 | 作用 |
| --- | --- |
| `data-zh` / `data-en` | 替换元素的文本 |
| `data-zh-html` / `data-en-html` | 替换元素内部 HTML（值里可以带标签） |
| `data-zh-<属性名>` / `data-en-<属性名>` | 替换任意属性，例如 `data-zh-aria-label` |

> ⚠️ 中英两边的属性必须成对出现。只写 `data-zh` 不写 `data-en`，切到英文时就会残留中文。

### 插入代码块

```html
<pre><code class="language-js">const a = 1;</code></pre>
```

记得把代码里的 `<`、`>`、`&` 转义成 `&lt;`、`&gt;`、`&amp;`。

已支持的语言：`js` `ts` `python` `bash` `c` `cpp` `json` `yaml` `css` `html`（另有若干别名，见 `assets/js/highlight.js` 里的 `ALIAS`）。未识别的语言会原样显示。

---

## 部署到 GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:TJSC1213/TJSC1213.github.io.git
git push -u origin main
```

仓库名**必须**是 `TJSC1213.github.io`，这样才会发布到 `https://tjsc1213.github.io/` 根路径（页面里的 `/assets/`、`/blog/` 等绝对路径依赖这一点）。

推送后到仓库 **Settings → Pages**，把 Source 设为 `Deploy from a branch`，分支选 `main`、目录选 `/ (root)`。首次生效通常需要一两分钟。

`.nojekyll` 文件不能删：GitHub Pages 默认会跑一遍 Jekyll，而 Jekyll 会忽略下划线开头的文件。

---

## 分享到 QQ / 微信时的卡片

把链接发到 QQ 群、微信或 Twitter 时，卡片上的标题、描述和缩略图**不由页面正文决定**，而是由页面 `<head>` 里的 Open Graph 标签决定。7 个页面都已带上这套标签：

```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="TJSC1213" />
<meta property="og:title" content="♥我爱你许下愿♥" />
<meta property="og:description" content="..." />
<meta property="og:url" content="https://tjsc1213.github.io/" />
<meta property="og:image" content="https://tjsc1213.github.io/assets/og-cover.png" />
<meta property="og:image:width" content="512" />
<meta property="og:image:height" content="512" />
<meta property="og:locale" content="zh_CN" />
```

其中 `og:title` 等于各页面自己的 `<title>` 文本，`og:description` 等于 `<meta name="description">`。想改分享出去显示成什么，就改这两个。

### 三个硬性要求

1. **必须是公网地址。** 爬虫在腾讯 / 微信自己的服务器上抓取页面，`localhost`、`127.0.0.1` 都抓不到——所以这个效果**只能在部署之后才能验证**。
2. **`og:image` 必须是绝对 URL**（带 `https://` 和域名），相对路径不生效。
3. **缩略图建议 1:1 且不小于 300×300。** 当前用的是 `assets/og-cover.png`（512×512）。想换成自己的图，直接替换这个同名文件即可，格式用 PNG 或 JPG——**别用 SVG**，多数平台不解析。

### 改了之后不生效？

QQ 按 URL 缓存抓取结果。改完标签或换完图片后，**一段时间内分享出来的仍是旧卡片**，等缓存过期，或换个路径试。

### 换域名时要改的地方

`og:url` / `og:image` / `twitter:image` 里写死了 `https://tjsc1213.github.io`。以后如果绑定自定义域名，7 个文件里的这几处都要跟着换，否则卡片缩略图会取不到。

---

## 需要你替换的占位内容

这些地方目前是占位文案，替换成你自己的：

- `about/index.html` —— 邮箱 `you@example.com`、工作经历时间线、个人简介段落
- `projects/index.html` —— 除了 `githubBlog` 之外的项目卡片

## 其他可自定义的地方

- **首页标题**：`index.html` 里 `<h1 class="wish">` 的文字，以及同文件 `<style>` 里的 `font-size` 和 `color`
- **分享缩略图**：替换 `assets/og-cover.png`（保持 1:1 正方形、≥300×300）
- **分享卡片的标题与描述**：各页面 `<head>` 里的 `og:title` / `og:description`
- **主题色**：`assets/css/style.css` 顶部的 `--accent`（浅色）与 `html[data-theme="dark"]` 里的 `--accent`（深色）
- **字体**：同文件的 `--font-sans` / `--font-mono`，默认走系统字体栈
- **默认语言**：`assets/js/i18n.js` 里的 `DEFAULT_LANG`（当前为 `zh`）
- **社交链接**：各页面页脚 `.footer-links` 与 `about/index.html` 的 `.contact-list`

---

## English

A personal blog built with hand-written HTML, CSS and vanilla JavaScript — no static site generator, no build step, no CDN. Hosted on GitHub Pages at <https://tjsc1213.github.io>.

The home page (`index.html`) is a deliberate exception: it is a standalone display page holding nothing but one large centred red headline, with no navigation, footer or scripts — so reach the rest of the site by visiting `/blog/`, `/projects/` or `/about/` directly.

On the other pages, bilingual switching is attribute-driven (`data-zh` / `data-en`), syntax highlighting is a ~60-line regex tokenizer in `assets/js/highlight.js`, and dark mode is applied by a synchronous inline script in each page's `head` so there is no flash on load.

Open Graph tags in every page's `head` drive the link preview cards shown when a URL is shared to QQ, WeChat or Twitter. They need a public HTTPS URL to work, so they can only be verified after deployment.

To preview locally, run `python -m http.server 8000` from the repository root — absolute paths mean opening the files directly with `file://` will not render correctly.
