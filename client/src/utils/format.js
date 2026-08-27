// 把 SQLite 存储的 UTC 时间字符串（"YYYY-MM-DD HH:MM:SS"）转成用户友好的展示。
// SQLite 的 datetime('now') 返回 UTC，无时区后缀，这里按 UTC 解析再本地化。

function parseDate(input) {
  if (!input) return null
  // 已带时区后缀（ISO）直接解析
  if (typeof input === 'string' && /Z$|[+-]\d{2}:?\d{2}$/.test(input)) {
    const d = new Date(input)
    return Number.isNaN(d.getTime()) ? null : d
  }
  const d = new Date(`${input.replace(' ', 'T')}Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

// 相对时间：刚刚 / n分钟前 / n小时前 / n天前，超过 7 天显示本地日期
export function relativeTime(input) {
  const date = parseDate(input)
  if (!date) return input || ''
  const diff = Date.now() - date.getTime()
  if (diff < 0) return '刚刚'
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 7) return `${day} 天前`
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// 让标题始终有兜底展示
export function firstLetter(text) {
  return ((text || '?').trim()[0] || '?').toUpperCase()
}
