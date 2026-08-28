<template>
  <span class="web-icon-wrap">
    <span v-if="failed" class="web-icon fallback" :style="{ background: color }">
      {{ letter }}
    </span>
    <img
      v-else-if="icon"
      :src="icon"
      :alt="host"
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

const PALETTE = ['#1890ff', '#722ed1', '#13c2c2', '#fa8c16', '#eb2f96', '#a0d911', '#f5222d']

export default defineComponent({
  props: {
    href: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      host: '',
      icon: '',
      loaded: false,
      failed: false,
      color: '#1890ff'
    }
  },
  computed: {
    letter() {
      return firstLetter(this.host || this.href)
    }
  },
  created() {
    try {
      const { hostname } = new URL(this.href)
      this.host = hostname
      // 用 DuckDuckGo 的 favicon 服务，比自猜路径可靠得多
      this.icon = `https://icons.duckduckgo.com/ip3/${hostname}.ico`
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
      this.failed = true
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
