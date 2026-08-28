import { json } from '../../lib/auth.ts'
import { MAX_VALUE_LENGTH, isValidHref } from '../../lib/bookmarks.ts'

export async function onRequestPut(context: HandlerContext): Promise<Response> {
  const { request, env, data, params } = context
  const userId = data.user.sub
  const id = Number(params.id)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const href = String(body.href || '').trim()
  const value = String(body.value || '').trim()
  if (!isValidHref(href)) return json({ error: '网址无效' }, 400)
  if (!value || value.length > MAX_VALUE_LENGTH) return json({ error: `名称需为 1-${MAX_VALUE_LENGTH} 个字符` }, 400)

  const result = await env.DB
    .prepare('UPDATE bookmarks SET href = ?, value = ? WHERE id = ? AND user_id = ?')
    .bind(href, value, id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '书签不存在' }, 404)
  return json({ ok: true })
}

export async function onRequestDelete(context: HandlerContext): Promise<Response> {
  const { env, data, params } = context
  const userId = data.user.sub
  const id = Number(params.id)

  const result = await env.DB
    .prepare('DELETE FROM bookmarks WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '书签不存在' }, 404)
  return json({ ok: true })
}
