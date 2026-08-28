-- 登录/注册速率限制：按 key（login:用户名 / register:用户名）记录滑动窗口内的失败次数
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_attempts_key ON auth_attempts(key);
