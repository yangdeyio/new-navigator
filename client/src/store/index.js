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
  }
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

export async function removeBookmark(category, id) {
  await axios.delete(`/api/bookmarks/${id}`)
  const list = store.bookmarks[category]
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) list.splice(idx, 1)
}
