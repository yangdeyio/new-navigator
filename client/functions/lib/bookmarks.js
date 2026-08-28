const MAX_CATEGORY_LENGTH = 64
const MAX_VALUE_LENGTH = 120

function isValidHref(href) {
  return /^https?:\/\/.+/.test(href) && href.length <= 2048
}

// 返回错误信息（无效时）或 null（有效时）。分类是动态的（可来自浏览器书签文件夹），只做长度校验
function validateBookmark({ category, href, value }) {
  if (!category || category.length > MAX_CATEGORY_LENGTH) return '分类无效'
  if (!isValidHref(href)) return '网址无效'
  if (!value || value.length > MAX_VALUE_LENGTH) return `名称需为 1-${MAX_VALUE_LENGTH} 个字符`
  return null
}

export { MAX_CATEGORY_LENGTH, MAX_VALUE_LENGTH, isValidHref, validateBookmark }
