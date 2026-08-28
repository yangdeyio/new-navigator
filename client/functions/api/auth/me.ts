import { json } from '../../lib/auth.ts'

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  const user = context.data.user
  return json({ user: { id: user.sub, username: user.username } })
}
