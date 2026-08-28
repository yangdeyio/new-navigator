const MAX_CATEGORY_LENGTH = 64
const MAX_VALUE_LENGTH = 120

export function isValidHref(href: string): boolean {
  return /^https?:\/\/.+/.test(href) && href.length <= 2048
}

interface BookmarkLike {
  category: string
  href: string
  value: string
}

// 返回错误信息（无效时）或 null（有效时）。分类是动态的（可来自浏览器书签文件夹），只做长度校验
export function validateBookmark({ category, href, value }: BookmarkLike): string | null {
  if (!category || category.length > MAX_CATEGORY_LENGTH) return '分类无效'
  if (!isValidHref(href)) return '网址无效'
  if (!value || value.length > MAX_VALUE_LENGTH) return `名称需为 1-${MAX_VALUE_LENGTH} 个字符`
  return null
}

export { MAX_CATEGORY_LENGTH, MAX_VALUE_LENGTH }
