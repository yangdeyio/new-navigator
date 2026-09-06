<template>
  <span class="web-icon-wrap" :style="wrapStyle">
    <span
      v-if="failed"
      class="web-icon fallback"
      :style="{ background: color, lineHeight: `${size}px`, fontSize: `${Math.max(10, Math.round(size * 0.45))}px` }"
    >
      {{ letter }}
    </span>
    <img
      v-else-if="icon"
      :src="icon"
      :alt="name || host"
      class="web-icon"
      @load="onLoad"
      @error="onError"
    />
    <span v-else class="web-icon placeholder" />
  </span>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { firstLetter } from '../utils/format'

const PALETTE = ['#4353e9', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96', '#a0d911', '#f5222d']

// 只用站点自带的 /favicon.ico:国内网络下 DuckDuckGo/Google 的 favicon 服务不可达(请求长时间挂起),
// 且 Google 对未知域名会返回 200 的默认地球图(load 成功、不触发 onerror),无法可靠判定失败。
// 源失败后立即由字母色块兜底。
function faviconSources(host: string): string[] {
  return [`https://${host}/favicon.ico`]
}

export default defineComponent({
  props: {
    href: {
      type: String,
      default: ''
    },
    size: {
      type: Number,
      default: 16
    },
    // 书签显示名:兜底字母块优先取它,而非域名首字符
    name: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      host: '',
      sources: [] as string[],
      sourceIndex: 0,
      icon: '',
      loaded: false,
      failed: false,
      color: '#4353e9'
    }
  },
  computed: {
    letter() {
      return firstLetter(this.name || this.host || this.href)
    },
    wrapStyle(): Record<string, string> {
      return {
        width: `${this.size}px`,
        height: `${this.size}px`
      }
    }
  },
  created() {
    try {
      const { hostname } = new URL(this.href)
      this.host = hostname
      this.sources = faviconSources(hostname)
      this.icon = this.sources[0]
      this.color = PALETTE[(hostname.charCodeAt(0) || 0) % PALETTE.length]
    } catch {
      this.failed = true
      this.color = PALETTE[0]
    }
  },
  methods: {
    onLoad() {
      this.loaded = true
      this.failed = false
    },
    onError() {
      if (this.loaded) return
      // 当前源加载失败就换下一个源；全部源失败后改用字母色块
      this.sourceIndex += 1
      if (this.sourceIndex < this.sources.length) {
        this.icon = this.sources[this.sourceIndex]
      } else {
        this.failed = true
      }
    }
  }
})
</script>
<style lang="scss" scoped>
.web-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin-right: 8px;
  border-radius: 5px;
  overflow: hidden;
  // 淡灰底：图片未加载/加载失败 + 透明图片统一衬底，形状一致
  background: #f0f2f5;
  box-sizing: border-box;
}
.web-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fallback,
.placeholder {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  box-sizing: border-box;
}
</style>
