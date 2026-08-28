import { json } from '../../lib/auth.ts'

const MAX_CONTENT_LENGTH = 500

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  const userId = context.data.user.sub
  const { results } = await context.env.DB.prepare(
    'SELECT id, content, is_done, created_at FROM worklogs WHERE user_id = ? ORDER BY is_done ASC, id DESC'
  )
    .bind(userId)
    .all()
  return json({ worklogs: results })
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

  const content = String(body.content || '').trim()
  if (!content) return json({ error: '内容不能为空' }, 400)
  if (content.length > MAX_CONTENT_LENGTH) {
    return json({ error: `日志最长 ${MAX_CONTENT_LENGTH} 字` }, 400)
  }

  const row = await env.DB
    .prepare('INSERT INTO worklogs (user_id, content) VALUES (?, ?) RETURNING id, content, is_done, created_at')
    .bind(userId, content)
    .first()

  return json({ worklog: row }, 201)
}
