const PBKDF2_ITERATIONS = 100000
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

async function pbkdf2(password, saltHex) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const salt = new Uint8Array(saltHex.match(/.{2}/g).map((h) => parseInt(h, 16)))
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS },
    key,
    256
  )
  return toHex(bits)
}

async function hashPassword(password) {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)))
  const hash = await pbkdf2(password, salt)
  return { hash, salt }
}

async function verifyPassword(password, hashHex, saltHex) {
  const computed = await pbkdf2(password, saltHex)
  return timingSafeEqual(computed, hashHex)
}

function b64urlEncode(data) {
  const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(data)
  let binary = ''
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function b64urlDecode(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(str.length / 4) * 4, '=')
  const binary = atob(padded)
  return Uint8Array.from(binary, (c) => c.charCodeAt(0))
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data)))
}

async function signJwt(payload, secret, ttlSeconds = SESSION_TTL_SECONDS) {
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + ttlSeconds }
  const header = b64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64urlEncode(JSON.stringify(fullPayload))
  const sig = b64urlEncode(await hmac(secret, `${header}.${body}`))
  return `${header}.${body}.${sig}`
}

async function verifyJwt(token, secret) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts
  const expected = b64urlEncode(await hmac(secret, `${header}.${body}`))
  if (!timingSafeEqual(sig, expected)) return null
  try {
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body)))
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

function parseCookies(request) {
  const header = request.headers.get('Cookie') || ''
  return Object.fromEntries(
    header.split(';').map((pair) => pair.trim().split('=').map(decodeURIComponent))
      .filter((parts) => parts.length >= 1)
      .map((parts) => [parts[0], parts.slice(1).join('=')])
  )
}

function sessionCookie(token) {
  return `session=${token}; HttpOnly; Secure; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax`
}

function clearSessionCookie() {
  return 'session=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax'
}

function getSessionToken(request) {
  return parseCookies(request).session || null
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers }
  })
}

export {
  PBKDF2_ITERATIONS,
  SESSION_TTL_SECONDS,
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  parseCookies,
  getSessionToken,
  sessionCookie,
  clearSessionCookie,
  json
}
