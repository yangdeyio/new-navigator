import type { BookmarkCategory, BookmarkGroups } from '../types'

// 遗留的 5 个英文分类 key 及其显示顺序；动态导入产生的新分类直接用原始名，排在其后
const LEGACY_CATEGORIES: ReadonlyArray<{ key: BookmarkCategory; label: string }> = [
  { key: 'document', label: '技术文档' },
  { key: 'blog', label: '技术博客' },
  { key: 'design', label: '设计' },
  { key: 'video', label: '视频学习' },
  { key: 'entertainment', label: '娱乐' }
]

const LEGACY_LABELS: Readonly<Record<BookmarkCategory, string>> = Object.fromEntries(
  LEGACY_CATEGORIES.map((c) => [c.key, c.label])
)

export function categoryLabel(category: BookmarkCategory): string {
  return LEGACY_LABELS[category] || category
}

// 按"遗留顺序在前、新分类按出现顺序在后"返回 store.bookmarks 的分类 key 列表
export function orderedCategories(bookmarks: BookmarkGroups): BookmarkCategory[] {
  const keys = Object.keys(bookmarks)
  const legacyOrder = LEGACY_CATEGORIES.map((c) => c.key)
  return [
    ...legacyOrder.filter((key) => keys.includes(key)),
    ...keys.filter((key) => !legacyOrder.includes(key))
  ]
}

export { LEGACY_CATEGORIES }
