import { json } from '../../lib/auth.ts'
import { isValidHref } from '../../lib/bookmarks.ts'

const MAX_TITLE_LENGTH = 120
const MAX_NOTE_LENGTH = 500

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

  const hasHref = body.href !== undefined
  const hasTitle = body.title !== undefined
  const hasNote = body.note !== undefined
  const hasIsRead = body.is_read !== undefined

  const href = hasHref ? String(body.href).trim() : ''
  const title = hasTitle ? String(body.title).trim() : ''
  const note = hasNote ? String(body.note).trim() : ''
  const isRead = hasIsRead ? (body.is_read ? 1 : 0) : undefined

  if (hasHref && !isValidHref(href)) return json({ error: '网址无效' }, 400)
  if (hasTitle && (!title || title.length > MAX_TITLE_LENGTH)) {
    return json({ error: `标题需为 1-${MAX_TITLE_LENGTH} 个字符` }, 400)
  }
  if (hasNote && note.length > MAX_NOTE_LENGTH) {
    return json({ error: `备注最长 ${MAX_NOTE_LENGTH} 字` }, 400)
  }

  const updates: Record<string, string | number> = {}
  if (hasHref) updates.href = href
  if (hasTitle) updates.title = title
  if (hasNote) updates.note = note
  if (hasIsRead) updates.is_read = isRead as number
  if (Object.keys(updates).length === 0) return json({ error: '没有可更新的字段' }, 400)

  const entries = Object.entries(updates)
  const setClause = entries.map(([k]) => `${k} = ?`).join(', ')
  const result = await env.DB.prepare(
    `UPDATE collections SET ${setClause} WHERE id = ? AND user_id = ?`
  )
    .bind(...entries.map(([, v]) => v), id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '收藏项不存在' }, 404)
  const row = await env.DB.prepare(
    'SELECT id, href, title, note, is_read, created_at FROM collections WHERE id = ? AND user_id = ?'
  )
    .bind(id, userId)
    .first()
  return json({ collection: row })
}

export async function onRequestDelete(context: HandlerContext): Promise<Response> {
  const { env, data, params } = context
  const userId = data.user.sub
  const id = Number(params.id)

  const result = await env.DB
    .prepare('DELETE FROM collections WHERE id = ? AND user_id = ?')
    .bind(id, userId)
    .run()

  if (!result.meta.changes) return json({ error: '收藏项不存在' }, 404)
  return json({ ok: true })
}
