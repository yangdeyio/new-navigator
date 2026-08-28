import { json } from '../../lib/auth.js'
import { validateBookmark } from '../../lib/bookmarks.js'

const MAX_IMPORT = 2000

export async function onRequestPost(context) {
  const { request, env } = context
  const userId = context.data.user.sub

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const items = Array.isArray(body.bookmarks) ? body.bookmarks : []
  if (items.length === 0) return json({ error: '没有可导入的书签' }, 400)
  if (items.length > MAX_IMPORT) return json({ error: `单次最多导入 ${MAX_IMPORT} 条` }, 400)

  const rows = []
  for (const item of items) {
    const bookmark = {
      category: String(item.category || '').trim(),
      href: String(item.href || '').trim(),
      value: String(item.value || '').trim()
    }
    const error = validateBookmark(bookmark)
    if (error) return json({ error: `「${bookmark.value || bookmark.href || '未知项'}」${error}` }, 400)
    rows.push(bookmark)
  }

  // 先取每个分类当前的 max(sort)，在 JS 侧编号后批量插入，避免批内子查询读到旧值
  const { results } = await env.DB.prepare(
    'SELECT category, COALESCE(MAX(sort), 0) AS max_sort FROM bookmarks WHERE user_id = ? GROUP BY category'
  )
    .bind(userId)
    .all()
  const counters = Object.fromEntries(results.map((row) => [row.category, row.max_sort]))
  for (const row of results) counters[row.category] = row.max_sort

  const stmt = env.DB.prepare(
    'INSERT INTO bookmarks (user_id, category, href, value, sort) VALUES (?, ?, ?, ?, ?)'
  )
  await env.DB.batch(
    rows.map((row) => {
      counters[row.category] = (counters[row.category] || 0) + 1
      return stmt.bind(userId, row.category, row.href, row.value, counters[row.category])
    })
  )

  return json({ imported: rows.length })
}
