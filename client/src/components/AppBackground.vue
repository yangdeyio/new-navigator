<template>
  <div class="app-background">
    <span v-if="isDark" class="app-background__img" :style="{ backgroundImage: `url('${bgUrl}')` }" />
    <span class="app-background__tint" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { randomBackground } from '../utils/background'
import { theme } from '../composables/useTheme'

export default defineComponent({
  name: 'AppBackground',
  data() {
    return {
      bgUrl: randomBackground()
    }
  },
  computed: {
    // 浅色主题用柔和渐变,不加载照片;深色主题保留照片 + 蓝紫 tint
    isDark() {
      return theme.value === 'dark'
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
  // 浅色:柔和蓝白渐变
  background:
    radial-gradient(1200px 800px at 85% -10%, rgba(67, 83, 233, 0.12), transparent 60%),
    radial-gradient(1000px 700px at -10% 110%, rgba(56, 152, 255, 0.1), transparent 55%),
    linear-gradient(180deg, #f2f5fb, #e9eef8);

  // 照片层：用普通 CSS background-image，浏览器会渐进渲染（加载到多少显示多少）。
  // 不要做成"整图下载完才显示"（onload 门控）——慢 CDN 下会一直只有渐变，观感即是"没加载"。
  &__img {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }

  // 深色:渐变遮罩在最上层，保证玻璃面板与文字可读
  &__tint {
    position: absolute;
    inset: 0;
  }

  html[data-theme='dark'] & {
    background: #10104a;

    &__tint {
      background: linear-gradient(135deg, rgba(24, 90, 157, 0.78), rgba(33, 26, 82, 0.84));
    }
  }
}
</style>
