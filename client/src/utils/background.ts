// picsum.photos 的 seed 形式：URL 稳定，浏览器可跨会话命中缓存。
// 从固定集合里随机挑一张，既保留"每次随机换图"的新鲜感，又不会每次刷新都重新下载一张新图。
const SEEDS = [
  'navigator-01',
  'navigator-02',
  'navigator-03',
  'navigator-04',
  'navigator-05',
  'navigator-06',
  'navigator-07',
  'navigator-08'
]

// 只在模块加载时随机一次：同一次页面加载内（包括登录页 → 内页的 SPA 跳转）背景保持不变，
// 刷新页面才会换新图。若放在组件 data() 里，每次挂载都会重掷，跳转时背景就会"变脸"。
const SEED = SEEDS[Math.floor(Math.random() * SEEDS.length)] ?? SEEDS[0]

export function backgroundUrl(): string {
  return `https://picsum.photos/seed/${SEED}/1920/1080`
}
