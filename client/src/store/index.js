import { reactive } from 'vue'
import axios from 'axios'

export const store = reactive({
  ready: false,
  user: null,
  // 分类是动态的（可来自浏览器书签导入），key 为分类名，value 为该书签列表
  bookmarks: {},
  loadingBookmarks: false,
  bookmarksError: false,
  worklogs: [],
  collections: []
})

// 从 hash 路由（形如 #/collect?x=1）中解析出当前路径，供 401 跳转时携带 redirect
function currentHashPath() {
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
async function safeLoadBookmarks() {
  try {
    await loadBookmarks()
  } catch {
    /* 已通过 bookmarksError 标记 */
  }
}

export async function initAuth() {
  if (store.ready) return store.user
  try {
    const { data } = await axios.get('/api/auth/me')
    store.user = data.user
  } catch {
    store.user = null
  } finally {
    store.ready = true
  }
  if (store.user) await safeLoadBookmarks()
  return store.user
}

export async function loadBookmarks() {
  store.loadingBookmarks = true
  store.bookmarksError = false
  try {
    const { data } = await axios.get('/api/bookmarks')
    Object.assign(store.bookmarks, data.bookmarks)
  } catch (e) {
    store.bookmarksError = true
    throw e
  } finally {
    store.loadingBookmarks = false
  }
}

export async function login(username, password) {
  const { data } = await axios.post('/api/auth/login', { username, password })
  store.user = data.user
  await safeLoadBookmarks()
  return store.user
}

export async function register(username, password) {
  const { data } = await axios.post('/api/auth/register', { username, password })
  store.user = data.user
  await safeLoadBookmarks()
  return store.user
}

export async function changePassword(currentPassword, newPassword) {
  await axios.post('/api/auth/password', { currentPassword, newPassword })
}

export async function logout() {
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

export async function addBookmark(category, href, value) {
  const { data } = await axios.post('/api/bookmarks', { category, href, value })
  if (!store.bookmarks[category]) store.bookmarks[category] = []
  store.bookmarks[category].unshift(data.bookmark)
  return data.bookmark
}

export async function updateBookmark(category, id, { href, value }) {
  await axios.put(`/api/bookmarks/${id}`, { href, value })
  const list = store.bookmarks[category]
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) {
    list[idx] = { ...list[idx], href, value }
  }
}

export async function removeBookmark(category, id) {
  await axios.delete(`/api/bookmarks/${id}`)
  const list = store.bookmarks[category]
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) list.splice(idx, 1)
}

export async function importBookmarks(items) {
  const { data } = await axios.post('/api/bookmarks/import', { bookmarks: items })
  await loadBookmarks()
  return data.imported
}

export async function loadWorklogs() {
  const { data } = await axios.get('/api/worklogs')
  store.worklogs = data.worklogs
}

export async function addWorklog(content) {
  const { data } = await axios.post('/api/worklogs', { content })
  store.worklogs.unshift(data.worklog)
  return data.worklog
}

export async function toggleWorklog(id, isDone) {
  const { data } = await axios.put(`/api/worklogs/${id}`, { is_done: isDone })
  const idx = store.worklogs.findIndex((item) => item.id === id)
  if (idx !== -1) store.worklogs[idx] = { ...store.worklogs[idx], ...data.worklog }
  // 未完成的置顶，保持"进行中在上"的展示顺序
  store.worklogs.sort((a, b) => Number(a.is_done) - Number(b.is_done))
  return data.worklog
}

export async function removeWorklog(id) {
  await axios.delete(`/api/worklogs/${id}`)
  const idx = store.worklogs.findIndex((item) => item.id === id)
  if (idx !== -1) store.worklogs.splice(idx, 1)
}

export async function loadCollections() {
  const { data } = await axios.get('/api/collections')
  store.collections = data.collections
}

export async function addCollection({ href, title, note }) {
  const { data } = await axios.post('/api/collections', { href, title, note })
  store.collections.unshift(data.collection)
  return data.collection
}

export async function toggleCollection(id, isRead) {
  const { data } = await axios.put(`/api/collections/${id}`, { is_read: isRead })
  const idx = store.collections.findIndex((item) => item.id === id)
  if (idx !== -1) store.collections[idx] = { ...store.collections[idx], ...data.collection }
  // 未读置顶
  store.collections.sort((a, b) => Number(a.is_read) - Number(b.is_read))
  return data.collection
}

export async function removeCollection(id) {
  await axios.delete(`/api/collections/${id}`)
  const idx = store.collections.findIndex((item) => item.id === id)
  if (idx !== -1) store.collections.splice(idx, 1)
}
