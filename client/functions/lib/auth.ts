export const PBKDF2_ITERATIONS = 100000
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function pbkdf2(password: string, saltHex: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  )
  return toHex(bits)
}

export interface HashedPassword {
  hash: string
  salt: string
}

export async function hashPassword(password: string): Promise<HashedPassword> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const hash = await pbkdf2(password, salt)
  return { hash, salt }
}

export async function verifyPassword(password: string, hashHex: string, saltHex: string): Promise<boolean> {
  const computed = await pbkdf2(password, saltHex)
  return timingSafeEqual(computed, hashHex)
}

function b64urlEncode(data: string | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)))
}

export async function signJwt(
  payload: { sub: number | string; username?: string },
  secret: string,
  ttlSeconds: number = SESSION_TTL_SECONDS
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds }
  const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64urlEncode(JSON.stringify(fullPayload))
  const sig = b64urlEncode(await hmac(secret, `${header}.${body}`))
  return `${header}.${body}.${sig}`
}

export interface JwtPayload {
  sub: number | string
  username?: string
  iat: number
  exp: number
}

export async function verifyJwt(token: string | null, secret: string): Promise<JwtPayload | null> {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = b64urlEncode(await hmac(secret, `${header}.${body}`))
  if (!timingSafeEqual(sig, expected)) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as JwtPayload
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function parseCookies(request: Request): Record<string, string> {
  const header = request.headers.get('Cookie') || ''
  return Object.fromEntries(
    header.split(';').map((pair) => pair.trim().split('=').map(decodeURIComponent))
      .filter((parts) => parts.length >= 1)
      .map((parts) => [parts[0], parts.slice(1).join('=')])
  )
}

export function sessionCookie(token: string): string {
  return `session=${token}; HttpOnly; Secure; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax`
}

export function clearSessionCookie(): string {
  return 'session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax'
}

export function getSessionToken(request: Request): string | null {
  return parseCookies(request).session || null
}

export function json(data: unknown, status: number = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  })
}
