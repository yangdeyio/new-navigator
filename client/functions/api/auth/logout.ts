import { clearSessionCookie, json } from '../../lib/auth.ts'

export async function onRequestPost(): Promise<Response> {
  return json({ ok: true }, 200, { 'Set-Cookie': clearSessionCookie() })
}
