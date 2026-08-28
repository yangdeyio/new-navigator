import { json } from '../../lib/auth.ts'

const MAX_CONTENT_LENGTH = 500

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

  const updates: Record<string, string | number> = {}
  if (body.content !== undefined) {
    const content = String(body.content).trim()
    if (!content) return json({ error: '内容不能为空' }, 400)
    if (content.length > MAX_CONTENT_LENGTH) return json({ error: `日志最长 ${MAX_CONTENT_LENGTH} 字` }, 400)
    updates.content = content
  }
  if (body.is_done !== undefined) {
    updates.is_done = body.is_done ? 1 : 0
  }
  if (Object.keys(updates).length === 0) return json({ error: '没有可更新的字段' }, 400)

  const entries = Object.entries(updates)
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const result = await env.DB.prepare(
    `UPDATE worklogs SET ${setClause}, updated_at = datetime('now') WHERE id = ? AND user_id = ?`
  )
    .bind(...entries.map(([, v]) => v), id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '日志不存在' }, 404)
  const row = await env.DB.prepare(
    'SELECT id, content, is_done, created_at, updated_at FROM worklogs WHERE id = ? AND user_id = ?'
  )
    .bind(id, userId)
    .first()
  return json({ worklog: row })
}

export async function onRequestDelete(context: HandlerContext): Promise<Response> {
  const { env, data, params } = context
  const userId = data.user.sub
  const id = Number(params.id)

  const result = await env.DB
    .prepare('DELETE FROM worklogs WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '日志不存在' }, 404)
  return json({ ok: true })
}
