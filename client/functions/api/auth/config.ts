import { json } from '../../lib/auth.ts'

export async function onRequestGet(context: HandlerContext): Promise<Response> {
  const { env } = context
  return json({ allowRegister: env.ALLOW_REGISTER === '1' })
}
