// picsum.photos 的 seed 形式：随机换图且每个 URL 独立，浏览器缓存不会把多次刷新钉在同一张图。
export function randomBackground(): string {
  const seed = Math.floor(Math.random() * 1000000)
  return `https://picsum.photos/seed/${seed}/1920/1080`
}
