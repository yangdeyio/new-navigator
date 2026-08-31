import { ref } from 'vue'

export type ThemeName = 'light' | 'dark'

const STORAGE_KEY = 'navigator-theme'

function resolveInitialTheme(): ThemeName {
  // index.html 的内联脚本已在首屏渲染前把 data-theme 写到 <html>,这里保持同一优先级:
  // 用户手动选择(localStorage)> 系统偏好 > 浅色
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // 隐私模式等拿不到 localStorage 的场景,忽略
  }
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const theme = ref<ThemeName>(resolveInitialTheme())

export function setTheme(t: ThemeName): void {
  theme.value = t
  try {
    localStorage.setItem(STORAGE_KEY, t)
  } catch {
    // ignore
  }
  applyTheme(t)
}

export function toggleTheme(): void {
  setTheme(theme.value === 'dark' ? 'light' : 'dark')
}

function applyTheme(t: ThemeName): void {
  document.documentElement.setAttribute('data-theme', t)
}

applyTheme(theme.value)
