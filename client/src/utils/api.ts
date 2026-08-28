// 从 axios 错误对象中提取后端返回的 error 字段，取不到时用兜底文案
export function getApiError(err: unknown, fallback = '操作失败'): string {
  const response = (err as { response?: { data?: unknown } } | null | undefined)?.response
  const data = response?.data as { error?: unknown } | string | undefined
  if (typeof data === 'object' && data !== null && typeof data.error === 'string') {
    return data.error
  }
  return fallback
}
