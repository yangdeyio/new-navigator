import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  hashPassword,
  verifyPassword,
  signJwt,
  verifyJwt,
  parseCookies,
  getSessionToken,
  sessionCookie,
  clearSessionCookie,
  SESSION_TTL_SECONDS
} from '../functions/lib/auth.ts'

const SECRET = 'unit-test-secret-that-is-long-enough'

// 只需满足 headers.get 形状的极简 Request 替身
function fakeRequest(cookie: string): Request {
  return { headers: { get: (name: string) => (name === 'Cookie' ? cookie : null) } } as unknown as Request
}

test('password hashing round-trips', async () => {
  const plain = 'sup3rSecret!'
  const { hash, salt } = await hashPassword(plain)
  assert.ok(hash.length > 0)
  assert.ok(salt.length > 0)
  assert.notEqual(hash, plain)
  await assert.doesNotReject(async () => {
    assert.equal(await verifyPassword(plain, hash, salt), true)
  })
})

test('verifyPassword rejects wrong password', async () => {
  const { hash, salt } = await hashPassword('correct-password')
  assert.equal(await verifyPassword('wrong-password', hash, salt), false)
})

test('same password always hashes to different salt & hash', async () => {
  const a = await hashPassword('twin-password')
  const b = await hashPassword('twin-password')
  assert.notEqual(a.salt, b.salt)
  assert.notEqual(a.hash, b.hash)
})

test('JWT sign + verify round-trip', async () => {
  const token = await signJwt({ sub: '7', username: 'blake' }, SECRET)
  const payload = await verifyJwt(token, SECRET)
  assert.ok(payload)
  assert.equal(payload.sub, '7')
  assert.equal(payload.username, 'blake')
  assert.ok(payload.exp > payload.iat)
})

test('verifyJwt rejects invalid signature', async () => {
  const token = await signJwt({ sub: '1' }, SECRET)
  const tampered = token.slice(0, -2) + (token.endsWith('AA') ? 'BB' : 'AA')
  assert.equal(await verifyJwt(tampered, SECRET), null)
  assert.equal(await verifyJwt(token, 'different-secret'), null)
})

test('verifyJwt rejects expired token', async () => {
  const expired = await signJwt({ sub: '1' }, SECRET, -10)
  assert.equal(await verifyJwt(expired, SECRET), null)
})

test('verifyJwt rejects malformed input', async () => {
  assert.equal(await verifyJwt('', SECRET), null)
  assert.equal(await verifyJwt('a.b', SECRET), null)
  assert.equal(await verifyJwt('abc.def.ghi', SECRET), null)
})

test('session cookie carries security flags', () => {
  const cookie = sessionCookie('abc123')
  assert.match(cookie, /^session=abc123;/)
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /Secure/)
  assert.match(cookie, /SameSite=Lax/)
  assert.match(cookie, /Path=\//)
  assert.match(cookie, new RegExp(`Max-Age=${SESSION_TTL_SECONDS}`))
})

test('clearSessionCookie expires the cookie', () => {
  const cookie = clearSessionCookie()
  assert.match(cookie, /Max-Age=0/)
  assert.match(cookie, /session=;/)
})

test('getSessionToken reads session from cookie header', () => {
  const req = fakeRequest('foo=1; session=my-token; bar=baz')
  assert.equal(getSessionToken(req), 'my-token')
})

test('getSessionToken returns null when absent', () => {
  const req = fakeRequest('foo=1')
  assert.equal(getSessionToken(req), null)
})

test('parseCookies handles simple header', () => {
  const req = fakeRequest('a=1; b=hello%20world')
  assert.deepEqual(parseCookies(req), { a: '1', b: 'hello world' })
})
