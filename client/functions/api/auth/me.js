import { json } from '../../lib/auth.js'

export async function onRequestGet(context) {
  const user = context.data.user
  return json({ user: { id: user.sub, username: user.username } })
}
