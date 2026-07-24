# 留言板 Worker

用 Cloudflare Workers + D1 实现的留言板后端，替代之前老崩的 Supabase 方案。这个目录是独立的项目，不参与博客本体的 GitHub Actions 构建。

## 当前部署状态

- Worker：`https://guestbook-api.airlofi.workers.dev`
- D1 数据库：`guestbook`（database_id 见 `wrangler.toml`）
- 防刷方案：蜜罐隐藏字段（拒绝机器人）+ 按 IP 哈希限制 20 秒内只能提交一次
- 前端 `src/pages/GuestbookPage.vue` 里的 `WORKER_URL` 已指向上面的地址

## 依赖

```bash
cd worker
npm install
```

## 本地开发

```bash
npm run dev              # 启动本地 Worker
npm run db:init:local    # 给本地模拟的 D1 建表（首次需要）
```

本地跑起来后地址通常是 `http://localhost:8787`，临时改一下前端的 `WORKER_URL` 指向它即可联调，不会影响线上数据。

## 改代码后如何重新部署

```bash
npm run deploy
```

如果改了 `schema.sql`（比如加字段），记得也执行一遍：

```bash
npm run db:init:remote
```

`CREATE TABLE IF NOT EXISTS` 是幂等的，不会破坏已有数据。

## 接口说明

- `GET /messages?limit=10&offset=0` — 分页拉取留言，按时间倒序
- `POST /messages` — 提交留言，body 为 `{ nickname, content, website }`
  - `website` 是蜜罐字段，前端里对应一个视觉隐藏的 input，真实用户不会填；填了就直接拒绝
  - 服务端还会校验昵称（≤50字）/ 内容（≤500字）长度，并按 IP 哈希限制提交频率（20 秒一次）

## 从零重新搭建（如果要换账号 / 换项目）

1. `npx wrangler login`
2. `npx wrangler d1 create guestbook`，把返回的 `database_id` 填进 `wrangler.toml`
3. `npm run db:init:remote` 建表
4. `npx wrangler secret put IP_HASH_SALT`，输入任意一段随机字符串（用来给 IP 做哈希，避免明文存储）
5. 确认 `wrangler.toml` 里的 `ALLOWED_ORIGIN` 是你自己的域名
6. `npm run deploy`
7. 把部署输出的 Worker URL 填进 `src/pages/GuestbookPage.vue` 的 `WORKER_URL`

## 如果之后想换成 Turnstile 人机验证

现在用的是蜜罐字段方案，不需要任何额外的 Cloudflare 控制台操作。如果之后垃圾留言变多，想升级成 Turnstile：

1. Cloudflare 控制台 → Turnstile → Add site，拿到 Site Key / Secret Key
2. `npx wrangler secret put TURNSTILE_SECRET_KEY`
3. `worker/src/index.ts` 的 `handlePostMessage` 里加一段调用 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 的校验
4. 前端加载 `https://challenges.cloudflare.com/turnstile/v0/api.js`，渲染 `cf-turnstile` 组件，提交时带上 token

这几步都需要在 Cloudflare 控制台手动创建 widget，无法用代码/CLI 全自动完成。
