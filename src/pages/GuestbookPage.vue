<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { formatDateShort } from '@/utils/format'

const WORKER_URL = 'https://guestbook-api.airlofi.workers.dev'
const PAGE_SIZE = 10

interface Message {
  id: string
  nickname: string
  content: string
  created_at: string
}

const messages = ref<Message[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const fetchError = ref('')
const submitError = ref('')
const submitSuccess = ref(false)
const submitting = ref(false)

const nickname = ref('')
const content = ref('')
// 蜜罐字段：真实用户看不到，机器人脚本通常会填上所有输入框
const website = ref('')

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

async function fetchMessages(offset: number): Promise<Message[]> {
  const res = await fetch(`${WORKER_URL}/messages?limit=${PAGE_SIZE}&offset=${offset}`)
  if (!res.ok) throw new Error('fetch failed')
  return res.json() as Promise<Message[]>
}

async function loadInitial() {
  loading.value = true
  fetchError.value = ''
  try {
    const data = await fetchMessages(0)
    messages.value = data
    hasMore.value = data.length === PAGE_SIZE
  } catch {
    fetchError.value = '留言加载失败，请刷新重试'
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return
  loadingMore.value = true
  try {
    const data = await fetchMessages(messages.value.length)
    messages.value.push(...data)
    hasMore.value = data.length === PAGE_SIZE
  } catch {
    // Stop paging rather than let the observer retry the same failing request forever
    hasMore.value = false
    fetchError.value = '加载更多失败，请刷新重试'
  } finally {
    loadingMore.value = false
  }
}

async function handleSubmit() {
  submitError.value = ''
  submitSuccess.value = false

  const nick = nickname.value.trim()
  const msg = content.value.trim()

  if (!nick) { submitError.value = '请输入昵称'; return }
  if (nick.length > 50) { submitError.value = '昵称最多 50 字'; return }
  if (!msg) { submitError.value = '请输入留言内容'; return }
  if (msg.length > 500) { submitError.value = '留言最多 500 字'; return }

  submitting.value = true
  try {
    const res = await fetch(`${WORKER_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: nick, content: msg, website: website.value }),
    })
    const json = await res.json()
    if (!res.ok) {
      submitError.value = json.error ?? '提交失败'
      return
    }
    messages.value.unshift(json.message as Message)
    nickname.value = ''
    content.value = ''
    submitSuccess.value = true
    setTimeout(() => { submitSuccess.value = false }, 3000)
  } catch {
    submitError.value = '网络错误，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadInitial()
  observer = new IntersectionObserver(
    (entries) => { if (entries[0].isIntersecting) loadMore() },
    { rootMargin: '200px' },
  )
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => { observer?.disconnect() })
</script>

<template>
  <div class="container">
    <div class="page-header">
      <h1 class="page-title">留言板</h1>
      <span v-if="!loading" class="page-count">{{ messages.length }} 条</span>
    </div>

    <!-- 留言表单 -->
    <section class="form-section">
      <h2 class="section-rule">留下留言</h2>
      <form class="guestbook-form" novalidate @submit.prevent="handleSubmit">
        <div class="form-row">
          <label class="form-label" for="gb-nickname">昵称</label>
          <input
            id="gb-nickname"
            v-model="nickname"
            type="text"
            class="input"
            placeholder="你的名字"
            maxlength="50"
            autocomplete="off"
          />
        </div>
        <div class="form-row">
          <label class="form-label" for="gb-content">留言内容</label>
          <textarea
            id="gb-content"
            v-model="content"
            class="input"
            placeholder="写下你想说的话…"
            maxlength="500"
            rows="4"
          />
          <span class="char-count">{{ content.length }}/500</span>
        </div>
        <input
          v-model="website"
          type="text"
          name="website"
          class="honeypot"
          tabindex="-1"
          autocomplete="off"
          aria-hidden="true"
        />
        <div class="form-footer">
          <p v-if="submitError" class="form-msg form-msg--error">{{ submitError }}</p>
          <p v-else-if="submitSuccess" class="form-msg form-msg--ok">留言成功！</p>
          <span v-else />
          <button type="submit" class="submit-btn" :disabled="submitting">
            {{ submitting ? '提交中…' : '提交留言' }}
          </button>
        </div>
      </form>
    </section>

    <!-- 留言列表 -->
    <section>
      <h2 class="section-rule">所有留言</h2>

      <div v-if="loading" class="state-hint">加载中…</div>
      <div v-else-if="fetchError" class="state-hint state-hint--error">{{ fetchError }}</div>
      <p v-else-if="messages.length === 0" class="state-hint">还没有留言，来第一个吧！</p>

      <ul v-else class="message-list">
        <li v-for="msg in messages" :key="msg.id" class="message-card">
          <div class="message-header">
            <span class="message-nick">{{ msg.nickname }}</span>
            <time class="message-time" :datetime="msg.created_at">{{ formatDateShort(msg.created_at) }}</time>
          </div>
          <p class="message-content">{{ msg.content }}</p>
        </li>
      </ul>

      <!-- 懒加载哨兵 -->
      <div ref="sentinel" class="sentinel">
        <span v-if="loadingMore" class="state-hint">加载更多…</span>
        <span v-else-if="!hasMore && messages.length > 0" class="end-hint">— 已到底了 —</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Form ───────────────────────── */
.guestbook-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.char-count {
  align-self: flex-end;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.form-msg {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
}

.form-msg--error { color: var(--danger); }
.form-msg--ok    { color: var(--text-accent); }

.submit-btn {
  padding: var(--space-2) var(--space-5);
  background: var(--accent-subtle);
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-sm);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-accent);
  cursor: pointer;
  transition: background var(--transition), border-color var(--transition), color var(--transition);
}

.submit-btn:hover:not(:disabled) {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--text-invert);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Messages ───────────────────── */
.message-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.message-card {
  padding: var(--space-4) var(--space-5);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition);
}

.message-card:hover {
  border-color: var(--accent-border);
}

.message-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.message-nick {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-accent);
}

.message-time {
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.message-content {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ── States ─────────────────────── */
.sentinel {
  padding: var(--space-8) 0;
  min-height: 1px;
}

.state-hint {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  padding: var(--space-12) 0;
  text-align: center;
}

.state-hint--error { color: var(--danger); }

.end-hint {
  display: block;
  font-family: var(--font-ui);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-align: center;
  letter-spacing: 0.1em;
}
</style>
