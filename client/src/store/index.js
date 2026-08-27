import { reactive } from 'vue'
import axios from 'axios'

export const store = reactive({
  ready: false,
  user: null,
  bookmarks: {
    document: [],
    blog: [],
    design: [],
    video: [],
    entertainment: []
  },
  worklogs: [],
  collections: []
})

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401 && !location.hash.startsWith('#/login')) {
      store.user = null
      location.hash = '#/login'
    }
    return Promise.reject(err)
  }
)

export async function initAuth() {
  if (store.ready) return store.user
  try {
    const { data } = await axios.get('/api/auth/me')
    store.user = data.user
    await loadBookmarks()
  } catch {
    store.user = null
  } finally {
    store.ready = true
  }
  return store.user
}

export async function loadBookmarks() {
  const { data } = await axios.get('/api/bookmarks')
  Object.assign(store.bookmarks, data.bookmarks)
}

export async function login(username, password) {
  const { data } = await axios.post('/api/auth/login', { username, password })
  store.user = data.user
  await loadBookmarks()
  return store.user
}

export async function register(username, password) {
  const { data } = await axios.post('/api/auth/register', { username, password })
  store.user = data.user
  await loadBookmarks()
  return store.user
}

export async function logout() {
  try {
    await axios.post('/api/auth/logout')
  } finally {
    store.user = null
  }
}

export async function addBookmark(category, href, value) {
  const { data } = await axios.post('/api/bookmarks', { category, href, value })
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
