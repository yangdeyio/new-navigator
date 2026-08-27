import { json } from '../../lib/auth.js'

export async function onRequestPut(context) {
  const { request, env, data } = context
  const userId = data.user.sub
  const id = Number(context.params.id)

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const href = String(body.href || '').trim()
  const value = String(body.value || '').trim()
  if (!/^https?:\/\/.+/.test(href) || href.length > 2048) return json({ error: '网址无效' }, 400)
  if (!value || value.length > 50) return json({ error: '名称需为 1-50 个字符' }, 400)

  const result = await env.DB
    .prepare('UPDATE bookmarks SET href = ?, value = ? WHERE id = ? AND user_id = ?')
    .bind(href, value, id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '书签不存在' }, 404)
  return json({ ok: true })
}

export async function onRequestDelete(context) {
  const { env, data } = context
  const userId = data.user.sub
  const id = Number(context.params.id)

  const result = await env.DB
    .prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '书签不存在' }, 404)
  return json({ ok: true })
}
