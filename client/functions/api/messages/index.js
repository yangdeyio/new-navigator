import { json } from '../../lib/auth.js'

const MAX_CONTENT_LENGTH = 1000

export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare(
    `SELECT m.id, m.content, m.created_at, u.username
     FROM messages m JOIN users u ON u.id = m.user_id
     ORDER BY m.id DESC LIMIT 200`
  ).all()
  return json({ messages: results })
}

export async function onRequestPost(context) {
  const { request, env, data } = context
  const userId = data.user.sub

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const content = String(body.content || '').trim()
  if (!content) return json({ error: '内容不能为空' }, 400)
  if (content.length > MAX_CONTENT_LENGTH) {
    return json({ error: `留言最长 ${MAX_CONTENT_LENGTH} 字` }, 400)
  }

  const row = await env.DB
    .prepare('INSERT INTO messages (user_id, content) VALUES (?, ?) RETURNING id, created_at')
    .bind(userId, content)
    .first()

  return json(
    { message: { id: row.id, content, created_at: row.created_at, username: data.user.username } },
    201
  )
}
