CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);

-- 按 IP 哈希记录最近一次提交时间，用于限制刷屏
CREATE TABLE IF NOT EXISTS rate_limits (
  ip_hash TEXT PRIMARY KEY,
  last_submitted_at INTEGER NOT NULL
);
