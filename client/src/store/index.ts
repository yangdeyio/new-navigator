import { reactive } from 'vue'
import axios from 'axios'
import type { Bookmark, BookmarkGroups, BookmarkImportItem, Collection, User, Worklog } from '../types'

interface StoreState {
  ready: boolean
  user: User | null
  // 分类是动态的（可来自浏览器书签导入），key 为分类名，value 为该书签列表
  bookmarks: BookmarkGroups
  loadingBookmarks: boolean
  bookmarksError: boolean
  worklogs: Worklog[]
  collections: Collection[]
}

export const store = reactive<StoreState>({
  ready: false,
  user: null,
  bookmarks: {},
  loadingBookmarks: false,
  bookmarksError: false,
  worklogs: [],
  collections: []
})

// 从 hash 路由（形如 #/collect?x=1）中解析出当前路径，供 401 跳转时携带 redirect
function currentHashPath(): string {
  return (location.hash || '#/').slice(1).split('?')[0] || '/'
}

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && !location.hash.startsWith('#/login')) {
      store.user = null
      location.hash = `#/login?redirect=${encodeURIComponent(currentHashPath())}`
    }
    return Promise.reject(err)
  }
)

// 登录/初始化时书签加载失败不应否定登录态，错误由页面通过 bookmarksError 展示
async function safeLoadBookmarks(): Promise<void> {
  try {
    await loadBookmarks()
  } catch {
    /* 已通过 bookmarksError 标记 */
  }
}

export async function initAuth(): Promise<User | null> {
  if (store.ready) return store.user
  try {
    const { data } = await axios.get<{ user: User | null }>('/api/auth/me')
    store.user = data.user
  } catch {
    store.user = null
  } finally {
    store.ready = true
  }
  if (store.user) await safeLoadBookmarks()
  return store.user
}

export async function loadBookmarks(): Promise<void> {
  store.loadingBookmarks = true
  store.bookmarksError = false
  try {
    const { data } = await axios.get<{ bookmarks: BookmarkGroups }>('/api/bookmarks')
    Object.assign(store.bookmarks, data.bookmarks)
  } catch (e) {
    store.bookmarksError = true
    throw e
  } finally {
    store.loadingBookmarks = false
  }
}

export async function login(username: string, password: string): Promise<User | null> {
  const { data } = await axios.post<{ user: User }>('/api/auth/login', { username, password })
  store.user = data.user
  await safeLoadBookmarks()
  return store.user
}

export async function register(username: string, password: string): Promise<User | null> {
  const { data } = await axios.post<{ user: User }>('/api/auth/register', { username, password })
  store.user = data.user
  await safeLoadBookmarks()
  return store.user
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await axios.post('/api/auth/password', { currentPassword, newPassword })
}

export async function logout(): Promise<void> {
  try {
    await axios.post('/api/auth/logout')
  } finally {
    store.user = null
    store.bookmarks = {}
    store.worklogs = []
    store.collections = []
    store.bookmarksError = false
  }
}

export async function addBookmark(category: string, href: string, value: string): Promise<Bookmark> {
  const { data } = await axios.post<{ bookmark: Bookmark }>('/api/bookmarks', { category, href, value })
  if (!store.bookmarks[category]) store.bookmarks[category] = []
  store.bookmarks[category].unshift(data.bookmark)
  return data.bookmark
}

export async function updateBookmark(
  category: string,
  id: number,
  { href, value }: { href: string; value: string }
): Promise<void> {
  await axios.put(`/api/bookmarks/${id}`, { href, value })
  const list = store.bookmarks[category]
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], href, value }
  }
}

export async function removeBookmark(category: string, id: number): Promise<void> {
  await axios.delete(`/api/bookmarks/${id}`)
  const list = store.bookmarks[category]
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) list.splice(idx, 1)
}

export async function importBookmarks(items: BookmarkImportItem[]): Promise<number> {
  const { data } = await axios.post<{ imported: number }>('/api/bookmarks/import', { bookmarks: items })
  await loadBookmarks()
  return data.imported
}

export async function loadWorklogs(): Promise<void> {
  const { data } = await axios.get<{ worklogs: Worklog[] }>('/api/worklogs')
  store.worklogs = data.worklogs
}

export async function addWorklog(content: string): Promise<Worklog> {
  const { data } = await axios.post<{ worklog: Worklog }>('/api/worklogs', { content })
  store.worklogs.unshift(data.worklog)
  return data.worklog
}

export async function toggleWorklog(id: number, isDone: boolean): Promise<Worklog> {
  const { data } = await axios.put<{ worklog: Worklog }>(`/api/worklogs/${id}`, { is_done: isDone })
  const idx = store.worklogs.findIndex((item) => item.id === id)
  if (idx !== -1) store.worklogs[idx] = { ...store.worklogs[idx], ...data.worklog }
  // 未完成的置顶，保持"进行中在上"的展示顺序
  store.worklogs.sort((a, b) => Number(a.is_done) - Number(b.is_done))
  return data.worklog
}

export async function removeWorklog(id: number): Promise<void> {
  await axios.delete(`/api/worklogs/${id}`)
  const idx = store.worklogs.findIndex((item) => item.id === id)
  if (idx !== -1) store.worklogs.splice(idx, 1)
}

export async function loadCollections(): Promise<void> {
  const { data } = await axios.get<{ collections: Collection[] }>('/api/collections')
  store.collections = data.collections
}

export interface CollectionInput {
  href: string
  title: string
  note?: string
}

export async function addCollection({ href, title, note }: CollectionInput): Promise<Collection> {
  const { data } = await axios.post<{ collection: Collection }>('/api/collections', { href, title, note })
  store.collections.unshift(data.collection)
  return data.collection
}

export async function toggleCollection(id: number, isRead: boolean): Promise<Collection> {
  const { data } = await axios.put<{ collection: Collection }>(`/api/collections/${id}`, { is_read: isRead })
  const idx = store.collections.findIndex((item) => item.id === id)
  if (idx !== -1) store.collections[idx] = { ...store.collections[idx], ...data.collection }
  // 未读置顶
  store.collections.sort((a, b) => Number(a.is_read) - Number(b.is_read))
  return data.collection
}

export async function removeCollection(id: number): Promise<void> {
  await axios.delete(`/api/collections/${id}`)
  const idx = store.collections.findIndex((item) => item.id === id)
  if (idx !== -1) store.collections.splice(idx, 1)
}
