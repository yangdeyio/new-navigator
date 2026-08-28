// 领域类型：与 D1 schema（migrations/0001_init.sql、0003_features.sql）及 API 返回结构对应

export interface User {
  id: number
  username: string
}

// 书签分类是动态的（可来自浏览器书签导入的任意文件夹名）
export type BookmarkCategory = string

export interface Bookmark {
  id: number
  href: string
  value: string
}

export type BookmarkGroups = Record<BookmarkCategory, Bookmark[]>

// SQLite 的 TEXT 时间戳（datetime('now')，UTC），解析见 utils/format.js
export type DbTimestamp = string

export interface Collection {
  id: number
  href: string
  title: string
  note: string | null
  is_read: 0 | 1
  created_at: DbTimestamp
}

export interface Worklog {
  id: number
  content: string
  is_done: 0 | 1
  created_at: DbTimestamp
  updated_at: DbTimestamp
}

export interface Message {
  id: number
  content: string
  created_at: DbTimestamp
  username: string
}

// 导入接口的输入行（未落库，无 id）
export interface BookmarkImportItem {
  category: BookmarkCategory
  href: string
  value: string
}

export interface ApiErrorResponse {
  error: string
}
