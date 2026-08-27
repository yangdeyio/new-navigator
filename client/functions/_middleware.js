import { getSessionToken, verifyJwt, json } from './lib/auth.js'

const PUBLIC_PATHS = new Set(['/api/auth/login', '/api/auth/register', '/api/auth/config'])

export const onRequest = async (context) => {
  const { request, env } = context
  const { pathname } = new URL(request.url)

  if (!pathname.startsWith('/api/')) return context.next()

  if (!env.JWT_SECRET) return json({ error: 'server misconfigured: JWT_SECRET missing' }, 500)
  if (!env.DB) return json({ error: 'server misconfigured: D1 binding missing' }, 500)

  if (PUBLIC_PATHS.has(pathname)) return context.next()

  const payload = await verifyJwt(getSessionToken(request), env.JWT_SECRET)
  if (!payload) return json({ error: 'unauthorized' }, 401)

  context.data.user = payload
  return context.next()
}
