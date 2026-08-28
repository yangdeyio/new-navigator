// 基于 D1 的固定窗口速率限制，用于登录/注册防暴力破解。
// 状态存 auth_attempts 表；窗口期与上限由调用方传入。

export interface RateLimitConfig {
  windowSeconds: number
  maxAttempts: number
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

// 读取当前状态：窗口已过期则计数归零。返回是否仍允许尝试，以及需要等待的秒数。
export async function checkAttempt(
  db: D1Database,
  key: string,
  { windowSeconds, maxAttempts }: RateLimitConfig
): Promise<RateLimitResult> {
  const now = Math.floor(Date.now() / 1000)
  const row = await db
    .prepare('SELECT attempts, window_started_at FROM auth_attempts WHERE key = ?')
    .bind(key)
    .first<{ attempts: number; window_started_at: number }>()

  if (!row) return { allowed: true, retryAfterSeconds: 0 }

  if (now - row.window_started_at >= windowSeconds) {
    // 窗口已过期：视为新窗口，重置为 0
    await db.prepare('DELETE FROM auth_attempts WHERE key = ?').bind(key).run()
    return { allowed: true, retryAfterSeconds: 0 }
  }

  if (row.attempts >= maxAttempts) {
    const waited = now - row.window_started_at
    return { allowed: false, retryAfterSeconds: Math.max(0, windowSeconds - waited) }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

// 记录一次失败：窗口内计数 +1；窗口已过期则重新开窗。
export async function recordFailure(
  db: D1Database,
  key: string,
  { windowSeconds }: RateLimitConfig
): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const row = await db
    .prepare('SELECT attempts, window_started_at FROM auth_attempts WHERE key = ?')
    .bind(key)
    .first<{ attempts: number; window_started_at: number }>()

  const windowStartedAt = !row || now - row.window_started_at >= windowSeconds ? now : row.window_started_at
  const attempts = (row?.attempts || 0) + 1

  await db
    .prepare(
      `INSERT INTO auth_attempts (key, attempts, window_started_at) VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET attempts = ?, window_started_at = ?`
    )
    .bind(key, attempts, windowStartedAt, attempts, windowStartedAt)
    .run()
}

// 成功验证后清空该 key 的计数，让已锁定的账号登录后立即恢复正常。
export async function resetAttempts(db: D1Database, key: string): Promise<void> {
  await db.prepare('DELETE FROM auth_attempts WHERE key = ?').bind(key).run()
}

export const LOGIN_RATE_LIMIT: RateLimitConfig = { windowSeconds: 900, maxAttempts: 5 }
export const REGISTER_RATE_LIMIT: RateLimitConfig = { windowSeconds: 900, maxAttempts: 5 }
