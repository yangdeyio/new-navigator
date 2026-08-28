// Pages Functions 共享类型：运行时环境绑定与会话载荷

interface Env {
  DB: D1Database
  JWT_SECRET: string
  ALLOW_REGISTER?: string
  TURNSTILE_SECRET_KEY?: string
}

// JWT payload（lib/auth.ts 的 signJwt 只写入 sub/username，exp/iat 由签名时附加）
interface SessionPayload {
  sub: number | string
  username?: string
  iat: number
  exp: number
}

// 已通过 _middleware 鉴权的处理器上下文（data.user 必然存在）
interface HandlerContext {
  request: Request
  env: Env
  params: Record<string, string>
  data: { user: SessionPayload }
  next(): Promise<Response>
  waitUntil(promise: Promise<unknown>): void
}

// _middleware 自己的上下文：鉴权前 data.user 还不存在
interface MiddlewareContext extends Omit<HandlerContext, 'data'> {
  data: { user?: SessionPayload }
}
