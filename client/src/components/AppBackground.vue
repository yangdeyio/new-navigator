<template>
  <div class="app-background">
    <span class="app-background__img" :style="{ backgroundImage: `url('${bgUrl}')` }" />
    <span class="app-background__tint" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { randomBackground } from '../utils/background'

export default defineComponent({
  name: 'AppBackground',
  data() {
    return {
      bgUrl: randomBackground()
    }
  }
})
</script>

<style lang="scss" scoped>
.app-background {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  // 兜底色：图片未加载时与渐变融合，避免白底
  background: #10104a;

  // 照片层：用普通 CSS background-image，浏览器会渐进渲染（加载到多少显示多少）。
  // 不要做成"整图下载完才显示"（onload 门控）——慢 CDN 下会一直只有渐变，观感即是"没加载"。
  &__img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  // 渐变遮罩始终在最上层，保证文字可读（同旧 background-image 的渐变）
  &__tint {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(24, 90, 157, 0.82), rgba(33, 26, 82, 0.86));
  }
}
</style>
