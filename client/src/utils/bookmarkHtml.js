// 解析浏览器导出的 Netscape 书签 HTML（Chrome/Edge/Firefox 的"导出书签"格式）。
// 每个链接的分类取其最近的父文件夹名；直接位于根层级（未进任何文件夹）的链接归入"未分类"。
const ROOT_CATEGORY = '未分类'

export function parseBookmarksHtml(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const rootDl = doc.querySelector('dl')
  if (!rootDl) return []

  const items = []
  walk(rootDl, ROOT_CATEGORY)
  return items

  function walk(dl, category) {
    for (const dt of dl.children) {
      if (dt.tagName !== 'DT') continue
      const h3 = dt.querySelector(':scope > h3')
      const a = dt.querySelector(':scope > a')
      if (h3) {
        // 子文件夹：嵌套的 DL 通常在 DT 内部，部分导出格式里是其兄弟节点
        const childDl = dt.querySelector(':scope > dl') || nextSiblingDl(dt)
        if (childDl) walk(childDl, h3.textContent.trim() || category)
      } else if (a) {
        items.push({
          category,
          href: (a.getAttribute('href') || '').trim(),
          value: (a.textContent || '').trim()
        })
      }
    }
  }
}

function nextSiblingDl(dt) {
  let sibling = dt.nextElementSibling
  while (sibling) {
    if (sibling.tagName === 'DL') return sibling
    if (sibling.tagName !== 'DT' && sibling.tagName !== 'P' && sibling.tagName !== 'DD') return null
    sibling = sibling.nextElementSibling
  }
  return null
}

// 粗略判断文件内容是否为 Netscape 书签 HTML（区别于本站导出的 JSON）
export function looksLikeBookmarksHtml(text) {
  const head = text.slice(0, 512).toLowerCase()
  return head.includes('<!doctype netscape-bookmark') || head.includes('<dt>') || head.includes('<h1>')
}
