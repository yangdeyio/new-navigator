// 从 axios 错误对象中提取后端返回的 error 字段，取不到时用兜底文案
export function getApiError(err, fallback = '操作失败') {
  return (err.response && err.response.data && err.response.data.error) || fallback
}
