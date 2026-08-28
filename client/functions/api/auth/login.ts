import { verifyPassword, signJwt, sessionCookie, json } from '../../lib/auth.ts'
import { checkAttempt, recordFailure, resetAttempts, LOGIN_RATE_LIMIT } from '../../lib/rateLimit.ts'

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  const { request, env } = context

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const username = String(body.username || '').trim()
  const password = String(body.password || '')
  if (!username || !password) return json({ error: '用户名和密码不能为空' }, 400)

  // 限流必须在 PBKDF2 验证之前：超限时不再跑昂贵的哈希，避免 CPU 消耗型 DoS
  const key = `login:${username}`
  const rate = await checkAttempt(env.DB, key, LOGIN_RATE_LIMIT)
  if (!rate.allowed) {
    return json({ error: '尝试次数过多，请稍后再试' }, 429, { 'Retry-After': String(rate.retryAfterSeconds) })
  }

  const user = await env.DB
    .prepare('SELECT id, username, password_hash, salt FROM users WHERE username = ?')
    .bind(username)
    .first<{ id: number; username: string; password_hash: string; salt: string }>()

  if (!user || !(await verifyPassword(password, user.password_hash, user.salt))) {
    await recordFailure(env.DB, key, LOGIN_RATE_LIMIT)
    return json({ error: '用户名或密码错误' }, 401)
  }

  await resetAttempts(env.DB, key)
  const token = await signJwt({ sub: user.id, username: user.username }, env.JWT_SECRET)
  return json(
    { user: { id: user.id, username: user.username } },
    200,
    { 'Set-Cookie': sessionCookie(token) }
  )
}
