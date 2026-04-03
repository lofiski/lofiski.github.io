# lofiski.github.io

个人博客。极简复古风，默认暗色。

**技术栈：** Vue 3 · Vite · TypeScript · unplugin-vue-markdown · Shiki

---

## 本地开发

```bash
npm install
npm run dev
```

## 写文章

在 `posts/` 目录下新建 `.md` 文件，frontmatter 格式：

```yaml
---
title: 文章标题
date: 2024-03-24
description: 一句话摘要（可选）
tags:
  - Vue
  - 随笔
draft: false   # true 则不会出现在列表中
---

正文内容...
```

Markdown 文件会被编译为 Vue SFC，可以在其中直接使用 Vue 组件：

```md
<script setup>
import MyComponent from '@/components/MyComponent.vue'
</script>

<MyComponent />
```

## 添加照片（照片页展示）

1. 将原始照片拖入 `photos/` 目录（支持 jpg / png / webp）
2. 提交时 pre-commit hook 自动处理，**无需手动操作**；也可以手动运行：

```bash
npm run photos
```

脚本会自动：读取 EXIF 拍摄时间 → 去除所有元数据（含 GPS）→ 压缩 → 重命名为 `p-{date}.jpg` → 输出到 `public/photos/` → 更新 `src/data/photos.json`。

原始文件在 `.gitignore` 中排除，仅处理后的 `p-` 前缀文件会被提交。

## 添加文章/项目图片

适用于在 Markdown 或 Vue 组件中引用的图片（不在照片页展示）。

1. 将图片拖入 `imgs/` 目录（支持 jpg / png / webp）
2. 提交时自动处理；也可以手动运行：

```bash
npm run imgs
```

处理完成后引用方式：

```md
<!-- Markdown 中 -->
![图片描述](/imgs/my-image.jpg)
```

```vue
<!-- Vue 组件中 -->
<img src="/imgs/my-image.jpg" alt="图片描述" />
```

脚本会去除所有元数据并压缩，输出到 `public/imgs/`，**文件名保持不变**。原始文件在 `.gitignore` 中排除，不会被提交。

## 个性化

| 文件 | 内容 |
|------|------|
| `src/config/site.ts` | 姓名、简介、GitHub / X / Email |
| `src/data/projects.ts` | 项目列表 |
| `public/avatar.jpg` | 头像 |

## 部署

推送到 `main` 分支后 GitHub Actions 自动构建并部署到 GitHub Pages。

首次需在仓库 **Settings → Pages → Source** 选择 **GitHub Actions**。

也支持直接部署到 Netlify（`netlify.toml` 已配置）。
