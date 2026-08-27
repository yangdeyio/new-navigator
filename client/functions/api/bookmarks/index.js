import { json } from '../../lib/auth.js'

const GROUPED_EMPTY = {
  document: [],
  blog: [],
  design: [],
  video: [],
  entertainment: []
}

export async function onRequestGet(context) {
  const userId = context.data.user.sub
  const { results } = await context.env.DB.prepare(
    'SELECT id, category, href, value FROM bookmarks WHERE user_id = ? ORDER BY category, sort DESC, id DESC'
  )
    .bind(userId)
    .all()

  const grouped = { ...GROUPED_EMPTY }
  for (const row of results) {
    if (!(row.category in grouped)) grouped[row.category] = []
    grouped[row.category].push({ id: row.id, href: row.href, value: row.value })
  }
  return json({ bookmarks: grouped })
}

export async function onRequestPost(context) {
  const { request } = context
  const userId = context.data.user.sub

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const category = String(body.category || '').trim()
  const href = String(body.href || '').trim()
  const value = String(body.value || '').trim()

  if (!category || category.length > 32) return json({ error: '分类无效' }, 400)
  if (!/^https?:\/\/.+/.test(href) || href.length > 2048) return json({ error: '网址无效' }, 400)
  if (!value || value.length > 50) return json({ error: '名称需为 1-50 个字符' }, 400)

  const row = await context.env.DB
    .prepare(
      `INSERT INTO bookmarks (user_id, category, href, value, sort)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(sort), 0) + 1 FROM bookmarks WHERE user_id = ? AND category = ?))
       RETURNING id`
    )
    .bind(userId, category, href, value, userId, category)
    .first()

  return json({ bookmark: { id: row.id, href, value } }, 201)
}
