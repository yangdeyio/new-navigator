import { hashPassword, signJwt, sessionCookie, json } from '../../lib/auth.ts'
import { checkAttempt, recordFailure, resetAttempts, REGISTER_RATE_LIMIT } from '../../lib/rateLimit.ts'

const USERNAME_RE = /^[a-zA-Z0-9_-]{2,24}$/

async function verifyTurnstile(secretKey: string, token: unknown): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: secretKey, response: String(token || '') })
  })
  const data = (await res.json()) as { success?: boolean }
  return data.success === true
}

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  const { request, env } = context

  if (env.ALLOW_REGISTER !== '1') return json({ error: '注册未开放' }, 403)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const username = String(body.username || '').trim()
  const password = String(body.password || '')

  // 限流放在 Turnstile 之后、哈希之前：超限时不再跑昂贵的 PBKDF2
  const key = `register:${username}`
  const rate = await checkAttempt(env.DB, key, REGISTER_RATE_LIMIT)
  if (!rate.allowed) {
    return json({ error: '尝试次数过多，请稍后再试' }, 429, { 'Retry-After': String(rate.retryAfterSeconds) })
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken)
    if (!ok) return json({ error: '人机验证失败' }, 403)
  }

  if (!USERNAME_RE.test(username)) {
    return json({ error: '用户名需为 2-24 位字母、数字、下划线或中划线' }, 400)
  }
  if (password.length < 8) return json({ error: '密码至少 8 位' }, 400)

  const { hash, salt } = await hashPassword(password)
  try {
    const result = await env.DB
      .prepare('INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?) RETURNING id')
      .bind(username, hash, salt)
      .first<{ id: number }>()
    await resetAttempts(env.DB, key)
    const token = await signJwt({ sub: result!.id, username }, env.JWT_SECRET)
    return json(
      { user: { id: result!.id, username } },
      200,
      { 'Set-Cookie': sessionCookie(token) }
    )
  } catch {
    await recordFailure(env.DB, key, REGISTER_RATE_LIMIT)
    return json({ error: '用户名已被占用' }, 409)
  }
}
