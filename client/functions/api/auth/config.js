import { json } from '../../lib/auth.js'

export async function onRequestGet(context) {
  const { env } = context
  return json({ allowRegister: env.ALLOW_REGISTER === '1' })
}
