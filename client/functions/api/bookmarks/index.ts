import { json } from '../../lib/auth.ts'
import { validateBookmark } from '../../lib/bookmarks.ts'

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  const userId = context.data.user.sub
  const { results } = await context.env.DB.prepare(
    'SELECT id, category, href, value FROM bookmarks WHERE user_id = ? ORDER BY category, sort DESC, id DESC'
  )
    .bind(userId)
    .all<{ id: number; category: string; href: string; value: string }>()

  // 分类是动态的，只返回实际存在的分组
  const grouped: Record<string, { id: number; href: string; value: string }[]> = {}
  for (const row of results) {
    if (!(row.category in grouped)) grouped[row.category] = []
    grouped[row.category].push({ id: row.id, href: row.href, value: row.value })
  }
  return json({ bookmarks: grouped })
}

export async function onRequestPost(context: HandlerContext): Promise<Response> {
  const { request } = context
  const userId = context.data.user.sub

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const category = String(body.category || '').trim()
  const href = String(body.href || '').trim()
  const value = String(body.value || '').trim()

  const error = validateBookmark({ category, href, value })
  if (error) return json({ error }, 400)

  const row = await context.env.DB
    .prepare(
      `INSERT INTO bookmarks (user_id, category, href, value, sort)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM bookmarks WHERE user_id = ? AND category = ?))
       RETURNING id`
    )
    .bind(userId, category, href, value, userId, category)
    .first<{ id: number }>()

  return json({ bookmark: { id: row!.id, href, value } }, 201)
}
