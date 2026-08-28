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

export function randomBackground(): string {
  const seed = SEEDS[Math.floor(Math.random() * SEEDS.length)] ?? SEEDS[0]
  return `https://picsum.photos/seed/${seed}/1920/1080`
}
