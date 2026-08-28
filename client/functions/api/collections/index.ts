import { json } from '../../lib/auth.ts'
import { isValidHref } from '../../lib/bookmarks.ts'

const MAX_TITLE_LENGTH = 120
const MAX_NOTE_LENGTH = 500

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  const userId = context.data.user.sub
  const { results } = await context.env.DB.prepare(
    'SELECT id, href, title, note, is_read, created_at FROM collections WHERE user_id = ? ORDER BY is_read ASC, id DESC'
  )
    .bind(userId)
    .all()
  return json({ collections: results })
}

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  const { request, env, data } = context
  const userId = data.user.sub

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const href = String(body.href || '').trim()
  const title = String(body.title || '').trim()
  const note = body.note ? String(body.note).trim() : ''

  if (!isValidHref(href)) return json({ error: '网址无效' }, 400)
  if (!title || title.length > MAX_TITLE_LENGTH) return json({ error: `标题需为 1-${MAX_TITLE_LENGTH} 个字符` }, 400)
  if (note.length > MAX_NOTE_LENGTH) return json({ error: `备注最长 ${MAX_NOTE_LENGTH} 字` }, 400)

  const row = await env.DB
    .prepare(
      'INSERT INTO collections (user_id, href, title, note) VALUES (?, ?, ?, ?) RETURNING id, href, title, note, is_read, created_at'
    )
    .bind(userId, href, title, note)
    .first()

  return json({ collection: row }, 201)
}
