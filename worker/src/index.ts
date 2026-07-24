export interface Env {
  DB: D1Database
  ALLOWED_ORIGIN: string
  IP_HASH_SALT: string
}

interface Message {
  id: string
  nickname: string
  content: string
  created_at: string
}

const NICKNAME_MAX = 50
const CONTENT_MAX = 500
const DEFAULT_PAGE_SIZE = 10
const MAX_PAGE_SIZE = 50
const RATE_LIMIT_WINDOW_MS = 20_000

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

function json(data: unknown, status: number, env: Env): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(env) },
  })
}

async function hashIp(ip: string, salt: string): Promise<string> {
  const bytes = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

async function handleGetMessages(url: URL, env: Env): Promise<Response> {
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number(url.searchParams.get('limit')) || DEFAULT_PAGE_SIZE))
  const offset = Math.max(0, Number(url.searchParams.get('offset')) || 0)

  const { results } = await env.DB.prepare(
    'SELECT id, nickname, content, created_at FROM messages ORDER BY created_at DESC, id DESC LIMIT ? OFFSET ?',
  ).bind(limit, offset).all<Message>()

  return json(results, 200, env)
}

async function handlePostMessage(request: Request, env: Env): Promise<Response> {
  let body: { nickname?: unknown; content?: unknown; website?: unknown }
  try {
    body = await request.json()
  } catch {
    return json({ error: '请求格式错误' }, 400, env)
  }

  const nickname = typeof body.nickname === 'string' ? body.nickname.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  // 蜜罐字段：真实用户看不到这个输入框，机器人脚本通常会无脑填所有字段
  const honeypot = typeof body.website === 'string' ? body.website.trim() : ''

  if (honeypot) return json({ error: '提交失败' }, 400, env)
  if (!nickname) return json({ error: '请输入昵称' }, 400, env)
  if (nickname.length > NICKNAME_MAX) return json({ error: `昵称最多 ${NICKNAME_MAX} 字` }, 400, env)
  if (!content) return json({ error: '请输入留言内容' }, 400, env)
  if (content.length > CONTENT_MAX) return json({ error: `留言最多 ${CONTENT_MAX} 字` }, 400, env)

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  const ipHash = await hashIp(ip, env.IP_HASH_SALT)

  const rateLimitRow = await env.DB.prepare(
    'SELECT last_submitted_at FROM rate_limits WHERE ip_hash = ?',
  ).bind(ipHash).first<{ last_submitted_at: number }>()

  if (rateLimitRow && Date.now() - rateLimitRow.last_submitted_at < RATE_LIMIT_WINDOW_MS) {
    return json({ error: '提交太频繁，请稍等再试' }, 429, env)
  }

  const message: Message = {
    id: crypto.randomUUID(),
    nickname,
    content,
    created_at: new Date().toISOString(),
  }

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO messages (id, nickname, content, created_at) VALUES (?, ?, ?, ?)',
    ).bind(message.id, message.nickname, message.content, message.created_at),
    env.DB.prepare(
      'INSERT INTO rate_limits (ip_hash, last_submitted_at) VALUES (?, ?) ' +
      'ON CONFLICT(ip_hash) DO UPDATE SET last_submitted_at = excluded.last_submitted_at',
    ).bind(ipHash, Date.now()),
  ])

  return json({ message }, 201, env)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(env) })
    }

    if (url.pathname === '/messages') {
      try {
        if (request.method === 'GET') return await handleGetMessages(url, env)
        if (request.method === 'POST') return await handlePostMessage(request, env)
      } catch (err) {
        console.error(err)
        return json({ error: '服务器错误' }, 500, env)
      }
    }

    return json({ error: 'Not found' }, 404, env)
  },
}
