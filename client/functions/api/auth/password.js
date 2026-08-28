import { verifyPassword, hashPassword, json } from '../../lib/auth.js'

export async function onRequestPost(context) {
  const { request, env } = context
  const userId = context.data.user.sub

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')
  if (!currentPassword || !newPassword) return json({ error: '密码不能为空' }, 400)
  if (newPassword.length < 8) return json({ error: '新密码至少 8 位' }, 400)

  const user = await env.DB
    .prepare('SELECT password_hash, salt FROM users WHERE id = ?')
    .bind(userId)
    .first()
  if (!user || !(await verifyPassword(currentPassword, user.password_hash, user.salt))) {
    return json({ error: '当前密码错误' }, 401)
  }

  const { hash, salt } = await hashPassword(newPassword)
  await env.DB
    .prepare('UPDATE users SET password_hash = ?, salt = ? WHERE id = ?')
    .bind(hash, salt, userId)
    .run()

  return json({ ok: true })
}
